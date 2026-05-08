// Exemplo de componente React para visualizar o gerenciamento financeiro do paciente

import React, { useState, useEffect } from 'react';
import api from '../services/api';

/**
 * Componente de Resumo Financeiro do Paciente
 * 
 * Exibe os tratamentos, parcelas e resumo financeiro de um paciente
 */
export function PatientFinancialOverview({ patientId }) {
  const [summary, setSummary] = useState(null);
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadFinancialData();
  }, [patientId]);

  const loadFinancialData = async () => {
    try {
      setLoading(true);
      
      // Buscar resumo financeiro
      const summaryData = await api.get(`/finance/patients/${patientId}/financial-summary`);
      setSummary(summaryData.data);

      // Buscar tratamentos detalhados
      const treatmentsData = await api.get(`/finance/patients/${patientId}/treatments`);
      setTreatments(treatmentsData.data);
      
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleRegisterPayment = async (paymentId, method) => {
    try {
      await api.post(`/finance/payments/${paymentId}/register`, { method });
      
      // Recarregar dados após pagamento
      loadFinancialData();
      alert('Pagamento registrado com sucesso!');
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Erro ao registrar pagamento';
      alert('Erro: ' + errorMsg);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
      PAID: { label: 'Pago', color: 'bg-green-100 text-green-800' },
      IN_PROGRESS: { label: 'Em Andamento', color: 'bg-blue-100 text-blue-800' },
      COMPLETED: { label: 'Concluído', color: 'bg-gray-100 text-gray-800' },
      CANCELED: { label: 'Cancelado', color: 'bg-red-100 text-red-800' }
    };
    const badge = badges[status] || badges.PENDING;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  const isOverdue = (dueDate, status) => {
    return status === 'PENDING' && new Date(dueDate) < new Date();
  };

  if (loading) return <div className="p-4">Carregando...</div>;
  if (error) return <div className="p-4 text-red-600">Erro: {error}</div>;

  return (
    <div className="space-y-6">
      {/* Resumo Financeiro */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Resumo Financeiro</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-500 rounded-lg p-4 shadow-sm">
            <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Total de Tratamentos</p>
            <p className="text-2xl font-bold text-gray-900 break-words">{summary?.totalTreatments || 0}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-l-4 border-purple-500 rounded-lg p-4 shadow-sm">
            <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Valor Total</p>
            <p className="text-xl font-bold text-gray-900 break-words">{formatCurrency(summary?.totalAmount || 0)}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-500 rounded-lg p-4 shadow-sm">
            <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Total Pago</p>
            <p className="text-xl font-bold text-green-700 break-words">{formatCurrency(summary?.totalPaid || 0)}</p>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 border-l-4 border-amber-500 rounded-lg p-4 shadow-sm">
            <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Pendente</p>
            <p className="text-xl font-bold text-amber-700 break-words">{formatCurrency(summary?.totalPending || 0)}</p>
          </div>
        </div>
        
        {summary?.totalOverdue > 0 && (
          <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg shadow-sm">
            <p className="text-sm font-semibold text-red-800">
              ⚠️ Atenção: {formatCurrency(summary.totalOverdue)} em atraso
            </p>
          </div>
        )}
      </div>

      {/* Lista de Tratamentos */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Tratamentos</h2>
        
        {treatments.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            Nenhum tratamento registrado
          </div>
        ) : (
          treatments.map((treatment) => (
            <div key={treatment.id} className="bg-white rounded-lg shadow overflow-hidden">
              {/* Header do Tratamento */}
              <div className="bg-gray-50 px-6 py-4 border-b">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{treatment.description}</h3>
                    <p className="text-sm font-medium text-gray-700 mt-1">
                      Iniciado em: {formatDate(treatment.startDate)}
                    </p>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(treatment.status)}
                    <p className="text-xl font-bold text-gray-900 mt-2">{formatCurrency(treatment.totalAmount)}</p>
                  </div>
                </div>
              </div>

              {/* Parcelas */}
              <div className="p-6">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Parcelas ({treatment.payments.filter(p => p.status === 'PAID').length}/{treatment.payments.length} pagas)
                </h4>
                <div className="space-y-2">
                  {treatment.payments.map((payment) => (
                    <div 
                      key={payment.id}
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        isOverdue(payment.dueDate, payment.status) 
                          ? 'bg-red-50 border-red-200' 
                          : payment.status === 'PAID'
                          ? 'bg-green-50 border-green-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white border-2">
                          <span className="font-semibold text-gray-900">{payment.installmentNumber}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{formatCurrency(payment.amount)}</p>
                          <p className="text-sm font-medium text-gray-700">
                            Vencimento: {formatDate(payment.dueDate)}
                            {isOverdue(payment.dueDate, payment.status) && (
                              <span className="ml-2 text-red-600 font-medium">• VENCIDA</span>
                            )}
                          </p>
                          {payment.paidAt && (
                            <p className="text-sm font-medium text-green-700">
                              Pago em: {formatDate(payment.paidAt)} • {payment.method}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        {payment.status === 'PENDING' ? (
                          <PaymentMethodSelector 
                            onSelect={(method) => handleRegisterPayment(payment.id, method)}
                          />
                        ) : (
                          <div className="flex items-center text-green-600">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/**
 * Componente de Seleção de Método de Pagamento
 */
function PaymentMethodSelector({ onSelect }) {
  const [showMenu, setShowMenu] = useState(false);

  const methods = [
    { value: 'CASH', label: 'Dinheiro', icon: '💵' },
    { value: 'PIX', label: 'PIX', icon: '📱' },
    { value: 'CREDIT_CARD', label: 'Cartão de Crédito', icon: '💳' },
    { value: 'DEBIT_CARD', label: 'Cartão de Débito', icon: '💳' },
    { value: 'TRANSFER', label: 'Transferência', icon: '🏦' },
  ];

  const handleSelect = (method) => {
    onSelect(method);
    setShowMenu(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Registrar Pagamento
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border z-10">
          <div className="py-1">
            {methods.map((method) => (
              <button
                key={method.value}
                onClick={() => handleSelect(method.value)}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-2 text-gray-900 font-medium"
              >
                <span>{method.icon}</span>
                <span>{method.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Componente para Criar Novo Tratamento
 */
export function CreateTreatmentForm({ patientId, onSuccess }) {
  const [formData, setFormData] = useState({
    description: '',
    totalAmount: '',
    installments: 1,
    firstDueDate: '',
    observations: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/finance/treatments', {
        ...formData,
        patientId,
        totalAmount: parseFloat(formData.totalAmount),
        installments: parseInt(formData.installments)
      });

      alert('Tratamento criado com sucesso!');
      onSuccess && onSuccess();
      // Limpar form
      setFormData({
        description: '',
        totalAmount: '',
        installments: 1,
        firstDueDate: '',
        observations: ''
      });
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Erro ao criar tratamento';
      alert('Erro: ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
      <h3 className="text-xl font-bold text-gray-900">Novo Tratamento</h3>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-1">
          Descrição do Tratamento
        </label>
        <input
          type="text"
          required
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
          placeholder="Ex: Tratamento de canal - dente 14"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1">
            Valor Total (R$)
          </label>
          <input
            type="number"
            step="0.01"
            required
            value={formData.totalAmount}
            onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
            placeholder="1000.00"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1">
            Número de Parcelas
          </label>
          <input
            type="number"
            min="1"
            max="48"
            required
            value={formData.installments}
            onChange={(e) => setFormData({ ...formData, installments: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-1">
          Vencimento da 1ª Parcela
        </label>
        <input
          type="date"
          required
          value={formData.firstDueDate}
          onChange={(e) => setFormData({ ...formData, firstDueDate: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-1">
          Observações (opcional)
        </label>
        <textarea
          value={formData.observations}
          onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
          rows="3"
          placeholder="Informações adicionais sobre o tratamento"
        />
      </div>

      {formData.totalAmount && formData.installments > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 Cada parcela será de aproximadamente: <strong>
              R$ {(parseFloat(formData.totalAmount) / parseInt(formData.installments)).toFixed(2)}
            </strong>
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
      >
        {loading ? 'Criando...' : 'Criar Tratamento'}
      </button>
    </form>
  );
}

export default PatientFinancialOverview;
