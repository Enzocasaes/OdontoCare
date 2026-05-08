# Sistema de Gerenciamento Financeiro - OdontoCare

Este documento descreve o sistema completo de gerenciamento financeiro implementado para controle de tratamentos e pagamentos de pacientes.

## 📊 Visão Geral

O sistema permite:
- ✅ Criar tratamentos com valores totais
- ✅ Parcelar tratamentos automaticamente
- ✅ Registrar pagamentos de parcelas
- ✅ Acompanhar status financeiro de pacientes
- ✅ Visualizar parcelas pagas, pendentes e atrasadas
- ✅ Obter resumo financeiro completo do paciente

## 🗂️ Estrutura de Dados

### Treatment (Tratamento)
```javascript
{
  id: "uuid",
  patientId: "uuid",
  description: "Tratamento de canal - dente 14",
  totalAmount: 1000.00,
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELED",
  startDate: "2026-05-03T00:00:00.000Z",
  completedAt: null,
  observations: "Tratamento em 4 sessões",
  payments: [...] // Array de parcelas
}
```

### Payment (Pagamento/Parcela)
```javascript
{
  id: "uuid",
  treatmentId: "uuid",
  amount: 250.00,
  installmentNumber: 1,
  totalInstallments: 4,
  dueDate: "2026-06-03T00:00:00.000Z",
  paidAt: "2026-06-02T14:30:00.000Z",
  method: "CREDIT_CARD" | "DEBIT_CARD" | "CASH" | "TRANSFER" | "PIX",
  status: "PENDING" | "PAID",
  treatment: {...} // Dados do tratamento
}
```

## 🔌 Endpoints da API

### 1. Criar Tratamento com Parcelas

**POST** `/api/finance/treatments`

Cria um novo tratamento e gera automaticamente as parcelas.

**Request Body:**
```json
{
  "patientId": "uuid-do-paciente",
  "description": "Tratamento de canal - dente 14",
  "totalAmount": 1000,
  "installments": 4,
  "firstDueDate": "2026-06-03",
  "observations": "Tratamento em 4 sessões"
}
```

**Response (201):**
```json
{
  "id": "treatment-uuid",
  "patientId": "uuid-do-paciente",
  "description": "Tratamento de canal - dente 14",
  "totalAmount": "1000.00",
  "status": "PENDING",
  "startDate": "2026-05-03T00:00:00.000Z",
  "completedAt": null,
  "observations": "Tratamento em 4 sessões",
  "patient": {
    "id": "uuid-do-paciente",
    "fullName": "João Silva",
    ...
  },
  "payments": [
    {
      "id": "payment-1-uuid",
      "amount": "250.00",
      "installmentNumber": 1,
      "totalInstallments": 4,
      "dueDate": "2026-06-03T00:00:00.000Z",
      "status": "PENDING",
      "method": null,
      "paidAt": null
    },
    {
      "id": "payment-2-uuid",
      "amount": "250.00",
      "installmentNumber": 2,
      "totalInstallments": 4,
      "dueDate": "2026-07-03T00:00:00.000Z",
      "status": "PENDING",
      "method": null,
      "paidAt": null
    },
    // ... parcelas 3 e 4
  ]
}
```

---

### 2. Registrar Pagamento de Parcela

**POST** `/api/finance/payments/:paymentId/register`

Marca uma parcela como paga.

**Request Body:**
```json
{
  "method": "CREDIT_CARD"
}
```

**Métodos aceitos:**
- `CASH` - Dinheiro
- `CREDIT_CARD` - Cartão de Crédito
- `DEBIT_CARD` - Cartão de Débito
- `TRANSFER` - Transferência Bancária
- `PIX` - PIX

**Response (200):**
```json
{
  "id": "payment-1-uuid",
  "amount": "250.00",
  "installmentNumber": 1,
  "totalInstallments": 4,
  "dueDate": "2026-06-03T00:00:00.000Z",
  "paidAt": "2026-06-02T14:30:00.000Z",
  "method": "CREDIT_CARD",
  "status": "PAID",
  "treatment": {
    "id": "treatment-uuid",
    "description": "Tratamento de canal - dente 14",
    ...
  }
}
```

---

### 3. Obter Resumo Financeiro do Paciente

