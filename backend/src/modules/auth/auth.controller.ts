import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from './decorators/current-user.decorator';
import { MeResponseDto } from './dto/me-response.dto';
import { SupabaseAuthGuard } from './guards/supabase-auth.guard';
import type { AuthenticatedUser } from './interfaces/authenticated-user.interface';

@ApiTags('auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  @Get('me')
  @UseGuards(SupabaseAuthGuard)
  @ApiOperation({ summary: 'Get authenticated user profile' })
  @ApiOkResponse({
    description: 'Authenticated user profile loaded from token',
    type: MeResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token' })
  getMe(@CurrentUser() user: AuthenticatedUser): MeResponseDto {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      appMetadata: user.appMetadata,
      userMetadata: user.userMetadata,
    };
  }
}
