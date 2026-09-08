/**
 * Utility untuk mentransformasikan data pesanan mentah (flat table dari DB)
 * menjadi format 1 baris terintegrasi untuk Tabel Rekap Dapur Gizi.
 */

/**
 * Format string gabungan paket dalam 1 waktu makan.
 * Aturan PRD:
 * - '/' memisahkan porsi pasien & penunggu (atau jika sama digabung "Paket A 2x")
 * - '|' memisahkan Paket Utama (INCLUDE) dengan Paket Ekstra (EXCLUDE)
 * Contoh: "Paket A 2x | Paket B" atau "Paket A / Paket B | Paket A"
 *
 * @param {Array} items
 * @returns {string}
 */
export function formatMealColumn(items = []) {
  if (!items || items.length === 0) return '-';

  const includeItems = items.filter(i => (i.type || 'INCLUDE').toUpperCase() === 'INCLUDE');
  const excludeItems = items.filter(i => (i.type || '').toUpperCase() === 'EXCLUDE');

  const formatGroup = (group) => {
    if (group.length === 0) return '';
    const counts = {};
    group.forEach(item => {
      const name = item.paketName || item.menuName || 'Menu';
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
    return `| ${excludeStr}`;
  }
  return '-';
}

/**
 * Memeriksa apakah teks alergi pasien benar-benar memiliki riwayat alergi
 * (bukan "Tidak Ada", "-", "Nihil", "None", dsb).
 * @param {string|null} allergies
 * @returns {boolean}
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
 * Mengelompokkan data array Order mentah menjadi format baris tabel admin.
 * @param {Array} rawOrders - Array data order flat dari DB / API
 * @returns {Array} Array baris tabel siap pakai
 */
export function groupOrdersForTable(rawOrders = []) {
  if (!rawOrders || rawOrders.length === 0) return [];

  // Group by orderCode (atau patientId + servingDate)
  const grouped = {};

  rawOrders.forEach(order => {
    const key = order.orderCode || `${order.patientId || order.pasienRM}_${order.servingDate || 'T1'}`;
    if (!grouped[key]) {
      const allergyRaw = order.patient?.allergies ?? order.allergies ?? order.allergyNote ?? null;
      const isAllergic = typeof order.hasAllergy === 'boolean' ? order.hasAllergy : hasRealAllergy(allergyRaw);

      grouped[key] = {
        id: key,
        orderCode: order.orderCode || key,
        patientId: order.patientId,
        patientName: order.patient?.name || order.patientName || order.pasienRM || 'Pasien',
        rmNumber: order.patient?.rmNumber || order.rmNumber || 'RM-000',
        pasienRM: `${order.patient?.name || order.patientName || 'Pasien'} (${order.patient?.rmNumber || order.rmNumber || 'RM-000'})`,
        kamar: order.roomNumber ? `${order.roomNumber} - ${order.classType || ''}` : (order.kamar || '-'),
        hasAllergy: isAllergic,
        allergyNote: isAllergic ? allergyRaw : null,
        notes: order.notes || order.catatan || null,
        hasCatatan: Boolean(order.notes || order.catatan),
        createdAt: order.createdAt || new Date(),
        servingDate: order.servingDate || new Date(Date.now() + 86400000),
        itemsPagi: [],
        itemsSiang: [],
        itemsMalam: [],
      };
    }

    const mealTime = (order.mealTime || '').toUpperCase();
    if (mealTime === 'PAGI') {
      grouped[key].itemsPagi.push(order);
    } else if (mealTime === 'SIANG') {
      grouped[key].itemsSiang.push(order);
    } else if (mealTime === 'SORE' || mealTime === 'MALAM') {
      grouped[key].itemsMalam.push(order);
    }
  });

  return Object.values(grouped).map(group => {
    const dOrder = new Date(group.createdAt);
    const dServing = new Date(group.servingDate);

    const pad = (n) => String(n).padStart(2, '0');
    const tanggalBesokStr = `${pad(dServing.getDate())}/${pad(dServing.getMonth() + 1)}/${dServing.getFullYear()}`;

    const makanPagi = formatMealColumn(group.itemsPagi);
    const makanSiang = formatMealColumn(group.itemsSiang);
    const makanMalam = formatMealColumn(group.itemsMalam);

    return {
      id: group.id,
      orderCode: group.orderCode,
      pasienRM: group.pasienRM,
      patientName: group.patientName,
      rmNumber: group.rmNumber,
      kamar: group.kamar,
      hasAllergy: group.hasAllergy,
      allergyNote: group.allergyNote,
      makanPagi,
      makanSiang,
      makanMalam,
      tanggalWaktuPengantaran: tanggalBesokStr,
      tanggalBesok: tanggalBesokStr,
      hasCatatan: group.hasCatatan,
      catatan: group.notes,
      notes: group.notes,
      menuPagiText: makanPagi,
      menuSiangText: makanSiang,
      menuMalamText: makanMalam,
    };
  });
}
