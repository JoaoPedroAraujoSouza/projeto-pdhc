import { supabase } from "@/lib/supabase";
import type { SignUpFormData } from "@/types/auth";

export async function signUpWithEmail(data: SignUpFormData) {
  const { name, email, password } = data;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
    },
  });

  if (error) {
    throw new Error(mapSupabaseAuthError(error.message));
  }
}

function mapSupabaseAuthError(message: string) {
  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes("already registered")) {
    return "Já existe uma conta cadastrada com este e-mail.";
  }

  if (normalizedMessage.includes("password")) {
    return "A senha informada não atende aos requisitos mínimos.";
  }

  if (normalizedMessage.includes("invalid email")) {
    return "O e-mail informado é inválido.";
  }

  return "Não foi possível realizar o cadastro. Tente novamente.";
}
