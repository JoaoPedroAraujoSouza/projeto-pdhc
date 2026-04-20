import { z } from "zod";

export const signInSchema = z.object({
  email: z
    .string()
    .min(1, "O e-mail é obrigatório.")
    .pipe(z.email("Informe um e-mail válido.")),
  password: z
    .string()
    .min(6, "A senha deve ter pelo menos 6 caracteres."),
});

export type SignInSchemaData = z.infer<typeof signInSchema>;
