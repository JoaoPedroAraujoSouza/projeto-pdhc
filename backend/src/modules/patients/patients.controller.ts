import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnprocessableEntityResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { CreatePatientDto } from './dto/create-patient.dto';
import { PatientResponseDto } from './dto/patient-response.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PatientsService } from './patients.service';

@ApiTags('patients')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new patient' })
  @ApiCreatedResponse({
    description: 'Patient successfully created',
    type: PatientResponseDto,
  })
  @ApiConflictResponse({ description: 'CPF already registered' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token' })
  create(
    @Body() createPatientDto: CreatePatientDto,
  ): Promise<PatientResponseDto> {
    return this.patientsService.create(createPatientDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all patients ordered by name' })
  @ApiOkResponse({
    description: 'Patients loaded successfully',
    type: PatientResponseDto,
    isArray: true,
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token' })
  findAll(): Promise<PatientResponseDto[]> {
    return this.patientsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a patient by id' })
  @ApiOkResponse({
    description: 'Patient loaded successfully',
    type: PatientResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Patient not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token' })
  findOne(@Param('id') id: string): Promise<PatientResponseDto> {
    return this.patientsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a patient by id' })
  @ApiOkResponse({
    description: 'Patient updated successfully',
    type: PatientResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Patient not found' })
  @ApiConflictResponse({
    description: 'CPF already registered by another patient',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token' })
  update(
    @Param('id') id: string,
    @Body() updatePatientDto: UpdatePatientDto,
  ): Promise<PatientResponseDto> {
    return this.patientsService.update(id, updatePatientDto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a patient by id' })
  @ApiNoContentResponse({ description: 'Patient deleted successfully' })
  @ApiNotFoundResponse({ description: 'Patient not found' })
  @ApiUnprocessableEntityResponse({
    description: 'Patient has appointments with status scheduled or confirmed',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.patientsService.remove(id);
  }
}
