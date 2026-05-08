import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, Calendar, User, Plus, Filter } from 'lucide-react';
import { api } from '../../services/api';

export const FinancePage = () => {
  const navigate = useNavigate();
  const [treatments, setTreatments] = useState([]);
  const [overduePayments, setOverduePayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, in_progress, completed
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalPaid: 0,
    totalPending: 0,
    totalOverdue: 0,
    totalTreatments: 0,
    activeTreatments: 0,
  });

  useEffect(() => {
    loadFinancialData();
  }, [filter]);

  const loadFinancialData = async () => {
    try {
      setLoading(true);
      
      // Carregar tratamentos
      const queryParams = filter !== 'all' ? `?status=${filter.toUpperCase()}` : '';
      const treatmentsRes = await api.get(`/finance/treatments${queryParams}`);
      setTreatments(treatmentsRes.data);

      // Carregar pagamentos vencidos
      const overdueRes = await api.get('/finance/payments/overdue/list');
      setOverduePayments(overdueRes.data);

      // Calcular estatísticas
      calculateStats(treatmentsRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (treatmentsList) => {
    let totalRevenue = 0;
    let totalPaid = 0;
    let totalPending = 0;
    let totalOverdue = 0;
    let activeTreatments = 0;

    treatmentsList.forEach((treatment) => {
      const revenue = parseFloat(treatment.totalAmount);
      totalRevenue += revenue;

      if (treatment.status === 'IN_PROGRESS' || treatment.status === 'PENDING') {
        activeTreatments++;
      }

      treatment.payments.forEach((payment) => {
        const amount = parseFloat(payment.amount);
        if (payment.status === 'PAID') {
          totalPaid += amount;
        } else {
          totalPending += amount;
          
          if (new Date(payment.dueDate) < new Date()) {
            totalOverdue += amount;
          }
        }
      });
    });

    setStats({
      totalRevenue,
      totalPaid,
      totalPending,
      totalOverdue,
      totalTreatments: treatmentsList.length,
      activeTreatments,
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
      IN_PROGRESS: { label: 'Em Andamento', color: 'bg-blue-100 text-blue-800' },
      COMPLETED: { label: 'Concluído', color: 'bg-green-100 text-green-800' },
      CANCELED: { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
    };
    const badge = badges[status] || badges.PENDING;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  const navigateToPatientFinancial = (patientId) => {
    navigate(`/patients/${patientId}/records`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <header className="space-y-1">
        <h2 className="text-3xl font-bold text-slate-100">Gerenciamento Financeiro</h2>
        <p className="text-sm text-slate-300">
          Acompanhamento completo de tratamentos, pagamentos e pendências
        </p>
      </header>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Receita Total</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
              <p className="text-xs text-gray-500 mt-1">{stats.totalTreatments} tratamentos</p>
            </div>
            <DollarSign className="w-10 h-10 text-blue-500 opacity-50" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Recebido</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalPaid)}</p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.totalRevenue > 0 
                  ? `${((stats.totalPaid / stats.totalRevenue) * 100).toFixed(1)}% do total`
                  : '0% do total'}
              </p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-500 opacity-50" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">A Receber</p>
              <p className="text-2xl font-bold text-yellow-600">{formatCurrency(stats.totalPending)}</p>
              <p className="text-xs text-gray-500 mt-1">{stats.activeTreatments} tratamentos ativos</p>
            </div>
            <Calendar className="w-10 h-10 text-yellow-500 opacity-50" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Em Atraso</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.totalOverdue)}</p>
              <p className="text-xs text-gray-500 mt-1">{overduePayments.length} parcelas vencidas</p>
            </div>
            <AlertCircle className="w-10 h-10 text-red-500 opacity-50" />
          </div>
        </div>
      </div>

      {/* Pagamentos Vencidos */}
      {overduePayments.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-red-800 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Pagamentos Vencidos ({overduePayments.length})
          </h3>
          <div className="space-y-2">
            {overduePayments.slice(0, 5).map((payment) => (
              <div
                key={payment.id}
                className="bg-white rounded p-3 flex items-center justify-between hover:shadow transition cursor-pointer"
                onClick={() => navigateToPatientFinancial(payment.treatment.patientId)}
              >
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {payment.treatment.patient.fullName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {payment.treatment.description} - Parcela {payment.installmentNumber}/{payment.totalInstallments}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-red-600">{formatCurrency(payment.amount)}</p>
                  <p className="text-xs text-gray-500">Vencido em {formatDate(payment.dueDate)}</p>
                </div>
              </div>
            ))}
            {overduePayments.length > 5 && (
              <p className="text-sm text-gray-600 text-center mt-2">
                E mais {overduePayments.length - 5} pagamento(s) vencido(s)
              </p>
            )}
          </div>
        </div>
      )}

      {/* Filtros e Lista de Tratamentos */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">Todos os Tratamentos</h3>
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-gray-700" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="all">Todos</option>
                <option value="pending">Pendentes</option>
                <option value="in_progress">Em Andamento</option>
                <option value="completed">Concluídos</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {treatments.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <DollarSign className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>Nenhum tratamento encontrado</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-4 font-semibold text-gray-900">Paciente</th>
                  <th className="p-4 font-semibold text-gray-900">Tratamento</th>
                  <th className="p-4 font-semibold text-gray-900">Valor Total</th>
                  <th className="p-4 font-semibold text-gray-900">Pago</th>
                  <th className="p-4 font-semibold text-gray-900">Pendente</th>
                  <th className="p-4 font-semibold text-gray-900">Parcelas</th>
                  <th className="p-4 font-semibold text-gray-900">Status</th>
                  <th className="p-4 font-semibold text-gray-900">Início</th>
                  <th className="p-4 font-semibold text-gray-900">Ações</th>
                </tr>
              </thead>
              <tbody>
                {treatments.map((treatment) => {
                  const paidAmount = treatment.payments
                    .filter(p => p.status === 'PAID')
                    .reduce((sum, p) => sum + parseFloat(p.amount), 0);
                  const pendingAmount = parseFloat(treatment.totalAmount) - paidAmount;
                  const paidCount = treatment.payments.filter(p => p.status === 'PAID').length;

                  return (
                    <tr
                      key={treatment.id}
                      className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition"
                      onClick={() => navigateToPatientFinancial(treatment.patientId)}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-600" />
                          <span className="font-semibold text-gray-900">{treatment.patient.fullName}</span>
                        </div>
                      </td>
                      <td className="p-4 max-w-xs truncate text-gray-900">{treatment.description}</td>
                      <td className="p-4 font-semibold text-gray-900">{formatCurrency(treatment.totalAmount)}</td>
                      <td className="p-4 text-green-700 font-semibold">{formatCurrency(paidAmount)}</td>
                      <td className="p-4 text-amber-700 font-semibold">{formatCurrency(pendingAmount)}</td>
                      <td className="p-4">
                        <span className="text-gray-900 font-medium">
                          {paidCount}/{treatment.payments.length}
                        </span>
                      </td>
                      <td className="p-4">{getStatusBadge(treatment.status)}</td>
                      <td className="p-4 text-gray-900">{formatDate(treatment.startDate)}</td>
                      <td className="p-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigateToPatientFinancial(treatment.patientId);
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
                        >
                          Ver Detalhes
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Dica */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          💡 <strong>Dica:</strong> Para criar um novo tratamento ou registrar pagamentos, acesse o 
          prontuário do paciente e vá na aba "Financeiro".
        </p>
      </div>
    </section>
  );
};
