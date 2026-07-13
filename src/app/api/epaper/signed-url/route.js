import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

function extractStoragePath(publicUrl) {
  if (!publicUrl) return "";

  const markers = [
    "/storage/v1/object/public/newspapers/",
    "/storage/v1/object/sign/newspapers/",
    "/storage/v1/object/authenticated/newspapers/",
  ];

  for (const marker of markers) {
    if (publicUrl.includes(marker)) {
      return decodeURIComponent(
        publicUrl.split(marker)[1].split("?")[0]
      );
    }
  }

  return "";
}

function getBearerToken(request) {
  const authorization =
    request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return "";
  }

  return authorization
    .replace("Bearer ", "")
    .trim();
}

export async function POST(request) {
  try {
    if (
      !supabaseUrl ||
      !supabaseAnonKey ||
      !serviceRoleKey
    ) {
      return NextResponse.json(
        {
          error:
            "Secure reader configuration is incomplete.",
        },
        { status: 500 }
      );
    }

    const accessToken =
      getBearerToken(request);

    if (!accessToken) {
      return NextResponse.json(
        {
          error:
            "Please log in to read the complete newspaper.",
        },
        { status: 401 }
      );
    }

    const authClient = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        global: {
          headers: {
            Authorization:
              `Bearer ${accessToken}`,
          },
        },
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await authClient.auth.getUser(
      accessToken
    );

    if (userError || !user) {
      return NextResponse.json(
        {
          error:
            "Your login session is invalid or expired.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const paperId = body?.paperId;

    if (!paperId) {
      return NextResponse.json(
        {
          error:
            "Newspaper ID is required.",
        },
        { status: 400 }
      );
    }

    const supabaseAdmin = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      }
    );

    const { data: subscription, error: subError } =
      await supabaseAdmin
        .from("user_subscriptions")
        .select("id, status, expiry_date")
        .eq("user_id", user.id)
        .eq("status", "active")
        .gte(
          "expiry_date",
          new Date().toISOString()
        )
        .order("expiry_date", {
          ascending: false,
        })
        .limit(1)
        .maybeSingle();

    if (subError) {
      return NextResponse.json(
        {
          error: subError.message,
        },
        { status: 500 }
      );
    }

    if (!subscription) {
      return NextResponse.json(
        {
          error:
            "An active premium subscription is required.",
        },
        { status: 403 }
      );
    }

    const { data: paper, error: paperError } =
      await supabaseAdmin
        .from("newspapers")
        .select(
          "id, title, pdf_url, pdf_path, is_published"
        )
        .eq("id", paperId)
        .eq("is_published", true)
        .maybeSingle();

    if (paperError) {
      return NextResponse.json(
        {
          error: paperError.message,
        },
        { status: 500 }
      );
    }

    if (!paper) {
      return NextResponse.json(
        {
          error:
            "Newspaper edition not found.",
        },
        { status: 404 }
      );
    }

    const pdfPath =
      paper.pdf_path ||
      extractStoragePath(paper.pdf_url);

    if (!pdfPath) {
      return NextResponse.json(
        {
          error:
            "The secure PDF storage path could not be determined.",
        },
        { status: 400 }
      );
    }

    if (!paper.pdf_path) {
      await supabaseAdmin
        .from("newspapers")
        .update({
          pdf_path: pdfPath,
        })
        .eq("id", paper.id);
    }

    const { data: signedData, error: signedError } =
      await supabaseAdmin.storage
        .from("newspapers")
        .createSignedUrl(pdfPath, 300);

    if (signedError) {
      return NextResponse.json(
        {
          error:
            `Unable to create secure PDF link: ${signedError.message}`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      signedUrl: signedData.signedUrl,
      expiresIn: 300,
      paper: {
        id: paper.id,
        title: paper.title,
      },
    });
  } catch (error) {
    console.error(
      "Signed URL API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to open the secure newspaper.",
      },
      { status: 500 }
    );
  }
}