import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { maskOnlyLetters } from '../../utils/masks';

const schema = z.object({
  name: z.string().min(3, 'Informe o nome completo'),
  email: z.string().email('Informe um email valido'),
  password: z.string().min(8, 'Minimo de 8 caracteres'),
  role: z.enum(['ADMIN', 'DENTIST', 'RECEPTION']),
});

export const RegisterPage = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: 'RECEPTION' },
  });

  const nameValue = watch('name');

  const onSubmit = async (data) => {
    await api.post('/auth/register', data);
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#0f766e,_#0f172a)] p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <h1 className="text-2xl font-bold text-slate-900">Criar conta</h1>
        <p className="mt-1 text-sm text-slate-500">Cadastre um acesso para o sistema OdontoCare.</p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="text-sm text-slate-700">Nome</label>
            <input 
              {...register('name')} 
              onChange={(e) => setValue('name', maskOnlyLetters(e.target.value))}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" 
            />
            {errors.name && <p className="text-xs text-rose-600">{errors.name.message}</p>}
          </div>

          <div>
            <label className="text-sm text-slate-700">Email</label>
            <input {...register('email')} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
            {errors.email && <p className="text-xs text-rose-600">{errors.email.message}</p>}
          </div>

          <div>
            <label className="text-sm text-slate-700">Senha</label>
            <input type="password" {...register('password')} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
            {errors.password && <p className="text-xs text-rose-600">{errors.password.message}</p>}
          </div>

          <div>
            <label className="text-sm text-slate-700">Perfil</label>
            <select {...register('role')} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2">
              <option value="RECEPTION">Recepção</option>
              <option value="DENTIST">Dentista</option>
              <option value="ADMIN">Admin</option>
            </select>
            {errors.role && <p className="text-xs text-rose-600">{errors.role.message}</p>}
          </div>

          <button disabled={isSubmitting} className="w-full rounded-lg bg-cyan-600 py-2 font-medium text-white hover:bg-cyan-700">
            {isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
          </button>

          <Link to="/login" className="block text-center text-sm text-cyan-700">
            Já tenho conta
          </Link>
        </div>
      </form>
    </div>
  );
};