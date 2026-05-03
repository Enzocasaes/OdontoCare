import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Pill, Stethoscope, Tooth } from 'lucide-react';
import { api } from '../../services/api';

const teethPositions = [
  // Dentes superiores
  { id: '11', position: 'top-left-far', label: '11', quadrant: 'sup-dir' },
  { id: '12', position: 'top-left', label: '12', quadrant: 'sup-dir' },
  { id: '13', position: 'top-left-center', label: '13', quadrant: 'sup-dir' },
  { id: '14', position: 'top-center-left', label: '14', quadrant: 'sup-dir' },
  { id: '15', position: 'top-center', label: '15', quadrant: 'sup-dir' },
  { id: '16', position: 'top-center-right', label: '16', quadrant: 'sup-dir' },
  { id: '17', position: 'top-right', label: '17', quadrant: 'sup-esq' },
  { id: '18', position: 'top-right-far', label: '18', quadrant: 'sup-esq' },

  { id: '21', position: 'top-right-far-2', label: '21', quadrant: 'sup-esq' },
  { id: '22', position: 'top-right-2', label: '22', quadrant: 'sup-esq' },
  { id: '23', position: 'top-right-center', label: '23', quadrant: 'sup-esq' },
  { id: '24', position: 'top-center-right-2', label: '24', quadrant: 'sup-esq' },
  { id: '25', position: 'top-center-2', label: '25', quadrant: 'sup-esq' },
  { id: '26', position: 'top-center-left-2', label: '26', quadrant: 'sup-esq' },
  { id: '27', position: 'top-left-2', label: '27', quadrant: 'sup-dir' },
  { id: '28', position: 'top-left-far-2', label: '28', quadrant: 'sup-dir' },

  // Dentes inferiores
  { id: '31', position: 'bottom-left-far', label: '31', quadrant: 'inf-esq' },
  { id: '32', position: 'bottom-left', label: '32', quadrant: 'inf-esq' },
  { id: '33', position: 'bottom-left-center', label: '33', quadrant: 'inf-esq' },
  { id: '34', position: 'bottom-center-left', label: '34', quadrant: 'inf-esq' },
  { id: '35', position: 'bottom-center', label: '35', quadrant: 'inf-esq' },
  { id: '36', position: 'bottom-center-right', label: '36', quadrant: 'inf-esq' },
  { id: '37', position: 'bottom-right', label: '37', quadrant: 'inf-dir' },
  { id: '38', position: 'bottom-right-far', label: '38', quadrant: 'inf-dir' },

  { id: '41', position: 'bottom-right-far-2', label: '41', quadrant: 'inf-dir' },
  { id: '42', position: 'bottom-right-2', label: '42', quadrant: 'inf-dir' },
  { id: '43', position: 'bottom-right-center', label: '43', quadrant: 'inf-dir' },
  { id: '44', position: 'bottom-center-right-2', label: '44', quadrant: 'inf-dir' },
  { id: '45', position: 'bottom-center-2', label: '45', quadrant: 'inf-dir' },
  { id: '46', position: 'bottom-center-left-2', label: '46', quadrant: 'inf-dir' },
  { id: '47', position: 'bottom-left-2', label: '47', quadrant: 'inf-esq' },
  { id: '48', position: 'bottom-left-far-2', label: '48', quadrant: 'inf-esq' },
];

