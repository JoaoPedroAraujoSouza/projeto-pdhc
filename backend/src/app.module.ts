import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [AuthModule],
  controllers: [HealthController],
})
export class AppModule {}
