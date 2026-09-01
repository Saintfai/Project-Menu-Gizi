/**
 * Validates if current time is within cut-off time for Main Meal orders (15:00 WIB / UTC+7).
 * Main meal orders for tomorrow (T+1) must be placed before 15:00 WIB today.
 *
 * @returns {{ isPastCutoff: boolean, cutoffTimeText: string, remainingHours: number }}
 */
export function checkMainMealCutoff() {
  const now = new Date();

  // Convert to WIB (UTC+7)
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const wibTime = new Date(utc + 3600000 * 7);

  const hours = wibTime.getHours();
  const minutes = wibTime.getMinutes();

  // Cut-off threshold: 15:00 WIB
  const isPastCutoff = hours >= 15;

  return {
    isPastCutoff,
    cutoffTimeText: '15:00 WIB',
    currentTimeWIB: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} WIB`,
  };
}
