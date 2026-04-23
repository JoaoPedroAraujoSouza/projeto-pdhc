import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AppointmentStatus } from '@prisma/client';

class NestedPatientDto {
  @ApiProperty({ example: 'a1b2c3d4-aafd-46eb-aec1-6044f2d9a66a' })
  id!: string;

  @ApiProperty({ example: 'Maria Souza' })
  fullName!: string;

  @ApiProperty({ example: '12345678901' })
  cpf!: string;

  @ApiProperty({ example: '11987654321' })
  phone!: string;
}

class NestedProfessionalDto {
  @ApiProperty({ example: 'c3d4e5f6-aafd-46eb-aec1-6044f2d9a66a' })
  id!: string;

  @ApiProperty({ example: 'Dr. João da Silva' })
  fullName!: string;
}

class NestedSpecialtyDto {
  @ApiProperty({ example: '8b1c9934-aafd-46eb-aec1-6044f2d9a66a' })
  id!: string;

  @ApiProperty({ example: 'Cardiologia' })
  name!: string;
}

export class AppointmentResponseDto {
  @ApiProperty({ example: 'e5f6a7b8-aafd-46eb-aec1-6044f2d9a66a' })
  id!: string;

  @ApiProperty({ example: 'a1b2c3d4-aafd-46eb-aec1-6044f2d9a66a' })
  patientId!: string;

  @ApiProperty({ example: 'c3d4e5f6-aafd-46eb-aec1-6044f2d9a66a' })
  professionalId!: string;

  @ApiProperty({ example: '8b1c9934-aafd-46eb-aec1-6044f2d9a66a' })
  specialtyId!: string;

  @ApiProperty({ example: '2026-05-10T14:00:00.000Z' })
  startAt!: Date;

  @ApiProperty({
    enum: AppointmentStatus,
    example: AppointmentStatus.SCHEDULED,
  })
  status!: AppointmentStatus;

  @ApiPropertyOptional({ example: 'Patient reports recurring headaches.' })
  notes!: string | null;

  @ApiProperty({ type: NestedPatientDto })
  patient!: NestedPatientDto;

  @ApiProperty({ type: NestedProfessionalDto })
  professional!: NestedProfessionalDto;

  @ApiProperty({ type: NestedSpecialtyDto })
  specialty!: NestedSpecialtyDto;

  @ApiProperty({ example: '2026-04-21T14:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-04-21T14:00:00.000Z' })
  updatedAt!: Date;
}
