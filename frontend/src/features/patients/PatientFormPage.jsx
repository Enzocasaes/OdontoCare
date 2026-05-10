import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, FilePlus2, Paperclip, PencilLine, Trash2 } from 'lucide-react';
import api from '../../services/api';
import { maskCPF, maskEmail, maskOnlyLetters, maskPhone } from '../../utils/masks';
import { AttachmentUpload, AttachmentList } from '../medical-records/Attachments';

const emptyPatientForm = {
  fullName: '',
  email: '',
  phone: '',
  birthDate: '',
  document: '',
  address: '',
  lgpdConsent: true,
};

const emptyAnamnesisForm = {
  allergies: '',
  medications: '',
  systemicDiseases: '',
  notes: '',
};

export const PatientFormPage = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(patientId && patientId !== 'new');

  const [patientForm, setPatientForm] = useState(emptyPatientForm);
  const [anamnesisForm, setAnamnesisForm] = useState(emptyAnamnesisForm);
  const [editingAnamnesisId, setEditingAnamnesisId] = useState(null);
  const [editingAttachment, setEditingAttachment] = useState(null);
  const [anamneses, setAnamneses] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const pageTitle = useMemo(() => {
    if (isEditing) return 'Editar Paciente';
    return 'Novo Paciente';
  }, [isEditing]);

  useEffect(() => {
    if (!isEditing) {
      setPatient(null);
      setAnamneses([]);
      setAttachments([]);
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        const [patientResponse, anamnesisResponse, attachmentsResponse] = await Promise.all([
          api.get(`/patients/${patientId}`),
          api.get(`/records/anamnesis/${patientId}`),
          api.get(`/attachments/patient/${patientId}`),
        ]);

        setPatient(patientResponse.data);
        setPatientForm({
          fullName: patientResponse.data.fullName || '',
          email: patientResponse.data.email || '',
          phone: patientResponse.data.phone || '',
          birthDate: patientResponse.data.birthDate ? new Date(patientResponse.data.birthDate).toISOString().slice(0, 10) : '',
          document: patientResponse.data.document || '',
          address: patientResponse.data.address || '',
          lgpdConsent: Boolean(patientResponse.data.lgpdConsent),
        });
        setAnamneses(anamnesisResponse.data || []);
        setAttachments(attachmentsResponse.data.attachments || []);
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Não foi possível carregar o paciente');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isEditing, patientId]);

  const resetFeedback = () => {
    setError('');
    setMessage('');
  };

  const handlePatientChange = (event) => {
    const { name, value, type, checked } = event.target;
    setPatientForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handlePatientSubmit = async (event) => {
    event.preventDefault();
    resetFeedback();

    try {
      setLoading(true);
      if (isEditing) {
        await api.put(`/patients/${patientId}`, patientForm);
        setMessage('Paciente atualizado com sucesso.');
      } else {
        const response = await api.post('/patients', patientForm);
        setMessage('Paciente cadastrado com sucesso.');
        navigate(`/patients/${response.data.id}/edit`, { replace: true });
        return;
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Falha ao salvar paciente');
    } finally {
      setLoading(false);
    }
  };

  const handleAnamnesisChange = (event) => {
    const { name, value } = event.target;
    setAnamnesisForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSaveAnamnesis = async (event) => {
    event.preventDefault();
    resetFeedback();

    if (!patientId || patientId === 'new') {
      setError('Salve o paciente antes de adicionar anamnese.');
      return;
    }

    try {
      setLoading(true);
      const payload = { patientId, ...anamnesisForm };

      if (editingAnamnesisId) {
        await api.put(`/records/anamnesis/${editingAnamnesisId}`, anamnesisForm);
        setMessage('Anamnese atualizada com sucesso.');
      } else {
        await api.post('/records/anamnesis', payload);
        setMessage('Anamnese adicionada com sucesso.');
      }

      const anamnesisResponse = await api.get(`/records/anamnesis/${patientId}`);
      setAnamneses(anamnesisResponse.data || []);
      setAnamnesisForm(emptyAnamnesisForm);
      setEditingAnamnesisId(null);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Falha ao salvar anamnese');
    } finally {
      setLoading(false);
    }
  };

  const handleEditAnamnesis = (anamnesis) => {
    setEditingAnamnesisId(anamnesis.id);
    setAnamnesisForm({
      allergies: anamnesis.allergies || '',
      medications: anamnesis.medications || '',
      systemicDiseases: anamnesis.systemicDiseases || '',
      notes: anamnesis.notes || '',
    });
  };

  const handleDeleteAnamnesis = async (anamnesisId) => {
    if (!window.confirm('Deseja excluir esta anamnese?')) return;

    resetFeedback();

    try {
      setLoading(true);
      await api.delete(`/records/anamnesis/${anamnesisId}`);
      const anamnesisResponse = await api.get(`/records/anamnesis/${patientId}`);
      setAnamneses(anamnesisResponse.data || []);
      if (editingAnamnesisId === anamnesisId) {
        setEditingAnamnesisId(null);
        setAnamnesisForm(emptyAnamnesisForm);
      }
      setMessage('Anamnese excluída com sucesso.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Falha ao excluir anamnese');
    } finally {
      setLoading(false);
    }
  };

  const handleAttachmentDeleted = async (attachmentId) => {
    if (!window.confirm('Deseja excluir este anexo?')) return;

    resetFeedback();

    try {
      setLoading(true);
      await api.delete(`/attachments/${attachmentId}`);
      const attachmentsResponse = await api.get(`/attachments/patient/${patientId}`);
      setAttachments(attachmentsResponse.data.attachments || []);
      setMessage('Anexo removido com sucesso.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Falha ao excluir anexo');
    } finally {
      setLoading(false);
    }
  };

  const handleAttachmentEdit = (attachment) => {
    setEditingAttachment({
      id: attachment.id,
      category: attachment.category,
      description: attachment.description || '',
    });
  };

  const handleAttachmentUpdate = async (event) => {
    event.preventDefault();
    if (!editingAttachment) return;

    resetFeedback();

    try {
      setLoading(true);
      await api.patch(`/attachments/${editingAttachment.id}`, {
        category: editingAttachment.category,
        description: editingAttachment.description,
      });
      const attachmentsResponse = await api.get(`/attachments/patient/${patientId}`);
      setAttachments(attachmentsResponse.data.attachments || []);
      setEditingAttachment(null);
      setMessage('Anexo atualizado com sucesso.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Falha ao atualizar anexo');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !patient && isEditing) {
    return <p className="text-sm text-slate-500">Carregando paciente...</p>;
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Link to="/patients" className="inline-flex items-center gap-1 hover:text-cyan-700">
              <ArrowLeft size={16} /> Voltar
            </Link>
            <span>•</span>
            <span>{pageTitle}</span>
          </div>
          <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-50">{pageTitle}</h2>
          <p className="text-sm text-slate-500">Cadastro principal, anamnese e anexos do paciente.</p>
        </div>
        {isEditing && patient && (
          <Link
            to={`/patients/${patientId}/records`}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:border-cyan-500 hover:text-cyan-700"
          >
            Abrir prontuário
          </Link>
        )}
      </header>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      {message && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{message}</div>}

      <form onSubmit={handlePatientSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span className="font-medium text-slate-700 dark:text-slate-200">Nome completo</span>
            <input
              name="fullName"
              value={patientForm.fullName}
              onChange={(event) => setPatientForm((current) => ({ ...current, fullName: maskOnlyLetters(event.target.value) }))}
              placeholder="Nome do paciente"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-black placeholder:text-gray-400 dark:border-slate-600 dark:bg-white dark:text-black dark:placeholder:text-gray-400"
            />
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-medium text-slate-700 dark:text-slate-200">Email</span>
            <input
              name="email"
              value={patientForm.email}
              onChange={(event) => setPatientForm((current) => ({ ...current, email: maskEmail(event.target.value) }))}
              placeholder="email@exemplo.com"
              type="email"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-black placeholder:text-gray-400 dark:border-slate-600 dark:bg-white dark:text-black dark:placeholder:text-gray-400"
            />
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-medium text-slate-700 dark:text-slate-200">Telefone</span>
            <input
              name="phone"
              value={patientForm.phone}
              onChange={(event) => setPatientForm((current) => ({ ...current, phone: maskPhone(event.target.value) }))}
              placeholder="(11) 99999-9999"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-black placeholder:text-gray-400 dark:border-slate-600 dark:bg-white dark:text-black dark:placeholder:text-gray-400"
            />
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-medium text-slate-700 dark:text-slate-200">Data de nascimento</span>
            <div className="relative">
              <input
                type="date"
                name="birthDate"
                value={patientForm.birthDate}
                onChange={handlePatientChange}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-black dark:border-slate-600 dark:bg-white dark:text-black"
              />
              <Calendar className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            </div>
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-medium text-slate-700 dark:text-slate-200">Documento</span>
            <input
              name="document"
              value={patientForm.document}
              onChange={(event) => setPatientForm((current) => ({ ...current, document: maskCPF(event.target.value) }))}
              placeholder="CPF ou documento"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-black placeholder:text-gray-400 dark:border-slate-600 dark:bg-white dark:text-black dark:placeholder:text-gray-400"
            />
          </label>
          <label className="space-y-2 text-sm md:col-span-2">
            <span className="font-medium text-slate-700 dark:text-slate-200">Endereço</span>
            <input
              name="address"
              value={patientForm.address}
              onChange={handlePatientChange}
              placeholder="Rua, número, bairro, cidade"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-black placeholder:text-gray-400 dark:border-slate-600 dark:bg-white dark:text-black dark:placeholder:text-gray-400"
            />
          </label>
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <input
            type="checkbox"
            name="lgpdConsent"
            checked={patientForm.lgpdConsent}
            onChange={handlePatientChange}
          />
          Consentimento LGPD registrado
        </label>

        <div className="flex justify-end gap-3">
          <Link to="/patients" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-400">
            Cancelar
          </Link>
          <button type="submit" className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-700">
            {isEditing ? 'Salvar alterações' : 'Cadastrar paciente'}
          </button>
        </div>
      </form>

      {isEditing && (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Anamnese</h3>
                <p className="text-sm text-slate-500">Adicionar, editar ou excluir o histórico clínico.</p>
              </div>
              <FilePlus2 className="text-cyan-600" size={20} />
            </div>

            <form onSubmit={handleSaveAnamnesis} className="space-y-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
              <div className="grid gap-3 md:grid-cols-2">
                <label className="space-y-2 text-sm">
                  <span className="font-medium">Alergias</span>
                  <textarea name="allergies" value={anamnesisForm.allergies} onChange={handleAnamnesisChange} rows="3" className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-black placeholder:text-gray-400 dark:border-slate-600 dark:bg-white dark:text-black dark:placeholder:text-gray-400" />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="font-medium">Medicamentos</span>
                  <textarea name="medications" value={anamnesisForm.medications} onChange={handleAnamnesisChange} rows="3" className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-black placeholder:text-gray-400 dark:border-slate-600 dark:bg-white dark:text-black dark:placeholder:text-gray-400" />
                </label>
                <label className="space-y-2 text-sm md:col-span-2">
                  <span className="font-medium">Doenças sistêmicas</span>
                  <textarea name="systemicDiseases" value={anamnesisForm.systemicDiseases} onChange={handleAnamnesisChange} rows="3" className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-black placeholder:text-gray-400 dark:border-slate-600 dark:bg-white dark:text-black dark:placeholder:text-gray-400" />
                </label>
                <label className="space-y-2 text-sm md:col-span-2">
                  <span className="font-medium">Observações</span>
                  <textarea name="notes" value={anamnesisForm.notes} onChange={handleAnamnesisChange} rows="3" className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-black placeholder:text-gray-400 dark:border-slate-600 dark:bg-white dark:text-black dark:placeholder:text-gray-400" />
                </label>
              </div>

              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditingAnamnesisId(null);
                    setAnamnesisForm(emptyAnamnesisForm);
                  }}
                  className="text-sm text-slate-500 hover:text-slate-700"
                >
                  Limpar
                </button>
                <button type="submit" className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-700">
                  {editingAnamnesisId ? 'Salvar anamnese' : 'Adicionar anamnese'}
                </button>
              </div>
            </form>

            <div className="space-y-3">
              {anamneses.length === 0 ? (
                <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-900">Nenhuma anamnese cadastrada.</p>
              ) : (
                anamneses.map((anamnesis) => (
                  <article key={anamnesis.id} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500">Versão {anamnesis.version}</p>
                        <p className="text-sm text-slate-500">{new Date(anamnesis.createdAt).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => handleEditAnamnesis(anamnesis)} className="rounded-lg p-2 text-cyan-600 hover:bg-cyan-50">
                          <PencilLine size={16} />
                        </button>
                        <button type="button" onClick={() => handleDeleteAnamnesis(anamnesis.id)} className="rounded-lg p-2 text-red-600 hover:bg-red-50">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-2 text-sm text-slate-700 dark:text-slate-200">
                      <p><strong>Alergias:</strong> {anamnesis.allergies}</p>
                      <p><strong>Medicamentos:</strong> {anamnesis.medications}</p>
                      <p><strong>Doenças sistêmicas:</strong> {anamnesis.systemicDiseases}</p>
                      <p><strong>Observações:</strong> {anamnesis.notes}</p>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>

          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Fotos e documentos</h3>
                <p className="text-sm text-slate-500">Anexe raio-x, fotos clínicas e PDFs do paciente.</p>
              </div>
              <Paperclip className="text-cyan-600" size={20} />
            </div>

            {editingAttachment && (
              <form onSubmit={handleAttachmentUpdate} className="space-y-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Editando anexo</p>
                <div className="grid gap-3">
                  <label className="space-y-2 text-sm">
                    <span className="font-medium">Categoria</span>
                    <select
                      value={editingAttachment.category}
                      onChange={(event) => setEditingAttachment((current) => ({ ...current, category: event.target.value }))}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-black dark:border-slate-600 dark:bg-white dark:text-black"
                    >
                      <option value="raio-x">Raio-X</option>
                      <option value="foto">Foto</option>
                      <option value="documento">Documento</option>
                      <option value="exame">Exame</option>
                      <option value="outro">Outro</option>
                    </select>
                  </label>
                  <label className="space-y-2 text-sm">
                    <span className="font-medium">Descrição</span>
                    <textarea
                      value={editingAttachment.description}
                      onChange={(event) => setEditingAttachment((current) => ({ ...current, description: event.target.value }))}
                      rows="3"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-black placeholder:text-gray-400 dark:border-slate-600 dark:bg-white dark:text-black dark:placeholder:text-gray-400"
                    />
                  </label>
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setEditingAttachment(null)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:border-slate-400">
                    Cancelar
                  </button>
                  <button type="submit" className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-700">
                    Salvar anexo
                  </button>
                </div>
              </form>
            )}

            <AttachmentUpload
              patientId={patientId}
              onUploadSuccess={async () => {
                const attachmentsResponse = await api.get(`/attachments/patient/${patientId}`);
                setAttachments(attachmentsResponse.data.attachments || []);
              }}
              isLoading={loading}
            />

            <AttachmentList
              attachments={attachments}
              onEdit={handleAttachmentEdit}
              onDelete={handleAttachmentDeleted}
              isLoading={loading}
              emptyMessage="Nenhum documento ou foto anexado."
            />
          </section>
        </div>
      )}
    </section>
  );
};

export default PatientFormPage;
