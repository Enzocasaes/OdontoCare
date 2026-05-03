import { useState } from 'react';
import { Plus, Edit, Trash2, Calendar } from 'lucide-react';

export function ClinicalRecordForm({ patientId, onSubmit, initialData = null, isLoading = false }) {
  const [formData, setFormData] = useState(
    initialData || {
      patientId,
      procedures: '',
      diagnosis: '',
      treatmentPlan: '',
      notes: '',
      appointmentId: '',
    }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = { ...formData };
    if (!payload.appointmentId) {
      delete payload.appointmentId;
    }

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">
        {initialData ? 'Editar Ficha Clínica' : 'Nova Ficha Clínica'}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Procedimentos Realizados *
          </label>
          <textarea
            name="procedures"
            value={formData.procedures}
            onChange={handleChange}
            placeholder="Descreva os procedimentos realizados..."
            className="w-full bg-white px-3 py-2 border border-gray-300 rounded-lg text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="4"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Diagnóstico *
          </label>
          <textarea
            name="diagnosis"
            value={formData.diagnosis}
            onChange={handleChange}
            placeholder="Digite o diagnóstico..."
            className="w-full bg-white px-3 py-2 border border-gray-300 rounded-lg text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="4"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Plano de Tratamento *
        </label>
        <textarea
          name="treatmentPlan"
          value={formData.treatmentPlan}
          onChange={handleChange}
          placeholder="Descreva o plano de tratamento..."
          className="w-full bg-white px-3 py-2 border border-gray-300 rounded-lg text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="4"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Observações Adicionais
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Observações opcionais..."
          className="w-full bg-white px-3 py-2 border border-gray-300 rounded-lg text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="3"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium"
      >
        {isLoading ? 'Salvando...' : initialData ? 'Atualizar' : 'Criar Ficha'}
      </button>
    </form>
  );
}

export function ClinicalRecordList({ records, onEdit, onDelete, isLoading = false }) {
  if (!records || records.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">Nenhuma ficha clínica registrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {records.map(record => (
        <div key={record.id} className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-500">
                  {new Date(record.createdAt).toLocaleDateString('pt-BR')}
                </span>
                {record.dentist && (
                  <span className="text-sm text-gray-500">
                    - Dr(a). {record.dentist.name}
                  </span>
                )}
              </div>

              <div className="mt-3 space-y-2">
                <div>
                  <h4 className="font-semibold text-gray-900">Procedimentos</h4>
                  <p className="text-gray-700">{record.procedures}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900">Diagnóstico</h4>
                  <p className="text-gray-700">{record.diagnosis}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900">Plano de Tratamento</h4>
                  <p className="text-gray-700">{record.treatmentPlan}</p>
                </div>

                {record.notes && (
                  <div>
                    <h4 className="font-semibold text-gray-900">Observações</h4>
                    <p className="text-gray-700">{record.notes}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 ml-4">
              <button
                onClick={() => onEdit(record)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                title="Editar"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button
                onClick={() => onDelete(record.id)}
                disabled={isLoading}
                className="p-2 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                title="Deletar"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
