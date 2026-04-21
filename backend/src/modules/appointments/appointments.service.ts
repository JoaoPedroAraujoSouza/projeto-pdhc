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
      throw new NotFoundException('Profissional não encontrado.');
    }

    if (professional.specialtyId !== dto.specialtyId) {
      throw new BadRequestException(
        'A especialidade não corresponde à especialidade do profissional.',
      );
    }

    const patient = await this.prisma.patient.findUnique({
      where: { id: dto.patientId },
    });

    if (!patient) {
      throw new NotFoundException('Paciente não encontrado.');
    }

    await this.assertNoConflict(dto.professionalId, dto.patientId, startAt);

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
      throw new NotFoundException('Agendamento não encontrado.');
    }

    return appointment;
  }

  // ─── Confirm ─────────────────────────────────────────────────────────────────

  async confirm(id: string) {
    const appointment = await this.findOne(id);

    if (appointment.status !== AppointmentStatus.SCHEDULED) {
      throw new UnprocessableEntityException(
        "Apenas agendamentos com status 'agendado' podem ser confirmados.",
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
        'Agendamentos cancelados ou concluídos não podem ser remarcados.',
      );
    }

    const newStartAt = new Date(dto.startAt);

    this.assertNotInThePast(newStartAt);

    await this.assertNoConflict(
      appointment.professionalId,
      appointment.patientId,
      newStartAt,
      id,
    );

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
        'O agendamento já está cancelado ou concluído.',
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
        'Apenas agendamentos ativos (agendado ou confirmado) podem ser concluídos.',
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
        'O agendamento não pode ser criado no passado.',
      );
    }
  }

  private async assertNoConflict(
    professionalId: string,
    patientId: string,
    startAt: Date,
    excludeId?: string,
  ): Promise<void> {
    const slotEnd = new Date(
      startAt.getTime() + SLOT_DURATION_MINUTES * 60_000,
    );
    const lowerBound = new Date(
      startAt.getTime() - SLOT_DURATION_MINUTES * 60_000,
    );

    const activeStatuses = {
      in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED],
    };
    const timeOverlap = [
      // existing slot starts before new slot ends
      { startAt: { lt: slotEnd } },
      // existing slot ends after new slot starts → existing.startAt + 30min > startAt
      // ⟺ existing.startAt > startAt - 30min  (strict: adjacent slots are NOT a conflict)
      { startAt: { gt: lowerBound } },
    ];
    const excludeFilter = excludeId ? { not: excludeId } : undefined;

    // Check professional conflict
    const professionalConflict = await this.prisma.appointment.findFirst({
      where: {
        professionalId,
        id: excludeFilter,
        status: activeStatuses,
        AND: timeOverlap,
      },
    });

    if (professionalConflict) {
      throw new ConflictException(
        'O profissional já possui um agendamento nesse horário.',
      );
    }

    // Check patient conflict
    const patientConflict = await this.prisma.appointment.findFirst({
      where: {
        patientId,
        id: excludeFilter,
        status: activeStatuses,
        AND: timeOverlap,
      },
    });

    if (patientConflict) {
      throw new ConflictException(
        'O paciente já possui um agendamento nesse horário.',
      );
    }
  }
}
