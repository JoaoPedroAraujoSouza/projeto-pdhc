import { z } from 'zod';

/** Converts a masked "DD/MM/AAAA" string to "YYYY-MM-DD" for the API. */
function parseBrDate(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length < 8) return value;
  const dd = digits.slice(0, 2);
  const mm = digits.slice(2, 4);
  const yyyy = digits.slice(4, 8);
  return `${yyyy}-${mm}-${dd}`;
}

export const patientFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, 'O nome do paciente é obrigatório.')
    .max(150, 'O nome deve ter no máximo 150 caracteres.'),

  cpf: z
    .string()
    .transform((val) => val.replace(/\D/g, ''))
    .pipe(z.string().length(11, 'O CPF deve conter exatamente 11 dígitos.')),

  birthDate: z
    .string()
    .min(1, 'A data de nascimento é obrigatória.')
    .transform(parseBrDate)
    .pipe(
      z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Informe a data no formato DD/MM/AAAA.'),
    ),

  phone: z
    .string()
    .transform((val) => val.replace(/\D/g, ''))
    .pipe(
      z
        .string()
        .min(10, 'O telefone deve conter 10 ou 11 dígitos.')
        .max(11, 'O telefone deve conter 10 ou 11 dígitos.'),
    ),
});

export type PatientFormData = z.infer<typeof patientFormSchema>;

/**
 * Raw (display) form values before Zod transform.
 * Used to type the react-hook-form defaultValues and watch().
 */
export type PatientFormRawValues = {
  fullName: string;
  cpf: string;
  birthDate: string;
  phone: string;
};
