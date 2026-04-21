import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { AppointmentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../lib/prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { ListAppointmentsQueryDto } from './dto/list-appointments-query.dto';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto';

/** Duration of each appointment slot in minutes. */
const SLOT_DURATION_MINUTES = 30;

const appointmentInclude = {
  patient: {
    select: { id: true, fullName: true, cpf: true, phone: true },
  },
  professional: {
    select: { id: true, fullName: true },
  },
  specialty: {
    select: { id: true, name: true },
  },
} as const;

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Create ──────────────────────────────────────────────────────────────────

  async create(dto: CreateAppointmentDto) {
    const startAt = new Date(dto.startAt);

    this.assertNotInThePast(startAt);

    const professional = await this.prisma.professional.findUnique({
      where: { id: dto.professionalId },
    });

    if (!professional) {
      throw new NotFoundException('Professional not found.');
    }

    if (professional.specialtyId !== dto.specialtyId) {
      throw new BadRequestException(
        'The specialty does not match the professional specialty.',
      );
    }

    const patient = await this.prisma.patient.findUnique({
      where: { id: dto.patientId },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found.');
    }

    await this.assertNoConflict(dto.professionalId, startAt);

    return this.prisma.appointment.create({
      data: {
        patientId: dto.patientId,
        professionalId: dto.professionalId,
        specialtyId: dto.specialtyId,
        startAt,
        notes: dto.notes,
      },
      include: appointmentInclude,
    });
  }

  // ─── List ─────────────────────────────────────────────────────────────────────

  async findAll(query: ListAppointmentsQueryDto) {
    const where: Prisma.AppointmentWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.professionalId) {
      where.professionalId = query.professionalId;
    }

    if (query.specialtyId) {
      where.specialtyId = query.specialtyId;
    }

    if (query.date) {
      const dayStart = new Date(`${query.date}T00:00:00.000Z`);
      const dayEnd = new Date(`${query.date}T23:59:59.999Z`);
      where.startAt = { gte: dayStart, lte: dayEnd };
    }

    return this.prisma.appointment.findMany({
      where,
      include: appointmentInclude,
      orderBy: { startAt: 'asc' },
    });
  }

  // ─── Find One ────────────────────────────────────────────────────────────────

  async findOne(id: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: appointmentInclude,
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found.');
    }

    return appointment;
  }

  // ─── Confirm ─────────────────────────────────────────────────────────────────

  async confirm(id: string) {
    const appointment = await this.findOne(id);

    if (appointment.status !== AppointmentStatus.SCHEDULED) {
      throw new UnprocessableEntityException(
        'Only scheduled appointments can be confirmed.',
      );
    }

    return this.prisma.appointment.update({
      where: { id },
      data: { status: AppointmentStatus.CONFIRMED },
      include: appointmentInclude,
    });
  }

  // ─── Reschedule ──────────────────────────────────────────────────────────────

  async reschedule(id: string, dto: RescheduleAppointmentDto) {
    const appointment = await this.findOne(id);

    if (
      appointment.status === AppointmentStatus.CANCELLED ||
      appointment.status === AppointmentStatus.COMPLETED
    ) {
      throw new UnprocessableEntityException(
        'Cancelled or completed appointments cannot be rescheduled.',
      );
    }

    const newStartAt = new Date(dto.startAt);

    this.assertNotInThePast(newStartAt);

    await this.assertNoConflict(appointment.professionalId, newStartAt, id);

    return this.prisma.appointment.update({
      where: { id },
      data: { startAt: newStartAt, status: AppointmentStatus.SCHEDULED },
      include: appointmentInclude,
    });
  }

  // ─── Cancel ──────────────────────────────────────────────────────────────────

  async cancel(id: string) {
    const appointment = await this.findOne(id);

    if (
      appointment.status === AppointmentStatus.CANCELLED ||
      appointment.status === AppointmentStatus.COMPLETED
    ) {
      throw new UnprocessableEntityException(
        'Appointment is already cancelled or completed.',
      );
    }

    return this.prisma.appointment.update({
      where: { id },
      data: { status: AppointmentStatus.CANCELLED },
      include: appointmentInclude,
    });
  }

  // ─── Complete ─────────────────────────────────────────────────────────────────

  async complete(id: string) {
    const appointment = await this.findOne(id);

    if (
      appointment.status !== AppointmentStatus.SCHEDULED &&
      appointment.status !== AppointmentStatus.CONFIRMED
    ) {
      throw new UnprocessableEntityException(
        'Only active appointments (scheduled or confirmed) can be completed.',
      );
    }

    return this.prisma.appointment.update({
      where: { id },
      data: { status: AppointmentStatus.COMPLETED },
      include: appointmentInclude,
    });
  }

  // ─── Private Helpers ─────────────────────────────────────────────────────────

  private assertNotInThePast(startAt: Date): void {
    if (startAt <= new Date()) {
      throw new BadRequestException(
        'Appointment cannot be scheduled in the past.',
      );
    }
  }

  private async assertNoConflict(
    professionalId: string,
    startAt: Date,
    excludeId?: string,
  ): Promise<void> {
    const slotEnd = new Date(
      startAt.getTime() + SLOT_DURATION_MINUTES * 60_000,
    );

    const conflict = await this.prisma.appointment.findFirst({
      where: {
        professionalId,
        id: excludeId ? { not: excludeId } : undefined,
        status: {
          in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED],
        },
        AND: [
          { startAt: { lt: slotEnd } },
          {
            startAt: {
              gte: new Date(startAt.getTime() - SLOT_DURATION_MINUTES * 60_000),
            },
          },
        ],
      },
    });

    if (conflict) {
      throw new ConflictException(
        'The professional already has an appointment in this time slot.',
      );
    }
  }
}
