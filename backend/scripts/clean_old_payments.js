import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanOldPayments() {
  try {
    console.log('Limpando pagamentos antigos...');
    
    const result = await prisma.payment.deleteMany({});
    
    console.log(`✅ ${result.count} pagamento(s) removido(s) com sucesso!`);
    console.log('Agora você pode executar: npx prisma migrate dev --name add_financial_management');
  } catch (error) {
    console.error('Erro ao limpar pagamentos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanOldPayments();
