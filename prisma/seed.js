import { PrismaClient } from '../src/generated/prisma/index.js';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const { Pool } = pg;
const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database via Prisma...');

  const patient = await prisma.patient.upsert({
    where: { rmNumber: 'RM-12345' },
    update: {},
    create: {
      rmNumber: 'RM-12345',
      name: 'pasien',
      dob: new Date('2003-02-01T00:00:00Z'),
      phone: '081234567890',
      roomName: 'Mawar 101',
      roomClass: 'VIP_A',
      allergies: 'Tidak Ada',
      medicalConditions: 'Tidak Ada',
    },
  });

  console.log('Seeded Patient:', patient);
  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
