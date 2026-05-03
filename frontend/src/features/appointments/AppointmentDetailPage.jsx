import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, DollarSign, FileText, MapPin, Phone, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';

export const AppointmentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusForm, setStatusForm] = useState('');

  useEffect(() => {
    const loadAppointment = async () => {
      try {
        const response = await api.get(`/appointments/${id}`);
        setAppointment(response.data);
        setStatusForm(response.data.status);
      } catch (err) {
        setError(err.response?.data?.message || 'Falha ao carregar agendamento.');
      } finally {
        setLoading(false);
      }
    };

    loadAppointment();
  }, [id]);

  const updateStatus = async (newStatus) => {
    try {
      await api.patch(`/appointments/${id}/status`, { status: newStatus });
      setStatusForm(newStatus);
      setAppointment({ ...appointment, status: newStatus });
    } catch (err) {
      setError(err.response?.data?.message || 'Falha ao atualizar status.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      SCHEDULED: 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100',
      CONFIRMED: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100',
      COMPLETED: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100',
      CANCELED: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100',
    };
    return statusMap[status] || statusMap.SCHEDULED;
  };

  if (loading) {
    return (
      <section className="space-y-6">
        <p className="text-slate-500">Carregando agendamento...</p>
      </section>
    );
  }

  if (!appointment) {
    return (
      <section className="space-y-6">
        <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-800 dark:border-red-700 dark:bg-red-900 dark:text-red-100">
          <p className="font-semibold">Agendamento não encontrado.</p>
        </div>
        <button
          onClick={() => navigate('/appointments')}
          className="rounded-lg bg-cyan-600 px-4 py-2 text-white"
        >
          Voltar para agenda
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <header className="space-y-1">
          <h2 className="text-2xl font-bold">Detalhamento do Agendamento</h2>
          <p className="text-sm text-slate-500">Consulta com {appointment.dentist.name}</p>
        </header>
        <button
          onClick={() => navigate('/appointments')}
          className="rounded-lg bg-slate-600 px-4 py-2 text-white hover:bg-slate-700"
        >
          Voltar
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-800 dark:border-red-700 dark:bg-red-900 dark:text-red-100">
          <p className="font-semibold">{error}</p>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Main Info */}
        <div className="space-y-4 lg:col-span-2">
          {/* Status */}
          <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
            <h3 className="font-semibold mb-4">Status</h3>
            <span className={`inline-block rounded-full px-4 py-2 text-sm font-medium ${getStatusBadge(appointment.status)}`}>
              {appointment.status}
            </span>
            <div className="mt-4 grid gap-2 md:grid-cols-2">
              {['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELED'].map((status) => (
                <button
                  key={status}
                  onClick={() => updateStatus(status)}
                  disabled={statusForm === status}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:opacity-60 dark:border-slate-600"
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Patient Info */}
          <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
            <h3 className="mb-4 flex items-center gap-2 font-semibold">
              <User size={18} />
              Paciente
            </h3>
            <div className="space-y-2">
              <p className="text-lg font-semibold">{appointment.patient.fullName}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">{appointment.patient.email}</p>
              <p className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Phone size={16} />
                {appointment.patient.phone}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <strong>Data nascimento:</strong> {formatDate(appointment.patient.birthDate)}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <strong>CPF:</strong> {appointment.patient.document}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <strong>Endereço:</strong> {appointment.patient.address}
              </p>
            </div>
          </div>

          {/* Appointment Info */}
          <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
            <h3 className="mb-4 flex items-center gap-2 font-semibold">
              <Calendar size={18} />
              Detalhes da Consulta
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Data:</span>
                <span className="font-medium">{formatDate(appointment.startAt)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Hora início:</span>
                <span className="font-medium">{formatTime(appointment.startAt)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Hora fim:</span>
                <span className="font-medium">{formatTime(appointment.endAt)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Duração:</span>
                <span className="font-medium">
                  {Math.round((new Date(appointment.endAt) - new Date(appointment.startAt)) / 60000)} minutos
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Dentista:</span>
                <span className="font-medium">{appointment.dentist.name}</span>
              </div>
              {appointment.notes && (
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                  <p className="mb-1 text-xs text-slate-600 dark:text-slate-400">Observações:</p>
                  <p className="text-sm">{appointment.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - Payment */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
            <h3 className="mb-4 flex items-center gap-2 font-semibold">
              <DollarSign size={18} />
              Pagamento
            </h3>
            {appointment.payment ? (
              <div className="space-y-3">
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                  <p className="text-xs text-slate-600 dark:text-slate-400">Valor da Consulta</p>
                  <p className="text-2xl font-bold text-cyan-600">
                    {formatCurrency(appointment.payment.amount)}
                  </p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Método:</span>
                    <span className="font-medium capitalize">{appointment.payment.method}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Vencimento:</span>
                    <span className="font-medium">{formatDate(appointment.payment.dueDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Status:</span>
                    <span
                      className={`font-medium ${
                        appointment.payment.status === 'PAID' ? 'text-green-600' : 'text-orange-600'
                      }`}
                    >
                      {appointment.payment.status === 'PAID' ? 'Pago' : 'Pendente'}
                    </span>
                  </div>
                  {appointment.payment.paidAt && (
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Pagamento em:</span>
                      <span className="font-medium">{formatDate(appointment.payment.paidAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-lg border-l-4 border-orange-500 bg-orange-50 p-3 dark:bg-orange-900">
                <p className="flex items-center gap-2 text-sm text-orange-800 dark:text-orange-100">
                  <AlertCircle size={16} />
                  Nenhum pagamento registrado
                </p>
              </div>
            )}
          </div>

          {/* Additional Info */}
          <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
            <h3 className="mb-4 flex items-center gap-2 font-semibold">
              <FileText size={18} />
              Histórico
            </h3>
            <div className="space-y-2 text-sm">
              <p className="text-slate-600 dark:text-slate-400">
                <strong>Criado em:</strong> {formatDate(appointment.createdAt)}
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                <strong>Última atualização:</strong> {formatDate(appointment.updatedAt)}
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                <strong>ID:</strong> <code className="text-xs">{appointment.id}</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
