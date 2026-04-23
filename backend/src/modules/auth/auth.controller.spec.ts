import { describe, expect, it } from '@jest/globals';
import { AuthController } from './auth.controller';
import type { AuthenticatedUser } from './interfaces/authenticated-user.interface';

describe('AuthController', () => {
  const controller = new AuthController();

  it('maps authenticated user data to me response', () => {
    const user: AuthenticatedUser = {
      id: 'user-id',
      email: 'user@example.com',
      role: 'authenticated',
      appMetadata: { provider: 'email' },
      userMetadata: { name: 'Ana' },
    };

    const result = controller.getMe(user);

    expect(result).toEqual({
      id: 'user-id',
      email: 'user@example.com',
      role: 'authenticated',
      appMetadata: { provider: 'email' },
      userMetadata: { name: 'Ana' },
    });
  });

  it('keeps optional fields undefined when absent', () => {
    const user: AuthenticatedUser = {
      id: 'user-id',
    };

    const result = controller.getMe(user);

    expect(result).toEqual({
      id: 'user-id',
      email: undefined,
      role: undefined,
      appMetadata: undefined,
      userMetadata: undefined,
    });
  });
});
