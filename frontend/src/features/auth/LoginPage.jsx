import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { login } from './authSlice';
import { maskEmail } from '../../utils/masks';

const schema = z.object({
  email: z.string().email('Informe um email valido'),
  password: z.string().min(6, 'Minimo de 6 caracteres'),
});

export const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, token } = useSelector((state) => state.auth);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  // Se já estiver autenticado, redireciona para home
  if (token) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (data) => {
    const result = await dispatch(login(data));
    if (!result.error) navigate('/');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#0f766e,_#0f172a)] p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <h1 className="text-2xl font-bold text-slate-900">Acesso OdontoCare</h1>
        <p className="mt-1 text-sm text-slate-500">Plataforma SaaS para clinica odontologica</p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="text-sm text-slate-700">Email</label>
            <input
              {...register('email', { setValueAs: (value) => maskEmail(value) })}
              type="email"
              autoComplete="email"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
            {errors.email && <p className="text-xs text-rose-600">{errors.email.message}</p>}
          </div>

          <div>
            <label className="text-sm text-slate-700">Senha</label>
            <input type="password" {...register('password')} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
            {errors.password && <p className="text-xs text-rose-600">{errors.password.message}</p>}
          </div>

          {error && <p className="text-sm text-rose-600">{error}</p>}

          <button disabled={loading} className="w-full rounded-lg bg-cyan-600 py-2 font-medium text-white hover:bg-cyan-700">
            {loading ? 'Entrando...' : 'Entrar'}
          </button>

          <Link to="/forgot-password" className="block text-center text-sm text-cyan-700">
            Esqueci minha senha
          </Link>
        </div>
      </form>
    </div>
  );
};
