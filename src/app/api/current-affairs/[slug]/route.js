import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function createAuthClient(accessToken) {
  return createClient(supabaseUrl, supabaseAnonKey, {
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
  });
}

const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }
);

export async function GET(request, { params }) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { error: "Article slug is required." },
        { status: 400 }
      );
    }

    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Login required." },
        { status: 401 }
      );
    }

    const accessToken = authorization.replace("Bearer ", "").trim();

    const authClient = createAuthClient(accessToken);

    const {
      data: { user },
      error: userError,
    } = await authClient.auth.getUser(accessToken);

    if (userError || !user) {
      return NextResponse.json(
        { error: "Your login session is invalid or expired." },
        { status: 401 }
      );
    }

    const now = new Date().toISOString();

    const { data: subscription, error: subscriptionError } =
      await supabaseAdmin
        .from("user_subscriptions")
        .select("id, plan, status, expiry_date")
        .eq("user_id", user.id)
        .eq("status", "active")
        .gte("expiry_date", now)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (subscriptionError) {
      return NextResponse.json(
        { error: subscriptionError.message },
        { status: 500 }
      );
    }

    if (!subscription) {
      return NextResponse.json(
        {
          error:
            "An active premium subscription is required to read this article.",
        },
        { status: 403 }
      );
    }

    const { data: article, error: articleError } = await supabaseAdmin
      .from("current_affairs")
      .select(
        `
          id,
          title,
          slug,
          summary,
          content,
          category,
          tags,
          image_url,
          is_featured,
          published_at
        `
      )
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();

    if (articleError) {
      return NextResponse.json(
        { error: articleError.message },
        { status: 500 }
      );
    }

    if (!article) {
      return NextResponse.json(
        { error: "Current affairs article not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      article,
      subscription: {
        plan: subscription.plan,
        expiry_date: subscription.expiry_date,
      },
    });
  } catch (error) {
    console.error("Current affairs API error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load the article.",
      },
      { status: 500 }
    );
  }
}