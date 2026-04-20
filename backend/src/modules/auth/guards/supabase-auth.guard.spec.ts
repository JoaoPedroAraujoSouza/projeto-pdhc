import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { SupabaseAuthGuard } from './supabase-auth.guard';
import type { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';
import type { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
import type { SupabaseAuthService } from '../services/supabase-auth.service';

describe('SupabaseAuthGuard', () => {
  const getAuthenticatedUserMock = jest.fn<
    (accessToken: string) => Promise<AuthenticatedUser>
  >();

  const mockSupabaseAuthService: Pick<
    SupabaseAuthService,
    'getAuthenticatedUser'
  > = {
    getAuthenticatedUser: getAuthenticatedUserMock,
  };

  const guard = new SupabaseAuthGuard({
    ...mockSupabaseAuthService,
  } as SupabaseAuthService);

  const createExecutionContext = (request: AuthenticatedRequest): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  };

  const createRequest = (authorization?: string): AuthenticatedRequest => {
    return {
      get: ((name: string) => {
        if (name.toLowerCase() === 'authorization') {
          return authorization;
        }

        return undefined;
      }) as AuthenticatedRequest['get'],
    } as AuthenticatedRequest;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('allows request and attaches user when bearer token is valid', async () => {
    const user: AuthenticatedUser = {
      id: 'user-id',
      email: 'user@example.com',
      role: 'authenticated',
    };

    const request = createRequest('Bearer valid-token');

    getAuthenticatedUserMock.mockResolvedValue(user);

    const canActivate = await guard.canActivate(
      createExecutionContext(request)
    );

    expect(canActivate).toBe(true);
    expect(getAuthenticatedUserMock).toHaveBeenCalledWith('valid-token');
    expect(request.user).toEqual(user);
    expect(request.accessToken).toBe('valid-token');
  });

  it('throws unauthorized when authorization header is missing', async () => {
    const request = createRequest(undefined);

    await expect(
      guard.canActivate(createExecutionContext(request))
    ).rejects.toThrow(UnauthorizedException);
  });

  it('throws unauthorized when token format is invalid', async () => {
    const request = createRequest('Token invalid-format');

    await expect(
      guard.canActivate(createExecutionContext(request))
    ).rejects.toThrow(UnauthorizedException);
  });
});
