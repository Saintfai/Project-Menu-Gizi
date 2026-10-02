require('dotenv').config({path: '.env'});
const { Client } = require('pg');

(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const pad = (n) => String(n).padStart(2, '0');
  const tomorrowStr = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());

  // Find orders for tomorrow that don't have notes
  const res = await client.query(`
    SELECT id FROM "Order" 
    WHERE "servingDate" >= $1 AND "servingDate" <= $2 
    AND (notes IS NULL OR notes = '')
    LIMIT 4
  `, [tomorrowStr + 'T00:00:00', tomorrowStr + 'T23:59:59']);
  
  if (res.rows.length === 0) {
    console.log('No empty orders found for tomorrow');
  } else {
    const dummyNotes = [
      'Tolong sayurnya dipotong kecil-kecil ya',
      'Nasinya dibikin agak lembek',
      'Kuahnya dibanyakin sedikit',
      'Jangan pakai saus tiram',
      'Ayam direbus, jangan digoreng'
    ];
    
    for (let i = 0; i < res.rows.length; i++) {
      const note = dummyNotes[i];
      await client.query('UPDATE "Order" SET notes = $1 WHERE id = $2', [note, res.rows[i].id]);
      console.log('Updated order', res.rows[i].id, 'with note:', note);
    }
  }
  
  await client.end();
})();
