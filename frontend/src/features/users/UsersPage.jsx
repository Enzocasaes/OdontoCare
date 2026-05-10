import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { maskEmail, maskOnlyLetters } from '../../utils/masks';

export const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'RECEPTION', clinicId: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadUsers = async () => {
    const response = await api.get('/users');
    setUsers(response.data);
  };

  const loadClinics = async () => {
    const response = await api.get('/clinics/mine');
    setClinics(response.data);
  };

  useEffect(() => {
    loadUsers();
    loadClinics();
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');

    if (!form.clinicId) {
      setError('Selecione um consultório para o usuário.');
      return;
    }

    try {
      await api.post('/auth/register', form);
      setForm({ name: '', email: '', password: '', role: 'RECEPTION', clinicId: '' });
      setMessage('Usuário cadastrado com sucesso.');
      await loadUsers();
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Falha ao cadastrar usuário.');
    }
  };

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-2xl font-bold">Usuarios e perfis</h2>
        <p className="text-sm text-slate-500">Cadastro administrativo de usuários do sistema</p>
      </header>

      <form onSubmit={submit} className="grid gap-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-700 md:grid-cols-5">
        <input
          value={form.name}
          onChange={(event) => setForm({ ...form, name: maskOnlyLetters(event.target.value) })}
          placeholder="Nome"
          className="rounded-lg border border-slate-300 px-3 py-2 dark:bg-slate-900"
        />
        <input
          value={form.email}
          onChange={(event) => setForm({ ...form, email: maskEmail(event.target.value) })}
          placeholder="Email"
          type="email"
          className="rounded-lg border border-slate-300 px-3 py-2 dark:bg-slate-900"
        />
        <input
          type="password"
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
          placeholder="Senha inicial"
          className="rounded-lg border border-slate-300 px-3 py-2 dark:bg-slate-900"
        />
        <select
          value={form.role}
          onChange={(event) => setForm({ ...form, role: event.target.value })}
          className="rounded-lg border border-slate-300 px-3 py-2 dark:bg-slate-900"
        >
          <option value="DENTIST">Dentista</option>
          <option value="RECEPTION">Recepção</option>
        </select>
        <select
          value={form.clinicId}
          onChange={(event) => setForm({ ...form, clinicId: event.target.value })}
          className="rounded-lg border border-slate-300 px-3 py-2 dark:bg-slate-900"
        >
          <option value="">Selecione o consultório</option>
          {clinics.map((clinic) => (
            <option key={clinic.id} value={clinic.id}>
              {clinic.name}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-lg bg-cyan-600 px-4 py-2 font-medium text-white">
          Cadastrar
        </button>
      </form>

      {error && <p className="text-sm text-rose-600">{error}</p>}
      {message && <p className="text-sm text-emerald-600">{message}</p>}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {users.map((user) => (
          <article key={user.id} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
            <h3 className="font-semibold">{user.name}</h3>
            <p className="text-sm text-slate-500">{user.email}</p>
            <span className="mt-2 inline-block rounded bg-slate-100 px-2 py-1 text-xs dark:bg-slate-700">{user.role}</span>
          </article>
        ))}
      </div>
    </section>
  );
};
