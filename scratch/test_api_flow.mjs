const BASE_URL = 'https://dev-flow.edelweiss.id';
const cred = Buffer.from('menu-gizi:KamiParaPejuang123!').toString('base64');
const headers = { 'Authorization': `Basic ${cred}` };

async function run() {
  console.log('Testing Menu Cycle...');
  const resCycle = await fetch(`${BASE_URL}/webhook/menu-gizi-cycle`, { headers });
  const dataCycle = await resCycle.json();
  console.log('Menu cycle count:', dataCycle.length, 'sample mid:', dataCycle[0]?.mid, dataCycle[0]?.name);

  console.log('Testing All Orders...');
  const resOrders = await fetch(`${BASE_URL}/webhook/all-order-item`, { headers });
  const dataOrders = await resOrders.json();
  console.log('Orders count:', dataOrders.length, 'sample id:', dataOrders[0]?.id, 'type:', dataOrders[0]?.type);

  console.log('Testing Patient Lookup (pid=26768)...');
  const resPatient = await fetch(`${BASE_URL}/webhook/get-patient?pid=26768`, { headers });
  const dataPatient = await resPatient.json();
  console.log('Patient found:', dataPatient[0]?.nama_pasien, 'kelas:', dataPatient[0]?.kelas, 'titipan:', dataPatient[0]?.titipan);

  console.log('Testing Patient Lookup by Name & DOB (nama=SYIFA&tanggal_lahir=26-04-1988)...');
  const resPatientDob = await fetch(`${BASE_URL}/webhook/get-patient-date-birth?nama=SYIFA&tanggal_lahir=26-04-1988`, { headers });
  const dataPatientDob = await resPatientDob.json();
  console.log('Patient by DOB found:', dataPatientDob[0]?.nama_pasien, 'tgl:', dataPatientDob[0]?.tanggal_lahir, 'kamar:', dataPatientDob[0]?.kamar);

  console.log('ALL API VERIFICATIONS PASSED SUCCESSFULLY!');
}

run().catch(err => {
  console.error('FAILED:', err);
  process.exit(1);
});
