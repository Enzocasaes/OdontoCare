import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, PencilLine, Plus, Search } from 'lucide-react';
import { api } from '../../services/api';

export const PatientsPage = () => {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadPatients = async (searchTerm = search) => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/patients', { params: { search: searchTerm } });
      setPatients(response.data || []);
    } catch {
      setError('Não foi possível carregar os pacientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Pacientes</h2>
          <p className="text-sm text-slate-500">Cadastro, anamnese, fotos e documentos em uma tela dedicada.</p>
        </div>
        <Link to="/patients/new" className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-700">
          <Plus size={16} /> Novo paciente
        </Link>
      </header>

      <div className="flex flex-wrap gap-2">
        <div className="flex flex-1 min-w-[240px] items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
          <Search size={16} className="text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && loadPatients()}
            placeholder="Buscar por nome ou documento"
            className="w-full bg-transparent outline-none"
          />
        </div>
        <button onClick={() => loadPatients()} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:border-cyan-500 hover:text-cyan-700">
          Buscar
        </button>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        {loading ? (
          <div className="p-6 text-sm text-slate-500">Carregando pacientes...</div>
        ) : patients.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">Nenhum paciente encontrado.</div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {patients.map((patient) => (
              <article key={patient.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">{patient.fullName}</h3>
                  <div className="mt-1 flex flex-wrap gap-3 text-sm text-slate-500">
                    <span>{patient.phone}</span>
                    <span>{patient.document}</span>
                    <span>{patient.lgpdConsent ? 'LGPD consentido' : 'LGPD pendente'}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    to={`/patients/${patient.id}/edit`}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium hover:border-cyan-500 hover:text-cyan-700"
                  >
                    <PencilLine size={16} /> Editar
                  </Link>
                  <Link
                    to={`/patients/${patient.id}/records`}
                    className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600"
                  >
                    Prontuário <ArrowRight size={16} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
