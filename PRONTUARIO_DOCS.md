# Sistema de Prontuário Completo - odontoCare

## 📋 Visão Geral

Implementação completa do sistema de prontuário para pacientes com três componentes principais:
1. **Anamnese** - Histórico do paciente
2. **Ficha Clínica** - Descrição de procedimentos realizados
3. **Odontograma** - Registro visual dos dentes e suas condições

---

## 🗄️ Alterações no Banco de Dados

### Novo Prisma Schema
Foram adicionados dois novos modelos:

#### **ClinicalRecord** - Ficha Clínica
```prisma
model ClinicalRecord {
  id              String   @id @default(uuid())
  patientId       String
  dentistId       String
  appointmentId   String?
  procedures      String      // Descrição dos procedimentos realizados
  diagnosis       String      // Diagnóstico
  treatmentPlan   String      // Plano de tratamento
  notes           String?     // Observações adicionais
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  patient         Patient  @relation("PatientClinicalRecords", onDelete: Cascade)
  dentist         User     @relation("DentistClinicalRecords")
  appointment     Appointment? @relation("AppointmentClinicalRecords", onDelete: SetNull)
}
```

#### **Odontogram** - Ficha Clínica Visual
```prisma
model Odontogram {
  id            String   @id @default(uuid())
  patientId     String   @unique
  dentistId     String
  teeth         Json     // JSON com dados dos 32 dentes permanentes
  observations  String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  patient       Patient  @relation("PatientOdontogram", onDelete: Cascade)
  dentist       User     @relation("DentistOdontogram")
}
```

**Migration criada:** `20260503155206_add_clinical_records_and_odontogram`

---

## 🔌 Backend API

### Estrutura de Arquivos Criados

#### Repositories
- [clinicalRecordRepository.js](backend/src/repositories/clinicalRecordRepository.js)
- [odontogramRepository.js](backend/src/repositories/odontogramRepository.js)

#### Services
- [clinicalRecordService.js](backend/src/services/clinicalRecordService.js)
- [odontogramService.js](backend/src/services/odontogramService.js)

#### Controllers
- [clinicalRecordController.js](backend/src/controllers/clinicalRecordController.js)
- [odontogramController.js](backend/src/controllers/odontogramController.js)

#### Schemas de Validação
- [clinicalRecordSchemas.js](backend/src/schemas/clinicalRecordSchemas.js)
- [odontogramSchemas.js](backend/src/schemas/odontogramSchemas.js)

#### Rotas
- [clinicalRecordRoutes.js](backend/src/routes/clinicalRecordRoutes.js)
- [odontogramRoutes.js](backend/src/routes/odontogramRoutes.js)

### Endpoints da API

#### Fichas Clínicas
```
POST   /api/clinical-records                    - Criar ficha clínica
GET    /api/clinical-records/:id                - Obter ficha por ID
GET    /api/clinical-records/patient/:patientId - Listar fichas do paciente (paginado)
GET    /api/clinical-records/patient/:patientId/latest - Obter última ficha
PATCH  /api/clinical-records/:id                - Atualizar ficha
DELETE /api/clinical-records/:id                - Deletar ficha
```

#### Odontogramas
```
POST   /api/odontograms/patient/:patientId                        - Criar odontograma
GET    /api/odontograms/patient/:patientId                        - Obter odontograma
PATCH  /api/odontograms/patient/:patientId                        - Atualizar odontograma
PATCH  /api/odontograms/patient/:patientId/tooth/:toothNumber     - Atualizar dente específico
DELETE /api/odontograms/patient/:patientId                        - Deletar odontograma
```

### Status dos Dentes (Odontograma)
- `healthy` - Hígido (saudável)
- `caries` - Cárie
- `missing` - Ausente
- `restored` - Restaurado
- `root` - Raiz

---

## 🎨 Frontend Components

### Estrutura de Componentes
[frontend/src/features/medical-records/](frontend/src/features/medical-records/)

#### **ClinicalRecord.jsx**
Componentes para gerenciar fichas clínicas:
- `ClinicalRecordForm` - Formulário para criar/editar ficha
- `ClinicalRecordList` - Lista de fichas do paciente

