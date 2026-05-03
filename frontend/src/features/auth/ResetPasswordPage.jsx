import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '../../services/api';

const schema = z.object({
  token: z.string().min(10, 'Informe o token recebido'),
  newPassword: z.string().min(8, 'A nova senha precisa ter ao menos 8 caracteres'),
});

export const ResetPasswordPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    await api.post('/auth/reset-password', data);
    alert('Senha redefinida com sucesso.');
    reset();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4 dark:bg-slate-950">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg dark:bg-slate-900">
        <h1 className="text-xl font-bold">Redefinir senha</h1>
        <p className="mt-1 text-sm text-slate-500">Use o token gerado pelo fluxo de recuperação.</p>
        <div className="mt-4 space-y-4">
          <div>
            <label className="text-sm">Token</label>
            <input {...register('token')} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:bg-slate-950" />
            {errors.token && <p className="text-xs text-rose-600">{errors.token.message}</p>}
          </div>
          <div>
            <label className="text-sm">Nova senha</label>
            <input type="password" {...register('newPassword')} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:bg-slate-950" />
            {errors.newPassword && <p className="text-xs text-rose-600">{errors.newPassword.message}</p>}
          </div>
          <button className="w-full rounded-lg bg-cyan-600 py-2 text-white">Atualizar senha</button>
        </div>
      </form>
    </div>
  );
};
