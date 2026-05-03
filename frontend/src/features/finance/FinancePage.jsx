import { useEffect, useState } from 'react';
import { api } from '../../services/api';

export const FinancePage = () => {
  const [payments, setPayments] = useState([]);
  const [message, setMessage] = useState('');

  const loadPayments = async () => {
    const response = await api.get('/finance');
    setPayments(response.data);
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const markAsPaid = async (id) => {
    await api.patch(`/finance/${id}/status`, { status: 'PAID' });
    setMessage('Pagamento marcado como pago.');
    await loadPayments();
  };

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h2 className="text-2xl font-bold">Financeiro básico</h2>
        <p className="text-sm text-slate-500">Acompanhamento de pagamentos e pendências</p>
      </header>

      {message && <p className="text-sm text-emerald-600">{message}</p>}

      <div className="overflow-auto rounded-2xl border border-slate-200 dark:border-slate-700">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 dark:bg-slate-700">
            <tr>
              <th className="p-3">Paciente</th>
              <th className="p-3">Valor</th>
              <th className="p-3">Metodo</th>
              <th className="p-3">Status</th>
              <th className="p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id} className="border-t border-slate-200 dark:border-slate-700">
                <td className="p-3">{payment.patient.fullName}</td>
                <td className="p-3">R$ {payment.amount}</td>
                <td className="p-3">{payment.method}</td>
                <td className="p-3">{payment.status}</td>
                <td className="p-3">
                  {payment.status !== 'PAID' && (
                    <button type="button" onClick={() => markAsPaid(payment.id)} className="rounded-lg bg-emerald-600 px-3 py-1 text-xs text-white">
                      Marcar pago
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
