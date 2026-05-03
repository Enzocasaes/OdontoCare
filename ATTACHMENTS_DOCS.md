# Sistema de Anexos - odontoCare

## 📸 Visão Geral

Implementação completa de upload e gerenciamento de anexos (fotos, raio-x, documentos, exames) para cada paciente no prontuário.

---

## 🗄️ Alterações no Banco de Dados

### Novo Modelo Prisma: Attachment

```prisma
model Attachment {
  id              String   @id @default(uuid())
  patientId       String
  clinicalRecordId String?
  uploadedById    String
  fileName        String        // Nome único do arquivo no servidor
  originalName    String        // Nome original do arquivo enviado
  fileType        String        // MIME type (image/jpeg, application/pdf, etc)
  fileSize        Int           // Tamanho em bytes
  filePath        String        // Caminho do arquivo no servidor
  category        String        // raio-x, foto, documento, exame, outro
  description     String?       // Descrição adicional
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  patient         Patient  @relation("PatientAttachments", onDelete: Cascade)
  clinicalRecord  ClinicalRecord? @relation(onDelete: SetNull)
  uploadedBy      User     @relation()
}
```

**Migration:** `20260503155804_add_attachments`

### Relações Atualizadas
- `Patient.attachments` - Lista de anexos do paciente
- `ClinicalRecord.attachments` - Anexos relacionados a uma ficha clínica
- `User.attachmentsUploaded` - Arquivos enviados por um usuário

---

## 🔌 Backend API

### Estrutura de Arquivos

```
backend/src/
├── repositories/
│   └── attachmentRepository.js
├── services/
│   └── attachmentService.js
├── controllers/
│   └── attachmentController.js
├── schemas/
│   └── attachmentSchemas.js
└── routes/
    └── attachmentRoutes.js
```

### Endpoints da API

#### Upload de Arquivo
```http
POST /api/attachments/patient/:patientId
Content-Type: multipart/form-data

body: {
  file: <arquivo>,
  category: "raio-x|foto|documento|exame|outro",
  description: "descrição opcional",
  clinicalRecordId: "uuid opcional"  // Associar a uma ficha clínica
}

Response: {
  id: "uuid",
  patientId: "uuid",
  fileName: "uuid.jpg",
  originalName: "raio-x-panoramico.jpg",
  fileType: "image/jpeg",
  fileSize: 2097152,
  category: "raio-x",
  description: "Raio-x panorâmico",
  uploadedBy: { id, name, email },
  createdAt: "2026-05-03T15:58:04Z"
}
```

#### Listar Anexos do Paciente
```http
GET /api/attachments/patient/:patientId?page=1&limit=10

Response: {
  attachments: [...],
  total: 10,
  page: 1,
  pageSize: 10
}
```

#### Listar Anexos por Categoria
```http
GET /api/attachments/patient/:patientId/category/:category

Response: [...]
```

#### Listar Anexos de uma Ficha Clínica
```http
GET /api/attachments/clinical-record/:clinicalRecordId

Response: [...]
```

#### Download de Arquivo
```http
GET /api/attachments/:attachmentId/download

Response: <binary file>
```

#### Visualizar Arquivo (inline)
```http
GET /api/attachments/:attachmentId/view

Response: <inline file>
```

#### Atualizar Informações do Arquivo
```http
PATCH /api/attachments/:id

body: {
  category: "raio-x|foto|documento|exame|outro",
  description: "nova descrição"
}
```

#### Deletar Arquivo
```http
DELETE /api/attachments/:id

Response: { message: "Arquivo deletado com sucesso" }
```

### Categorias Suportadas
- `raio-x` - Radiografias (panorâmicas, periapicais, etc)
- `foto` - Fotos intraorais e extraorais
- `documento` - Documentos gerais
- `exame` - Exames laboratoriais
- `outro` - Outros tipos

### Tipos de Arquivo Suportados
- `image/jpeg` - Foto JPEG
- `image/png` - Foto PNG
- `image/webp` - Foto WebP
- `image/tiff` - Foto TIFF (comum em raio-x)
- `application/pdf` - Documentos PDF

### Limites
- **Tamanho máximo:** 10MB por arquivo
- **Diretório de upload:** `./uploads` (configurável via `UPLOAD_DIR`)

### Segurança
- ✅ Autenticação JWT obrigatória
- ✅ Upload apenas por DENTIST e ADMIN
- ✅ Validação de tipo MIME
- ✅ Validação de tamanho
- ✅ Isolamento por paciente
- ✅ Soft-delete ao deletar paciente

---

## 🎨 Frontend Components

### Estrutura
[frontend/src/features/medical-records/Attachments.jsx](../frontend/src/features/medical-records/Attachments.jsx)

### Componentes

#### 1. **AttachmentUpload**
Form para upload de arquivos com drag-and-drop.

**Props:**
```javascript
{
  patientId: string,           // ID do paciente (obrigatório)
  clinicalRecordId?: string,   // Associar a uma ficha clínica (opcional)
  onUploadSuccess: function,   // Callback após upload bem-sucedido
  isLoading?: boolean          // Estado de carregamento
}
```

**Funcionalidades:**
- Drag and drop de arquivos
- Seleção de arquivo via input
- Seleção de categoria com ícones
- Descrição opcional
- Validação de tipo e tamanho
- Feedback visual durante upload

#### 2. **AttachmentItem**
Card individual para exibir um anexo.

