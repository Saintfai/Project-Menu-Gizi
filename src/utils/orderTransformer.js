/**
 * Utilitas Transformasi & Agregasi Data Pesanan Dapur Gizi
 * Mengonsolidasikan data pesanan transaksi mentah menjadi 1 baris per pasien/orderCode
 * dengan notasi standar Dapur Gizi ('/' porsi pendamping, '|' paket ekstra, '-' nihil),
 * serta deteksi riwayat alergi dan bentuk makanan.
 */

/**
 * Memformat daftar item pesanan pada satu waktu makan menjadi format teks standar Dapur Gizi.
 * 
 * Aturan Notasi Pemisah (PRD 3.8):
 * - Menampilkan nama menu aktual (cth: "Chicken Teriyaki", "Soto Bandung")
 * - Garis Miring (`/`): Memisahkan porsi pasien dan pendamping (cth: "Chicken Teriyaki / Soto Bandung" atau "Chicken Teriyaki 2x")
 * - Garis Tegak (`|`): Memisahkan Paket Utama (INCLUDE) dengan Paket Ekstra (EXCLUDE) (cth: "Chicken Teriyaki 2x | Soto Bandung")
 * - Tanda Strip (`-`): Ditampilkan jika waktu makan tidak dipesan oleh pasien
 * 
 * @param {Array<object>} [items=[]] - Daftar item pesanan untuk satu waktu makan
 * @returns {string} String terformat sesuai notasi dapur gizi
 */
export function formatMealColumn(items = []) {
  if (!items || items.length === 0) return '-';

  // Filter item yang tidak memiliki menu aktual atau nama paket nyata
  const validItems = items.filter(item => {
    const rawName = item.menuName || item.name || item.paketName || '';
    const name = typeof rawName === 'string' ? rawName.trim() : String(rawName).trim();
    return name !== '' && name !== '-';
  });

  if (validItems.length === 0) return '-';

  const includeItems = validItems.filter(i => (i.type || 'INCLUDE').toUpperCase() === 'INCLUDE');
  const excludeItems = validItems.filter(i => (i.type || '').toUpperCase() === 'EXCLUDE');

  const formatGroup = (group) => {
    if (group.length === 0) return '';
    const counts = {};
    group.forEach(item => {
      const rawName = item.menuName || item.name || item.paketName || 'Menu';
      let name = typeof rawName === 'string' ? rawName.trim() : rawName;
      // Bentuk makanan sekarang ditampilkan di kolom khusus
      counts[name] = (counts[name] || 0) + (item.quantity || 1);
    });

    const entries = Object.entries(counts);
    return entries.map(([name, qty]) => (qty > 1 ? `${name} ${qty}x` : name)).join(' / ');
  };

  const includeStr = formatGroup(includeItems);
  const excludeStr = formatGroup(excludeItems);

  if (includeStr && excludeStr) {
    return `${includeStr} | ${excludeStr}`;
  }
  if (includeStr) {
    return includeStr;
  }
  if (excludeStr) {
    return excludeStr;
  }
  return '-';
}

/**
 * Memeriksa apakah pesanan merupakan order kosong (tanpa menu) dari pasien registrasi lewat cut-off.
 * Digunakan untuk mendeteksi order yang perlu di-sync dengan SIMRS.
 * 
 * @param {object} groupedRow - Baris data pesanan yang sudah dikelompokkan per pasien/orderCode
 * @returns {boolean} True jika semua waktu makan kosong (tidak ada item menu sama sekali)
 */
export function isEmptyOrder(groupedRow) {
  if (!groupedRow) return true;

  // Cek apakah ada item di salah satu sesi makan
  const hasItems = (
    (Array.isArray(groupedRow.itemsPagi) && groupedRow.itemsPagi.length > 0) ||
    (Array.isArray(groupedRow.itemsSiang) && groupedRow.itemsSiang.length > 0) ||
    (Array.isArray(groupedRow.itemsSore) && groupedRow.itemsSore.length > 0)
  );

  if (hasItems) {
    // Pastikan item tersebut bukan hanya placeholder kosong
    const allItems = [
      ...(groupedRow.itemsPagi || []),
      ...(groupedRow.itemsSiang || []),
      ...(groupedRow.itemsSore || []),
    ];
    const hasRealMenu = allItems.some(item => {
      const name = (item.menuName || item.name || item.paketName || '').trim();
      return name !== '' && name !== '-';
    });
    if (hasRealMenu) return false;
  }

  // Jika tidak ada item atau hanya placeholder, periksa teks kolom makan
  if (groupedRow.makanPagi || groupedRow.makanSiang || groupedRow.makanSore || groupedRow.makanMalam) {
    const p = (groupedRow.makanPagi || '-').trim();
    const s = (groupedRow.makanSiang || '-').trim();
    const m = (groupedRow.makanSore || groupedRow.makanMalam || '-').trim();
    if (p !== '-' || s !== '-' || m !== '-') {
      return false;
    }
  }

  return true;
}

