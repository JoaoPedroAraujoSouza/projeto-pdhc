import { z } from 'zod';

const cpfRegex = /^\d{10,11}$/;
const phoneRegex = /^\d{10,11}$/;

export const patientFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, 'O nome do paciente é obrigatório.')
    .max(150, 'O nome deve ter no máximo 150 caracteres.'),
  cpf: z
    .string()
    .trim()
    .transform((val) => val.replace(/\D/g, ''))
    .pipe(
      z
        .string()
        .length(11, 'O CPF deve conter exatamente 11 dígitos.')
        .regex(cpfRegex, 'CPF inválido.'),
    ),
  birthDate: z.string().min(1, 'A data de nascimento é obrigatória.'),
  phone: z
    .string()
    .trim()
    .transform((val) => val.replace(/\D/g, ''))
    .pipe(
      z
        .string()
        .min(10, 'O telefone deve conter 10 ou 11 dígitos.')
        .max(11, 'O telefone deve conter 10 ou 11 dígitos.')
        .regex(phoneRegex, 'Telefone inválido.'),
    ),
});

export type PatientFormData = z.infer<typeof patientFormSchema>;
