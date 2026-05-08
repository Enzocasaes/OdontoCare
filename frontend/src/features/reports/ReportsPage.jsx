import { useState, useEffect } from 'react';
import { FileText, Download, Calendar, DollarSign, Users, TrendingUp, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';

export const ReportsPage = () => {
  const [period, setPeriod] = useState('day'); // day, week, month
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Define datas padrão baseado no período selecionado
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    if (period === 'day') {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (period === 'week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      setStartDate(weekAgo.toISOString().split('T')[0]);
      setEndDate(todayStr);
    } else if (period === 'month') {
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      setStartDate(monthAgo.toISOString().split('T')[0]);
      setEndDate(todayStr);
    }
  }, [period]);

  useEffect(() => {
    if (startDate && endDate) {
      loadReportData();
    }
  }, [startDate, endDate]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      
      // Buscar consultas do período
      const appointmentsRes = await api.get('/appointments', {
        params: {
          startAt: new Date(startDate).toISOString(),
          endAt: new Date(new Date(endDate).setHours(23, 59, 59, 999)).toISOString()
        }
      });

      // Buscar tratamentos e pagamentos
      const treatmentsRes = await api.get('/finance/treatments');
      
      const treatments = treatmentsRes.data;
      
      // Calcular valores
      const paymentsInPeriod = [];
      let totalReceived = 0;
      let totalPending = 0;
      
      // Define o período com início às 00:00:00 e fim às 23:59:59
      const periodStart = new Date(startDate);
      periodStart.setHours(0, 0, 0, 0);
      
      const periodEnd = new Date(endDate);
      periodEnd.setHours(23, 59, 59, 999);
      
      treatments.forEach(treatment => {
        treatment.payments?.forEach(payment => {
          const isPaid = payment.status === 'PAID';
          const isPending = payment.status === 'PENDING';
          
          if (isPaid) {
            // Usa paidAt se existir, senão usa updatedAt ou createdAt como fallback
            const paymentDate = payment.paidAt 
              ? new Date(payment.paidAt)
              : payment.updatedAt 
                ? new Date(payment.updatedAt)
                : new Date(payment.createdAt);
            
            const isInPeriod = paymentDate >= periodStart && paymentDate <= periodEnd;
            
            if (isInPeriod) {
              totalReceived += parseFloat(payment.amount);
              paymentsInPeriod.push(payment);
            }
          }
          
          if (isPending) {
            totalPending += parseFloat(payment.amount);
          }
        });
      });

      setReportData({
        appointments: appointmentsRes.data,
        totalAppointments: appointmentsRes.data.length,
        totalReceived,
        totalPending,
        paymentsCount: paymentsInPeriod.length,
        treatments: treatments.length
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar dados do relatório:', error);
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const exportToPDF = () => {
    // Criar HTML para impressão
    const printWindow = window.open('', '_blank');
    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Relatório - OdontoCare</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              padding: 40px;
              color: #333;
            }
            h1 { 
              color: #0f766e; 
              border-bottom: 3px solid #0f766e;
              padding-bottom: 10px;
            }
            .header { margin-bottom: 30px; }
            .period { 
              background: #f0f9ff; 
              padding: 15px; 
              border-left: 4px solid #0ea5e9;
              margin-bottom: 30px;
            }
            .metrics { 
              display: grid; 
              grid-template-columns: repeat(2, 1fr); 
              gap: 20px;
              margin-bottom: 30px;
            }
            .metric { 
              background: #f8fafc; 
              padding: 20px; 
              border-radius: 8px;
              border-left: 4px solid #0f766e;
            }
            .metric-label { 
              font-size: 12px; 
              color: #64748b; 
              text-transform: uppercase;
              font-weight: 600;
              margin-bottom: 8px;
            }
            .metric-value { 
              font-size: 28px; 
              font-weight: bold; 
              color: #0f172a;
            }
            .footer {
              margin-top: 50px;
              padding-top: 20px;
              border-top: 1px solid #e2e8f0;
              text-align: center;
              color: #64748b;
              font-size: 12px;
            }
            @media print {
              body { padding: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📊 Relatório Financeiro - OdontoCare</h1>
            <p>Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
          </div>
          
          <div class="period">
            <strong>Período:</strong> ${formatDate(startDate)} até ${formatDate(endDate)}
          </div>
          
          <div class="metrics">
            <div class="metric">
              <div class="metric-label">Total de Consultas</div>
              <div class="metric-value">${reportData?.totalAppointments || 0}</div>
            </div>
            
            <div class="metric">
              <div class="metric-label">Total Recebido</div>
              <div class="metric-value" style="color: #059669;">${formatCurrency(reportData?.totalReceived || 0)}</div>
            </div>
            
            <div class="metric">
              <div class="metric-label">Pagamentos Realizados</div>
              <div class="metric-value">${reportData?.paymentsCount || 0}</div>
            </div>
            
            <div class="metric">
              <div class="metric-label">Total de Pendências</div>
              <div class="metric-value" style="color: #dc2626;">${formatCurrency(reportData?.totalPending || 0)}</div>
            </div>
          </div>
          
          <div class="footer">
            <p>OdontoCare - Sistema de Gestão Odontológica</p>
            <p>Este é um documento gerado automaticamente</p>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `;
    
    printWindow.document.write(content);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-300">Carregando relatório...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="space-y-1">
        <h2 className="text-3xl font-bold text-slate-100">Relatórios</h2>
        <p className="text-sm text-slate-300">
          Gere relatórios financeiros e operacionais do consultório
        </p>
      </header>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-4 mb-4">
          <Calendar className="w-5 h-5 text-gray-700" />
          <h3 className="text-lg font-semibold text-gray-900">Selecione o Período</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Período Rápido
            </label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="day">Hoje</option>
              <option value="week">Última Semana</option>
              <option value="month">Último Mês</option>
              <option value="custom">Personalizado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Data Inicial
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Data Final
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={exportToPDF}
              disabled={!reportData}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold transition"
            >
              <Download className="w-4 h-4" />
              Exportar PDF
            </button>
          </div>
        </div>
      </div>

      {/* Métricas */}
      {reportData && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-500 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Consultas
                </p>
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{reportData.totalAppointments}</p>
              <p className="text-xs text-gray-600 mt-1">No período selecionado</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-500 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Total Recebido
                </p>
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-700">{formatCurrency(reportData.totalReceived)}</p>
              <p className="text-xs text-gray-600 mt-1">{reportData.paymentsCount} pagamentos</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-l-4 border-purple-500 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Tratamentos
                </p>
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{reportData.treatments}</p>
              <p className="text-xs text-gray-600 mt-1">Total de tratamentos</p>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 border-l-4 border-red-500 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Pendências
                </p>
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <p className="text-2xl font-bold text-red-700">{formatCurrency(reportData.totalPending)}</p>
              <p className="text-xs text-gray-600 mt-1">Total a receber</p>
            </div>
          </div>

          {/* Info adicional */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-900">
                  Exportação de Relatório
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  Clique em "Exportar PDF" para gerar um documento imprimível com todos os dados do período selecionado.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
