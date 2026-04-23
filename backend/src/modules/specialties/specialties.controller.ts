import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { CreateSpecialtyDto } from './dto/create-specialty.dto';
import { SpecialtyResponseDto } from './dto/specialty-response.dto';
import { SpecialtiesService } from './specialties.service';

@ApiTags('specialties')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('specialties')
export class SpecialtiesController {
  constructor(private readonly specialtiesService: SpecialtiesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new specialty' })
  @ApiCreatedResponse({
    description: 'Specialty successfully created',
    type: SpecialtyResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid request body' })
  @ApiConflictResponse({ description: 'Specialty name already exists' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token' })
  create(
    @Body() createSpecialtyDto: CreateSpecialtyDto,
  ): Promise<SpecialtyResponseDto> {
    return this.specialtiesService.create(createSpecialtyDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all specialties' })
  @ApiOkResponse({
    description: 'Specialties loaded successfully',
    type: SpecialtyResponseDto,
    isArray: true,
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token' })
  findAll(): Promise<SpecialtyResponseDto[]> {
    return this.specialtiesService.findAll();
  }
}
