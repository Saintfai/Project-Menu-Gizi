import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

/**
 * Supabase Edge Function: patient-lookup
 *
 * Secure server-side patient verification with rate limiting and service_role access.
 * Replaces direct client-side querying of the Patient table to protect sensitive patient PII.
 *
 * Environment Variables (auto-provided by Supabase runtime):
 *   - SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY
 */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info",
  "Content-Type": "application/json",
};

// ── Rate Limiting (In-Memory sliding window per client IP) ──
interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10; // Max 10 requests per minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  // Clean up expired entries periodically
  if (rateLimitMap.size > 1000) {
    for (const [key, val] of rateLimitMap.entries()) {
      if (now > val.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    });
    return false;
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  record.count += 1;
  return false;
}

function getClientIP(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

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

  // ── 1. Check Rate Limit ──
  const clientIP = getClientIP(req);
  if (isRateLimited(clientIP)) {
    return new Response(
      JSON.stringify({
        error: "Terlalu banyak percobaan pencarian. Silakan tunggu 1 menit sebelum mencoba lagi.",
      }),
      { status: 429, headers: CORS_HEADERS }
    );
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars");
      return new Response(
        JSON.stringify({ error: "Konfigurasi server belum lengkap." }),
        { status: 500, headers: CORS_HEADERS }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const body = await req.json().catch(() => ({}));
    const { identifier, dob } = body;

    if (!identifier || typeof identifier !== "string" || !identifier.trim()) {
      return new Response(
        JSON.stringify({ error: "Nomor RM atau Nama Pasien wajib diisi." }),
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const normalizedInput = identifier.replace(/\s+/g, "").toLowerCase();
    const isRM = /\d/.test(normalizedInput);

    let query = supabase.from("Patient").select(
      "id, rmNumber, name, dob, phone, address, roomName, roomClass, allergies"
    );

    if (isRM) {
      const numericInput = normalizedInput.replace(/[^0-9]/g, "");
      const formattedRM = `RM-${numericInput}`;
      query = query.eq("rmNumber", formattedRM);
    } else {
      if (!dob) {
        return new Response(
          JSON.stringify({
            error: "Tanggal lahir wajib diisi untuk pencarian berdasarkan nama.",
          }),
          { status: 400, headers: CORS_HEADERS }
        );
      }
      query = query.eq("dob", dob);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Database query error in patient-lookup:", error);
      return new Response(
        JSON.stringify({ error: "Terjadi kesalahan saat memproses data pasien." }),
        { status: 500, headers: CORS_HEADERS }
      );
    }

    if (!data || data.length === 0) {
      return new Response(
        JSON.stringify({ error: "Data pasien tidak ditemukan." }),
        { status: 404, headers: CORS_HEADERS }
      );
    }

    const matchedPatients = data.filter((p) => {
      if (isRM) {
        const pNumeric = (p.rmNumber || "").replace(/[^0-9]/g, "");
        const inputNumeric = normalizedInput.replace(/[^0-9]/g, "");
        return pNumeric === inputNumeric;
      } else {
        const normName = (p.name || "").replace(/\s+/g, "").toLowerCase();
        return normName === normalizedInput;
      }
    });

    if (matchedPatients.length === 0) {
      return new Response(
        JSON.stringify({
          error: "Data pasien tidak ditemukan atau tanggal lahir salah.",
        }),
        { status: 404, headers: CORS_HEADERS }
      );
    }

    if (matchedPatients.length === 1) {
      const patientData = {
        ...matchedPatients[0],
        isVerified: true,
      };
      return new Response(
        JSON.stringify({ type: "single", patient: patientData }),
        { status: 200, headers: CORS_HEADERS }
      );
    }

    return new Response(
      JSON.stringify({ type: "multiple", patients: matchedPatients }),
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (err) {
    console.error("patient-lookup unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Terjadi kesalahan internal server." }),
      { status: 500, headers: CORS_HEADERS }
    );
  }
});