**GET** `/api/finance/patients/:patientId/financial-summary`

Retorna um resumo completo da situação financeira do paciente.

**Response (200):**
```json
{
  "totalTreatments": 2,
  "totalAmount": 1500.00,
  "totalPaid": 500.00,
  "totalPending": 1000.00,
  "totalOverdue": 250.00,
  "treatments": [
    {
      "id": "treatment-1-uuid",
      "description": "Tratamento de canal - dente 14",
      "totalAmount": 1000.00,
      "paidAmount": 500.00,
      "pendingAmount": 500.00,
      "overdueAmount": 250.00,
      "status": "IN_PROGRESS",
      "totalInstallments": 4,
      "paidInstallments": 2,
      "startDate": "2026-05-03T00:00:00.000Z"
    },
    {
      "id": "treatment-2-uuid",
      "description": "Implante dentário",
      "totalAmount": 500.00,
      "paidAmount": 0.00,
      "pendingAmount": 500.00,
      "overdueAmount": 0.00,
      "status": "PENDING",
      "totalInstallments": 2,
      "paidInstallments": 0,
      "startDate": "2026-04-15T00:00:00.000Z"
    }
  ]
}
```

---

### 4. Listar Tratamentos do Paciente

**GET** `/api/finance/patients/:patientId/treatments`

**Query Parameters:**
- `status` (opcional): Filtrar por status (`PENDING`, `IN_PROGRESS`, `COMPLETED`, `CANCELED`)

**Response (200):**
```json
[
  {
    "id": "treatment-uuid",
    "description": "Tratamento de canal - dente 14",
    "totalAmount": "1000.00",
    "status": "IN_PROGRESS",
    "payments": [...]
  }
]
```

---

### 5. Listar Todas as Parcelas

**GET** `/api/finance/payments`

**Query Parameters:**
- `treatmentId` (opcional): Filtrar por tratamento específico
- `status` (opcional): Filtrar por status (`PENDING`, `PAID`)

**Response (200):**
```json
[
  {
    "id": "payment-uuid",
    "amount": "250.00",
    "installmentNumber": 1,
    "totalInstallments": 4,
    "dueDate": "2026-06-03T00:00:00.000Z",
    "status": "PAID",
    "treatment": {...}
  }
]
```

---

### 6. Listar Pagamentos em Atraso

**GET** `/api/finance/payments/overdue/list`

Retorna todas as parcelas pendentes com data de vencimento já passada.

**Response (200):**
```json
[
  {
    "id": "payment-uuid",
    "amount": "250.00",
    "dueDate": "2026-04-03T00:00:00.000Z",
    "status": "PENDING",
    "treatment": {
      "id": "treatment-uuid",
      "patient": {
        "fullName": "João Silva",
        "phone": "(11) 98765-4321"
      }
    }
  }
]
```

---

### 7. Cancelar Pagamento

**POST** `/api/finance/payments/:paymentId/cancel`

Reverte um pagamento, marcando-o como pendente novamente.

**Response (200):**
```json
{
  "id": "payment-uuid",
  "status": "PENDING",
  "paidAt": null,
  "method": null,
  ...
}
```

---

### 8. Atualizar Status do Tratamento

**PATCH** `/api/finance/treatments/:treatmentId/status`

**Request Body:**
```json
{
  "status": "IN_PROGRESS"
}
```

**Status aceitos:**
- `PENDING` - Pendente
- `IN_PROGRESS` - Em andamento
- `COMPLETED` - Concluído
- `CANCELED` - Cancelado

**Response (200):**
```json
{
  "id": "treatment-uuid",
  "status": "IN_PROGRESS",
  "completedAt": null,
  ...
}
```

---

### 9. Obter Parcelas de um Tratamento

**GET** `/api/finance/treatments/:treatmentId/payments`

**Response (200):**
```json
[
  {
    "id": "payment-1-uuid",
    "installmentNumber": 1,
    "amount": "250.00",
    "status": "PAID",
    "dueDate": "2026-06-03T00:00:00.000Z",
    "paidAt": "2026-06-02T14:30:00.000Z"
  },
  {
    "id": "payment-2-uuid",
    "installmentNumber": 2,
    "amount": "250.00",
    "status": "PENDING",
    "dueDate": "2026-07-03T00:00:00.000Z",
    "paidAt": null
  }
]
```

