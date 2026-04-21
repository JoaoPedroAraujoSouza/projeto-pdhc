import { ApiProperty } from '@nestjs/swagger';

export class PatientResponseDto {
  @ApiProperty({
    description: 'Patient unique identifier',
    example: 'a1b2c3d4-aafd-46eb-aec1-6044f2d9a66a',
  })
  id!: string;

  @ApiProperty({
    description: 'Full name of the patient',
    example: 'Maria Souza',
  })
  fullName!: string;

  @ApiProperty({
    description: 'Brazilian CPF (11 digits)',
    example: '12345678901',
  })
  cpf!: string;

  @ApiProperty({
    description: 'Date of birth',
    example: '1990-06-15T00:00:00.000Z',
  })
  birthDate!: Date;

  @ApiProperty({
    description: 'Patient phone number',
    example: '11987654321',
  })
  phone!: string;

  @ApiProperty({
    description: 'Patient creation timestamp in ISO format',
    example: '2026-04-21T14:00:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Patient last update timestamp in ISO format',
    example: '2026-04-21T14:00:00.000Z',
  })
  updatedAt!: Date;
}
