import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { SupabaseAuthService } from '../src/modules/auth/services/supabase-auth.service';
import type { AuthenticatedUser } from '../src/modules/auth/interfaces/authenticated-user.interface';

describe('App (e2e)', () => {
  let app: INestApplication<App>;
  const getAuthenticatedUserMock = jest.fn<
    (accessToken: string) => Promise<AuthenticatedUser>
  >();

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(SupabaseAuthService)
      .useValue({
        getAuthenticatedUser: getAuthenticatedUserMock,
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    getAuthenticatedUserMock.mockImplementation(async (token: string) => {
      if (token !== 'valid-token') {
        throw new UnauthorizedException('Token inválido ou expirado.');
      }

      return {
        id: 'user-id',
        email: 'user@example.com',
        role: 'authenticated',
        appMetadata: { provider: 'email' },
        userMetadata: { name: 'Ana' },
      };
    });
  });

  it('/api/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/health')
      .expect(200)
      .expect({
        status: 'ok',
        service: 'pdhc-backend',
      });
  });

  it('/api/auth/me (GET) returns 401 without authorization header', () => {
    return request(app.getHttpServer()).get('/api/auth/me').expect(401);
  });

  it('/api/auth/me (GET) returns 401 with invalid authorization format', () => {
    return request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', 'Token invalid-token')
      .expect(401);
  });

  it('/api/auth/me (GET) returns authenticated user payload', () => {
    return request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', 'Bearer valid-token')
      .expect(200)
      .expect({
        id: 'user-id',
        email: 'user@example.com',
        role: 'authenticated',
        appMetadata: { provider: 'email' },
        userMetadata: { name: 'Ana' },
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
