/**
 * Logic for 11 Menu Cycles according to Hospital Dietary PRD:
 * - Date 1 - 10: Cycle 1 - 10
 * - Date 11 - 20: Repeat Cycle 1 - 10
 * - Date 21 - 30: Repeat Cycle 1 - 10
 * - Date 31: Specific Cycle 11
 *
 * @param {Date|string|number} [dateInput] - Defaults to tomorrow (T+1) if not provided.
 * @returns {number} Cycle number (1 to 11)
 */
export function getMenuCycleByDate(dateInput) {
  let targetDate;
  if (!dateInput) {
    // Default to tomorrow (T+1) for main meal planning
    targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 1);
  } else {
    targetDate = new Date(dateInput);
  }

  const dayOfMonth = targetDate.getDate();

  // Date 31 is specifically Cycle 11
  if (dayOfMonth === 31) {
    return 11;
  }

  // Days 1-30 map to cycles 1-10
  const cycle = dayOfMonth % 10;
  return cycle === 0 ? 10 : cycle;
}

/**
 * Gets the serving date string for tomorrow (T+1)
 * Format: YYYY-MM-DD
 */
export function getTomorrowServingDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}
