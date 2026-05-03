import { useState } from 'react';
import { Upload, X, FileText, Image, File } from 'lucide-react';
import api from '../../services/api';

export function AttachmentUpload({ patientId, clinicalRecordId, onUploadSuccess, isLoading = false }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [category, setCategory] = useState('outro');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const categories = [
    { value: 'raio-x', label: 'Raio-X', icon: '🦷' },
    { value: 'foto', label: 'Foto', icon: '📸' },
    { value: 'documento', label: 'Documento', icon: '📄' },
    { value: 'exame', label: 'Exame', icon: '🔬' },
    { value: 'outro', label: 'Outro', icon: '📎' },
  ];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Selecione um arquivo');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('category', category);
    formData.append('description', description);
    if (clinicalRecordId) {
      formData.append('clinicalRecordId', clinicalRecordId);
    }

    try {
      setUploading(true);
      setError(null);

      const response = await api.post(`/attachments/patient/${patientId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const attachment = response.data;
      setSelectedFile(null);
      setDescription('');
      setCategory('outro');

      if (onUploadSuccess) {
        onUploadSuccess(attachment);
      }
    } catch (err) {
      setError(err.message || 'Erro ao fazer upload');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Anexar Documento ou Foto</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
          {error}
        </div>
      )}

      {/* Drag and drop area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center mb-6 transition-colors ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
      >
        {!selectedFile ? (
          <div>
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-700 font-medium mb-1">
              Arraste o arquivo aqui ou
            </p>
            <label className="text-blue-600 cursor-pointer hover:text-blue-700 font-medium">
              clique para selecionar
              <input
                type="file"
                onChange={handleFileSelect}
                accept="image/jpeg,image/png,image/webp,application/pdf,image/tiff"
                className="hidden"
              />
            </label>
            <p className="text-sm text-gray-500 mt-2">
              JPEG, PNG, WebP, PDF ou TIFF (máx. 10MB)
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <FileText className="w-8 h-8 text-gray-400" />
              <p className="text-gray-700 font-medium">{selectedFile.name}</p>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500">
              {(selectedFile.size / 1024 / 1024).toFixed(2)}MB
            </p>
          </div>
        )}
      </div>

      {selectedFile && (
        <div className="space-y-4">
          {/* Category selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Documento *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {categories.map(cat => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`min-h-28 p-3 rounded-xl border-2 text-center text-sm font-medium transition-all flex flex-col items-center justify-center gap-2 leading-tight ${
                    category === cat.value
                      ? 'border-blue-600 bg-blue-50 text-blue-600'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-2xl leading-none">{cat.icon}</div>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição (opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Raio-X panorâmico, Foto do sorriso, etc..."
              maxLength={500}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
            />
            <p className="text-xs text-gray-500 mt-1">{description.length}/500</p>
          </div>

          {/* Upload button */}
          <button
            onClick={handleUpload}
            disabled={uploading || isLoading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium transition-colors"
          >
            {uploading ? 'Enviando...' : 'Fazer Upload'}
          </button>
        </div>
      )}
    </div>
  );
}

export function AttachmentItem({ attachment, onEdit, onDelete, isLoading = false }) {
  const categoryColors = {
    'raio-x': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    'foto': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    'documento': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
    'exame': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    'outro': { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
  };

  const colors = categoryColors[attachment.category] || categoryColors.outro;
  const isImage = attachment.fileType.startsWith('image/');
  const isPdf = attachment.fileType === 'application/pdf';

  return (
    <div className={`border rounded-lg p-4 ${colors.border}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {isImage ? (
              <Image className="w-5 h-5 text-blue-600" />
            ) : (
              <FileText className="w-5 h-5 text-gray-600" />
            )}
            <a
              href={`${api.defaults.baseURL}/attachments/${attachment.id}/download`}
              className="text-blue-600 hover:text-blue-700 font-medium"
              target="_blank"
              rel="noopener noreferrer"
            >
              {attachment.originalName}
            </a>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${colors.bg} ${colors.text}`}>
              {attachment.category === 'raio-x' && '📷 Raio-X'}
              {attachment.category === 'foto' && '📸 Foto'}
              {attachment.category === 'documento' && '📄 Documento'}
              {attachment.category === 'exame' && '🔬 Exame'}
              {attachment.category === 'outro' && '📎 Outro'}
            </span>
            <span className="text-xs text-gray-500">
              {(attachment.fileSize / 1024 / 1024).toFixed(2)}MB
            </span>
            <span className="text-xs text-gray-500">
              {new Date(attachment.createdAt).toLocaleDateString('pt-BR')}
            </span>
          </div>

          {attachment.description && (
            <p className="text-sm text-gray-600 mb-2">{attachment.description}</p>
          )}

          {attachment.uploadedBy && (
            <p className="text-xs text-gray-500">
              Enviado por: {attachment.uploadedBy.name}
            </p>
          )}

          {isImage && (
            <a
              href={`${api.defaults.baseURL}/attachments/${attachment.id}/view`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Visualizar Imagem →
            </a>
          )}
        </div>

        <div className="ml-4 flex gap-2">
          {onEdit && (
            <button
              onClick={() => onEdit(attachment)}
              disabled={isLoading}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded disabled:opacity-50"
              title="Editar"
            >
              <File className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={() => onDelete(attachment.id)}
            disabled={isLoading}
            className="p-2 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
            title="Deletar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function AttachmentList({ attachments, onEdit, onDelete, isLoading = false, emptyMessage = 'Nenhum anexo' }) {
  if (!attachments || attachments.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <File className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {attachments.map(attachment => (
        <AttachmentItem
          key={attachment.id}
          attachment={attachment}
          onEdit={onEdit}
          onDelete={onDelete}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}
