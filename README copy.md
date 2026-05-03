# OdontoCare

Sistema web de gerenciamento e agendamento para consultório odontológico.

## Stack

- Frontend: React + Vite + TailwindCSS
- Estado: Redux Toolkit
- Backend: Node.js + Express
- Banco: PostgreSQL
- ORM: Prisma
- Auth: JWT

## Estrutura

- `frontend/` app React por features
- `backend/` API em camadas com controllers, services, repositories, middlewares e rotas
- `docker-compose.yml` PostgreSQL local

## Como rodar

### 1. Banco

```bash
docker compose up -d
```

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run prisma:generate
npx prisma migrate dev --name init
npm run dev
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Arquitetura do backend

- Controllers: recebem requisições HTTP e respondem JSON
- Services: concentram regras de negócio
- Repositories: isolam o acesso ao Prisma
- Middlewares: autenticação, autorização, validação e erros

## Funcionalidades

- Login e recuperação de senha
- Dashboard com KPIs e consultas do dia
- Cadastro e busca de pacientes
- Agenda com criação e alteração de status
- Prontuário e anamnese
- Financeiro básico com baixa de pagamento
- Logs de atividade e trilha de auditoria
- Integração preparada para WhatsApp webhook

## Rotas principais da API

- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/auth/register`
- `GET /api/dashboard/overview`
- `GET /api/patients`
- `POST /api/patients`
- `GET /api/appointments/today`
- `POST /api/appointments`
- `PATCH /api/appointments/:id/status`
- `GET /api/records/medical/:patientId`
- `POST /api/records/medical`
- `GET /api/finance`
- `PATCH /api/finance/:id/status`
- `GET /api/logs`
- `POST /api/integrations/whatsapp/webhook`

## Observações de segurança

- Senhas com bcrypt
- JWT para autenticação
- RBAC por perfil
- Validação com Zod
- Helmet, CORS, rate limit e sanitização básica
- Prontidão para LGPD com auditoria e consentimento do paciente
