import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsNotEmpty } from 'class-validator';

export class RescheduleAppointmentDto {
  @ApiProperty({
    description: 'New appointment start datetime in ISO 8601 format',
    example: '2026-05-12T10:00:00.000Z',
  })
  @Type(() => String)
  @IsDateString()
  @IsNotEmpty()
  startAt!: string;
}
