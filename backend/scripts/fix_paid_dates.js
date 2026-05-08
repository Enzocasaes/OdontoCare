// Script para corrigir pagamentos PAID sem paidAt definido
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixPaidDates() {
  try {
    console.log('🔍 Buscando pagamentos PAID sem paidAt...');
    
    const paymentsWithoutPaidAt = await prisma.payment.findMany({
      where: {
        status: 'PAID',
        paidAt: null
      },
      include: {
        treatment: {
          include: {
            patient: true
          }
        }
      }
    });

    console.log(`📊 Encontrados ${paymentsWithoutPaidAt.length} pagamentos para corrigir`);

    if (paymentsWithoutPaidAt.length === 0) {
      console.log('✅ Nenhum pagamento precisa ser corrigido');
      return;
    }

    for (const payment of paymentsWithoutPaidAt) {
      // Usa updatedAt como data de pagamento (mais provável que seja a data que foi marcado como pago)
      const paidAtDate = payment.updatedAt;
      
      console.log(`🔧 Corrigindo pagamento ${payment.id}:`);
      console.log(`   Paciente: ${payment.treatment.patient.name}`);
      console.log(`   Valor: R$ ${payment.amount}`);
      console.log(`   Parcela: ${payment.installmentNumber}/${payment.totalInstallments}`);
      console.log(`   Definindo paidAt: ${paidAtDate.toLocaleString('pt-BR')}`);

      await prisma.payment.update({
        where: { id: payment.id },
        data: { paidAt: paidAtDate }
      });
    }

    console.log(`\n✅ ${paymentsWithoutPaidAt.length} pagamentos corrigidos com sucesso!`);
    
  } catch (error) {
    console.error('❌ Erro ao corrigir pagamentos:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixPaidDates()
  .then(() => {
    console.log('🎉 Script concluído!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Falha na execução:', error);
    process.exit(1);
  });
