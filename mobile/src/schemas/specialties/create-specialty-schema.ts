import { z } from 'zod';

export const createSpecialtySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'O nome da especialidade é obrigatório.')
    .max(120, 'O nome deve ter no máximo 120 caracteres.'),
});

export type CreateSpecialtySchemaData = z.infer<typeof createSpecialtySchema>;
