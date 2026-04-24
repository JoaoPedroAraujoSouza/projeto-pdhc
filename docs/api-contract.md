# API Contract

## Convenções gerais

### Base local

- API backend: `http://127.0.0.1:3000`
- Prefixo global: `/api`
- Swagger: `http://127.0.0.1:3000/docs`

Em dispositivo físico, use o IP da máquina na LAN para `EXPO_PUBLIC_API_URL` (ex.: `http://192.168.0.10:3000`). O mobile adiciona `/api` automaticamente.

### Autenticação

Rotas protegidas exigem header:

```http
Authorization: Bearer <access_token>
```

O token é emitido pelo Supabase Auth e validado pela API NestJS.

### Erros (padrão NestJS)

```json
{
  "statusCode": 409,
  "message": "The selected professional already has an appointment in this time slot.",
  "error": "Conflict"
}
```

## Auth

### GET `/api/auth/me`

Retorna dados do usuário autenticado extraídos do token.

```json
{
  "id": "user-id",
  "email": "user@example.com",
  "role": "authenticated",
  "appMetadata": {},
  "userMetadata": {}
}
```

## Specialties

### POST `/api/specialties`

```json
{
  "name": "Cardiologia"
}
```

Regras:

- `name` obrigatório
- nome único

### GET `/api/specialties`

Lista especialidades.

## Professionals

### POST `/api/professionals`

```json
{
  "fullName": "Dra. Ana Lima",
  "specialtyId": "specialty-id"
}
```

Regras:

- `fullName` obrigatório
- `specialtyId` deve existir

### GET `/api/professionals`

Lista profissionais.

### GET `/api/professionals/:id`

Detalha profissional.

### PATCH `/api/professionals/:id`

Atualiza nome e/ou especialidade.

## Patients

### POST `/api/patients`

```json
{
  "fullName": "Maria de Souza",
  "cpf": "00000000000",
  "birthDate": "1998-06-15",
  "phone": "81999999999"
}
```

Regras:

- campos obrigatórios: `fullName`, `cpf`, `birthDate`, `phone`
- `cpf` deve ser único

### GET `/api/patients`

Lista pacientes.

### GET `/api/patients/:id`

Detalha paciente.

### PATCH `/api/patients/:id`

Atualiza paciente.

## Appointments

### POST `/api/appointments`

```json
{
  "patientId": "patient-id",
  "professionalId": "professional-id",
  "startAt": "2026-04-20T14:00:00.000Z",
  "notes": "Primeira consulta"
}
```

Regras:

- `patientId` e `professionalId` devem existir
- não permitir horário no passado
- não permitir conflito para o mesmo profissional
- `specialtyId` é derivado do profissional

### GET `/api/appointments`

Lista com filtros opcionais:

- `date` (`YYYY-MM-DD`)
- `status`
- `professionalId`
- `specialtyId`

Exemplo:

```http
GET /api/appointments?date=2026-04-20&status=SCHEDULED
```

### GET `/api/appointments/:id`

Detalha agendamento.

### PATCH `/api/appointments/:id/confirm`

Confirma consulta em `SCHEDULED`.

### PATCH `/api/appointments/:id/reschedule`

```json
{
  "startAt": "2026-04-21T10:30:00.000Z"
}
```

Revalida data e conflito.

### PATCH `/api/appointments/:id/cancel`

Marca como `CANCELLED`.

### PATCH `/api/appointments/:id/complete`

Marca como `COMPLETED` (somente consulta ativa).

## Dashboard

### GET `/api/dashboard/today`

Parâmetro opcional:

- `date` (`YYYY-MM-DD`) — se omitido, usa o dia atual do servidor.

Exemplo:

```http
GET /api/dashboard/today?date=2026-04-21
```

Exemplo de resposta:

```json
{
  "date": "2026-04-21",
  "scheduled": 8,
  "confirmed": 4,
  "cancelled": 1,
  "completed": 2,
  "nextAppointments": []
}
```

## Códigos de status mais comuns

- `200 OK` / `201 Created`
- `400 Bad Request`
- `401 Unauthorized`
- `404 Not Found`
- `409 Conflict`
- `422 Unprocessable Entity`
