import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const adminName = process.env.ADMIN_NAME?.trim();
const adminEmail = process.env.ADMIN_EMAIL?.trim()?.toLowerCase();
const adminPassword = process.env.ADMIN_PASSWORD;
const clinicName = process.env.ADMIN_CLINIC_NAME?.trim() || 'Consultório Principal';

async function main() {
  if (!adminName || !adminEmail || !adminPassword) {
    throw new Error('Defina ADMIN_NAME, ADMIN_EMAIL e ADMIN_PASSWORD no ambiente antes de executar.');
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const user = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: adminName,
      passwordHash,
      role: 'ADMIN',
    },
    create: {
      name: adminName,
      email: adminEmail,
      passwordHash,
      role: 'ADMIN',
    },
  });

  const clinic = await prisma.clinic.findFirst({
    where: { name: clinicName },
    orderBy: { createdAt: 'asc' },
  }) ?? await prisma.clinic.create({
    data: { name: clinicName },
  });

  await prisma.clinicMember.upsert({
    where: {
      clinicId_userId: {
        clinicId: clinic.id,
        userId: user.id,
      },
    },
    update: {},
    create: {
      clinicId: clinic.id,
      userId: user.id,
    },
  });

  console.log('Admin inicial configurado com sucesso.');
  console.log(`Nome: ${user.name}`);
  console.log(`Email: ${user.email}`);
  console.log(`Consultório vinculado: ${clinic.name}`);
}

main()
  .catch((error) => {
    console.error('Falha ao configurar o admin inicial:');
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
