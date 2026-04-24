# API Contract

## Convenções gerais
### Base URL
A URL base será definida por ambiente. Em desenvolvimento local:

- backend NestJS: `http://127.0.0.1:3000`
- prefixo global obrigatório das rotas da API: `/api`
- Supabase API local: `http://127.0.0.1:54321`
- Postgres local (Supabase): `127.0.0.1:54322`

Em dispositivo físico, o mobile deve usar o IP da máquina na LAN, preservando porta e prefixo (ex.: `http://192.168.0.10:3000/api`).

### Prefixo de rotas
Todas as rotas deste contrato são servidas sob o prefixo `/api`.

Exemplos:
- `/api/auth/me`
- `/api/patients`
- `/api/appointments/:id/confirm`

### Autenticação
As rotas protegidas exigem bearer token no header:

```http
Authorization: Bearer <access_token>
```

O token será emitido pelo Supabase Auth e validado pela API NestJS.

### Formato de resposta
O projeto pode adotar resposta direta por recurso ou um padrão padronizado. Para o MVP, a prioridade é manter consistência simples e clareza.

## Auth
### GET `/api/auth/me`
Retorna os dados básicos do usuário autenticado.

#### Resposta esperada
```json
{
  "id": "user-id",
  "email": "user@example.com"
}
```

## Specialties
### POST `/api/specialties`
Cria uma nova especialidade.

#### Request body
```json
{
  "name": "Cardiologia"
}
```

#### Regras
- nome é obrigatório
- nome deve ser válido e não vazio

### GET `/api/specialties`
Lista especialidades cadastradas.

#### Resposta esperada
```json
[
  {
    "id": "specialty-id",
    "name": "Cardiologia",
    "createdAt": "2026-04-18T10:00:00.000Z"
  }
]
```

## Professionals
### POST `/api/professionals`
Cria um profissional.

#### Request body
```json
{
  "fullName": "Dr. João Silva",
  "specialtyId": "specialty-id"
}
```

#### Regras
- nome é obrigatório
- `specialtyId` deve existir
- um profissional possui apenas uma especialidade

### GET `/api/professionals`
Lista profissionais.

### GET `/api/professionals/:id`
Retorna detalhes de um profissional.

### PATCH `/api/professionals/:id`
Edita dados do profissional.

#### Request body
```json
{
  "fullName": "Dr. João Pedro Silva"
}
```

## Patients
### POST `/api/patients`
Cria um paciente.

#### Request body
```json
{
  "fullName": "Maria de Souza",
  "cpf": "00000000000",
  "birthDate": "1998-06-15",
  "phone": "81999999999"
}
```

#### Regras
- nome é obrigatório
- CPF deve ter formato válido conforme a regra escolhida no MVP
- data de nascimento é obrigatória
- telefone é obrigatório no MVP apenas se isso fizer sentido no fluxo

### GET `/api/patients`
Lista pacientes.

### GET `/api/patients/:id`
Retorna detalhes de um paciente.

### PATCH `/api/patients/:id`
Edita dados do paciente.

## Appointments
### POST `/api/appointments`
Cria um agendamento.

#### Request body
```json
{
  "patientId": "patient-id",
  "professionalId": "professional-id",
  "startAt": "2026-04-20T14:00:00.000Z",
  "notes": "Primeira consulta"
}
```

#### Regras
- `patientId` deve existir
- `professionalId` deve existir
- não permitir agendamento no passado
- não permitir conflito de horário para o mesmo profissional
- `specialtyId` pode ser derivado do profissional no backend

#### Resposta esperada
```json
{
  "id": "appointment-id",
  "patientId": "patient-id",
  "professionalId": "professional-id",
  "specialtyId": "specialty-id",
  "startAt": "2026-04-20T14:00:00.000Z",
  "status": "SCHEDULED",
  "notes": "Primeira consulta",
  "createdAt": "2026-04-18T12:00:00.000Z",
  "updatedAt": "2026-04-18T12:00:00.000Z"
}
```

### GET `/api/appointments`
Lista agendamentos.

#### Filtros suportados
- `date`
- `status`
- `professionalId`
- `specialtyId`

#### Exemplo
```http
GET /api/appointments?date=2026-04-20&status=SCHEDULED&professionalId=professional-id
```

### GET `/api/appointments/:id`
Retorna detalhes de um agendamento.

### PATCH `/api/appointments/:id/confirm`
Confirma um agendamento.

#### Regras
- só pode confirmar consulta ativa
- não faz sentido confirmar consulta cancelada ou concluída

### PATCH `/api/appointments/:id/reschedule`
Remarca um agendamento.

#### Request body
```json
{
  "startAt": "2026-04-21T10:30:00.000Z"
}
```

#### Regras
- deve validar novamente data futura
- deve validar novamente conflito de horário

### PATCH `/api/appointments/:id/cancel`
Cancela um agendamento.

#### Regras
- não remove o registro fisicamente
- apenas altera o status para `CANCELLED`

### PATCH `/api/appointments/:id/complete`
Conclui um agendamento.

#### Regras
- só pode concluir consulta não cancelada

## Dashboard
### GET `/api/dashboard/today`
Retorna resumo dos atendimentos do dia.

#### Exemplo de resposta
```json
{
  "date": "2026-04-18",
  "scheduled": 8,
  "confirmed": 4,
  "cancelled": 1,
  "completed": 2,
  "nextAppointments": [
    {
      "id": "appointment-id",
      "patientName": "Maria de Souza",
      "professionalName": "Dr. João Silva",
      "startAt": "2026-04-18T14:00:00.000Z",
      "status": "CONFIRMED"
    }
  ]
}
```

## Padrão de erros
Os erros devem seguir um padrão consistente e legível para o mobile.

### Exemplos importantes
- `401 Unauthorized` para token ausente ou inválido
- `404 Not Found` para recurso inexistente
- `409 Conflict` para conflito de horário
- `400 Bad Request` para dados inválidos

### Exemplo de erro
```json
{
  "statusCode": 409,
  "message": "The selected professional already has an appointment in this time slot.",
  "error": "Conflict"
}
```

## Observações de implementação
- a documentação definitiva dos endpoints será refletida no Swagger/OpenAPI
- este arquivo serve como contrato inicial entre backend e mobile
- alterações relevantes nos payloads devem atualizar este documento

## Nota de sincronização documental
Sempre que houver mudança de rota, script ou variável de ambiente, atualizar este contrato e a documentação relacionada (`README.md` e `docs/architecture.md`) no mesmo conjunto de mudanças.
