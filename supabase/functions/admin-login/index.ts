import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

/**
 * Supabase Edge Function: admin-login
 *
 * Validates the admin password server-side and returns a signed JWT token.
 * The password is stored as a Supabase secret (ADMIN_PASSWORD), never in frontend.
 *
 * Environment Variables (set via `supabase secrets set`):
 *   - ADMIN_PASSWORD: The single hardcoded admin password
 *   - ADMIN_JWT_SECRET: Secret key for signing JWT tokens
 */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info",
  "Content-Type": "application/json",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: CORS_HEADERS }
    );
  }

  try {
    const ADMIN_PASSWORD = Deno.env.get("ADMIN_PASSWORD");
    const JWT_SECRET = Deno.env.get("ADMIN_JWT_SECRET");

    if (!ADMIN_PASSWORD || !JWT_SECRET) {
      console.error("Missing ADMIN_PASSWORD or ADMIN_JWT_SECRET env vars");
      return new Response(
        JSON.stringify({ error: "Konfigurasi server belum lengkap." }),
        { status: 500, headers: CORS_HEADERS }
      );
    }

    const { password } = await req.json();

    if (!password || password !== ADMIN_PASSWORD) {
      return new Response(
        JSON.stringify({ error: "Kata sandi yang Anda masukkan salah." }),
        { status: 401, headers: CORS_HEADERS }
      );
    }

    // Generate JWT token (valid for 8 hours)
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(JWT_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const now = Math.floor(Date.now() / 1000);
    const exp = now + 8 * 60 * 60; // 8 hours

    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }))
      .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    const payload = btoa(JSON.stringify({ role: "admin_gizi", iat: now, exp }))
      .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

    const data = new TextEncoder().encode(`${header}.${payload}`);
    const signature = await crypto.subtle.sign("HMAC", key, data);
    const sig = btoa(String.fromCharCode(...new Uint8Array(signature)))
      .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

    const token = `${header}.${payload}.${sig}`;

    return new Response(
      JSON.stringify({ token, expiresIn: 8 * 60 * 60 }),
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (err) {
    console.error("admin-login error:", err);
    return new Response(
      JSON.stringify({ error: "Terjadi kesalahan server." }),
      { status: 500, headers: CORS_HEADERS }
    );
  }
});
