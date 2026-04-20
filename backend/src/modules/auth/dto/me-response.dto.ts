import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MeResponseDto {
  @ApiProperty({
    description: 'Authenticated user unique identifier',
    example: '9f6f9100-7f6e-428c-932a-b4a52d305f62',
  })
  id!: string;

  @ApiPropertyOptional({
    description: 'Authenticated user email',
    example: 'user@example.com',
  })
  email?: string;

  @ApiPropertyOptional({
    description: 'Supabase role assigned to the user',
    example: 'authenticated',
  })
  role?: string;

  @ApiPropertyOptional({
    description: 'Supabase app metadata',
    type: 'object',
    additionalProperties: true,
    example: { provider: 'email' },
  })
  appMetadata?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Supabase user metadata',
    type: 'object',
    additionalProperties: true,
    example: { name: 'Ana' },
  })
  userMetadata?: Record<string, unknown>;
}