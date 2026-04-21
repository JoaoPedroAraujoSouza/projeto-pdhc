import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateAppointmentDto {
  @ApiProperty({
    description: 'UUID of the patient',
    example: 'a1b2c3d4-aafd-46eb-aec1-6044f2d9a66a',
  })
  @IsUUID('all', { message: 'O ID do paciente deve ser um UUID válido.' })
  @IsNotEmpty({ message: 'O ID do paciente é obrigatório.' })
  patientId!: string;

  @ApiProperty({
    description: 'UUID of the professional',
    example: 'c3d4e5f6-aafd-46eb-aec1-6044f2d9a66a',
  })
  @IsUUID('all', { message: 'O ID do profissional deve ser um UUID válido.' })
  @IsNotEmpty({ message: 'O ID do profissional é obrigatório.' })
  professionalId!: string;

  @ApiProperty({
    description:
      'UUID of the specialty — must match the professional specialty',
    example: '8b1c9934-aafd-46eb-aec1-6044f2d9a66a',
  })
  @IsUUID('all', { message: 'O ID da especialidade deve ser um UUID válido.' })
  @IsNotEmpty({ message: 'O ID da especialidade é obrigatório.' })
  specialtyId!: string;

  @ApiProperty({
    description: 'Appointment start datetime in ISO 8601 format',
    example: '2026-05-10T14:00:00.000Z',
  })
  @Type(() => String)
  @IsDateString(
    { strict: true },
    {
      message:
        'A data e horário de início devem ser um formato ISO 8601 válido.',
    },
  )
  @IsNotEmpty({ message: 'A data e horário de início são obrigatórios.' })
  startAt!: string;

  @ApiPropertyOptional({
    description: 'Optional notes for the appointment',
    example: 'Patient reports recurring headaches.',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'As observações devem ser um texto.' })
  @MaxLength(500, {
    message: 'As observações não podem ter mais que 500 caracteres.',
  })
  notes?: string;
}
