import { useEffect, useState } from 'react';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from '../../services/api';
import { MetricCard } from '../../components/MetricCard';

export const DashboardPage = () => {
  const [data, setData] = useState({ kpis: {}, appointments: [] });

  useEffect(() => {
    api.get('/dashboard/overview').then((response) => setData(response.data));
  }, []);

  const chartData = [
    { name: 'Agendadas', value: data.kpis.appointmentsToday || 0 },
    { name: 'Confirmadas', value: data.kpis.confirmed || 0 },
    { name: 'Realizadas', value: data.kpis.completed || 0 },
    { name: 'Pendencias', value: data.kpis.pendingPayments || 0 },
  ];

  return (
    <section className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold">Visao geral do dia</h2>
        <p className="text-sm text-slate-500">KPIs operacionais da clinica</p>
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard title="Consultas hoje" value={data.kpis.appointmentsToday || 0} hint="Agenda do dia" />
        <MetricCard title="Confirmadas" value={data.kpis.confirmed || 0} hint="Recepcao" />
        <MetricCard title="Realizadas" value={data.kpis.completed || 0} hint="Atendimento" />
        <MetricCard title="Receita paga" value={`R$ ${data.kpis.revenue || 0}`} hint="Financeiro" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
          <h3 className="mb-4 font-semibold">Indicadores</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#0891b2" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
          <h3 className="mb-4 font-semibold">Consultas do dia</h3>
          <ul className="space-y-2 text-sm">
            {data.appointments.map((appointment) => (
              <li key={appointment.id} className="rounded-lg bg-slate-100 p-3 dark:bg-slate-700">
                {new Date(appointment.startAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                {' - '}
                {appointment.patient.fullName}
                {' ('}
                {appointment.status}
                {')'}
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
};
