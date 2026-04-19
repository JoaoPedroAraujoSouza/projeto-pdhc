# Testing Strategy

## Objetivo
Garantir confiança nas regras principais do sistema sem ampliar demais o escopo do MVP. A estratégia de testes do HospAgenda prioriza fluxos críticos do domínio de agendamento e a integridade da API, mantendo um equilíbrio entre robustez e prazo.

## Abordagem geral
O projeto adotará uma estratégia enxuta, com foco em:

- testes unitários nos serviços centrais
- testes de integração para fluxos críticos da API
- testes manuais guiados no aplicativo mobile

## Princípios
- testar regras de negócio mais relevantes antes de testar cenários periféricos
- priorizar testes com maior retorno sobre confiança do sistema
- evitar sobrecarga com automação que não se justifique no prazo
- manter testes legíveis e aderentes ao domínio

## Escopo de testes do backend
### Testes unitários
Os testes unitários devem se concentrar principalmente no módulo de agendamentos.

#### Casos prioritários
- criar agendamento válido
- impedir agendamento no passado
- impedir conflito de horário para o mesmo profissional
- confirmar consulta válida
- cancelar consulta
- remarcar consulta com validação do novo horário
- concluir consulta em estado permitido

### Testes unitários adicionais desejáveis
- validar criação de profissional com especialidade inexistente
- validar criação de paciente com dados obrigatórios ausentes
- consolidar resumo do dashboard do dia

## Escopo de testes de integração
Os testes de integração devem validar a API como um todo em cenários críticos.

### Casos prioritários
- acesso a rota protegida com token válido
- falha de acesso com token ausente ou inválido
- criação de agendamento autenticado
- erro ao criar agendamento com conflito de horário
- listagem de agendamentos com filtro por data

## Escopo de testes do mobile
Para o mobile, neste MVP, a abordagem será prioritariamente manual.

### Fluxos manuais prioritários
- login e cadastro
- navegação autenticada
- cadastro de especialidade
- cadastro de profissional
- cadastro de paciente
- criação de consulta
- confirmação, cancelamento e remarcação
- visualização do dashboard do dia

## O que fica fora do escopo neste MVP
- testes E2E completos do app mobile
- testes visuais automatizados
- cobertura total de todos os módulos
- testes de carga
- testes complexos de integração com terceiros

## Ferramentas sugeridas
### Backend
- Jest
- Supertest para integração, se fizer sentido na implementação

### Mobile
- checklist manual guiado
- testes automatizados apenas se houver folga de tempo

## Critérios mínimos de qualidade
Antes da entrega, o projeto deve garantir ao menos:

- testes unitários cobrindo regras centrais de agendamento
- ao menos alguns testes de integração da API
- execução de lint e build sem erros
- evidência manual de funcionamento no app

## Ordem recomendada de implementação dos testes
1. testes unitários do fluxo de criação de consulta
2. testes unitários de conflito de horário
3. testes unitários de remarcação, cancelamento e conclusão
4. testes de integração da autenticação e criação de consulta
5. checklist manual do mobile

## Observação final
O objetivo desta estratégia não é maximizar volume de testes, e sim demonstrar capacidade de selecionar e validar os pontos mais importantes do sistema com critério técnico.
