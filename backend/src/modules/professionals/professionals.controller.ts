import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { CreateProfessionalDto } from './dto/create-professional.dto';
import { ProfessionalResponseDto } from './dto/professional-response.dto';
import { UpdateProfessionalDto } from './dto/update-professional.dto';
import { ProfessionalsService } from './professionals.service';

@ApiTags('professionals')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('professionals')
export class ProfessionalsController {
  constructor(private readonly professionalsService: ProfessionalsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new professional' })
  @ApiCreatedResponse({
    description: 'Professional successfully created',
    type: ProfessionalResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Specialty not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token' })
  create(
    @Body() createProfessionalDto: CreateProfessionalDto,
  ): Promise<ProfessionalResponseDto> {
    return this.professionalsService.create(createProfessionalDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all professionals ordered by name' })
  @ApiOkResponse({
    description: 'Professionals loaded successfully',
    type: ProfessionalResponseDto,
    isArray: true,
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token' })
  findAll(): Promise<ProfessionalResponseDto[]> {
    return this.professionalsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a professional by id' })
  @ApiOkResponse({
    description: 'Professional loaded successfully',
    type: ProfessionalResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Professional not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token' })
  findOne(@Param('id') id: string): Promise<ProfessionalResponseDto> {
    return this.professionalsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a professional by id' })
  @ApiOkResponse({
    description: 'Professional updated successfully',
    type: ProfessionalResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Professional or specialty not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token' })
  update(
    @Param('id') id: string,
    @Body() updateProfessionalDto: UpdateProfessionalDto,
  ): Promise<ProfessionalResponseDto> {
    return this.professionalsService.update(id, updateProfessionalDto);
  }
}
