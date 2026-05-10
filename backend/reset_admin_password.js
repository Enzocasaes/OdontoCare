import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetAdminPassword() {
  const newPassword = 'admin123'; // Senha simples para teste
  const passwordHash = await bcrypt.hash(newPassword, 10);
  
  try {
    const user = await prisma.user.update({
      where: { email: 'enzocasais0802@gmail.com' },
      data: { passwordHash }
    });
    
    console.log('✅ Senha do admin resetada com sucesso!');
    console.log('Email:', user.email);
    console.log('Nova senha: ' + newPassword);
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminPassword();
