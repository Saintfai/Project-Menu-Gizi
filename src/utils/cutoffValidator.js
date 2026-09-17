
export function checkMainMealCutoff() {
  const now = new Date();

  
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const wibTime = new Date(utc + 3600000 * 7);

  const hours = wibTime.getHours();
  const minutes = wibTime.getMinutes();

  
  const isPastCutoff = hours >= 15;

  return {
    isPastCutoff,
    cutoffTimeText: '15:00 WIB',
    currentTimeWIB: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} WIB`,
  };
}

export function getCurrentWIBHour() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const wibTime = new Date(utc + 3600000 * 7);
  return wibTime.getHours();
}
