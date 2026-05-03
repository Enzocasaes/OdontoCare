import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { ApiError } from '../utils/apiError.js';
import { signToken } from '../utils/jwt.js';

export class AuthService {
  constructor({ userRepository, passwordResetRepository, activityLogRepository }) {
    this.userRepository = userRepository;
    this.passwordResetRepository = passwordResetRepository;
    this.activityLogRepository = activityLogRepository;
  }

  async register(payload, actor) {
    const existing = await this.userRepository.findByEmail(payload.email);

    if (existing) {
      throw new ApiError(409, 'Email já está em uso');
    }

    const passwordHash = await bcrypt.hash(payload.password, 10);
    const user = await this.userRepository.create({
      name: payload.name,
      email: payload.email,
      passwordHash,
      role: payload.role,
    });

    await this.activityLogRepository.create({
      userId: actor?.id || user.id,
      action: 'USER_REGISTERED',
      entity: 'User',
      entityId: user.id,
      metadata: { role: user.role },
    });

    return { id: user.id, name: user.name, email: user.email, role: user.role };
  }

  async login(payload) {
    const user = await this.userRepository.findByEmail(payload.email);

    if (!user || !(await bcrypt.compare(payload.password, user.passwordHash))) {
      throw new ApiError(401, 'Credenciais inválidas');
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role, name: user.name });

    return {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    };
  }

  async requestPasswordReset(email) {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
    return { message: 'Se o email existe, instruções de reset foram geradas.' };
    }

    const token = crypto.randomBytes(20).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await this.passwordResetRepository.create({ userId: user.id, token, expiresAt });

    return { message: 'Token de reset gerado para simulação', token };
  }

  async resetPassword(token, newPassword) {
    const resetToken = await this.passwordResetRepository.findValidToken(token);

    if (!resetToken) {
      throw new ApiError(400, 'Token de reset inválido ou expirado');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await this.userRepository.prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    });

    await this.passwordResetRepository.markAsUsed(resetToken.id);
    return { message: 'Senha atualizada com sucesso' };
  }
}
