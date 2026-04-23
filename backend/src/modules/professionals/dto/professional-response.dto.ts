import { ApiProperty } from '@nestjs/swagger';

class NestedSpecialtyDto {
  @ApiProperty({
    description: 'Specialty unique identifier',
    example: '8b1c9934-aafd-46eb-aec1-6044f2d9a66a',
  })
  id!: string;

  @ApiProperty({
    description: 'Medical specialty name',
    example: 'Cardiologia',
  })
  name!: string;
}

export class ProfessionalResponseDto {
  @ApiProperty({
    description: 'Professional unique identifier',
    example: 'c3d4e5f6-aafd-46eb-aec1-6044f2d9a66a',
  })
  id!: string;

  @ApiProperty({
    description: 'Full name of the professional',
    example: 'Dr. João da Silva',
  })
  fullName!: string;

  @ApiProperty({
    description: 'UUID of the related specialty',
    example: '8b1c9934-aafd-46eb-aec1-6044f2d9a66a',
  })
  specialtyId!: string;

  @ApiProperty({
    description: 'Related specialty object',
    type: NestedSpecialtyDto,
  })
  specialty!: NestedSpecialtyDto;

  @ApiProperty({
    description: 'Professional creation timestamp in ISO format',
    example: '2026-04-21T14:00:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Professional last update timestamp in ISO format',
    example: '2026-04-21T14:00:00.000Z',
  })
  updatedAt!: Date;
}
