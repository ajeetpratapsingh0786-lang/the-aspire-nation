import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getBearerToken(request) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return "";
  }

  return authorization.replace("Bearer ", "").trim();
}

function jsonResponse(body, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}

export async function POST(request) {
  try {
    if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
      return jsonResponse(
        {
          error: "Editorial reader configuration is incomplete.",
        },
        500
      );
    }

    const body = await request.json();
    const slug = body?.slug?.trim();

    if (!slug) {
      return jsonResponse(
        {
          error: "Editorial URL is required.",
        },
        400
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

    /*
     * PUBLIC QUERY
     *
     * Important: content is deliberately excluded.
     * Logged-out and free visitors can never receive it from this query.
     */
    const {
      data: publicEditorial,
      error: publicEditorialError,
    } = await supabaseAdmin
      .from("editorials")
      .select(
        `
          id,
          title,
          slug,
          summary,
          category,
          image_url,
          tags,
          is_featured,
          published_at
        `
      )
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();

    if (publicEditorialError) {
      return jsonResponse(
        {
          error: publicEditorialError.message,
        },
        500
      );
    }

    if (!publicEditorial) {
      return jsonResponse(
        {
          error: "Editorial not found.",
        },
        404
      );
    }

    const accessToken = getBearerToken(request);

    /*
     * LOGGED-OUT VISITOR
     */
    if (!accessToken) {
      return jsonResponse({
        success: true,
        authenticated: false,
        premium: false,
        editorial: publicEditorial,
      });
    }

    const authClient = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
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
    } = await authClient.auth.getUser(accessToken);

    /*
     * INVALID OR EXPIRED LOGIN
     */
    if (userError || !user) {
      return jsonResponse({
        success: true,
        authenticated: false,
        premium: false,
        editorial: publicEditorial,
      });
    }

    const {
      data: subscription,
      error: subscriptionError,
    } = await supabaseAdmin
      .from("user_subscriptions")
      .select("id, status, expiry_date")
      .eq("user_id", user.id)
      .eq("status", "active")
      .gte("expiry_date", new Date().toISOString())
      .order("expiry_date", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle();

    if (subscriptionError) {
      return jsonResponse(
        {
          error: subscriptionError.message,
        },
        500
      );
    }

    /*
     * LOGGED-IN FREE USER
     */
    if (!subscription) {
      return jsonResponse({
        success: true,
        authenticated: true,
        premium: false,
        editorial: publicEditorial,
      });
    }

    /*
     * PREMIUM QUERY
     *
     * The full content is fetched only after the subscription is verified.
     */
    const {
      data: premiumEditorial,
      error: premiumEditorialError,
    } = await supabaseAdmin
      .from("editorials")
      .select("content")
      .eq("id", publicEditorial.id)
      .eq("is_published", true)
      .maybeSingle();

    if (premiumEditorialError) {
      return jsonResponse(
        {
          error: premiumEditorialError.message,
        },
        500
      );
    }

    if (!premiumEditorial) {
      return jsonResponse(
        {
          error: "Premium editorial content was not found.",
        },
        404
      );
    }

    return jsonResponse({
      success: true,
      authenticated: true,
      premium: true,
      editorial: {
        ...publicEditorial,
        content: premiumEditorial.content,
      },
    });
  } catch (error) {
    console.error("Editorial premium API error:", error);

    return jsonResponse(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to open editorial.",
      },
      500
    );
  }
}