---

## 🎯 Casos de Uso Comuns

### Caso 1: Criar um novo tratamento parcelado

```javascript
// POST /api/finance/treatments
const response = await fetch('/api/finance/treatments', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    patientId: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Tratamento ortodôntico',
    totalAmount: 2400,
    installments: 12,
    firstDueDate: '2026-06-01',
    observations: 'Manutenção mensal necessária'
  })
});

const treatment = await response.json();
// O tratamento será criado com 12 parcelas de R$ 200 cada
```

### Caso 2: Registrar pagamento de uma parcela

```javascript
// POST /api/finance/payments/:paymentId/register
const response = await fetch('/api/finance/payments/payment-uuid/register', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    method: 'PIX'
  })
});

const payment = await response.json();
// A parcela será marcada como paga com método PIX
```

### Caso 3: Visualizar situação financeira do paciente

```javascript
// GET /api/finance/patients/:patientId/financial-summary
const response = await fetch('/api/finance/patients/patient-uuid/financial-summary', {
  headers: {
    'Authorization': 'Bearer TOKEN'
  }
});

const summary = await response.json();
console.log(`Total devido: R$ ${summary.totalPending}`);
console.log(`Em atraso: R$ ${summary.totalOverdue}`);
console.log(`Total pago: R$ ${summary.totalPaid}`);
```

### Caso 4: Listar parcelas em atraso

```javascript
// GET /api/finance/payments/overdue/list
const response = await fetch('/api/finance/payments/overdue/list', {
  headers: {
    'Authorization': 'Bearer TOKEN'
  }
});

const overduePayments = await response.json();
// Útil para enviar lembretes de pagamento
```

## 🔐 Autenticação

Todas as rotas requerem autenticação via token JWT no header:
```
Authorization: Bearer <token>
```

## 📝 Logs de Atividade

O sistema registra automaticamente todas as ações financeiras:
- `TREATMENT_CREATED` - Quando um tratamento é criado
- `TREATMENT_STATUS_UPDATED` - Quando o status de um tratamento muda
- `PAYMENT_REGISTERED` - Quando um pagamento é registrado
- `PAYMENT_CANCELED` - Quando um pagamento é cancelado

## ⚙️ Configuração do Banco de Dados

Os modelos já estão definidos no Prisma schema. Para aplicar as mudanças:

```bash
# Gerar migration
npx prisma migrate dev --name add_financial_management

# Aplicar em produção
npx prisma migrate deploy
```

## 🎨 Exemplo de Fluxo Completo

1. **Paciente inicia tratamento de R$ 1.000 em 4 parcelas:**
   ```
   POST /api/finance/treatments
   → Cria tratamento + 4 parcelas de R$ 250
   ```

2. **Paciente paga a 1ª parcela:**
   ```
   POST /api/finance/payments/{parcela-1-id}/register
   → Marca parcela 1 como paga
   ```

3. **Paciente paga a 2ª parcela:**
   ```
   POST /api/finance/payments/{parcela-2-id}/register
   → Marca parcela 2 como paga
   ```

4. **Verificar situação atual:**
   ```
   GET /api/finance/patients/{patient-id}/financial-summary
   → Retorna: pago R$ 500, pendente R$ 500 (parcelas 3 e 4)
   ```

5. **Paciente finaliza pagamento:**
   ```
   Paga parcelas 3 e 4
   → Sistema automaticamente marca tratamento como COMPLETED
   ```

## 📱 Próximos Passos (Frontend)

Para integrar no frontend, você pode:
1. Criar uma tela de "Financeiro" no perfil do paciente
2. Mostrar resumo com valores totais, pagos, pendentes e em atraso
3. Listar todos os tratamentos do paciente
4. Para cada tratamento, mostrar as parcelas com status visual
5. Permitir registrar pagamentos com seleção de método
6. Adicionar alertas para parcelas vencidas
7. Criar relatórios financeiros gerais da clínica

## 🐛 Tratamento de Erros

Os endpoints retornam os seguintes códigos de status:
- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Dados inválidos
- `401` - Não autenticado
- `404` - Recurso não encontrado
- `500` - Erro interno do servidor
