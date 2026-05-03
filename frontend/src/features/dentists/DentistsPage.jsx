import { useEffect, useMemo, useState } from 'react';
import { api } from '../../services/api';
import { maskOnlyLetters } from '../../utils/masks';

const initialForm = { name: '', email: '', password: '' };

export const DentistsPage = () => {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadDentists = async () => {
    const response = await api.get('/users');
    setUsers(response.data);
  };

  useEffect(() => {
    loadDentists();
  }, []);

  const dentists = useMemo(() => users.filter((user) => user.role === 'DENTIST'), [users]);

  const submit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');

    if (!form.name || !form.email || !form.password) {
      setError('Preencha nome, email e senha.');
      return;
    }

    try {
      setLoading(true);
      await api.post('/auth/register', { ...form, role: 'DENTIST' });
      setForm(initialForm);
      setMessage('Dentista cadastrado com sucesso.');
      await loadDentists();
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Falha ao cadastrar dentista.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-2xl font-bold">Dentistas</h2>
        <p className="text-sm text-slate-500">Cadastro e lista de profissionais com perfil de dentista</p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <form onSubmit={submit} className="space-y-4 rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
          <div>
            <label className="text-sm text-slate-700 dark:text-slate-300">Nome</label>
            <input
              value={form.name}
              onChange={(event) => setForm({ ...form, name: maskOnlyLetters(event.target.value) })}
              placeholder="Nome completo do dentista"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:bg-slate-900"
            />
          </div>

          <div>
            <label className="text-sm text-slate-700 dark:text-slate-300">Email</label>
            <input
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              placeholder="email@clinica.com"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:bg-slate-900"
            />
          </div>

          <div>
            <label className="text-sm text-slate-700 dark:text-slate-300">Senha inicial</label>
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              placeholder="Senha com no minimo 8 caracteres"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:bg-slate-900"
            />
          </div>

          <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            O perfil será salvo como <strong>DENTIST</strong> automaticamente.
          </div>

          {error && <p className="text-sm text-rose-600">{error}</p>}
          {message && <p className="text-sm text-emerald-600">{message}</p>}

          <button type="submit" disabled={loading} className="rounded-lg bg-cyan-600 px-4 py-2 font-medium text-white disabled:opacity-60">
            {loading ? 'Cadastrando...' : 'Cadastrar dentista'}
          </button>
        </form>

        <aside className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Dentistas cadastrados</h3>
            <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-medium text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-200">
              {dentists.length}
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {dentists.map((dentist) => (
              <article key={dentist.id} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
                <h4 className="font-semibold">{dentist.name}</h4>
                <p className="text-sm text-slate-500">{dentist.email}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-cyan-700 dark:text-cyan-300">{dentist.role}</p>
              </article>
            ))}

            {dentists.length === 0 && <p className="text-sm text-slate-500">Nenhum dentista cadastrado ainda.</p>}
          </div>
        </aside>
      </div>
    </section>
  );
};