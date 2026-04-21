import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { AppointmentStatus } from '@prisma/client';
import { AppointmentsService } from './appointments.service';
import type { PrismaService } from '../../lib/prisma/prisma.service';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Returns a Date that is `offsetMinutes` from now (positive = future). */
function minutesFromNow(offsetMinutes: number): Date {
  return new Date(Date.now() + offsetMinutes * 60_000);
}

const SLOT = 30; // slot duration in minutes

const PROFESSIONAL_ID = 'pro-1';
const PATIENT_ID = 'pat-1';
const SPECIALTY_ID = 'spc-1';
const APPOINTMENT_ID = 'appt-1';

function makeProfessional(overrides = {}) {
  return {
    id: PROFESSIONAL_ID,
    fullName: 'Dr. Smith',
    specialtyId: SPECIALTY_ID,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makePatient(overrides = {}) {
  return {
    id: PATIENT_ID,
    fullName: 'Jane Doe',
    cpf: '12345678901',
    birthDate: new Date('1990-01-01'),
    phone: '11999999999',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeAppointment(
  status: AppointmentStatus,
  startAt: Date,
  overrides = {},
) {
  return {
    id: APPOINTMENT_ID,
    patientId: PATIENT_ID,
    professionalId: PROFESSIONAL_ID,
    specialtyId: SPECIALTY_ID,
    startAt,
    status,
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    patient: { id: PATIENT_ID, fullName: 'Jane Doe', cpf: '123', phone: '11' },
    professional: { id: PROFESSIONAL_ID, fullName: 'Dr. Smith' },
    specialty: { id: SPECIALTY_ID, name: 'Cardiology' },
    ...overrides,
  };
}

// ─── Types ────────────────────────────────────────────────────────────────────

// Prisma model return types (simplified for tests)
type ProfessionalRecord = ReturnType<typeof makeProfessional>;
type PatientRecord = ReturnType<typeof makePatient>;
type AppointmentRecord = ReturnType<typeof makeAppointment>;

// ─── Mock Prisma ──────────────────────────────────────────────────────────────

function buildMockPrisma() {
  return {
    professional: {
      findUnique:
        jest.fn<(...args: unknown[]) => Promise<ProfessionalRecord | null>>(),
    },
    patient: {
      findUnique:
        jest.fn<(...args: unknown[]) => Promise<PatientRecord | null>>(),
    },
    appointment: {
      findFirst:
        jest.fn<(...args: unknown[]) => Promise<AppointmentRecord | null>>(),
      findUnique:
        jest.fn<(...args: unknown[]) => Promise<AppointmentRecord | null>>(),
      findMany: jest.fn<(...args: unknown[]) => Promise<AppointmentRecord[]>>(),
      create: jest.fn<(...args: unknown[]) => Promise<AppointmentRecord>>(),
      update: jest.fn<(...args: unknown[]) => Promise<AppointmentRecord>>(),
    },
  };
}

type MockPrisma = ReturnType<typeof buildMockPrisma>;

function buildService(prisma: MockPrisma) {
  return new AppointmentsService(prisma as unknown as PrismaService);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('AppointmentsService', () => {
  let prisma: MockPrisma;
  let service: AppointmentsService;

  beforeEach(() => {
    prisma = buildMockPrisma();
    service = buildService(prisma);
    jest.clearAllMocks();
  });

  // ─── create ───────────────────────────────────────────────────────────────

  describe('create()', () => {
    it('throws BadRequestException when startAt is in the past', async () => {
      await expect(
        service.create({
          patientId: PATIENT_ID,
          professionalId: PROFESSIONAL_ID,
          specialtyId: SPECIALTY_ID,
          startAt: minutesFromNow(-1).toISOString(),
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when startAt is exactly now', async () => {
      await expect(
        service.create({
          patientId: PATIENT_ID,
          professionalId: PROFESSIONAL_ID,
          specialtyId: SPECIALTY_ID,
          startAt: new Date().toISOString(),
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException when professional does not exist', async () => {
      jest.mocked(prisma.professional.findUnique).mockResolvedValue(null);

      await expect(
        service.create({
          patientId: PATIENT_ID,
          professionalId: 'nonexistent-pro',
          specialtyId: SPECIALTY_ID,
          startAt: minutesFromNow(60).toISOString(),
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException when specialty does not match professional', async () => {
      jest
        .mocked(prisma.professional.findUnique)
        .mockResolvedValue(makeProfessional({ specialtyId: 'other-spc' }));

      await expect(
        service.create({
          patientId: PATIENT_ID,
          professionalId: PROFESSIONAL_ID,
          specialtyId: SPECIALTY_ID,
          startAt: minutesFromNow(60).toISOString(),
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException when patient does not exist', async () => {
      jest
        .mocked(prisma.professional.findUnique)
        .mockResolvedValue(makeProfessional());
      jest.mocked(prisma.patient.findUnique).mockResolvedValue(null);

      await expect(
        service.create({
          patientId: 'nonexistent-pat',
          professionalId: PROFESSIONAL_ID,
          specialtyId: SPECIALTY_ID,
          startAt: minutesFromNow(60).toISOString(),
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ConflictException when a SCHEDULED appointment overlaps the same slot', async () => {
      const newStart = minutesFromNow(60);

      jest
        .mocked(prisma.professional.findUnique)
        .mockResolvedValue(makeProfessional());
      jest.mocked(prisma.patient.findUnique).mockResolvedValue(makePatient());
      // Simulate an existing SCHEDULED appointment at the same time
      jest
        .mocked(prisma.appointment.findFirst)
        .mockResolvedValue(
          makeAppointment(AppointmentStatus.SCHEDULED, newStart),
        );

      await expect(
        service.create({
          patientId: PATIENT_ID,
          professionalId: PROFESSIONAL_ID,
          specialtyId: SPECIALTY_ID,
          startAt: newStart.toISOString(),
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('throws ConflictException when a CONFIRMED appointment overlaps the new slot', async () => {
      const newStart = minutesFromNow(60);
      // Existing appointment starts 15 minutes before → slots overlap
      const existingStart = minutesFromNow(60 - 15);

      jest
        .mocked(prisma.professional.findUnique)
        .mockResolvedValue(makeProfessional());
      jest.mocked(prisma.patient.findUnique).mockResolvedValue(makePatient());
      jest
        .mocked(prisma.appointment.findFirst)
        .mockResolvedValue(
          makeAppointment(AppointmentStatus.CONFIRMED, existingStart),
        );

      await expect(
        service.create({
          patientId: PATIENT_ID,
          professionalId: PROFESSIONAL_ID,
          specialtyId: SPECIALTY_ID,
          startAt: newStart.toISOString(),
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('throws ConflictException when new appointment starts inside an existing SCHEDULED slot', async () => {
      const existingStart = minutesFromNow(60);
      // New appointment starts 15 min after existing → still inside existing [60, 90)
      const newStart = minutesFromNow(60 + 15);

      jest
        .mocked(prisma.professional.findUnique)
        .mockResolvedValue(makeProfessional());
      jest.mocked(prisma.patient.findUnique).mockResolvedValue(makePatient());
      jest
        .mocked(prisma.appointment.findFirst)
        .mockResolvedValue(
          makeAppointment(AppointmentStatus.SCHEDULED, existingStart),
        );

      await expect(
        service.create({
          patientId: PATIENT_ID,
          professionalId: PROFESSIONAL_ID,
          specialtyId: SPECIALTY_ID,
          startAt: newStart.toISOString(),
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('throws ConflictException when patient already has a SCHEDULED appointment at the same time', async () => {
      const newStart = minutesFromNow(60);

      jest
        .mocked(prisma.professional.findUnique)
        .mockResolvedValue(makeProfessional());
      jest.mocked(prisma.patient.findUnique).mockResolvedValue(makePatient());
      // First call (professional check) → no conflict
      // Second call (patient check) → conflict found
      jest
        .mocked(prisma.appointment.findFirst)
        .mockResolvedValueOnce(null) // professional: no conflict
        .mockResolvedValueOnce(
          makeAppointment(AppointmentStatus.SCHEDULED, newStart, {
            id: 'other-appt',
          }),
        );

      await expect(
        service.create({
          patientId: PATIENT_ID,
          professionalId: PROFESSIONAL_ID,
          specialtyId: SPECIALTY_ID,
          startAt: newStart.toISOString(),
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('does NOT throw ConflictException for adjacent slots (existing ends when new begins)', async () => {
      // New appointment starts exactly 30 min after an existing one → adjacent, no overlap
      const newStart = minutesFromNow(60 + SLOT);

      jest
        .mocked(prisma.professional.findUnique)
        .mockResolvedValue(makeProfessional());
      jest.mocked(prisma.patient.findUnique).mockResolvedValue(makePatient());
      // No conflict found in DB
      jest.mocked(prisma.appointment.findFirst).mockResolvedValue(null);
      jest
        .mocked(prisma.appointment.create)
        .mockResolvedValue(
          makeAppointment(AppointmentStatus.SCHEDULED, newStart),
        );

      await expect(
        service.create({
          patientId: PATIENT_ID,
          professionalId: PROFESSIONAL_ID,
          specialtyId: SPECIALTY_ID,
          startAt: newStart.toISOString(),
        }),
      ).resolves.toBeDefined();

      // Verify the conflict query used `gt` (not `gte`) for the lower bound
      expect(prisma.appointment.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: expect.arrayContaining([
              expect.objectContaining({
                startAt: expect.objectContaining({ gt: expect.any(Date) }),
              }),
            ]),
          }),
        }),
      );
    });

    it('does NOT throw for CANCELLED/COMPLETED appointments in the same slot', async () => {
      const newStart = minutesFromNow(60);

      jest
        .mocked(prisma.professional.findUnique)
        .mockResolvedValue(makeProfessional());
      jest.mocked(prisma.patient.findUnique).mockResolvedValue(makePatient());
      // findFirst returns null → no active conflict
      jest.mocked(prisma.appointment.findFirst).mockResolvedValue(null);
      jest
        .mocked(prisma.appointment.create)
        .mockResolvedValue(
          makeAppointment(AppointmentStatus.SCHEDULED, newStart),
        );

      await expect(
        service.create({
          patientId: PATIENT_ID,
          professionalId: PROFESSIONAL_ID,
          specialtyId: SPECIALTY_ID,
          startAt: newStart.toISOString(),
        }),
      ).resolves.toBeDefined();
    });

    it('creates appointment successfully when slot is free', async () => {
      const startAt = minutesFromNow(60);
      const created = makeAppointment(AppointmentStatus.SCHEDULED, startAt);

      jest
        .mocked(prisma.professional.findUnique)
        .mockResolvedValue(makeProfessional());
      jest.mocked(prisma.patient.findUnique).mockResolvedValue(makePatient());
      jest.mocked(prisma.appointment.findFirst).mockResolvedValue(null);
      jest.mocked(prisma.appointment.create).mockResolvedValue(created);

      const result = await service.create({
        patientId: PATIENT_ID,
        professionalId: PROFESSIONAL_ID,
        specialtyId: SPECIALTY_ID,
        startAt: startAt.toISOString(),
      });

      expect(result).toEqual(created);
      expect(prisma.appointment.create).toHaveBeenCalledTimes(1);
    });
  });

  // ─── reschedule ───────────────────────────────────────────────────────────

  describe('reschedule()', () => {
    it('throws UnprocessableEntityException when appointment is CANCELLED', async () => {
      const existing = makeAppointment(
        AppointmentStatus.CANCELLED,
        minutesFromNow(-60),
      );
      jest.mocked(prisma.appointment.findUnique).mockResolvedValue(existing);

      await expect(
        service.reschedule(APPOINTMENT_ID, {
          startAt: minutesFromNow(60).toISOString(),
        }),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('throws UnprocessableEntityException when appointment is COMPLETED', async () => {
      const existing = makeAppointment(
        AppointmentStatus.COMPLETED,
        minutesFromNow(-60),
      );
      jest.mocked(prisma.appointment.findUnique).mockResolvedValue(existing);

      await expect(
        service.reschedule(APPOINTMENT_ID, {
          startAt: minutesFromNow(60).toISOString(),
        }),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('throws BadRequestException when new startAt is in the past', async () => {
      const existing = makeAppointment(
        AppointmentStatus.SCHEDULED,
        minutesFromNow(60),
      );
      jest.mocked(prisma.appointment.findUnique).mockResolvedValue(existing);

      await expect(
        service.reschedule(APPOINTMENT_ID, {
          startAt: minutesFromNow(-10).toISOString(),
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws ConflictException when new slot conflicts with another SCHEDULED appointment', async () => {
      const newStart = minutesFromNow(120);
      const existing = makeAppointment(
        AppointmentStatus.SCHEDULED,
        minutesFromNow(60),
      );
      jest.mocked(prisma.appointment.findUnique).mockResolvedValue(existing);
      // Another appointment already occupies newStart
      jest.mocked(prisma.appointment.findFirst).mockResolvedValue(
        makeAppointment(AppointmentStatus.SCHEDULED, newStart, {
          id: 'other-appt',
        }),
      );

      await expect(
        service.reschedule(APPOINTMENT_ID, {
          startAt: newStart.toISOString(),
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('does NOT conflict with itself when rescheduling to a free slot', async () => {
      const newStart = minutesFromNow(120);
      const existing = makeAppointment(
        AppointmentStatus.SCHEDULED,
        minutesFromNow(60),
      );
      jest.mocked(prisma.appointment.findUnique).mockResolvedValue(existing);
      // No OTHER conflict
      jest.mocked(prisma.appointment.findFirst).mockResolvedValue(null);
      jest
        .mocked(prisma.appointment.update)
        .mockResolvedValue({ ...existing, startAt: newStart });

      await expect(
        service.reschedule(APPOINTMENT_ID, {
          startAt: newStart.toISOString(),
        }),
      ).resolves.toBeDefined();

      // The conflict query must exclude the appointment itself
      expect(prisma.appointment.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ id: { not: APPOINTMENT_ID } }),
        }),
      );
    });
  });

  // ─── confirm ──────────────────────────────────────────────────────────────

  describe('confirm()', () => {
    it('throws UnprocessableEntityException when appointment is CONFIRMED', async () => {
      jest
        .mocked(prisma.appointment.findUnique)
        .mockResolvedValue(
          makeAppointment(AppointmentStatus.CONFIRMED, minutesFromNow(60)),
        );

      await expect(service.confirm(APPOINTMENT_ID)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });

    it('throws UnprocessableEntityException when appointment is CANCELLED', async () => {
      jest
        .mocked(prisma.appointment.findUnique)
        .mockResolvedValue(
          makeAppointment(AppointmentStatus.CANCELLED, minutesFromNow(60)),
        );

      await expect(service.confirm(APPOINTMENT_ID)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });

    it('confirms a SCHEDULED appointment', async () => {
      const appt = makeAppointment(
        AppointmentStatus.SCHEDULED,
        minutesFromNow(60),
      );
      jest.mocked(prisma.appointment.findUnique).mockResolvedValue(appt);
      jest
        .mocked(prisma.appointment.update)
        .mockResolvedValue({ ...appt, status: AppointmentStatus.CONFIRMED });

      const result = await service.confirm(APPOINTMENT_ID);

      expect(prisma.appointment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: AppointmentStatus.CONFIRMED },
        }),
      );
      expect(result.status).toBe(AppointmentStatus.CONFIRMED);
    });
  });

  // ─── cancel ───────────────────────────────────────────────────────────────

  describe('cancel()', () => {
    it('throws UnprocessableEntityException when appointment is already CANCELLED', async () => {
      jest
        .mocked(prisma.appointment.findUnique)
        .mockResolvedValue(
          makeAppointment(AppointmentStatus.CANCELLED, minutesFromNow(60)),
        );

      await expect(service.cancel(APPOINTMENT_ID)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });

    it('throws UnprocessableEntityException when appointment is COMPLETED', async () => {
      jest
        .mocked(prisma.appointment.findUnique)
        .mockResolvedValue(
          makeAppointment(AppointmentStatus.COMPLETED, minutesFromNow(-10)),
        );

      await expect(service.cancel(APPOINTMENT_ID)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });

    it('cancels a SCHEDULED appointment', async () => {
      const appt = makeAppointment(
        AppointmentStatus.SCHEDULED,
        minutesFromNow(60),
      );
      jest.mocked(prisma.appointment.findUnique).mockResolvedValue(appt);
      jest
        .mocked(prisma.appointment.update)
        .mockResolvedValue({ ...appt, status: AppointmentStatus.CANCELLED });

      const result = await service.cancel(APPOINTMENT_ID);

      expect(result.status).toBe(AppointmentStatus.CANCELLED);
    });

    it('cancels a CONFIRMED appointment', async () => {
      const appt = makeAppointment(
        AppointmentStatus.CONFIRMED,
        minutesFromNow(60),
      );
      jest.mocked(prisma.appointment.findUnique).mockResolvedValue(appt);
      jest
        .mocked(prisma.appointment.update)
        .mockResolvedValue({ ...appt, status: AppointmentStatus.CANCELLED });

      await expect(service.cancel(APPOINTMENT_ID)).resolves.toBeDefined();
    });
  });

  // ─── complete ─────────────────────────────────────────────────────────────

  describe('complete()', () => {
    it('throws UnprocessableEntityException when appointment is CANCELLED', async () => {
      jest
        .mocked(prisma.appointment.findUnique)
        .mockResolvedValue(
          makeAppointment(AppointmentStatus.CANCELLED, minutesFromNow(-60)),
        );

      await expect(service.complete(APPOINTMENT_ID)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });

    it('throws UnprocessableEntityException when appointment is already COMPLETED', async () => {
      jest
        .mocked(prisma.appointment.findUnique)
        .mockResolvedValue(
          makeAppointment(AppointmentStatus.COMPLETED, minutesFromNow(-60)),
        );

      await expect(service.complete(APPOINTMENT_ID)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });

    it('completes a SCHEDULED appointment', async () => {
      const appt = makeAppointment(
        AppointmentStatus.SCHEDULED,
        minutesFromNow(60),
      );
      jest.mocked(prisma.appointment.findUnique).mockResolvedValue(appt);
      jest
        .mocked(prisma.appointment.update)
        .mockResolvedValue({ ...appt, status: AppointmentStatus.COMPLETED });

      const result = await service.complete(APPOINTMENT_ID);

      expect(result.status).toBe(AppointmentStatus.COMPLETED);
    });

    it('completes a CONFIRMED appointment', async () => {
      const appt = makeAppointment(
        AppointmentStatus.CONFIRMED,
        minutesFromNow(60),
      );
      jest.mocked(prisma.appointment.findUnique).mockResolvedValue(appt);
      jest
        .mocked(prisma.appointment.update)
        .mockResolvedValue({ ...appt, status: AppointmentStatus.COMPLETED });

      await expect(service.complete(APPOINTMENT_ID)).resolves.toBeDefined();
    });
  });

  // ─── findOne ──────────────────────────────────────────────────────────────

  describe('findOne()', () => {
    it('throws NotFoundException when appointment does not exist', async () => {
      jest.mocked(prisma.appointment.findUnique).mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('returns appointment when found', async () => {
      const appt = makeAppointment(
        AppointmentStatus.SCHEDULED,
        minutesFromNow(60),
      );
      jest.mocked(prisma.appointment.findUnique).mockResolvedValue(appt);

      const result = await service.findOne(APPOINTMENT_ID);

      expect(result).toEqual(appt);
    });
  });
});
