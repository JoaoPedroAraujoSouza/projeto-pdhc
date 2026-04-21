import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateAppointmentDto {
  @ApiProperty({
    description: 'UUID of the patient',
    example: 'a1b2c3d4-aafd-46eb-aec1-6044f2d9a66a',
  })
  @IsUUID()
  @IsNotEmpty()
  patientId!: string;

  @ApiProperty({
    description: 'UUID of the professional',
    example: 'c3d4e5f6-aafd-46eb-aec1-6044f2d9a66a',
  })
  @IsUUID()
  @IsNotEmpty()
  professionalId!: string;

  @ApiProperty({
    description:
      'UUID of the specialty — must match the professional specialty',
    example: '8b1c9934-aafd-46eb-aec1-6044f2d9a66a',
  })
  @IsUUID()
  @IsNotEmpty()
  specialtyId!: string;

  @ApiProperty({
    description: 'Appointment start datetime in ISO 8601 format',
    example: '2026-05-10T14:00:00.000Z',
  })
  @Type(() => String)
  @IsDateString()
  @IsNotEmpty()
  startAt!: string;

  @ApiPropertyOptional({
    description: 'Optional notes for the appointment',
    example: 'Patient reports recurring headaches.',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  notes?: string;
}
