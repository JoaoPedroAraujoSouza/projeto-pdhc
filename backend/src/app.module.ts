import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { HealthController } from './health/health.controller';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { PatientsModule } from './modules/patients/patients.module';
import { PrismaModule } from './lib/prisma/prisma.module';
import { ProfessionalsModule } from './modules/professionals/professionals.module';
import { SpecialtiesModule } from './modules/specialties/specialties.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['src/config/.env', '.env'],
    }),
    PrismaModule,
    AuthModule,
    SpecialtiesModule,
    ProfessionalsModule,
    PatientsModule,
    AppointmentsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
