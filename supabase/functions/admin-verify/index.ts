import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

/**
 * Supabase Edge Function: admin-verify
 *
 * Verifies a JWT token issued by admin-login.
 * Used by the frontend to validate stored sessions on page load.
 *
 * Environment Variables (set via `supabase secrets set`):
 *   - ADMIN_JWT_SECRET: Same secret key used by admin-login to sign tokens
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
      JSON.stringify({ valid: false, error: "Method not allowed" }),
      { status: 405, headers: CORS_HEADERS }
    );
  }

  try {
    const JWT_SECRET = Deno.env.get("ADMIN_JWT_SECRET");

    if (!JWT_SECRET) {
      return new Response(
        JSON.stringify({ valid: false, error: "Server not configured" }),
        { status: 500, headers: CORS_HEADERS }
      );
    }

    // Extract token from Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ valid: false, error: "Missing or invalid token" }),
        { status: 401, headers: CORS_HEADERS }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const parts = token.split(".");

    if (parts.length !== 3) {
      return new Response(
        JSON.stringify({ valid: false, error: "Malformed token" }),
        { status: 401, headers: CORS_HEADERS }
      );
    }

    const [headerB64, payloadB64, signatureB64] = parts;

    // Verify signature
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(JWT_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const data = new TextEncoder().encode(`${headerB64}.${payloadB64}`);

    // Restore base64url to standard base64
    const sigStd = signatureB64.replace(/-/g, "+").replace(/_/g, "/");
    const sigBytes = Uint8Array.from(atob(sigStd), (c) => c.charCodeAt(0));

    const valid = await crypto.subtle.verify("HMAC", key, sigBytes, data);

    if (!valid) {
      return new Response(
        JSON.stringify({ valid: false, error: "Invalid signature" }),
        { status: 401, headers: CORS_HEADERS }
      );
    }

    // Decode payload and check expiration
    const payloadStd = payloadB64.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(payloadStd));

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return new Response(
        JSON.stringify({ valid: false, error: "Token expired" }),
        { status: 401, headers: CORS_HEADERS }
      );
    }

    return new Response(
      JSON.stringify({ valid: true, role: payload.role }),
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (err) {
    console.error("admin-verify error:", err);
    return new Response(
      JSON.stringify({ valid: false, error: "Verification failed" }),
      { status: 401, headers: CORS_HEADERS }
    );
  }
});
