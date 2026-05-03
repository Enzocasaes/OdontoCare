import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FileText, Plus, Loader, Paperclip } from 'lucide-react';
import api from '../../services/api';
import { ClinicalRecordForm, ClinicalRecordList } from './ClinicalRecord';
import { Odontogram } from './Odontogram';
import { AttachmentUpload, AttachmentList } from './Attachments';

export function PatientRecordsPage() {
  const { patientId } = useParams();
  const [activeTab, setActiveTab] = useState('anamnesis');
  const [anamneses, setAnamneses] = useState([]);
  const [clinicalRecords, setClinicalRecords] = useState([]);
  const [odontogram, setOdontogram] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [patientData, setPatientData] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPatientData();
    loadAnamneses();
    loadClinicalRecords();
    loadOdontogram();
    loadAttachments();
  }, [patientId]);

  const loadPatientData = async () => {
    try {
      const response = await api.get(`/patients/${patientId}`);
      setPatientData(response.data);
    } catch (err) {
      console.error('Erro ao carregar dados do paciente:', err);
    }
  };

  const loadClinicalRecords = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/clinical-records/patient/${patientId}`);
      setClinicalRecords(response.data.records || []);
    } catch (err) {
      console.error('Erro ao carregar fichas clínicas:', err);
      setError('Erro ao carregar fichas clínicas');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAnamneses = async () => {
    try {
      const response = await api.get(`/records/anamnesis/${patientId}`);
      setAnamneses(response.data || []);
    } catch (err) {
      console.error('Erro ao carregar anamneses:', err);
    }
  };

  const loadOdontogram = async () => {
    try {
      const response = await api.get(`/odontograms/patient/${patientId}`);
      setOdontogram(response.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setOdontogram(null);
        return;
      }

      console.error('Erro ao carregar odontograma:', err);
    }
  };

  const loadAttachments = async () => {
    try {
      const response = await api.get(`/attachments/patient/${patientId}`);
      setAttachments(response.data.attachments || []);
    } catch (err) {
      console.error('Erro ao carregar anexos:', err);
    }
  };

  const handleCreateRecord = async (data) => {
    try {
      setIsLoading(true);
      if (editingRecord) {
        await api.patch(`/clinical-records/${editingRecord.id}`, data);
      } else {
        await api.post('/clinical-records', data);
      }
      await loadClinicalRecords();
      setShowForm(false);
      setEditingRecord(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao salvar ficha clínica');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRecord = async (recordId) => {
    if (!window.confirm('Deseja deletar esta ficha clínica?')) return;

    try {
      setIsLoading(true);
      await api.delete(`/clinical-records/${recordId}`);
      await loadClinicalRecords();
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao deletar ficha clínica');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOdontogram = async () => {
    try {
      setIsLoading(true);
      await api.post(`/odontograms/patient/${patientId}`, {});
      await loadOdontogram();
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao criar odontograma');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateToothStatus = async (toothNumber, status) => {
    if (!odontogram) return;

    try {
      setIsLoading(true);
      await api.patch(
        `/odontograms/patient/${patientId}/tooth/${toothNumber}`,
        { status }
      );
      await loadOdontogram();
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao atualizar dente');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    if (!window.confirm('Deseja deletar este arquivo?')) return;

    try {
      setIsLoading(true);
      await api.delete(`/attachments/${attachmentId}`);
      await loadAttachments();
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao deletar arquivo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAttachmentUploadSuccess = (attachment) => {
    setAttachments(prev => [attachment, ...prev]);
  };

  if (!patientData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Prontuário - {patientData.fullName}
        </h1>
        <p className="text-gray-600 mt-2">
          Documento: {patientData.document} | Telefone: {patientData.phone}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-800">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('anamnesis')}
              className={`px-6 py-3 font-medium border-b-2 ${
                activeTab === 'anamnesis'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Anamnese
            </button>
            <button
              onClick={() => setActiveTab('clinical')}
              className={`px-6 py-3 font-medium border-b-2 ${
                activeTab === 'clinical'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Ficha Clínica
            </button>
            <button
              onClick={() => setActiveTab('odontogram')}
              className={`px-6 py-3 font-medium border-b-2 ${
                activeTab === 'odontogram'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Odontograma
            </button>
            <button
              onClick={() => setActiveTab('attachments')}
              className={`px-6 py-3 font-medium border-b-2 flex items-center gap-2 ${
                activeTab === 'attachments'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Paperclip className="w-4 h-4" />
              Anexos ({attachments.length})
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Anamnese Tab */}
          {activeTab === 'anamnesis' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-2xl font-bold text-gray-900">Anamnese</h2>
                <span className="text-sm text-gray-500">{anamneses.length} registro(s)</span>
              </div>

              {anamneses.length > 0 ? (
                <>
                  <div className="rounded-lg border border-gray-200 p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-500">Anamnese mais recente</p>
                        <h3 className="text-lg font-bold text-gray-900">Versão {anamneses[0].version}</h3>
                      </div>
                      <p className="text-xs text-gray-500">
                        {anamneses[0].createdAt ? new Date(anamneses[0].createdAt).toLocaleDateString('pt-BR') : ''}
                      </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Alergias</p>
                        <p className="mt-1 text-sm text-gray-900">{anamneses[0].allergies || 'Não informado'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Medicações</p>
                        <p className="mt-1 text-sm text-gray-900">{anamneses[0].medications || 'Não informado'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Doenças sistêmicas</p>
                        <p className="mt-1 text-sm text-gray-900">{anamneses[0].systemicDiseases || 'Não informado'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Observações</p>
                        <p className="mt-1 text-sm text-gray-900">{anamneses[0].notes || 'Não informado'}</p>
                      </div>
                    </div>
                  </div>

                  {anamneses.length > 1 && (
                    <div className="rounded-lg border border-gray-200 p-5 shadow-sm">
                      <h3 className="mb-4 text-lg font-bold text-gray-900">Histórico de anamnese</h3>
                      <div className="space-y-3">
                        {anamneses.slice(1).map((anamnesis) => (
                          <div key={anamnesis.id} className="rounded-md bg-gray-50 p-4">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="font-semibold text-gray-900">Versão {anamnesis.version}</p>
                              <p className="text-xs text-gray-500">
                                {anamnesis.createdAt ? new Date(anamnesis.createdAt).toLocaleDateString('pt-BR') : ''}
                              </p>
                            </div>
                            <p className="mt-2 text-sm text-gray-600">Alergias: {anamnesis.allergies || 'Não informado'}</p>
                            <p className="text-sm text-gray-600">Medicações: {anamnesis.medications || 'Não informado'}</p>
                            <p className="text-sm text-gray-600">Doenças sistêmicas: {anamnesis.systemicDiseases || 'Não informado'}</p>
                            <p className="text-sm text-gray-600">Observações: {anamnesis.notes || 'Não informado'}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-gray-600">
                  Nenhuma anamnese registrada para este paciente.
                </div>
              )}
            </div>
          )}

          {/* Ficha Clínica Tab */}
          {activeTab === 'clinical' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Fichas Clínicas</h2>
                {!showForm && (
                  <button
                    onClick={() => {
                      setShowForm(true);
                      setEditingRecord(null);
                    }}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="w-5 h-5" />
                    Nova Ficha
                  </button>
                )}
              </div>

              {showForm && (
                <div>
                  <ClinicalRecordForm
                    patientId={patientId}
                    onSubmit={handleCreateRecord}
                    initialData={editingRecord}
                    isLoading={isLoading}
                  />
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditingRecord(null);
                    }}
                    className="mt-4 text-gray-600 hover:text-gray-900"
                  >
                    Cancelar
                  </button>
                </div>
              )}

              <ClinicalRecordList
                records={clinicalRecords}
                onEdit={(record) => {
                  setEditingRecord(record);
                  setShowForm(true);
                }}
                onDelete={handleDeleteRecord}
                isLoading={isLoading}
              />
            </div>
          )}

          {/* Odontograma Tab */}
          {activeTab === 'odontogram' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Ficha Clínica - Odontograma</h2>
                {!odontogram && (
                  <button
                    onClick={handleCreateOdontogram}
                    disabled={isLoading}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    <Plus className="w-5 h-5" />
                    Criar Odontograma
                  </button>
                )}
              </div>

              {odontogram ? (
                <Odontogram
                  teethData={odontogram.teeth || {}}
                  onToothSelect={handleUpdateToothStatus}
                  isEditable={true}
                  isLoading={isLoading}
                />
              ) : (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">Nenhum odontograma criado</p>
                  <button
                    onClick={handleCreateOdontogram}
                    disabled={isLoading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    Criar Agora
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Attachments Tab */}
          {activeTab === 'attachments' && (
            <div className="space-y-6">
              <AttachmentUpload
                patientId={patientId}
                onUploadSuccess={handleAttachmentUploadSuccess}
                isLoading={isLoading}
              />

              {attachments.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Anexos ({attachments.length})
                  </h3>
                  <AttachmentList
                    attachments={attachments}
                    onDelete={handleDeleteAttachment}
                    isLoading={isLoading}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PatientRecordsPage;
