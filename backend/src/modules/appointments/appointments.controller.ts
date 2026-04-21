import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { AppointmentsService } from './appointments.service';
import { AppointmentResponseDto } from './dto/appointment-response.dto';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { ListAppointmentsQueryDto } from './dto/list-appointments-query.dto';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto';

@ApiTags('appointments')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new appointment' })
  @ApiCreatedResponse({
    description: 'Appointment successfully created',
    type: AppointmentResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Appointment in the past or specialty mismatch',
  })
  @ApiNotFoundResponse({ description: 'Patient or professional not found' })
  @ApiConflictResponse({
    description: 'Time slot conflict for the professional',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token' })
  create(
    @Body() createAppointmentDto: CreateAppointmentDto,
  ): Promise<AppointmentResponseDto> {
    return this.appointmentsService.create(createAppointmentDto);
  }

  @Get()
  @ApiOperation({
    summary:
      'List appointments with optional filters (date, status, professionalId, specialtyId)',
  })
  @ApiOkResponse({
    description: 'Appointments loaded successfully',
    type: AppointmentResponseDto,
    isArray: true,
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token' })
  findAll(
    @Query() query: ListAppointmentsQueryDto,
  ): Promise<AppointmentResponseDto[]> {
    return this.appointmentsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an appointment by id' })
  @ApiOkResponse({
    description: 'Appointment loaded successfully',
    type: AppointmentResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Appointment not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token' })
  findOne(@Param('id') id: string): Promise<AppointmentResponseDto> {
    return this.appointmentsService.findOne(id);
  }

  @Patch(':id/confirm')
  @ApiOperation({ summary: 'Confirm a scheduled appointment' })
  @ApiOkResponse({
    description: 'Appointment confirmed',
    type: AppointmentResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Appointment not found' })
  @ApiUnprocessableEntityResponse({
    description: 'Appointment is not in SCHEDULED status',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token' })
  confirm(@Param('id') id: string): Promise<AppointmentResponseDto> {
    return this.appointmentsService.confirm(id);
  }

  @Patch(':id/reschedule')
  @ApiOperation({ summary: 'Reschedule an active appointment' })
  @ApiOkResponse({
    description: 'Appointment rescheduled',
    type: AppointmentResponseDto,
  })
  @ApiBadRequestResponse({ description: 'New date is in the past' })
  @ApiNotFoundResponse({ description: 'Appointment not found' })
  @ApiConflictResponse({
    description: 'Time slot conflict for the professional',
  })
  @ApiUnprocessableEntityResponse({
    description:
      'Appointment cannot be rescheduled (already cancelled or completed)',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token' })
  reschedule(
    @Param('id') id: string,
    @Body() rescheduleDto: RescheduleAppointmentDto,
  ): Promise<AppointmentResponseDto> {
    return this.appointmentsService.reschedule(id, rescheduleDto);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel an active appointment' })
  @ApiOkResponse({
    description: 'Appointment cancelled',
    type: AppointmentResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Appointment not found' })
  @ApiUnprocessableEntityResponse({
    description: 'Appointment is already cancelled or completed',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token' })
  cancel(@Param('id') id: string): Promise<AppointmentResponseDto> {
    return this.appointmentsService.cancel(id);
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Mark an active appointment as completed' })
  @ApiOkResponse({
    description: 'Appointment completed',
    type: AppointmentResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Appointment not found' })
  @ApiUnprocessableEntityResponse({
    description: 'Only scheduled or confirmed appointments can be completed',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token' })
  complete(@Param('id') id: string): Promise<AppointmentResponseDto> {
    return this.appointmentsService.complete(id);
  }
}
