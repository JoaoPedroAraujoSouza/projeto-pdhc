import { supabase } from '@/lib/supabase';
import type { SignInFormData } from '@/types/auth';

export async function signInWithEmail(data: SignInFormData) {
  const { email, password } = data;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(mapSupabaseAuthError(error.message));
  }
}

function mapSupabaseAuthError(message: string) {
  const normalizedMessage = message.toLowerCase();

  if (
    normalizedMessage.includes('invalid login credentials') ||
    normalizedMessage.includes('invalid credentials')
  ) {
    return 'E-mail ou senha inválidos.';
  }

  if (normalizedMessage.includes('email not confirmed')) {
    return 'Confirme seu e-mail antes de fazer login.';
  }

  if (normalizedMessage.includes('too many requests')) {
    return 'Muitas tentativas. Aguarde alguns instantes e tente novamente.';
  }

  return 'Não foi possível realizar o login. Tente novamente.';
}
