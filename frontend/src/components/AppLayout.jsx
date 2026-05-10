import { Moon, Sun, LogOut } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/clinics', label: 'Consultórios', adminOnly: true },
  { to: '/patients', label: 'Pacientes' },
  { to: '/appointments', label: 'Agenda' },
  { to: '/finance', label: 'Financeiro' },
  { to: '/reports', label: 'Relatórios' },
  { to: '/users', label: 'Usuarios', adminOnly: true },
  { to: '/dentists', label: 'Dentistas', adminOnly: true },
  // logs removed from main navigation per admin requirements
];

export const AppLayout = () => {
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark');
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <div className="mx-auto grid max-w-7xl gap-6 p-4 md:grid-cols-[240px_1fr]">
        <aside className="rounded-2xl bg-[#0f172a] p-5 text-slate-100 shadow-lg">
          <h1 className="text-xl font-bold">OdontoCare SaaS</h1>
          <p className="mt-1 text-xs text-slate-300">Gestao clinica odontologica</p>
          
          {user && (
            <div className="mt-4 rounded-xl bg-slate-800/80 p-3 text-sm text-slate-200">
              <p className="font-semibold">{user.name}</p>
              <p className="text-xs text-slate-400">{user.email}</p>
              <p className="mt-1 text-xs text-cyan-400">{user.role}</p>
            </div>
          )}

          <nav className="mt-6 flex flex-col gap-2">
              {user && links
                .filter((l) => (user.role === 'ADMIN' ? l.adminOnly : !l.adminOnly))
                .map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      `rounded-lg px-3 py-2 text-sm transition ${isActive ? 'bg-cyan-500 text-white' : 'text-slate-200 hover:bg-slate-700'}`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
          </nav>

          <div className="mt-6 flex gap-2">
            <button type="button" onClick={() => setDarkMode((prev) => !prev)} className="rounded-lg bg-slate-700 p-2 hover:bg-slate-600 transition">
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button 
              type="button" 
              onClick={handleLogout} 
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-red-600 p-2 hover:bg-red-700 transition text-sm font-medium"
            >
              <LogOut size={16} />
              Sair
            </button>
          </div>
        </aside>

        <main className="rounded-2xl bg-white/95 p-6 shadow-lg backdrop-blur dark:bg-slate-800">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