/**
 * Memeriksa apakah pasien memiliki riwayat alergi yang valid (bukan teks kosong atau 'tidak ada').
 * 
 * @param {string | null | undefined} allergies - Teks riwayat alergi pasien
 * @returns {boolean} True jika pasien memiliki riwayat alergi nyata
 */
export function hasRealAllergy(allergies) {
  if (!allergies || typeof allergies !== 'string') return false;
  const cleaned = allergies.trim().toLowerCase();
  const nonAllergyValues = [
    'tidak ada',
    'tidak',
    'none',
    'nihil',
    '-',
    '--',
    'n/a',
    'na',
    'null',
    'no allergy',
    'no allergies',
    'tidak ada alergi',
    'tidak ada riwayat alergi',
  ];
  return cleaned.length > 0 && !nonAllergyValues.includes(cleaned);
}

/**
 * Menormalisasi berbagai format tanggal (ISO string, YYYY-MM-DD, DD/MM/YYYY, Date object)
 * ke format standar YYYY-MM-DD sesuai zona waktu lokal/WIB.
 * 
 * @param {string | Date | null | undefined} dateVal - Nilai tanggal input
 * @returns {string} Tanggal dalam format YYYY-MM-DD atau string kosong
 */
export function normalizeDateToYYYYMMDD(dateVal) {
  if (!dateVal) return '';

  // Jika sudah string murni YYYY-MM-DD (tanpa jam/zona waktu)
  if (typeof dateVal === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateVal.trim())) {
    return dateVal.trim();
  }

  // Jika format DD/MM/YYYY atau DD-MM-YYYY
  if (typeof dateVal === 'string' && /^\d{2}[/-]\d{2}[/-]\d{4}$/.test(dateVal.trim())) {
    const parts = dateVal.trim().split(/[/-]/);
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  }

  // Jika ISO string atau objek Date: parse dengan Date object lokal
  const d = new Date(dateVal);
  if (!isNaN(d.getTime())) {
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  // Fallback regex jika ada substring YYYY-MM-DD
  if (typeof dateVal === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateVal)) {
    return dateVal.slice(0, 10);
  }

  return '';
}

/**
 * Mengelompokkan data mentah pesanan (flat order records) menjadi 1 baris terintegrasi per sesi checkout dan tanggal saji.
 * Digunakan untuk menyajikan tabel rekapitulasi Dapur Gizi sesuai PRD 3.8.
 * 
 * @param {Array<object>} [rawOrders=[]] - Daftar order mentah dari database
 * @returns {Array<object>} Daftar pesanan terkelompok per pasien/orderCode siap tampil di tabel
 */
