import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { HealthController } from './health/health.controller';
import { PrismaModule } from './lib/prisma/prisma.module';
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
  ],
  controllers: [HealthController],
})
export class AppModule {}
