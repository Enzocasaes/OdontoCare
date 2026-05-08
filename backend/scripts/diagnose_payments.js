// Script de diagnóstico - lista todos os pagamentos
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function diagnose() {
  try {
    console.log('📊 Listando todos os pagamentos...\n');
    
    const payments = await prisma.payment.findMany({
      include: {
        treatment: {
          include: {
            patient: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`Total de pagamentos: ${payments.length}\n`);

    payments.forEach((payment, index) => {
      console.log(`\n${index + 1}. Pagamento #${payment.id.substring(0, 8)}`);
      console.log(`   Paciente: ${payment.treatment.patient.name}`);
      console.log(`   Descrição: ${payment.treatment.description}`);
      console.log(`   Valor: R$ ${payment.amount}`);
      console.log(`   Parcela: ${payment.installmentNumber}/${payment.totalInstallments}`);
      console.log(`   Status: ${payment.status}`);
      console.log(`   Vencimento: ${payment.dueDate.toLocaleDateString('pt-BR')}`);
      console.log(`   Pago em: ${payment.paidAt ? payment.paidAt.toLocaleString('pt-BR') : 'N/A'}`);
      console.log(`   Criado em: ${payment.createdAt.toLocaleString('pt-BR')}`);
      console.log(`   Atualizado em: ${payment.updatedAt.toLocaleString('pt-BR')}`);
    });

    console.log('\n\n📈 Resumo:');
    const paid = payments.filter(p => p.status === 'PAID');
    const pending = payments.filter(p => p.status === 'PENDING');
    const totalPaid = paid.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const totalPending = pending.reduce((sum, p) => sum + parseFloat(p.amount), 0);

    console.log(`   Pagos: ${paid.length} (R$ ${totalPaid.toFixed(2)})`);
    console.log(`   Pendentes: ${pending.length} (R$ ${totalPending.toFixed(2)})`);
    
  } catch (error) {
    console.error('❌ Erro:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

diagnose()
  .then(() => {
    console.log('\n✅ Diagnóstico concluído!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Falha:', error);
    process.exit(1);
  });
