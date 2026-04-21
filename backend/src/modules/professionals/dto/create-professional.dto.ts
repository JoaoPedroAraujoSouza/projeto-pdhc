import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateProfessionalDto {
  @ApiProperty({
    description: 'Full name of the professional',
    example: 'Dr. João da Silva',
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
    description: 'UUID of the specialty this professional belongs to',
    example: '8b1c9934-aafd-46eb-aec1-6044f2d9a66a',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  specialtyId!: string;
}
