import { useState } from 'react';
import { Edit2, Info } from 'lucide-react';

const TOOTH_STATUSES = {
  healthy: { label: 'Hígido', color: '#22c55e', bgColor: '#dcfce7' },
  caries: { label: 'Cárie', color: '#ef4444', bgColor: '#fee2e2' },
  missing: { label: 'Ausente', color: '#6b7280', bgColor: '#f3f4f6' },
  restored: { label: 'Restaurado', color: '#3b82f6', bgColor: '#dbeafe' },
  root: { label: 'Raiz', color: '#f59e0b', bgColor: '#fef3c7' },
};

const TOOTH_NUMBERS = {
  superior_right: [18, 17, 16, 15, 14, 13, 12, 11],
  superior_left: [21, 22, 23, 24, 25, 26, 27, 28],
  inferior_left: [31, 32, 33, 34, 35, 36, 37, 38],
  inferior_right: [48, 47, 46, 45, 44, 43, 42, 41],
};

export function Odontogram({ teethData = {}, onToothSelect, isEditable = false, isLoading = false }) {
  const [selectedTooth, setSelectedTooth] = useState(null);
  const [editingStatus, setEditingStatus] = useState(null);

  const handleToothClick = (toothNumber) => {
    if (isEditable) {
      setSelectedTooth(toothNumber);
    }
  };

  const handleStatusChange = async (toothNumber, newStatus) => {
    if (onToothSelect) {
      await onToothSelect(toothNumber, newStatus);
      setSelectedTooth(null);
      setEditingStatus(null);
    }
  };

  const getToothData = (toothNumber) => {
    return teethData[toothNumber] || { status: 'healthy', notes: '' };
  };

  const renderToothRow = (toothNumbers, isInferior = false) => {
    return (
      <div className="flex justify-center gap-2 mb-2">
        {toothNumbers.map(num => {
          const tooth = getToothData(num);
          const status = tooth.status || 'healthy';
          const statusInfo = TOOTH_STATUSES[status];

          return (
            <div
              key={num}
              className="flex flex-col items-center"
              onMouseEnter={() => !isEditable && setEditingStatus(num)}
              onMouseLeave={() => !isEditable && setEditingStatus(null)}
            >
              <button
                onClick={() => handleToothClick(num)}
                className={`w-12 h-12 rounded border-2 flex items-center justify-center font-bold text-sm cursor-pointer transition-all ${
                  selectedTooth === num ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                }`}
                style={{
                  backgroundColor: statusInfo.bgColor,
                  borderColor: statusInfo.color,
                  color: statusInfo.color,
                }}
                title={tooth.notes || statusInfo.label}
                disabled={isLoading}
              >
                {num}
              </button>

              {(editingStatus === num || selectedTooth === num) && (
                <div className="mt-1 text-xs text-gray-600 text-center max-w-12">
                  {statusInfo.label}
                </div>
              )}

              {selectedTooth === num && isEditable && (
                <div className="absolute mt-14 bg-white border rounded shadow-lg p-2 z-10">
                  <div className="text-sm font-semibold mb-2">Alterar Status</div>
                  <div className="space-y-1">
                    {Object.entries(TOOTH_STATUSES).map(([key, value]) => (
                      <button
                        key={key}
                        onClick={() => handleStatusChange(num, key)}
                        className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded"
                        style={{ color: value.color }}
                      >
                        {value.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Odontograma</h3>

      <div className="mb-6 p-4 bg-blue-50 rounded border border-blue-200">
        <div className="flex gap-2 items-start">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            {isEditable ? 'Clique nos dentes para alterar o status' : 'Passe o mouse sobre os dentes para ver o status'}
          </div>
        </div>
      </div>

      <div className="mb-6 flex justify-center gap-8">
        <div>
          <div className="text-center text-sm font-semibold text-gray-600 mb-2">SUPERIOR</div>
          <div>
            <div className="text-xs text-gray-500 text-center mb-2">DIREITA</div>
            {renderToothRow(TOOTH_NUMBERS.superior_right)}
            <div className="text-xs text-gray-500 text-center mt-2">ESQUERDA</div>
            {renderToothRow(TOOTH_NUMBERS.superior_left)}
          </div>
        </div>

        <div className="border-l-2 border-gray-300"></div>

        <div>
          <div className="text-center text-sm font-semibold text-gray-600 mb-2">INFERIOR</div>
          <div>
            <div className="text-xs text-gray-500 text-center mb-2">ESQUERDA</div>
            {renderToothRow(TOOTH_NUMBERS.inferior_left, true)}
            <div className="text-xs text-gray-500 text-center mt-2">DIREITA</div>
            {renderToothRow(TOOTH_NUMBERS.inferior_right, true)}
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded">
        <h4 className="font-semibold text-gray-900 mb-3">Legenda</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(TOOTH_STATUSES).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded border-2"
                style={{
                  backgroundColor: value.bgColor,
                  borderColor: value.color,
                }}
              ></div>
              <span className="text-sm text-gray-700">{value.label}</span>
            </div>
          ))}
        </div>
      </div>

      {selectedTooth && isEditable && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
          Clique em um status acima para alterar o dente {selectedTooth}
        </div>
      )}
    </div>
  );
}

export function ToothDetailsPanel({ toothNumber, toothData = {}, onClose }) {
  const status = toothData.status || 'healthy';
  const statusInfo = TOOTH_STATUSES[status];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Dente {toothNumber}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <div
              className="w-full px-3 py-2 rounded border-2"
              style={{
                backgroundColor: statusInfo.bgColor,
                borderColor: statusInfo.color,
                color: statusInfo.color,
              }}
            >
              {statusInfo.label}
            </div>
          </div>

          {toothData.notes && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observações
              </label>
              <p className="text-gray-700">{toothData.notes}</p>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full bg-gray-200 text-gray-900 py-2 rounded hover:bg-gray-300 font-medium"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}
