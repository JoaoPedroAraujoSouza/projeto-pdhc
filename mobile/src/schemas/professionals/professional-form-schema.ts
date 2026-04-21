import { z } from 'zod';

export const professionalFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, 'O nome do profissional é obrigatório.')
    .max(150, 'O nome deve ter no máximo 150 caracteres.'),
  specialtyId: z.string().min(1, 'A especialidade é obrigatória.'),
});

export type ProfessionalFormData = z.infer<typeof professionalFormSchema>;