export function groupOrdersForTable(rawOrders = []) {
  if (!rawOrders || rawOrders.length === 0) return [];

  const grouped = {};

  rawOrders.forEach(order => {
    const rawServingDate = order.servingDate || order.serving_date || order.createdAt || order.created_at;
    const dateStr = normalizeDateToYYYYMMDD(rawServingDate);

    // Pisahkan grup berdasarkan orderCode dan tanggal saji (agar pesanan hari ini dan besok terpisah mandiri)
    const baseCode = order.orderCode || order.orderId || order.patientId || order.pasienRM || 'ORD';
    const key = dateStr ? `${baseCode}_${dateStr}` : baseCode;

    if (!grouped[key]) {
      const allergyRaw = order.patient?.allergies ?? order.allergies ?? order.allergyNote ?? null;
      const isAllergic = typeof order.hasAllergy === 'boolean' ? order.hasAllergy : hasRealAllergy(allergyRaw);
      const noReg = order.noReg || order.noreg || order.no_regis || order.no_reg || order.no_registrasi || order.patient?.noReg || order.patient?.noreg || order.patient?.no_regis || order.patient?.no_registrasi || null;

      grouped[key] = {
        id: key,
        orderCode: order.orderCode || baseCode,
        patientId: order.patientId || order.patient_id || order.rmNumber || order.rm_number,
        noReg: noReg,
        noreg: noReg,
        no_reg: noReg,
        no_regis: noReg,
        no_registrasi: noReg,
        patientName: order.patient?.name || order.patientName || order.pasienRM || 'Pasien',
        rmNumber: order.patient?.rmNumber || order.rmNumber || 'RM-000',
        pasienRM: `${order.patient?.name || order.patientName || 'Pasien'} (${order.patient?.rmNumber || order.rmNumber || 'RM-000'})`,
        kamar: (order.roomNumber ? `${order.roomNumber} - ${order.classType || ''}` : (order.kamar || '-')).replace(/\s*\|\s*$/, ''),
        hasAllergy: isAllergic,
        allergyNote: isAllergic ? allergyRaw : null,
        notes: order.notes || order.catatan || null,
        hasCatatan: Boolean(order.notes || order.catatan),
        createdAt: order.createdAt || new Date(),
        servingDate: order.servingDate || order.serving_date || (dateStr || new Date(Date.now() + 86400000)),
        itemsPagi: [],
        itemsSiang: [],
        itemsSore: [],
      };
    }

    const mealTime = (order.mealTime || '').toUpperCase();
    if (mealTime === 'PAGI') {
      grouped[key].itemsPagi.push(order);
    } else if (mealTime === 'SIANG') {
      grouped[key].itemsSiang.push(order);
    } else if (mealTime === 'SORE') {
      grouped[key].itemsSore.push(order);
    }
  });

  return Object.values(grouped).map(group => {
    const dServing = new Date(group.servingDate);

    const pad = (n) => String(n).padStart(2, '0');
    let tanggalBesokStr = '-';
    if (!isNaN(dServing.getTime())) {
      tanggalBesokStr = `${pad(dServing.getDate())}/${pad(dServing.getMonth() + 1)}/${dServing.getFullYear()}`;
    }

    const makanPagi = formatMealColumn(group.itemsPagi);
    const makanSiang = formatMealColumn(group.itemsSiang);
    const makanSore = formatMealColumn(group.itemsSore);

    const allItems = [...group.itemsPagi, ...group.itemsSiang, ...group.itemsSore];

    // Prioritaskan bentukMakanan dari data pasien (API get-patient),
    // fallback ke bentukMakanan item menu jika data pasien tidak tersedia
    const patientBentuk = allItems.find(i => i.patientBentukMakanan)?.patientBentukMakanan
      || allItems.find(i => i.patient?.bentukMakanan)?.patient?.bentukMakanan
      || null;

    let bentukMakananText;
    if (patientBentuk) {
      bentukMakananText = patientBentuk;
    } else {
      const bentukSet = new Set(
        allItems
          .map(i => i.bentukMakanan)
          .filter(b => b && typeof b === 'string' && b.toLowerCase() !== 'biasa')
      );
      bentukMakananText = bentukSet.size > 0 ? Array.from(bentukSet).join(', ') : '-';
    }
    const combinedNotesList = allItems
      .map(i => i.notes || i.catatan)
      .filter(Boolean);
    const combinedNotes = combinedNotesList.length > 0
      ? Array.from(new Set(combinedNotesList)).join('\n')
      : group.notes;
    const groupHasCatatan = allItems.some(i => Boolean(i.notes || i.catatan)) || group.hasAllergy;

    return {
      id: group.id,
      orderCode: group.orderCode,
      patientId: group.patientId || group.rmNumber,
      noReg: group.noReg,
      noreg: group.noreg,
      no_reg: group.noReg,
      no_regis: group.noReg,
      no_registrasi: group.noReg,
      pasienRM: group.pasienRM,
      patientName: group.patientName,
      rmNumber: group.rmNumber,
      kamar: group.kamar,
      hasAllergy: group.hasAllergy,
      allergyNote: group.allergyNote,
      servingDate: group.servingDate,
      createdAt: group.createdAt,
      itemsPagi: group.itemsPagi,
      itemsSiang: group.itemsSiang,
      itemsSore: group.itemsSore,
      makanPagi,
      makanSiang,
      makanSore,
      makanMalam: makanSore, // alias for backwards compatibility
      tanggalWaktuPengantaran: tanggalBesokStr,
      tanggalBesok: tanggalBesokStr,
      tanggalBesokStr: tanggalBesokStr,
      bentukMakananText,
      hasCatatan: groupHasCatatan,
      catatan: combinedNotes || null,
      notes: combinedNotes || null,
      menuPagiText: makanPagi,
      menuSiangText: makanSiang,
      menuSoreText: makanSore,
      menuMalamText: makanSore, // alias for backwards compatibility
    };
  }).map(row => ({
    ...row,
    isEmptyOrder: isEmptyOrder(row),
  }));
}
