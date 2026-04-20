import { z } from "zod";

export const signUpSchema = z
  .object({
    name: z
      .string()
      .min(3, "Informe um nome com pelo menos 3 caracteres.")
      .max(100, "O nome deve ter no máximo 100 caracteres."),
    email: z
      .string()
      .min(1, "O e-mail é obrigatório.")
      .pipe(z.email("Informe um e-mail válido.")),
    password: z
      .string()
      .min(6, "A senha deve ter pelo menos 6 caracteres."),
    confirmPassword: z
      .string()
      .min(6, "Confirme a senha."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

export type SignUpSchemaData = z.infer<typeof signUpSchema>;
