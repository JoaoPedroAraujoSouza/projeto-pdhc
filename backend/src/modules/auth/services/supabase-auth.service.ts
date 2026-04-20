import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

@Injectable()
export class SupabaseAuthService {
  private readonly supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        'SUPABASE_URL and SUPABASE_ANON_KEY must be set in environment variables.'
      );
    }

    this.supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  async getAuthenticatedUser(accessToken: string): Promise<AuthenticatedUser> {
    const { data, error } = await this.supabase.auth.getUser(accessToken);

    if (error || !data.user) {
      throw new UnauthorizedException('Token inválido ou expirado.');
    }

    return {
      id: data.user.id,
      email: data.user.email,
      role: data.user.role,
      appMetadata: data.user.app_metadata,
      userMetadata: data.user.user_metadata,
    };
  }
}
