import { Injectable, BadRequestException } from '@nestjs/common';
import { AppointmentStatus } from '@prisma/client';
import { PrismaService } from '../../lib/prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getTodayMetrics(dateString?: string) {
    // If dateString is not provided, fallback to current UTC date.
    // It's highly recommended for clients to pass the dateString in YYYY-MM-DD format.
    let baseDate: Date;
    if (dateString) {
      // Validate format YYYY-MM-DD
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        throw new BadRequestException(
          'Formato de data inválido. Use YYYY-MM-DD.',
        );
      }
      // Create date strictly based on the string (UTC boundaries)
      baseDate = new Date(`${dateString}T00:00:00.000Z`);
    } else {
      const now = new Date();
      baseDate = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
      );
    }

    // Set time boundaries based on the normalized baseDate
    const startOfDay = new Date(baseDate);

    const endOfDay = new Date(baseDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

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

    // 2. Fetch only upcoming appointments for the selected day.
    // For "today", this excludes earlier slots that already happened.
    const now = new Date();
    const isCurrentUtcDay =
      baseDate.getUTCFullYear() === now.getUTCFullYear() &&
      baseDate.getUTCMonth() === now.getUTCMonth() &&
      baseDate.getUTCDate() === now.getUTCDate();

    const upcomingStart = isCurrentUtcDay
      ? new Date(Math.max(now.getTime(), startOfDay.getTime()))
      : startOfDay;

    const upcomingAppointments = await this.prisma.appointment.findMany({
      where: {
        startAt: {
          gte: upcomingStart,
          lte: endOfDay,
        },
        status: {
          in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED],
        },
      },
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
