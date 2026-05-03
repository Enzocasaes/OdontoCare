import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Eye, DollarSign } from 'lucide-react';
import { api } from '../../services/api';
import { maskCurrency } from '../../utils/masks';

export const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ patientId: '', dentistId: '', startAt: '', endAt: '', notes: '', amount: '' });
  const [message, setMessage] = useState('');

  const loadData = async () => {
    const startAt = new Date();
    startAt.setHours(0, 0, 0, 0);
    const endAt = new Date();
    endAt.setHours(23, 59, 59, 999);

    const [appointmentsResponse, patientsResponse, usersResponse] = await Promise.all([
      api.get('/appointments', { params: { startAt: startAt.toISOString(), endAt: endAt.toISOString() } }),
      api.get('/patients'),
      api.get('/users'),
    ]);

    setAppointments(appointmentsResponse.data);
    setPatients(patientsResponse.data);
    setUsers(usersResponse.data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const createAppointment = async (event) => {
    event.preventDefault();
    setMessage('');

    if (!form.patientId || !form.dentistId || !form.startAt || !form.endAt) {
      setMessage('Selecione paciente, dentista, data inicial e data final.');
      return;
    }

    try {
      const appointmentData = {
        ...form,
        status: 'SCHEDULED',
      };
      if (form.amount) {
        appointmentData.amount = parseFloat(form.amount.replace(/[^0-9,-]/g, '').replace(',', '.'));
      }
      await api.post('/appointments', appointmentData);
      setMessage('Consulta criada com sucesso.');
      setForm({ patientId: '', dentistId: '', startAt: '', endAt: '', notes: '', amount: '' });
      await loadData();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Falha ao criar consulta.');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/appointments/${id}/status`, { status });
      await loadData();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Falha ao atualizar status.');
    }
  };

  const dentists = users.filter((user) => user.role === 'DENTIST');

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-2xl font-bold">Agenda</h2>
        <p className="text-sm text-slate-500">Criar, confirmar, realizar e cancelar consultas</p>
      </header>

      <form onSubmit={createAppointment} className="grid gap-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-700 md:grid-cols-2 xl:grid-cols-5">
        <select value={form.patientId} onChange={(event) => setForm({ ...form, patientId: event.target.value })} className="rounded-lg border border-slate-300 px-3 py-2 dark:bg-slate-900">
          <option value="">Paciente</option>
          {patients.map((patient) => (
            <option key={patient.id} value={patient.id}>{patient.fullName}</option>
          ))}
        </select>
        <select value={form.dentistId} onChange={(event) => setForm({ ...form, dentistId: event.target.value })} className="rounded-lg border border-slate-300 px-3 py-2 dark:bg-slate-900">
          <option value="">Dentista</option>
          {dentists.map((dentist) => (
            <option key={dentist.id} value={dentist.id}>
              {dentist.name}
            </option>
          ))}
        </select>
        <div className="relative">
          <input type="datetime-local" value={form.startAt} onChange={(event) => setForm({ ...form, startAt: event.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:bg-slate-900" />
          <Calendar className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        </div>
        <div className="relative">
          <input type="datetime-local" value={form.endAt} onChange={(event) => setForm({ ...form, endAt: event.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:bg-slate-900" />
          <Calendar className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        </div>
        <input value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Observações" className="rounded-lg border border-slate-300 px-3 py-2 dark:bg-slate-900" />
        <div className="relative">
          <input value={form.amount} onChange={(event) => setForm({ ...form, amount: maskCurrency(event.target.value) })} placeholder="Valor (opcional)" className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:bg-slate-900" />
          <DollarSign className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        </div>
        <button type="submit" className="rounded-lg bg-cyan-600 px-4 py-2 font-medium text-white xl:col-span-5">Agendar consulta</button>
      </form>

      {message && <p className="text-sm text-emerald-600">{message}</p>}

      <div className="grid gap-3">
        {appointments.map((appointment) => (
          <article key={appointment.id} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
            <p className="text-sm text-slate-500">{new Date(appointment.startAt).toLocaleString('pt-BR')}</p>
            <h3 className="font-semibold">{appointment.patient.fullName}</h3>
            <p className="text-sm">Dentista: {appointment.dentist.name}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-medium text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-200">
                {appointment.status}
              </span>
              <Link to={`/appointments/${appointment.id}`} className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700">
                <Eye size={14} />
                Detalhes
              </Link>
              <button type="button" onClick={() => updateStatus(appointment.id, 'CONFIRMED')} className="rounded-lg border border-slate-300 px-3 py-1 text-xs dark:border-slate-600">Confirmar</button>
              <button type="button" onClick={() => updateStatus(appointment.id, 'COMPLETED')} className="rounded-lg border border-slate-300 px-3 py-1 text-xs dark:border-slate-600">Concluir</button>
              <button type="button" onClick={() => updateStatus(appointment.id, 'CANCELED')} className="rounded-lg border border-rose-300 px-3 py-1 text-xs text-rose-600 dark:border-rose-800">Cancelar</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
