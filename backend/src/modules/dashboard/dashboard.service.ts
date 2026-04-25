import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../lib/prisma/prisma.service';

const BRASILIA_TIME_ZONE = 'America/Sao_Paulo';
const BRASILIA_UTC_OFFSET = '-03:00';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  private getTodayDateStringInBrasilia(): string {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: BRASILIA_TIME_ZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
  }

  async getTodayMetrics(dateString?: string) {
    const targetDateString = dateString ?? this.getTodayDateStringInBrasilia();

    if (!/^\d{4}-\d{2}-\d{2}$/.test(targetDateString)) {
      throw new BadRequestException('Formato de data inválido. Use YYYY-MM-DD.');
    }

    // Boundaries for the calendar day in Brasília time (UTC-03:00).
    const startOfDay = new Date(
      `${targetDateString}T00:00:00.000${BRASILIA_UTC_OFFSET}`,
    );
    const endOfDay = new Date(
      `${targetDateString}T23:59:59.999${BRASILIA_UTC_OFFSET}`,
    );

    const whereClause = {
      startAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    };

    // 1. Group by status for metrics
    const statusCounts = await this.prisma.appointment.groupBy({
      by: ['status'],
      where: whereClause,
      _count: {
        id: true,
      },
    });

    const metrics = {
      total: 0,
      SCHEDULED: 0,
      CONFIRMED: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    };

    for (const item of statusCounts) {
      const count = item._count.id;
      metrics.total += count;
      if (item.status in metrics) {
        metrics[item.status as keyof typeof metrics] = count;
      }
    }

    // 2. Fetch upcoming appointments (ignoring cancelled/completed if we want,
    // but the spec says "próximos agendamentos do dia", it's good to list all or at least scheduled/confirmed)
    // Let's bring all appointments for today so the user sees the full agenda
    const upcomingAppointments = await this.prisma.appointment.findMany({
      where: whereClause,
      orderBy: {
        startAt: 'asc',
      },
      include: {
        patient: {
          select: { id: true, fullName: true, cpf: true, phone: true },
        },
        professional: {
          select: { id: true, fullName: true },
        },
        specialty: {
          select: { id: true, name: true },
        },
      },
    });

    return {
      metrics,
      upcomingAppointments,
    };
  }
}
