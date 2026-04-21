import { z } from 'zod';

/**
 * Converte "DD/MM/AAAA" + "HH:MM" para ISO 8601 no fuso de Brasília (UTC-3).
 * Exemplo: "21/04/2026" + "14:30" → "2026-04-21T14:30:00.000-03:00"
 */
export function toISOStartAt(date: string, time: string): string {
  const digits = date.replace(/\D/g, '');
  const dd = digits.slice(0, 2);
  const mm = digits.slice(2, 4);
  const yyyy = digits.slice(4, 8);
  // "-03:00" = Brasília (America/Sao_Paulo, sem horário de verão desde 2019)
  return `${yyyy}-${mm}-${dd}T${time}:00.000-03:00`;
}

export const appointmentFormSchema = z.object({
  patientId: z.string().min(1, 'Selecione um paciente.'),
  professionalId: z.string().min(1, 'Selecione um profissional.'),
  specialtyId: z.string().min(1, 'Selecione uma especialidade.'),
  date: z
    .string()
    .min(1, 'Informe a data.')
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Informe a data no formato DD/MM/AAAA.'),
  time: z
    .string()
    .min(1, 'Informe o horário.')
    .regex(/^\d{2}:\d{2}$/, 'Informe o horário no formato HH:MM.'),
  notes: z.string().max(500, 'Máximo de 500 caracteres.').optional(),
});

export type AppointmentFormData = z.infer<typeof appointmentFormSchema>;
