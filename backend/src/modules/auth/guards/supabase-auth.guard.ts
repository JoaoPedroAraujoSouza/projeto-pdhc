import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';
import { SupabaseAuthService } from '../services/supabase-auth.service';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(private readonly supabaseAuthService: SupabaseAuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const accessToken = this.extractBearerToken(request.get('authorization'));

    if (!accessToken) {
      throw new UnauthorizedException('Formato de token inválido.');
    }

    const user =
      await this.supabaseAuthService.getAuthenticatedUser(accessToken);

    request.user = user;
    request.accessToken = accessToken;

    return true;
  }

  private extractBearerToken(authorization?: string): string | null {
    if (!authorization) {
      return null;
    }

    const match = authorization.match(/^Bearer\s+(.+)$/i);
    return match?.[1] ?? null;
  }
}
