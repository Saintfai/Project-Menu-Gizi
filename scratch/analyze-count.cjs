const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./scratch/menu_items_export.json', 'utf-8'));

console.log('Total menuItems:', data.menuItems.length);
console.log('');

const cycleCount = {};
const breakdown = {};

data.menuItems.forEach(item => {
  // Per siklus
  if (!cycleCount[item.cycleId]) cycleCount[item.cycleId] = 0;
  cycleCount[item.cycleId]++;

  // Per siklus + waktu makan
  const key = 'Siklus ' + item.cycleId + ' - ' + item.mealTime;
  if (!breakdown[key]) breakdown[key] = 0;
  breakdown[key]++;
});

console.log('=== Per Siklus ===');
Object.entries(cycleCount)
  .sort((a, b) => Number(a[0]) - Number(b[0]))
  .forEach(([k, v]) => console.log('  Siklus ' + k + ': ' + v + ' item'));

console.log('');
console.log('=== Per Siklus + Waktu Makan ===');
Object.entries(breakdown)
  .sort()
  .forEach(([k, v]) => console.log('  ' + k + ': ' + v + ' item'));
