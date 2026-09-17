import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

/**
 * Supabase Edge Function: create-order
 *
 * Secure server-side order processing and validation.
 * Enforces business rules on server:
 *   1. Cut-off time validation (WIB = UTC+7)
 *   2. Single checkout session & duplicate order prevention
 *   3. Portion quota validation by room class
 *   4. Text sanitization
 *   5. Atomic insert via service_role key
 */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info",
  "Content-Type": "application/json",
};

// ── WIB Time Helper ──
function getWIBTime() {
  const now = new Date();
  // UTC time + 7 hours for WIB
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const wib = new Date(utc + 3600000 * 7);
  return {
    hours: wib.getHours(),
    minutes: wib.getMinutes(),
    wibDate: wib,
  };
}

function getServingDateISO(): string {
  const { wibDate } = getWIBTime();
  const tomorrow = new Date(wibDate);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
  const date = String(tomorrow.getDate()).padStart(2, "0");
  return `${year}-${month}-${date}T00:00:00.000Z`;
}

function sanitizeString(str: unknown, maxLen = 300): string | null {
  if (typeof str !== "string") return null;
  const cleaned = str
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned ? cleaned.slice(0, maxLen) : null;
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

    const body = await req.json().catch(() => null);
    if (!body) {
      return new Response(
        JSON.stringify({ error: "Format request tidak valid." }),
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // Support both structured payload { patientId, roomNumber, classType, items, notes }
    // and flat array of items [{ patientId, ... }]
    let patientId = body.patientId;
    let roomNumber = body.roomNumber;
    let classType = body.classType;
    let rawNotes = body.notes;
    let items = body.items;

    if (Array.isArray(body)) {
      if (body.length === 0) {
        return new Response(
          JSON.stringify({ error: "Keranjang pesanan kosong." }),
          { status: 400, headers: CORS_HEADERS }
        );
      }
      patientId = body[0].patientId;
      roomNumber = body[0].roomNumber;
      classType = body[0].classType;
      rawNotes = body[0].notes;
      items = body;
    }

    if (!patientId || !items || !Array.isArray(items) || items.length === 0) {
      return new Response(
        JSON.stringify({ error: "Data pesanan tidak lengkap atau kosong." }),
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // Fetch patient record from DB to verify existence and get latest roomClass
    const { data: patient, error: patientError } = await supabase
      .from("Patient")
      .select("id, name, roomName, roomClass")
      .eq("id", patientId)
      .maybeSingle();

    if (patientError || !patient) {
      return new Response(
        JSON.stringify({ error: "Data pasien tidak ditemukan atau tidak valid." }),
        { status: 404, headers: CORS_HEADERS }
      );
    }

    const currentRoomClass = patient.roomClass || classType || "Kelas 1";
    const currentRoomName = patient.roomName || roomNumber || "-";

    // ── 1. Cut-Off Time Validation ──
    const { hours: currentHour, minutes: currentMin } = getWIBTime();

    const hasInclude = items.some((it: any) => it.type === "INCLUDE");
    const hasEkstraSiang = items.some(
      (it: any) => it.type === "EXCLUDE" && it.mealTime === "SIANG"
    );
    const hasEkstraSore = items.some(
      (it: any) => it.type === "EXCLUDE" && it.mealTime === "SORE"
    );

    if (hasInclude && currentHour >= 15) {
      return new Response(
        JSON.stringify({
          error: "Batas waktu pemesanan Paket Utama (15:00 WIB) telah lewat.",
        }),
        { status: 400, headers: CORS_HEADERS }
      );
    }

    if (hasEkstraSiang && currentHour >= 10) {
      return new Response(
        JSON.stringify({
          error: "Batas waktu pemesanan Ekstra Siang (10:00 WIB) telah lewat.",
        }),
        { status: 400, headers: CORS_HEADERS }
      );
    }

    if (hasEkstraSore && currentHour >= 14) {
      return new Response(
        JSON.stringify({
          error: "Batas waktu pemesanan Ekstra Sore (14:00 WIB) telah lewat.",
        }),
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const servingDateISO = getServingDateISO();

    // ── 2. Single Checkout Session / Duplicate Check ──
    if (hasInclude) {
      const { data: existingOrders, error: checkError } = await supabase
        .from("Order")
        .select("id")
        .eq("patientId", patient.id)
        .eq("servingDate", servingDateISO)
        .eq("type", "INCLUDE")
        .limit(1);

      if (checkError) {
        console.error("Error checking existing orders:", checkError);
        return new Response(
          JSON.stringify({ error: "Gagal memverifikasi status pesanan sebelumnya." }),
          { status: 500, headers: CORS_HEADERS }
        );
      }

      if (existingOrders && existingOrders.length > 0) {
        return new Response(
          JSON.stringify({
            error:
              "Menu utama untuk penyajian esok hari sudah dipesan sebelumnya. Anda hanya dapat memesan menu utama 1 kali per hari.",
          }),
          { status: 400, headers: CORS_HEADERS }
        );
      }
    }

    // ── 3. Portion Quota Validation ──
    // VIP A ke Atas (VIP A, VIP_A, VVIP, Suite): max 2 per mealTime
    // VIP B ke Bawah: PAGI: 2, SIANG: 1, SORE: 1
    const normalizedClass = currentRoomClass.toLowerCase().replace(/[\s_-]+/g, "");
    const isVipAOrAbove =
      normalizedClass.includes("vipa") ||
      normalizedClass.includes("vvip") ||
      normalizedClass.includes("suite");

    const maxQuota: Record<string, number> = {
      PAGI: 2,
      SIANG: isVipAOrAbove ? 2 : 1,
      SORE: isVipAOrAbove ? 2 : 1,
    };

    const mealTotals: Record<string, number> = { PAGI: 0, SIANG: 0, SORE: 0 };
    for (const item of items) {
      if (item.type === "INCLUDE") {
        const mealTime = item.mealTime?.toUpperCase();
        if (mealTime && mealTotals[mealTime] !== undefined) {
          mealTotals[mealTime] += Number(item.quantity) || 1;
        }
      }
    }

    for (const [mealTime, totalQty] of Object.entries(mealTotals)) {
      if (totalQty > maxQuota[mealTime]) {
        return new Response(
          JSON.stringify({
            error: `Batas kuota porsi ${mealTime} untuk kelas ${currentRoomClass} adalah ${maxQuota[mealTime]} porsi. Pilihan Anda: ${totalQty} porsi.`,
          }),
          { status: 400, headers: CORS_HEADERS }
        );
      }
    }

    // ── 4. Prepare Order Records ──
    const dateStr = servingDateISO.slice(0, 10).replace(/-/g, "");
    const randomStr = Math.floor(1000 + Math.random() * 9000);
    const orderCode = `ORD-${dateStr}-${randomStr}`;
    const sanitizedNote = sanitizeString(rawNotes);

    const recordsToInsert = items.map((item: any) => {
      return {
        id: crypto.randomUUID(),
        orderCode,
        patientId: patient.id,
        roomNumber: currentRoomName,
        classType: currentRoomClass,
        menuName: sanitizeString(item.menuName, 100) || item.menuName,
        paketName: sanitizeString(item.paketName, 50),
        mealTime: item.mealTime,
        servingDate: servingDateISO,
        quantity: Math.max(1, Math.min(10, Number(item.quantity) || 1)),
        type: item.type === "EXCLUDE" ? "EXCLUDE" : "INCLUDE",
        consumer: item.consumer === "PENDAMPING" ? "PENDAMPING" : "PASIEN",
        notes: sanitizedNote,
      };
    });

    // ── 5. Insert Orders via service_role ──
    const { data: insertedData, error: insertError } = await supabase
      .from("Order")
      .insert(recordsToInsert)
      .select();

    if (insertError) {
      console.error("Error inserting orders in create-order:", insertError);
      return new Response(
        JSON.stringify({
          error: "Gagal menyimpan pesanan ke database: " + insertError.message,
        }),
        { status: 500, headers: CORS_HEADERS }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        orderCode,
        count: insertedData?.length || 0,
        orders: insertedData,
      }),
      { status: 201, headers: CORS_HEADERS }
    );
  } catch (err: any) {
    console.error("create-order unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Terjadi kesalahan internal server: " + (err.message || err) }),
      { status: 500, headers: CORS_HEADERS }
    );
  }
});
