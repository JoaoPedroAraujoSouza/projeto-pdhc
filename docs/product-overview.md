# Product Overview

## Visão
HospAgenda é uma aplicação mobile de agendamento hospitalar simplificado voltada ao uso por equipe administrativa. O projeto tem como foco permitir o cadastro de pacientes, profissionais e especialidades, além da criação e gerenciamento de consultas de forma organizada, segura e aderente ao domínio operacional hospitalar.

## Problema
Em fluxos administrativos hospitalares, o controle de consultas pode se tornar disperso quando depende de registros manuais, anotações desconectadas ou sistemas com excesso de complexidade para cenários básicos. Isso dificulta o acompanhamento dos horários, a visualização dos atendimentos do dia, a atualização do status das consultas e a prevenção de conflitos de agenda.

## Objetivo do MVP
Entregar um MVP funcional que demonstre:

- integração entre aplicação mobile, backend e autenticação
- organização arquitetural no backend
- regras de negócio coerentes com o domínio hospitalar
- boa base de documentação
- testes estratégicos
- preocupação com experiência de uso em um fluxo administrativo

## Público-alvo
O MVP é voltado ao uso por um ator principal:

- atendente ou equipe administrativa hospitalar

O sistema não contempla, nesta primeira versão, o fluxo de acesso do paciente.

## Escopo do MVP
### Incluído
- autenticação via Supabase Auth
- cadastro e listagem de especialidades
- cadastro, edição e listagem de profissionais
- cadastro, edição e listagem de pacientes
- criação de agendamentos
- listagem de agendamentos com filtros
- confirmação de consulta
- remarcação de consulta
- cancelamento de consulta
- conclusão de atendimento
- dashboard simples com visão do dia
- documentação técnica e funcional
- testes de backend nos fluxos principais

### Fora do escopo
- portal do paciente
- múltiplos perfis de usuário
- notificações
- sincronização em tempo real
- disponibilidade médica avançada
- prontuário eletrônico
- integrações externas
- exclusão física de registros

## Funcionalidades principais
### Especialidades
Permite o cadastro e a listagem de especialidades médicas utilizadas no sistema.

### Profissionais
Permite o cadastro, edição, visualização e listagem de profissionais vinculados a uma única especialidade.

### Pacientes
Permite o cadastro, edição, visualização e listagem de pacientes.

### Agendamentos
Permite criar, visualizar e atualizar consultas por meio de ações orientadas ao domínio:

- confirmar
- remarcar
- cancelar
- concluir

### Dashboard
Apresenta uma visão resumida dos atendimentos do dia, permitindo rápida leitura operacional.

## Regras de negócio centrais
- não permitir agendamento no passado
- não permitir conflito de horário para o mesmo profissional
- cada profissional possui uma única especialidade
- toda consulta deve estar vinculada a paciente e profissional válidos
- o cancelamento deve preservar o histórico da consulta
- a remarcação deve revalidar as regras de data e conflito
- a duração da consulta será implícita e fixa em 30 minutos

## Critérios de sucesso do MVP
O projeto será considerado bem-sucedido se:

- o fluxo de autenticação estiver funcional
- um usuário autenticado conseguir cadastrar pacientes, profissionais e especialidades
- um usuário autenticado conseguir criar e gerenciar consultas sem conflito de horário
- o dashboard exibir dados básicos do dia
- a API estiver documentada
- os principais fluxos de agendamento estiverem cobertos por testes

## Diferenciais esperados
Além da funcionalidade, o projeto busca demonstrar:

- clareza de arquitetura
- qualidade na organização do repositório
- definição intencional de escopo
- consistência entre backend, mobile e documentação
- preocupação com rastreabilidade das entregas via GitHub Projects
