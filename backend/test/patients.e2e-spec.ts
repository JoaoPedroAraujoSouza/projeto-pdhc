import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, UnauthorizedException } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/lib/prisma/prisma.service';
import { SupabaseAuthService } from '../src/modules/auth/services/supabase-auth.service';
import { setupE2eApp } from './utils/e2e-setup';
import { randomUUID } from 'crypto';
import { AppointmentStatus } from '@prisma/client';

describe('PatientsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const getAuthenticatedUserMock = jest.fn();

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
    await app.close();
  });

  const validToken = 'Bearer valid-token';

  describe('POST /api/patients', () => {
    it('returns 401 when unauthorized', () => {
      return request(app.getHttpServer())
        .post('/api/patients')
        .send({ fullName: 'John Doe' })
        .expect(401);
    });

    it('returns 400 when body is invalid', () => {
      return request(app.getHttpServer())
        .post('/api/patients')
        .set('Authorization', validToken)
        .send({ fullName: '' }) // missing cpf, phone, birthDate
        .expect(400)
        .expect((res) => {
          const body = res.body as { message: string | string[] };
          expect(body.message).toEqual(expect.any(Array));
          expect(body.message.length).toBeGreaterThan(0);
        });
    });

    it('creates a patient successfully (Happy Path)', async () => {
      const uniqueCpf = Math.random().toString().slice(2, 13);

      const response = await request(app.getHttpServer())
        .post('/api/patients')
        .set('Authorization', validToken)
        .send({
          fullName: 'John E2E',
          cpf: uniqueCpf,
          birthDate: '1990-01-01',
          phone: '11999999999',
        })
        .expect(201);

      const body = response.body as {
        id: string;
        fullName: string;
        cpf: string;
        birthDate: string;
        phone: string;
      };
      expect(body).toMatchObject({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        id: expect.any(String),
        fullName: 'John E2E',
        cpf: uniqueCpf,
        birthDate: '1990-01-01T00:00:00.000Z',
        phone: '11999999999',
      });

      // Cleanup
      await prisma.patient.delete({ where: { id: body.id } });
    });

    it('returns 409 Conflict if CPF already exists', async () => {
      const uniqueCpf = Math.random().toString().slice(2, 13);

      // Create first patient
      const patient = await prisma.patient.create({
        data: {
          fullName: 'Original John',
          cpf: uniqueCpf,
          birthDate: new Date('1990-01-01'),
          phone: '11999999999',
        },
      });

      // Attempt to create second with same CPF
      await request(app.getHttpServer())
        .post('/api/patients')
        .set('Authorization', validToken)
        .send({
          fullName: 'Duplicate John',
          cpf: uniqueCpf,
          birthDate: '1995-05-05',
          phone: '11888888888',
        })
        .expect(409)
        .expect((res) => {
          const body = res.body as { message: string };
          expect(body.message).toBe(
            'Já existe um paciente cadastrado com este CPF.',
          );
        });

      // Cleanup
      await prisma.patient.delete({ where: { id: patient.id } });
    });
  });

  describe('GET /api/patients', () => {
    it('returns a list of patients', async () => {
      const uniqueCpf = Math.random().toString().slice(2, 13);
      const patient = await prisma.patient.create({
        data: {
          fullName: 'Zoe E2E',
          cpf: uniqueCpf,
          birthDate: new Date('2000-01-01'),
          phone: '11999999999',
        },
      });

      const response = await request(app.getHttpServer())
        .get('/api/patients')
        .set('Authorization', validToken)
        .expect(200);

      const body = response.body as any[];
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThanOrEqual(1);

      // Cleanup
      await prisma.patient.delete({ where: { id: patient.id } });
    });
  });

  describe('PATCH /api/patients/:id', () => {
    it('returns 404 for non-existent patient', () => {
      return request(app.getHttpServer())
        .patch(`/api/patients/${randomUUID()}`)
        .set('Authorization', validToken)
        .send({ fullName: 'Updated Name' })
        .expect(404);
    });

    it('updates a patient successfully', async () => {
      const uniqueCpf = Math.random().toString().slice(2, 13);
      const patient = await prisma.patient.create({
        data: {
          fullName: 'Old Name',
          cpf: uniqueCpf,
          birthDate: new Date('2000-01-01'),
          phone: '11999999999',
        },
      });

      const response = await request(app.getHttpServer())
        .patch(`/api/patients/${patient.id}`)
        .set('Authorization', validToken)
        .send({ fullName: 'New Name' })
        .expect(200);

      const body = response.body as { fullName: string; cpf: string };
      expect(body.fullName).toBe('New Name');
      expect(body.cpf).toBe(uniqueCpf);

      // Cleanup
      await prisma.patient.delete({ where: { id: patient.id } });
    });
  });

  describe('DELETE /api/patients/:id', () => {
    it('deletes patient when there is no scheduled or confirmed appointment', async () => {
      const patient = await prisma.patient.create({
        data: {
          fullName: 'Delete Me',
          cpf: Math.random().toString().slice(2, 13),
          birthDate: new Date('1992-06-10'),
          phone: '11911111111',
        },
      });

      await request(app.getHttpServer())
        .delete(`/api/patients/${patient.id}`)
        .set('Authorization', validToken)
        .expect(204);

      const deletedPatient = await prisma.patient.findUnique({
        where: { id: patient.id },
      });
      expect(deletedPatient).toBeNull();
    });

    it('returns 422 when patient has appointment with status scheduled', async () => {
      const specialty = await prisma.specialty.create({
        data: { name: `E2E Del ${randomUUID().slice(0, 8)}` },
      });
      const professional = await prisma.professional.create({
        data: {
          fullName: 'E2E Del Professional',
          specialtyId: specialty.id,
        },
      });
      const patient = await prisma.patient.create({
        data: {
          fullName: 'Locked Patient',
          cpf: Math.random().toString().slice(2, 13),
          birthDate: new Date('1991-04-01'),
          phone: '11922222222',
        },
      });
      const appointment = await prisma.appointment.create({
        data: {
          patientId: patient.id,
          professionalId: professional.id,
          specialtyId: specialty.id,
          startAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
          status: AppointmentStatus.SCHEDULED,
        },
      });

      await request(app.getHttpServer())
        .delete(`/api/patients/${patient.id}`)
        .set('Authorization', validToken)
        .expect(422)
        .expect((res) => {
          const body = res.body as { message: string };
          expect(body.message).toBe(
            'Não é possível excluir o paciente pois ele possui consulta agendada ou confirmada.',
          );
        });

      await prisma.appointment.delete({ where: { id: appointment.id } });
      await prisma.patient.delete({ where: { id: patient.id } });
      await prisma.professional.delete({ where: { id: professional.id } });
      await prisma.specialty.delete({ where: { id: specialty.id } });
    });
  });
});
