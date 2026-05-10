import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const DEFAULT_CLINIC_ID = '00000000-0000-0000-0000-000000000001';

async function cleanDatabase() {
  try {
    console.log('Limpando dados operacionais para evitar conflitos...');

    await prisma.$transaction([
      prisma.activityLog.deleteMany({}),
      prisma.attachment.deleteMany({}),
      prisma.clinicalRecord.deleteMany({}),
      prisma.odontogram.deleteMany({}),
      prisma.medicalRecord.deleteMany({}),
      prisma.anamnesis.deleteMany({}),
      prisma.payment.deleteMany({}),
      prisma.treatment.deleteMany({}),
      prisma.appointment.deleteMany({}),
      prisma.patient.deleteMany({}),
      prisma.clinicMember.deleteMany({}),
    ]);

    const defaultClinic = await prisma.clinic.upsert({
      where: { id: DEFAULT_CLINIC_ID },
      update: { name: 'Consultório Principal' },
      create: {
        id: DEFAULT_CLINIC_ID,
        name: 'Consultório Principal',
      },
    });

    const users = await prisma.user.findMany({ select: { id: true } });

    for (const user of users) {
      await prisma.clinicMember.upsert({
        where: {
          clinicId_userId: {
            clinicId: defaultClinic.id,
            userId: user.id,
          },
        },
        update: {},
        create: {
          clinicId: defaultClinic.id,
          userId: user.id,
        },
      });
    }

    console.log('Limpeza concluída com sucesso.');
    console.log(`Consultório principal: ${defaultClinic.name}`);
    console.log(`Usuários vinculados ao consultório padrão: ${users.length}`);
  } catch (error) {
    console.error('Erro ao limpar o banco:', error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

cleanDatabase();