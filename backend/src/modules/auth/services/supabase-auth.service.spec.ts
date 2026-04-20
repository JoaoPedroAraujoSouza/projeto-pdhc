import { afterAll, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { UnauthorizedException } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { SupabaseAuthService } from './supabase-auth.service';

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

describe('SupabaseAuthService', () => {
  type SupabaseGetUserResult = {
    data: {
      user: unknown;
    };
    error: unknown;
  };

  const createClientMock = createClient as unknown as jest.Mock;
  const getUserMock = jest.fn<
    (accessToken: string) => Promise<SupabaseGetUserResult>
  >();
  const originalSupabaseUrl = process.env.SUPABASE_URL;
  const originalSupabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.SUPABASE_URL = 'http://127.0.0.1:54321';
    process.env.SUPABASE_ANON_KEY = 'anon-key';

    createClientMock.mockReturnValue({
      auth: {
        getUser: getUserMock,
      },
    });
  });

  afterAll(() => {
    if (originalSupabaseUrl === undefined) {
      delete process.env.SUPABASE_URL;
    } else {
      process.env.SUPABASE_URL = originalSupabaseUrl;
    }

    if (originalSupabaseAnonKey === undefined) {
      delete process.env.SUPABASE_ANON_KEY;
    } else {
      process.env.SUPABASE_ANON_KEY = originalSupabaseAnonKey;
    }
  });

  it('returns mapped user when token is valid', async () => {
    getUserMock.mockResolvedValue({
      data: {
        user: {
          id: 'user-id',
          email: 'user@example.com',
          role: 'authenticated',
          app_metadata: { provider: 'email' },
          user_metadata: { name: 'Ana' },
        },
      },
      error: null,
    });

    const service = new SupabaseAuthService();
    const result = await service.getAuthenticatedUser('access-token');

    expect(createClientMock).toHaveBeenCalledWith(
      'http://127.0.0.1:54321',
      'anon-key',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    expect(result).toEqual({
      id: 'user-id',
      email: 'user@example.com',
      role: 'authenticated',
      appMetadata: { provider: 'email' },
      userMetadata: { name: 'Ana' },
    });
  });

  it('throws unauthorized when Supabase returns an error', async () => {
    getUserMock.mockResolvedValue({
      data: {
        user: null,
      },
      error: {
        message: 'invalid token',
      },
    });

    const service = new SupabaseAuthService();

    await expect(service.getAuthenticatedUser('bad-token')).rejects.toThrow(
      UnauthorizedException
    );
  });

  it('throws during bootstrap when env variables are missing', () => {
    delete process.env.SUPABASE_URL;

    expect(() => new SupabaseAuthService()).toThrow(
      'SUPABASE_URL and SUPABASE_ANON_KEY must be set in environment variables.'
    );
  });
});
