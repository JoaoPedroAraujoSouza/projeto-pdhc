import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, UnauthorizedException } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/lib/prisma/prisma.service';
import { SupabaseAuthService } from '../src/modules/auth/services/supabase-auth.service';
import { setupE2eApp } from './utils/e2e-setup';
import { randomUUID } from 'crypto';
import { AppointmentStatus } from '@prisma/client';

describe('AppointmentsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const getAuthenticatedUserMock = jest.fn();

  // Shared test data
  let specialtyId: string;
  let professionalId: string;
  let patientId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(SupabaseAuthService)
      .useValue({
        getAuthenticatedUser: getAuthenticatedUserMock,
      })
      .compile();

    app = await setupE2eApp(moduleFixture);
    prisma = app.get<PrismaService>(PrismaService);

    // Setup seed data for appointments
    const specialty = await prisma.specialty.create({
      data: { name: `E2E Spec ${randomUUID().slice(0, 8)}` },
    });
    specialtyId = specialty.id;

    const professional = await prisma.professional.create({
      data: {
        fullName: 'E2E Professional',
        specialtyId,
      },
    });
    professionalId = professional.id;

    const uniqueCpf = Math.random().toString().slice(2, 13);
    const patient = await prisma.patient.create({
      data: {
        fullName: 'E2E Patient',
        cpf: uniqueCpf,
        birthDate: new Date('1990-01-01'),
        phone: '11999999999',
      },
    });
    patientId = patient.id;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    getAuthenticatedUserMock.mockImplementation((token: string) => {
      if (token !== 'valid-token') {
        throw new UnauthorizedException('Token inválido ou expirado.');
      }
      return Promise.resolve({
        id: 'user-id',
        email: 'user@example.com',
        role: 'authenticated',
        appMetadata: { provider: 'email' },
        userMetadata: { name: 'E2E Tester' },
      });
    });
  });

  afterAll(async () => {
    // Cleanup seed data
    if (patientId) await prisma.patient.delete({ where: { id: patientId } });
    if (professionalId)
      await prisma.professional.delete({ where: { id: professionalId } });
    if (specialtyId)
      await prisma.specialty.delete({ where: { id: specialtyId } });
    await app.close();
  });

  const validToken = 'Bearer valid-token';

  describe('POST /api/appointments', () => {
    it('returns 400 when startAt is missing or invalid', () => {
      return request(app.getHttpServer())
        .post('/api/appointments')
        .set('Authorization', validToken)
        .send({
          patientId,
          professionalId,
          specialtyId,
          startAt: 'not-a-date',
        })
        .expect(400)
        .expect((res) => {
          const body = res.body as { message: string | string[] };
          expect(body.message).toContain(
            'A data e horário de início devem ser um formato ISO 8601 válido.',
          );
        });
    });

    it('returns 400 when scheduling in the past', () => {
      return request(app.getHttpServer())
        .post('/api/appointments')
        .set('Authorization', validToken)
        .send({
          patientId,
          professionalId,
          specialtyId,
          startAt: new Date(Date.now() - 60000).toISOString(),
        })
        .expect(400)
        .expect((res) => {
          const body = res.body as { message: string };
          expect(body.message).toBe(
            'O agendamento não pode ser criado no passado.',
          );
        });
    });

    it('creates an appointment successfully', async () => {
      // Future date 1 hour from now
      const startAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

      const response = await request(app.getHttpServer())
        .post('/api/appointments')
        .set('Authorization', validToken)
        .send({
          patientId,
          professionalId,
          specialtyId,
          startAt,
          notes: 'Test notes',
        })
        .expect(201);

      const body = response.body as { id: string };
      expect(body).toMatchObject({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        id: expect.any(String),
        patientId,
        professionalId,
        specialtyId,
        status: AppointmentStatus.SCHEDULED,
        notes: 'Test notes',
      });

      // Cleanup
      await prisma.appointment.delete({ where: { id: body.id } });
    });

    it('returns 409 Conflict if professional is already booked', async () => {
      const startAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now

      // Create existing
      const existing = await prisma.appointment.create({
        data: {
          patientId,
          professionalId,
          specialtyId,
          startAt,
          status: AppointmentStatus.SCHEDULED,
        },
      });

      // Create new patient to avoid patient conflict, so we ONLY hit professional conflict
      const otherPatient = await prisma.patient.create({
        data: {
          fullName: 'Other',
          cpf: Math.random().toString().slice(2, 13),
          birthDate: new Date(),
          phone: '000',
        },
      });

      // Attempt to create another at same time for same professional
      await request(app.getHttpServer())
        .post('/api/appointments')
        .set('Authorization', validToken)
        .send({
          patientId: otherPatient.id,
          professionalId,
          specialtyId,
          startAt: startAt.toISOString(),
        })
        .expect(409)
        .expect((res) => {
          const body = res.body as { message: string };
          expect(body.message).toBe(
            'O profissional já possui um agendamento nesse horário.',
          );
        });

      // Cleanup
      await prisma.appointment.delete({ where: { id: existing.id } });
      await prisma.patient.delete({ where: { id: otherPatient.id } });
    });
  });

  describe('PATCH /api/appointments/:id/confirm', () => {
    it('confirms a scheduled appointment', async () => {
      const startAt = new Date(Date.now() + 3 * 60 * 60 * 1000); // 3 hours from now

      const appointment = await prisma.appointment.create({
        data: {
          patientId,
          professionalId,
          specialtyId,
          startAt,
          status: AppointmentStatus.SCHEDULED,
        },
      });

      const response = await request(app.getHttpServer())
        .patch(`/api/appointments/${appointment.id}/confirm`)
        .set('Authorization', validToken)
        .expect(200);

      const body = response.body as { status: string };
      expect(body.status).toBe(AppointmentStatus.CONFIRMED);

      await prisma.appointment.delete({ where: { id: appointment.id } });
    });
  });

  describe('PATCH /api/appointments/:id/cancel', () => {
    it('returns 422 if already cancelled', async () => {
      const startAt = new Date(Date.now() + 4 * 60 * 60 * 1000);

      const appointment = await prisma.appointment.create({
        data: {
          patientId,
          professionalId,
          specialtyId,
          startAt,
          status: AppointmentStatus.CANCELLED,
        },
      });

      await request(app.getHttpServer())
        .patch(`/api/appointments/${appointment.id}/cancel`)
        .set('Authorization', validToken)
        .expect(422)
        .expect((res) => {
          const body = res.body as { message: string };
          expect(body.message).toBe(
            'O agendamento já está cancelado ou concluído.',
          );
        });

      await prisma.appointment.delete({ where: { id: appointment.id } });
    });
  });
});
