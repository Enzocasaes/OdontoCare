import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { maskOnlyLetters } from '../../utils/masks';

export const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'RECEPTION' });
  const [message, setMessage] = useState('');

  const loadUsers = async () => {
    const response = await api.get('/users');
    setUsers(response.data);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    setMessage('');
    await api.post('/auth/register', form);
    setForm({ name: '', email: '', password: '', role: 'RECEPTION' });
    setMessage('Usuário cadastrado com sucesso.');
    await loadUsers();
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
          onChange={(event) => setForm({ ...form, email: event.target.value })}
          placeholder="Email"
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
          <option value="ADMIN">Admin</option>
          <option value="DENTIST">Dentista</option>
          <option value="RECEPTION">Recepção</option>
        </select>
        <button type="submit" className="rounded-lg bg-cyan-600 px-4 py-2 font-medium text-white">
          Cadastrar
        </button>
      </form>

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
