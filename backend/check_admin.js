import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAdmin() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'enzocasais0802@gmail.com' }
    });
    
    if (user) {
      console.log('✅ Admin encontrado no banco:');
      console.log('  ID:', user.id);
      console.log('  Nome:', user.name);
      console.log('  Email:', user.email);
      console.log('  Role:', user.role);
      console.log('  isActive:', user.isActive);
      console.log('  Senha hash (primeiros 20 chars):', user.passwordHash?.substring(0, 20) + '...');
    } else {
      console.log('❌ Admin NÃO encontrado no banco');
    }
  } catch (error) {
    console.error('Erro ao consultar banco:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmin();
