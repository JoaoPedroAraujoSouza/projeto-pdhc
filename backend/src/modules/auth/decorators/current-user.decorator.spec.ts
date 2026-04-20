import { describe, expect, it } from '@jest/globals';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { currentUserFactory } from './current-user.decorator';
import type { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';
import type { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

describe('currentUserFactory', () => {
  const createExecutionContext = (request: AuthenticatedRequest): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  };

  it('returns request user when available', () => {
    const user: AuthenticatedUser = {
      id: 'user-id',
      email: 'user@example.com',
      role: 'authenticated',
      appMetadata: { provider: 'email' },
      userMetadata: { name: 'Ana' },
    };

    const request = {
      user,
    } as AuthenticatedRequest;

    const result = currentUserFactory(undefined, createExecutionContext(request));

    expect(result).toEqual(user);
  });

  it('throws unauthorized when request user is missing', () => {
    const request = {} as AuthenticatedRequest;

    expect(() =>
      currentUserFactory(undefined, createExecutionContext(request))
    ).toThrow(UnauthorizedException);
  });
});