import { ApiProperty } from '@nestjs/swagger';

export class SpecialtyResponseDto {
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

  @ApiProperty({
    description: 'Specialty creation timestamp in ISO format',
    example: '2026-04-20T18:00:00.000Z',
  })
  createdAt!: Date;
}