export const ProntuarioPage = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  
  const [patient, setPatient] = useState(null);
  const [anamneses, setAnamneses] = useState([]);
  const [procedures, setProcedures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toothStatus, setToothStatus] = useState({});
  const [selectedTab, setSelectedTab] = useState('anamnese');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [patientRes, anameseRes, proceduresRes] = await Promise.all([
          api.get(`/patients`),
          api.get(`/records/anamnesis/${patientId}`),
          api.get(`/records/medical/${patientId}`),
        ]);

        const foundPatient = patientRes.data.find(p => p.id === patientId);
        if (!foundPatient) {
          setError('Paciente não encontrado');
          setLoading(false);
          return;
        }

        setPatient(foundPatient);
        setAnamneses(anameseRes.data);
        setProcedures(proceduresRes.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Falha ao carregar prontuário');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [patientId]);

  const toggleToothStatus = (toothId) => {
    setToothStatus(prev => ({
      ...prev,
      [toothId]: !prev[toothId],
    }));
  };

  if (loading) {
    return (
      <section className="space-y-6">
        <p className="text-slate-500">Carregando prontuário...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="space-y-6">
        <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-800 dark:border-red-700 dark:bg-red-900 dark:text-red-100">
          <p className="font-semibold">{error}</p>
        </div>
        <button
          onClick={() => navigate('/patients')}
          className="rounded-lg bg-cyan-600 px-4 py-2 text-white"
        >
          Voltar
        </button>
      </section>
    );
  }

  const latestAnamnesis = anamneses[0];

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/patients')}
          className="rounded-lg border border-slate-300 p-2 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800"
        >
          <ArrowLeft size={20} />
        </button>
        <header className="space-y-1">
          <h2 className="text-2xl font-bold">Prontuário do Paciente</h2>
          <p className="text-sm text-slate-500">{patient?.fullName}</p>
        </header>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
        {[
          { id: 'anamnese', label: 'Anamnese', icon: Pill },
          { id: 'procedimentos', label: 'Procedimentos', icon: FileText },
          { id: 'odontograma', label: 'Odontograma', icon: Tooth },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id)}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 font-medium transition ${
              selectedTab === tab.id
                ? 'border-cyan-600 text-cyan-600'
                : 'border-transparent text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Anamnese Tab */}
      {selectedTab === 'anamnese' && (
        <div className="space-y-4">
          {latestAnamnesis ? (
            <>
              <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                <h3 className="mb-4 flex items-center gap-2 font-semibold">
                  <Pill size={18} />
                  Informações de Saúde
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-slate-600 dark:text-slate-400">Alergias:</label>
                    <p className="mt-1 text-sm">{latestAnamnesis.allergies || 'Nenhuma registrada'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-600 dark:text-slate-400">Medicações:</label>
                    <p className="mt-1 text-sm">{latestAnamnesis.medications || 'Nenhuma registrada'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-600 dark:text-slate-400">Doenças Sistêmicas:</label>
                    <p className="mt-1 text-sm">{latestAnamnesis.systemicDiseases || 'Nenhuma registrada'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-600 dark:text-slate-400">Observações:</label>
                    <p className="mt-1 text-sm">{latestAnamnesis.notes || 'Nenhuma registrada'}</p>
                  </div>
                </div>
              </div>

              {anamneses.length > 1 && (
                <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                  <h4 className="mb-3 font-semibold">Histórico de Anamneses</h4>
                  <div className="space-y-2">
                    {anamneses.slice(1).map((anamnesis, idx) => (
                      <div key={anamnesis.id} className="text-sm text-slate-600 dark:text-slate-400">
                        <p className="font-medium">Versão {anamnesis.version} - {new Date(anamnesis.createdAt).toLocaleDateString('pt-BR')}</p>
                        <p className="text-xs">Alergias: {anamnesis.allergies || 'Não registrado'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-xl border border-slate-300 bg-slate-50 p-4 text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <p>Nenhuma anamnese registrada para este paciente.</p>
            </div>
          )}
        </div>
      )}

      {/* Procedimentos Tab */}
      {selectedTab === 'procedimentos' && (
        <div className="space-y-4">
          {procedures.length > 0 ? (
            procedures.map(procedure => (
              <div key={procedure.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold">{procedure.diagnosis}</h4>
                    <p className="text-sm text-slate-500">
                      Dentista: {procedure.dentist?.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(procedure.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 border-t border-slate-200 pt-3 dark:border-slate-700">
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Plano de Tratamento:</label>
                    <p className="mt-1 text-sm">{procedure.treatmentPlan}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Evolução:</label>
                    <p className="mt-1 text-sm">{procedure.evolution}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-slate-300 bg-slate-50 p-4 text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <p>Nenhum procedimento registrado para este paciente.</p>
            </div>
          )}
        </div>
      )}

      {/* Odontograma Tab */}
      {selectedTab === 'odontograma' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 p-6 dark:border-slate-700">
            <h3 className="mb-6 flex items-center gap-2 font-semibold">
              <Tooth size={18} />
              Representação dos Dentes
            </h3>

            <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
              Clique nos dentes para marcar/desmarcar alterações
            </p>

            <div className="space-y-8">
              {/* Dentes Superiores */}
              <div>
                <p className="mb-3 text-sm font-medium text-slate-600 dark:text-slate-300">Dentes Superiores</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {teethPositions
                    .filter(t => t.label.startsWith('1') || t.label.startsWith('2'))
                    .map(tooth => (
                      <button
                        key={tooth.id}
                        onClick={() => toggleToothStatus(tooth.id)}
                        className={`flex h-12 w-12 items-center justify-center rounded-lg border-2 font-medium transition ${
                          toothStatus[tooth.id]
                            ? 'border-red-500 bg-red-100 text-red-600 dark:border-red-600 dark:bg-red-900 dark:text-red-100'
                            : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                        }`}
                      >
                        {tooth.label}
                      </button>
                    ))}
                </div>
              </div>

              {/* Dentes Inferiores */}
              <div>
                <p className="mb-3 text-sm font-medium text-slate-600 dark:text-slate-300">Dentes Inferiores</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {teethPositions
                    .filter(t => t.label.startsWith('3') || t.label.startsWith('4'))
                    .map(tooth => (
                      <button
                        key={tooth.id}
                        onClick={() => toggleToothStatus(tooth.id)}
                        className={`flex h-12 w-12 items-center justify-center rounded-lg border-2 font-medium transition ${
                          toothStatus[tooth.id]
                            ? 'border-red-500 bg-red-100 text-red-600 dark:border-red-600 dark:bg-red-900 dark:text-red-100'
                            : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                        }`}
                      >
                        {tooth.label}
                      </button>
                    ))}
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-lg bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400">
              <p className="font-medium mb-1">Legenda:</p>
              <p>Numeração: 11-18, 21-28 (superiores) | 31-38, 41-48 (inferiores)</p>
              <p className="mt-1">Vermelho = Dentes com alterações registradas</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
