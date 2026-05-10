import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { maskCNPJ, maskEmail } from '../../utils/masks';

const initialForm = {
  name: '',
  email: '',
  role: 'RECEPTION',
  password: '',
  clinicId: '',
};

const initialClinicForm = {
  name: '',
  address: '',
  cnpj: '',
};

const normalizeCnpj = (value = '') => value.replace(/\D/g, '');

const formatCnpj = (value = '') => {
  const digits = normalizeCnpj(value);

  if (digits.length !== 14) {
    return value;
  }

  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
};

export const ClinicsPage = () => {
  const [clinics, setClinics] = useState([]);
  const [membersByClinic, setMembersByClinic] = useState({});
  const [form, setForm] = useState(initialClinicForm);
  const [editingClinic, setEditingClinic] = useState(null);
  const [memberForm, setMemberForm] = useState(initialForm);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteConfirmValue, setDeleteConfirmValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadClinics = async () => {
    const response = await api.get('/clinics/mine');
    setClinics(response.data);

    const nextMembers = {};
    response.data.forEach((clinic) => {
      nextMembers[clinic.id] = clinic.members || [];
    });
    setMembersByClinic(nextMembers);
  };

  useEffect(() => {
    loadClinics();
  }, []);

  const createClinic = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');

    if (!form.name.trim()) {
      setError('Informe o nome do consultório.');
      return;
    }

    if (!form.address.trim()) {
      setError('Informe o endereço completo do consultório.');
      return;
    }

    if (!form.cnpj.trim()) {
      setError('Informe o CNPJ do consultório.');
      return;
    }

    try {
      setLoading(true);
      await api.post('/clinics', {
        name: form.name.trim(),
        address: form.address.trim(),
        cnpj: normalizeCnpj(form.cnpj),
      });
      setForm(initialClinicForm);
      setMessage('Consultório criado com sucesso.');
      await loadClinics();
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Falha ao criar consultório.');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (clinic) => {
    setMessage('');
    setError('');
    setEditingClinic({
      id: clinic.id,
      name: clinic.name || '',
      address: clinic.address || '',
      cnpj: formatCnpj(clinic.cnpj || ''),
    });
  };

  const cancelEdit = () => {
    setEditingClinic(null);
  };

  const saveEdit = async (clinicId) => {
    if (!editingClinic?.name.trim()) {
      setError('Informe o nome do consultório.');
      return;
    }

    if (!editingClinic?.address.trim()) {
      setError('Informe o endereço completo do consultório.');
      return;
    }

    if (!editingClinic?.cnpj.trim()) {
      setError('Informe o CNPJ do consultório.');
      return;
    }

    try {
      setLoading(true);
      await api.patch(`/clinics/${clinicId}`, {
        name: editingClinic.name.trim(),
        address: editingClinic.address.trim(),
        cnpj: normalizeCnpj(editingClinic.cnpj),
      });
      setMessage('Consultório atualizado com sucesso.');
      cancelEdit();
      await loadClinics();
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Falha ao atualizar consultório.');
    } finally {
      setLoading(false);
    }
  };

  const openDeleteDialog = (clinic) => {
    setMessage('');
    setError('');
    setDeleteTarget(clinic);
    setDeleteConfirmValue('');
  };

  const closeDeleteDialog = () => {
    setDeleteTarget(null);
    setDeleteConfirmValue('');
  };

  const deleteClinic = async () => {
    if (!deleteTarget) return;

    try {
      setLoading(true);
      await api.delete(`/clinics/${deleteTarget.id}`);
      if (editingClinic?.id === deleteTarget.id) {
        cancelEdit();
      }
      closeDeleteDialog();
      setMessage('Consultório excluído com sucesso.');
      await loadClinics();
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Falha ao excluir consultório.');
    } finally {
      setLoading(false);
    }
  };

  const addMember = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');

    if (!memberForm.clinicId || !memberForm.email || !memberForm.password) {
      setError('Preencha consultório, nome, email e senha.');
      return;
    }

    try {
      setLoading(true);
      await api.post('/auth/register', {
        name: memberForm.name,
        email: memberForm.email,
        password: memberForm.password,
        role: memberForm.role,
        clinicId: memberForm.clinicId,
      });
      setMemberForm(initialForm);
      setMessage('Usuário adicionado ao consultório com sucesso.');
      await loadClinics();
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Falha ao adicionar usuário.');
    } finally {
      setLoading(false);
    }
  };

  const filteredClinics = clinics.filter((clinic) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;

    const memberCount = String(membersByClinic[clinic.id]?.length || 0);
    const normalizedTerm = normalizeCnpj(term);
    const normalizedClinicCnpj = normalizeCnpj(clinic.cnpj || '');
    return (
      clinic.name.toLowerCase().includes(term) ||
      (clinic.address || '').toLowerCase().includes(term) ||
      (clinic.cnpj || '').toLowerCase().includes(term) ||
      normalizedClinicCnpj.includes(normalizedTerm) ||
      clinic.id.toLowerCase().includes(term) ||
      memberCount.includes(term)
    );
  });

  const sortedClinics = [...filteredClinics].sort((a, b) => {
    const aName = a.name.toLowerCase();
    const bName = b.name.toLowerCase();
    const aMembers = membersByClinic[a.id]?.length || 0;
    const bMembers = membersByClinic[b.id]?.length || 0;

    switch (sortBy) {
      case 'name-desc':
        return bName.localeCompare(aName);
      case 'members-desc':
        return bMembers - aMembers || aName.localeCompare(bName);
      case 'members-asc':
        return aMembers - bMembers || aName.localeCompare(bName);
      case 'recent-desc':
        return new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0);
      case 'name-asc':
      default:
        return aName.localeCompare(bName);
    }
  });

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-2xl font-bold">Consultórios</h2>
        <p className="text-sm text-slate-500">Administração dos consultórios e dos usuários vinculados.</p>
      </header>

      <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
        <div className="grid gap-4 md:grid-cols-[1fr_220px] lg:grid-cols-[1fr_220px_180px]">
          <div>
            <label className="text-sm text-slate-700 dark:text-slate-300">Filtrar consultórios</label>
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar por nome, endereço, CNPJ, ID ou número de membros"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:bg-slate-900"
            />
          </div>

          <div>
            <label className="text-sm text-slate-700 dark:text-slate-300">Ordenar por</label>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:bg-slate-900"
            >
              <option value="name-asc">Nome A-Z</option>
              <option value="name-desc">Nome Z-A</option>
              <option value="members-desc">Mais membros</option>
              <option value="members-asc">Menos membros</option>
              <option value="recent-desc">Mais recente</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setSortBy('name-asc');
              }}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium dark:border-slate-600"
            >
              Limpar filtros
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
          <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">{sortedClinics.length} resultado(s)</span>
          {searchTerm.trim() && <span className="rounded-full bg-cyan-100 px-3 py-1 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-200">Busca: {searchTerm.trim()}</span>}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <form onSubmit={createClinic} className="space-y-4 rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
          <h3 className="font-semibold">Novo consultório</h3>

          <div>
            <label className="text-sm text-slate-700 dark:text-slate-300">Nome do consultório</label>
            <input
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              placeholder="Ex.: OdontoCare Centro"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:bg-slate-900"
            />
          </div>

          <div>
            <label className="text-sm text-slate-700 dark:text-slate-300">Endereço completo</label>
            <input
              value={form.address}
              onChange={(event) => setForm({ ...form, address: event.target.value })}
              placeholder="Rua, número, bairro, cidade, estado"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:bg-slate-900"
            />
          </div>

          <div>
            <label className="text-sm text-slate-700 dark:text-slate-300">CNPJ</label>
            <input
              value={form.cnpj}
              onChange={(event) => setForm({ ...form, cnpj: maskCNPJ(event.target.value) })}
              placeholder="00.000.000/0000-00"
              inputMode="numeric"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:bg-slate-900"
            />
          </div>

          {error && <p className="text-sm text-rose-600">{error}</p>}
          {message && <p className="text-sm text-emerald-600">{message}</p>}

          <button type="submit" disabled={loading} className="rounded-lg bg-cyan-600 px-4 py-2 font-medium text-white disabled:opacity-60">
            {loading ? 'Salvando...' : 'Criar consultório'}
          </button>
        </form>

        <form onSubmit={addMember} className="space-y-4 rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
          <h3 className="font-semibold">Vincular usuário a consultório</h3>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm text-slate-700 dark:text-slate-300">Consultório</label>
              <select
                value={memberForm.clinicId}
                onChange={(event) => setMemberForm({ ...memberForm, clinicId: event.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:bg-slate-900"
              >
                <option value="">Selecione</option>
                {clinics.map((clinic) => (
                  <option key={clinic.id} value={clinic.id}>
                    {clinic.name} - {formatCnpj(clinic.cnpj)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-slate-700 dark:text-slate-300">Perfil</label>
              <select
                value={memberForm.role}
                onChange={(event) => setMemberForm({ ...memberForm, role: event.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:bg-slate-900"
              >
                <option value="DENTIST">Dentista</option>
                <option value="RECEPTION">Recepção</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm text-slate-700 dark:text-slate-300">Nome</label>
              <input
                value={memberForm.name}
                onChange={(event) => setMemberForm({ ...memberForm, name: event.target.value })}
                placeholder="Nome completo"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:bg-slate-900"
              />
            </div>

            <div>
              <label className="text-sm text-slate-700 dark:text-slate-300">Email</label>
              <input
                value={memberForm.email}
                onChange={(event) => setMemberForm({ ...memberForm, email: maskEmail(event.target.value) })}
                placeholder="usuario@consultorio.com"
                type="email"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:bg-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-700 dark:text-slate-300">Senha inicial</label>
            <input
              type="password"
              value={memberForm.password}
              onChange={(event) => setMemberForm({ ...memberForm, password: event.target.value })}
              placeholder="Senha temporária"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:bg-slate-900"
            />
          </div>

          <button type="submit" disabled={loading} className="rounded-lg bg-cyan-600 px-4 py-2 font-medium text-white disabled:opacity-60">
            {loading ? 'Salvando...' : 'Vincular usuário'}
          </button>
        </form>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {sortedClinics.map((clinic) => (
          <article key={clinic.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
            <div className="flex items-start justify-between gap-3">
              <div>
                {editingClinic?.id === clinic.id ? (
                  <div className="space-y-2">
                    <label className="text-sm text-slate-700 dark:text-slate-300">Nome do consultório</label>
                    <input
                      value={editingClinic?.name || ''}
                      onChange={(event) => setEditingClinic({ ...editingClinic, name: event.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:bg-slate-900"
                    />
                    <label className="text-sm text-slate-700 dark:text-slate-300">Endereço completo</label>
                    <input
                      value={editingClinic?.address || ''}
                      onChange={(event) => setEditingClinic({ ...editingClinic, address: event.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:bg-slate-900"
                    />
                    <label className="text-sm text-slate-700 dark:text-slate-300">CNPJ</label>
                    <input
                      value={editingClinic?.cnpj || ''}
                      onChange={(event) => setEditingClinic({ ...editingClinic, cnpj: maskCNPJ(event.target.value) })}
                      inputMode="numeric"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:bg-slate-900"
                    />
                  </div>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold">{clinic.name}</h3>
                    <p className="text-sm text-slate-500">{clinic.address}</p>
                    <p className="text-sm text-slate-500">CNPJ: {formatCnpj(clinic.cnpj)}</p>
                    <p className="text-sm text-slate-500">{clinic.id}</p>
                  </>
                )}
              </div>
              <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-medium text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-200">
                {membersByClinic[clinic.id]?.length || 0} membros
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {editingClinic?.id === clinic.id ? (
                <>
                  <button
                    type="button"
                    onClick={() => saveEdit(clinic.id)}
                    disabled={loading}
                    className="rounded-lg bg-cyan-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
                  >
                    Salvar
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium dark:border-slate-600"
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => startEdit(clinic)}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium dark:border-slate-600"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => openDeleteDialog(clinic)}
                    disabled={loading}
                    className="rounded-lg border border-rose-300 px-3 py-2 text-sm font-medium text-rose-700 disabled:opacity-60 dark:border-rose-800 dark:text-rose-300"
                  >
                    Excluir
                  </button>
                </>
              )}
            </div>

            <div className="mt-4 space-y-2">
              {(membersByClinic[clinic.id] || []).map((member) => (
                <div key={member.id} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
                  <p className="font-medium">{member.user?.name}</p>
                  <p className="text-sm text-slate-500">{member.user?.email}</p>
                  <p className="text-xs uppercase tracking-wide text-cyan-700 dark:text-cyan-300">{member.user?.role}</p>
                </div>
              ))}

              {(membersByClinic[clinic.id] || []).length === 0 && (
                <p className="text-sm text-slate-500">Nenhum membro vinculado.</p>
              )}
            </div>
          </article>
        ))}

        {clinics.length === 0 && (
          <p className="text-sm text-slate-500">Você ainda não tem consultórios vinculados.</p>
        )}

        {clinics.length > 0 && sortedClinics.length === 0 && (
          <p className="text-sm text-slate-500">Nenhum consultório encontrado com os filtros atuais.</p>
        )}
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <h3 className="text-xl font-bold text-rose-700 dark:text-rose-300">Excluir consultório</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Essa ação é permanente e remove os vínculos do consultório com seus dados relacionados.
            </p>

            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
              <p className="font-semibold">{deleteTarget.name}</p>
              <p>{deleteTarget.address}</p>
              <p>CNPJ: {formatCnpj(deleteTarget.cnpj)}</p>
              <p>ID: {deleteTarget.id}</p>
            </div>

            <div className="mt-4">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Digite exatamente o nome do consultório para confirmar
              </label>
              <input
                value={deleteConfirmValue}
                onChange={(event) => setDeleteConfirmValue(event.target.value)}
                placeholder={deleteTarget.name}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:bg-slate-950"
              />
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={deleteClinic}
                disabled={loading || deleteConfirmValue.trim() !== deleteTarget.name}
                className="rounded-lg bg-rose-600 px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Excluindo...' : 'Confirmar exclusão'}
              </button>
              <button
                type="button"
                onClick={closeDeleteDialog}
                disabled={loading}
                className="rounded-lg border border-slate-300 px-4 py-2 font-medium dark:border-slate-600"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};