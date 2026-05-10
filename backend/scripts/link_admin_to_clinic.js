import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const adminEmail = process.env.ADMIN_EMAIL?.trim()?.toLowerCase() || 'enzocasais0802@gmail.com';
const clinicName = process.env.ADMIN_CLINIC_NAME?.trim() || 'Consultório Principal';

async function main() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (!user) {
      throw new Error(`Usuário admin não encontrado: ${adminEmail}`);
    }

    const clinic = await prisma.clinic.findFirst({
      where: { name: clinicName },
      orderBy: { createdAt: 'asc' },
    }) ?? await prisma.clinic.create({
      data: { name: clinicName },
    });

    const membership = await prisma.clinicMember.upsert({
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

    console.log('Admin vinculado ao consultório com sucesso.');
    console.log('Email:', user.email);
    console.log('Consultório:', clinic.name);
    console.log('Membership ID:', membership.id);
  } catch (error) {
    console.error('Falha ao vincular admin ao consultório:');
    console.error(error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();