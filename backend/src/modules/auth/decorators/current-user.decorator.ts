import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import type { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';
import type { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

export const currentUserFactory = (
  _data: unknown,
  context: ExecutionContext,
): AuthenticatedUser => {
  const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

  if (!request.user) {
    throw new UnauthorizedException('User not found in request context');
  }

  return request.user;
};

export const CurrentUser = createParamDecorator(currentUserFactory);
