import { syncPatientOrder } from '../src/services/orderService.js';

async function main() {
  try {
    const res = await syncPatientOrder({
      no_regis: '2610260240',
      patientId: '48730',
      rmNumber: '48730',
      patientName: 'AGUS KURNIAWAN'
    });
    console.log('Result:', res);
  } catch (err) {
    console.error('Error in syncPatientOrder:', err.message);
  }
}

main();

