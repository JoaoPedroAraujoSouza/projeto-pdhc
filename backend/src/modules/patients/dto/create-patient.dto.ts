import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreatePatientDto {
  @ApiProperty({
    description: 'Full name of the patient',
    example: 'Maria Souza',
    maxLength: 150,
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  fullName!: string;

  @ApiProperty({
    description: 'Brazilian CPF (digits only, 11 characters)',
    example: '12345678901',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.replace(/\D/g, '') : value,
  )
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{11}$/, { message: 'cpf must contain exactly 11 digits' })
  cpf!: string;

  @ApiProperty({
    description: 'Date of birth in ISO 8601 format (YYYY-MM-DD)',
    example: '1990-06-15',
  })
  @IsDateString()
  @IsNotEmpty()
  birthDate!: string;

  @ApiProperty({
    description: 'Patient phone number (digits only, 10 or 11 characters)',
    example: '11987654321',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.replace(/\D/g, '') : value,
  )
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{10,11}$/, {
    message: 'phone must contain 10 or 11 digits',
  })
  phone!: string;
}
