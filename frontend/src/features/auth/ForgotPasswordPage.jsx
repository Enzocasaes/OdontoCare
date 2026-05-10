import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '../../services/api';
import { maskEmail } from '../../utils/masks';

const schema = z.object({
  email: z.string().email('Email invalido'),
});

export const ForgotPasswordPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    const response = await api.post('/auth/forgot-password', data);
    alert(`Token de recuperacao (simulacao): ${response.data.token || 'nao gerado'}`);
    reset();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-xl font-bold">Recuperar senha</h1>
        <label className="mt-4 block text-sm">Email</label>
        <input
          {...register('email', { setValueAs: (value) => maskEmail(value) })}
          type="email"
          autoComplete="email"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
        />
        {errors.email && <p className="text-xs text-rose-600">{errors.email.message}</p>}
        <button className="mt-4 w-full rounded-lg bg-cyan-600 py-2 text-white">Solicitar token</button>
      </form>
    </div>
  );
};
