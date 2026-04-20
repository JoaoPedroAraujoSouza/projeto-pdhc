import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import type { Session } from '@supabase/supabase-js';
import React, { useContext } from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { AuthContext, AuthProvider } from './AuthProvider';

const mockGetSession =
  jest.fn<
    () => Promise<{ data: { session: Session | null }; error: Error | null }>
  >();
const mockSignOut = jest.fn<() => Promise<{ error: Error | null }>>();
const mockUnsubscribe = jest.fn();

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: () => mockGetSession(),
      onAuthStateChange: () => ({
        data: {
          subscription: {
            unsubscribe: mockUnsubscribe,
          },
        },
      }),
      signOut: () => mockSignOut(),
    },
  },
}));

describe('AuthProvider', () => {
  let renderer: TestRenderer.ReactTestRenderer | undefined;
  let authContextValue: React.ContextType<typeof AuthContext> | undefined;

  function CaptureAuthContext() {
    authContextValue = useContext(AuthContext);
    return null;
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await act(async () => {
      renderer?.unmount();
    });

    renderer = undefined;
    authContextValue = undefined;
  });

  it('clears session after signOut is called', async () => {
    const initialSession = { access_token: 'valid-token' } as Session;

    mockGetSession.mockResolvedValue({
      data: {
        session: initialSession,
      },
      error: null,
    });

    mockSignOut.mockResolvedValue({
      error: null,
    });

    await act(async () => {
      renderer = TestRenderer.create(
        <AuthProvider>
          <CaptureAuthContext />
        </AuthProvider>,
      );
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(authContextValue?.session).toEqual(initialSession);

    await act(async () => {
      await authContextValue?.signOut();
    });

    expect(mockSignOut).toHaveBeenCalledTimes(1);
    expect(authContextValue?.session).toBeNull();
  });
});
