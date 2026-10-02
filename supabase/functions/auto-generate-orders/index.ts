// @ts-ignore
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info",
  "Content-Type": "application/json",
};

// WIB Time Helper
function getWIBTime() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const wib = new Date(utc + 3600000 * 7);
  return {
    hours: wib.getHours(),
    minutes: wib.getMinutes(),
    wibDate: wib,
  };
}

function getTomorrowServingDate(): { servingDateISO: string; dayOfMonth: number } {
  const { wibDate } = getWIBTime();
  const tomorrow = new Date(wibDate);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
  const date = String(tomorrow.getDate()).padStart(2, "0");

  return {
    servingDateISO: `${year}-${month}-${date}T00:00:00.000Z`,
    dayOfMonth: tomorrow.getDate(),
  };
}

function getCycleByDay(dayOfMonth: number): number {
  if (dayOfMonth === 31) return 11;
  const cycle = dayOfMonth % 10;
  return cycle === 0 ? 10 : cycle;
}

serve(async (req: any) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: CORS_HEADERS });
  }

  try {
    // @ts-ignore
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    // @ts-ignore
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars");
      return new Response(
        JSON.stringify({ error: "Konfigurasi server belum lengkap." }),
        { status: 500, headers: CORS_HEADERS }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1. Calculate serving date and cycle
    const { servingDateISO, dayOfMonth } = getTomorrowServingDate();
    const cycleNumber = getCycleByDay(dayOfMonth);

    // 2. Fetch menu items for this cycle
    const { data: menuItems, error: menuError } = await supabase
      .from("MenuItem")
      .select("*")
      .eq("cycleId", cycleNumber);

    if (menuError) {
      console.error("Error fetching menu items:", menuError);
      return new Response(
        JSON.stringify({ error: "Gagal memuat menu siklus: " + menuError.message }),
        { status: 500, headers: CORS_HEADERS }
      );
    }

    const getPaketA = (mealTime: string) => {
      const found = menuItems?.find(
        (m: any) =>
          m.mealTime === mealTime &&
          (m.paketName?.toUpperCase().includes("A") || m.name?.toUpperCase().includes("PAKET A"))
      );
      return (
        found || {
          name: `Paket A (${mealTime})`,
          paketName: "Paket A",
          bentukMakanan: null,
        }
      );
    };

    const menuPagi = getPaketA("PAGI");
    const menuSiang = getPaketA("SIANG");
    const menuSore = getPaketA("SORE");

    // 3. Query all patients with roomClass = 'Kelas'
    const { data: kelasPatients, error: patientError } = await supabase
      .from("Patient")
      .select("id, rmNumber, name, roomName, roomClass, allergies")
      .eq("roomClass", "Kelas");

    if (patientError) {
      console.error("Error fetching Kelas patients:", patientError);
      return new Response(
        JSON.stringify({ error: "Gagal memuat data pasien Kelas: " + patientError.message }),
        { status: 500, headers: CORS_HEADERS }
      );
    }

    if (!kelasPatients || kelasPatients.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Tidak ada pasien dengan roomClass 'Kelas' saat ini.",
          servingDate: servingDateISO,
          cycleNumber,
          generatedPatientsCount: 0,
          generatedOrdersCount: 0,
        }),
        { status: 200, headers: CORS_HEADERS }
      );
    }

    // 4. Check existing orders for tomorrow to maintain idempotency
    const patientIds = kelasPatients.map((p: any) => p.id);
    const { data: existingOrders, error: existingError } = await supabase
      .from("Order")
      .select("patientId")
      .in("patientId", patientIds)
      .eq("servingDate", servingDateISO)
      .eq("type", "INCLUDE");

    if (existingError) {
      console.error("Error checking existing orders:", existingError);
      return new Response(
        JSON.stringify({ error: "Gagal memeriksa pesanan eksisting: " + existingError.message }),
        { status: 500, headers: CORS_HEADERS }
      );
    }

    const patientsWithOrders = new Set((existingOrders || []).map((o: any) => o.patientId));
    const eligiblePatients = kelasPatients.filter((p: any) => !patientsWithOrders.has(p.id));

    if (eligiblePatients.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Semua pasien Kelas sudah memiliki pesanan untuk tanggal penyajian ini.",
          servingDate: servingDateISO,
          cycleNumber,
          totalKelasPatients: kelasPatients.length,
          generatedPatientsCount: 0,
          generatedOrdersCount: 0,
        }),
        { status: 200, headers: CORS_HEADERS }
      );
    }

    // 5. Generate Order records for eligible patients
    const dateStr = servingDateISO.slice(0, 10).replace(/-/g, "");
    const ordersToInsert: any[] = [];

    eligiblePatients.forEach((patient: any) => {
      const randomStr = Math.floor(1000 + Math.random() * 9000);
      const orderCode = `ORD-${dateStr}-AUTO-${randomStr}`;

      const meals = [
        { mealTime: "PAGI", menu: menuPagi },
        { mealTime: "SIANG", menu: menuSiang },
        { mealTime: "SORE", menu: menuSore },
      ];

      meals.forEach(({ mealTime, menu }) => {
        ordersToInsert.push({
          id: crypto.randomUUID(),
          orderCode,
          patientId: patient.id,
          roomNumber: patient.roomName || "-",
          classType: patient.roomClass || "Kelas",
          menuName: menu.name,
          paketName: menu.paketName || "Paket A",
          mealTime,
          servingDate: servingDateISO,
          quantity: 1,
          type: "INCLUDE",
          consumer: "PASIEN",
          notes: null,
          bentukMakanan: null,
          isAutoGenerated: true,
        });
      });
    });

    // 6. Insert into database
    const { data: insertedData, error: insertError } = await supabase
      .from("Order")
      .insert(ordersToInsert)
      .select();

    if (insertError) {
      console.error("Error inserting auto-generated orders:", insertError);
      return new Response(
        JSON.stringify({ error: "Gagal menyimpan pesanan otomatis: " + insertError.message }),
        { status: 500, headers: CORS_HEADERS }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Berhasil membuat ${insertedData?.length || 0} pesanan otomatis untuk ${eligiblePatients.length} pasien Kelas.`,
        servingDate: servingDateISO,
        cycleNumber,
        generatedPatientsCount: eligiblePatients.length,
        generatedOrdersCount: insertedData?.length || 0,
        patientNames: eligiblePatients.map((p: any) => p.name),
      }),
      { status: 201, headers: CORS_HEADERS }
    );
  } catch (err: any) {
    console.error("auto-generate-orders unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Terjadi kesalahan internal server: " + (err.message || err) }),
      { status: 500, headers: CORS_HEADERS }
    );
  }
});
