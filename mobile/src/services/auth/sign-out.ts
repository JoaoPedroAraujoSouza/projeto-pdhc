import { supabase } from '@/lib/supabase';

export async function signOutUser() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error('Não foi possível encerrar a sessão.');
  }
}
