import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { ApiError } from '../utils/apiError.js';
import { signToken } from '../utils/jwt.js';

export class AuthService {
  constructor({ userRepository, passwordResetRepository, activityLogRepository, clinicRepository }) {
    this.userRepository = userRepository;
    this.passwordResetRepository = passwordResetRepository;
    this.activityLogRepository = activityLogRepository;
    this.clinicRepository = clinicRepository;
  }

  async register(payload, actor) {
    if (!actor?.id || actor.role !== 'ADMIN') {
      throw new ApiError(403, 'Apenas administradores podem criar contas');
    }

    if (payload.role === 'ADMIN') {
      throw new ApiError(403, 'Não é permitido criar outra conta de administrador');
    }

    const clinic = await this.clinicRepository.findById(payload.clinicId);

    if (!clinic) {
      throw new ApiError(404, 'Consultório não encontrado');
    }

    const actorMembership = await this.clinicRepository.findMember(clinic.id, actor.id);

    if (!actorMembership) {
      throw new ApiError(403, 'Você não tem acesso ao consultório vinculado');
    }

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

    const membership = await this.clinicRepository.findMember(clinic.id, user.id);
    if (!membership) {
      await this.clinicRepository.addMember(clinic.id, user.id);
    }

    await this.activityLogRepository.create({
      clinicId: clinic.id,
      userId: actor?.id || user.id,
      action: 'USER_REGISTERED',
      entity: 'User',
      entityId: user.id,
      metadata: { role: user.role },
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      clinicId: clinic.id,
    };
  }

  async login(payload) {
    const user = await this.userRepository.findByEmailWithClinics(payload.email);

    if (!user || !(await bcrypt.compare(payload.password, user.passwordHash))) {
      throw new ApiError(401, 'Credenciais inválidas');
    }

    const clinics = user.clinicMemberships.map((membership) => membership.clinic);

    if (!clinics.length) {
      throw new ApiError(403, 'Usuário não está vinculado a nenhum consultório');
    }

    const activeClinic = clinics[0];

    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      clinicId: activeClinic.id,
    });

    return {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, clinicId: activeClinic.id },
      clinic: {
        id: activeClinic.id,
        name: activeClinic.name,
        address: activeClinic.address,
        cnpj: activeClinic.cnpj,
      },
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
