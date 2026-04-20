import { describe, expect, it, jest } from '@jest/globals';
import type { Session, User } from '@supabase/supabase-js';
import { Redirect, Stack } from 'expo-router';
import type { ReactElement } from 'react';
import { useAuth } from '@/hooks/useAuth';
import ProtectedLayout from './_layout';

jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

function buildAuthState(
  overrides: Partial<ReturnType<typeof useAuth>> = {},
): ReturnType<typeof useAuth> {
  return {
    session: null,
    user: null,
    isLoading: false,
    signOut: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe('ProtectedLayout', () => {
  it('redirects unauthenticated users to sign-in', () => {
    mockUseAuth.mockReturnValue(buildAuthState());

    const element = ProtectedLayout() as ReactElement<{ href: string }>;

    expect(element.type).toBe(Redirect);
    expect(element.props.href).toBe('/auth/sign-in');
  });

  it('allows authenticated users into protected stack', () => {
    const session = { access_token: 'valid-token' } as Session;
    const user = { id: 'user-id' } as User;

    mockUseAuth.mockReturnValue(
      buildAuthState({
        session,
        user,
      }),
    );

    const element = ProtectedLayout() as ReactElement;

    expect(element.type).toBe(Stack);
  });
});