**Funcionalidades:**
- Criar novo registro de procedimentos
- Editar fichas existentes
- Deletar registros
- Visualizar diagnóstico e plano de tratamento
- Suporta paginação

#### **Odontogram.jsx**
Componentes para o odontograma visual:
- `Odontogram` - Gráfico interativo dos dentes
- `ToothDetailsPanel` - Painel de detalhes do dente

**Funcionalidades:**
- Visualização dos 32 dentes permanentes
- 5 estados diferentes com cores
- Modo edição para alterar status dos dentes
- Teclado visual com dentes por setor (superior/inferior, direita/esquerda)
- Legenda interativa

#### **PatientRecordsPage.jsx**
Página principal com 3 abas:

1. **Anamnese** - Histórico do paciente (placeholder para implementação futura)
2. **Ficha Clínica** - 
   - Lista de fichas clínicas do paciente
   - Criar nova ficha
   - Editar existentes
   - Deletar registros
3. **Odontograma** -
   - Visualização interativa dos dentes
   - Criar novo odontograma
   - Atualizar status de dentes individuais
   - Edição em tempo real

---

## 📱 Rota Adicionada

```javascript
// Em router.jsx
<Route path="patients/:patientId/records" element={<PatientRecordsPage />} />
```

**Acesso:** `http://localhost:5173/patients/{patientId}/records`

---

## 🚀 Como Usar

### Backend
1. Migrations já foram aplicadas automaticamente
2. Endpoints documentados acima estão prontos para uso
3. Todos os endpoints requerem autenticação

### Frontend
1. Navegue até uma página de paciente
2. Acesse o prontuário via botão ou link direto
3. Navigate entre as 3 abas:
   - **Anamnese:** Histórico do paciente
   - **Ficha Clínica:** Procedimentos e diagnósticos
   - **Odontograma:** Visualização e edição dos dentes

---

## 🔐 Segurança

- ✅ Proteção por autenticação em todas as rotas
- ✅ Validação com Zod nos endpoints
- ✅ Controle de acesso: Apenas DENTIST e ADMIN podem criar/editar registros
- ✅ Validações de permissão no service
- ✅ CSRF protection habilitado

---

## 📊 Estrutura de Dados - Odontograma

```json
{
  "teeth": {
    "11": { "number": 11, "status": "healthy", "notes": "" },
    "12": { "number": 12, "status": "caries", "notes": "Cárie inicial" },
    "13": { "number": 13, "status": "restored", "notes": "Restauração de resina" },
    ...restante dos dentes
  },
  "observations": "Observações gerais sobre a boca do paciente"
}
```

---

## 🔄 Fluxo de Uso

### Criar Prontuário Completo
1. **Anamnese** → Histórico do paciente e doenças
2. **Ficha Clínica** → Procedimentos realizados e diagnóstico
3. **Odontograma** → Mapa visual com status de cada dente

### Editar Prontuário
- Fichas clínicas podem ser editadas/deletadas
- Odontogramas podem ser atualizados (incluso dente por dente)
- Histórico mantido (criatedAt/updatedAt)

---

## 📝 Próximos Passos Sugeridos

1. **Implementar Anamnese:**
   - Criar modelo e CRUD completo
   - Versionar histórico de mudanças
   - Integrar com fichas clínicas

2. **Relatórios:**
   - Gerar PDF do prontuário completo
   - Exportar odontograma em imagem

3. **Melhorias na UI:**
   - Adicionar observações por dente
   - Integrar fotos do dente
   - Timeline de eventos do paciente

4. **Auditoria:**
   - Rastrear todas as alterações no prontuário
   - Log de quem alterou o quê e quando

---

## ✅ Testes Sugeridos

```bash
# Criar ficha clínica
POST /api/clinical-records
{
  "patientId": "uuid",
  "procedures": "Limpeza e polimento dos dentes",
  "diagnosis": "Gengivite leve",
  "treatmentPlan": "Escovação correta e higiene bucal"
}

# Criar odontograma
POST /api/odontograms/patient/{patientId}
{}

# Atualizar dente
PATCH /api/odontograms/patient/{patientId}/tooth/11
{
  "status": "caries"
}
```
