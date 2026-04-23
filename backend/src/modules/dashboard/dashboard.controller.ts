import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('today')
  @ApiOperation({ summary: 'Obtém métricas e agendamentos do dia' })
  @ApiQuery({
    name: 'date',
    required: false,
    description:
      'Data no formato YYYY-MM-DD. Se omitida, usará o dia atual do servidor.',
    example: '2026-04-21',
  })
  @ApiResponse({
    status: 200,
    description: 'Dados do dashboard obtidos com sucesso.',
  })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 400, description: 'Formato de data inválido.' })
  getToday(@Query('date') date?: string) {
    return this.dashboardService.getTodayMetrics(date);
  }
}