**Props:**
```javascript
{
  attachment: object,           // Dados do anexo
  onDelete: function,           // Callback para deletar
  isLoading?: boolean          // Estado de carregamento
}
```

**Funcionalidades:**
- Exibe ícone baseado no tipo
- Mostra categoria com cor
- Link de download
- Link de visualização para imagens
- Metadados (tamanho, data, uploader)
- Botão de delete

#### 3. **AttachmentList**
Lista de anexos com suporte a empty state.

**Props:**
```javascript
{
  attachments: array,           // Lista de anexos
  onDelete: function,          // Callback para deletar
  isLoading?: boolean,         // Estado de carregamento
  emptyMessage?: string        // Mensagem quando vazio
}
```

### Integração na Página de Prontuário

A nova aba **"Anexos"** foi adicionada ao `PatientRecordsPage` com:

```javascript
{/* Attachments Tab */}
{activeTab === 'attachments' && (
  <div className="space-y-6">
    {/* Upload component */}
    <AttachmentUpload
      patientId={patientId}
      onUploadSuccess={handleAttachmentUploadSuccess}
      isLoading={isLoading}
    />

    {/* Lista de anexos */}
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
```

### UI/UX
- **Cores por categoria:**
  - Raio-X: Roxo
  - Foto: Azul
  - Documento: Amarelo
  - Exame: Verde
  - Outro: Cinza

- **Ícones:**
  - 📷 Raio-X
  - 📸 Foto
  - 📄 Documento
  - 🔬 Exame
  - 📎 Outro

---

## 🔧 Configuração

### Variáveis de Ambiente

Adicione ao `.env`:

```env
# Upload Configuration
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=10485760  # 10MB em bytes
```

### Diretório de Upload

O servidor criará automaticamente a pasta `./uploads` se não existir.

**Estrutura:**
```
uploads/
├── <uuid-1>.jpg
├── <uuid-2>.pdf
├── <uuid-3>.png
└── ...
```

**Nota:** A pasta `uploads/` deve estar em `.gitignore`

---

## 🚀 Como Usar

### Backend Setup
1. Dependências instaladas: `npm install multer`
2. Migration aplicada: `20260503155804_add_attachments`
3. Endpoints disponíveis em `/api/attachments/*`

### Frontend Usage

#### 1. Navegue até o Prontuário do Paciente
```
/patients/{patientId}/records
```

#### 2. Acesse a aba "Anexos"
```
Prontuário > Anexos (nova aba)
```

#### 3. Upload de Arquivo
- Arrastar arquivo para a área de drop
- Ou clicar para selecionar
- Escolher categoria
- Adicionar descrição (opcional)
- Clicar "Fazer Upload"

#### 4. Gerenciar Anexos
- Visualizar em lista
- Download via link
- Ver imagens inline
- Deletar (com confirmação)

---

## 📊 Exemplos de Uso

### Upload de Raio-X
```javascript
const file = new File(["..."], "rx-panoramica.jpg", { type: "image/jpeg" });
const formData = new FormData();
formData.append("file", file);
formData.append("category", "raio-x");
formData.append("description", "Raio-X panorâmico - diagnóstico inicial");

await fetch(`/api/attachments/patient/${patientId}`, {
  method: "POST",
  body: formData,
  headers: {
    "Authorization": `Bearer ${token}`
  }
});
```

### Listar Raio-Xs do Paciente
```javascript
const response = await fetch(
  `/api/attachments/patient/${patientId}/category/raio-x`
);
const raioXs = await response.json();
```

### Download de Arquivo
```javascript
window.open(`/api/attachments/${attachmentId}/download`);
```

---

## 🔒 Segurança

- ✅ **Autenticação:** JWT obrigatório
- ✅ **Autorização:** Apenas DENTIST e ADMIN podem fazer upload
- ✅ **Validação MIME:** Whitelist de tipos permitidos
- ✅ **Limite de tamanho:** 10MB máximo
- ✅ **Isolamento:** Cada paciente só vê seus anexos
- ✅ **Nomes únicos:** UUIDs para evitar conflitos
- ✅ **Cascade delete:** Anexos deletados com paciente

---

## 📋 Próximas Melhorias Sugeridas

1. **Compressão de Imagens**
   - Comprimir JPEG no upload
   - Gerar thumbnails

2. **Galeria Visual**
   - Visualização em grid
   - Preview em modal
   - Lightbox para imagens

3. **OCR para Documentos**
   - Extrair texto de PDFs
   - Busca por conteúdo

4. **Sincronização com Nuvem**
   - Backup automático
   - S3, Google Cloud, etc.

5. **Anotações em Imagens**
   - Desenhar sobre radiografias
   - Marcar áreas de interesse

6. **Versioning**
   - Histórico de versões
   - Comparação antes/depois

---

## 🐛 Troubleshooting

### Erro: "Tipo de arquivo não permitido"
- Certifique-se que o arquivo é: JPEG, PNG, WebP, PDF ou TIFF
- Verifique a extensão do arquivo

### Erro: "Arquivo muito grande"
- Máximo 10MB por arquivo
- Comprima a imagem antes de enviar

### Erro: "Permissão negada"
- Apenas DENTIST e ADMIN podem fazer upload
- Verifique seu token JWT

### Arquivo não aparece
- Refreche a página
- Verifique se o paciente ID está correto
- Veja o console do navegador para erros
