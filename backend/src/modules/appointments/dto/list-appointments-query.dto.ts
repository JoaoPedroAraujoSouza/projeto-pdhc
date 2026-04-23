import { ApiPropertyOptional } from '@nestjs/swagger';
import { AppointmentStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';

export class ListAppointmentsQueryDto {
  @ApiPropertyOptional({
    description:
      'Filter by date (YYYY-MM-DD) — returns all appointments on that calendar day',
    example: '2026-05-10',
  })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({
    description: 'Filter by appointment status',
    enum: AppointmentStatus,
  })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @ApiPropertyOptional({
    description: 'Filter by professional UUID',
    example: 'c3d4e5f6-aafd-46eb-aec1-6044f2d9a66a',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => value)
  @IsUUID()
  professionalId?: string;

  @ApiPropertyOptional({
    description: 'Filter by specialty UUID',
    example: '8b1c9934-aafd-46eb-aec1-6044f2d9a66a',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => value)
  @IsUUID()
  specialtyId?: string;
}
