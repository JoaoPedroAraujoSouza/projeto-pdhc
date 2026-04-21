import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsNotEmpty } from 'class-validator';

export class RescheduleAppointmentDto {
  @ApiProperty({
    description: 'New appointment start datetime in ISO 8601 format',
    example: '2026-05-12T10:00:00.000Z',
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
}
