import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { BadRequestException } from '@nestjs/common';
import { AppointmentStatus } from '@prisma/client';
import { DashboardService } from './dashboard.service';
import type { PrismaService } from '../../lib/prisma/prisma.service';

type GroupByResult = Array<{
  status: AppointmentStatus;
  _count: { id: number };
}>;

function buildMockPrisma() {
  return {
    appointment: {
      groupBy: jest.fn<(...args: unknown[]) => Promise<GroupByResult>>(),
      findMany: jest.fn<(...args: unknown[]) => Promise<unknown[]>>(),
    },
  };
}

type MockPrisma = ReturnType<typeof buildMockPrisma>;

function buildService(prisma: MockPrisma) {
  return new DashboardService(prisma as unknown as PrismaService);
}

describe('DashboardService', () => {
  let prisma: MockPrisma;
  let service: DashboardService;

  beforeEach(() => {
    prisma = buildMockPrisma();
    service = buildService(prisma);
    jest.clearAllMocks();

    jest.mocked(prisma.appointment.groupBy).mockResolvedValue([]);
    jest.mocked(prisma.appointment.findMany).mockResolvedValue([]);
  });

  it('throws BadRequestException when date format is invalid', async () => {
    await expect(service.getTodayMetrics('24-04-2026')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('requests only active upcoming appointments for the selected day', async () => {
    await service.getTodayMetrics('2026-04-10');

    expect(prisma.appointment.findMany).toHaveBeenCalledTimes(1);
    const [firstCall] = jest.mocked(prisma.appointment.findMany).mock.calls;
    const where = firstCall?.[0]?.where;

    expect(where).toEqual({
      startAt: {
        gte: new Date('2026-04-10T00:00:00.000Z'),
        lte: new Date('2026-04-10T23:59:59.999Z'),
      },
      status: {
        in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED],
      },
    });
  });

  it('aggregates totals by appointment status', async () => {
    jest.mocked(prisma.appointment.groupBy).mockResolvedValue([
      { status: AppointmentStatus.SCHEDULED, _count: { id: 3 } },
      { status: AppointmentStatus.CONFIRMED, _count: { id: 1 } },
      { status: AppointmentStatus.CANCELLED, _count: { id: 2 } },
    ]);

    const result = await service.getTodayMetrics('2026-04-24');

    expect(result.metrics).toEqual({
      total: 6,
      SCHEDULED: 3,
      CONFIRMED: 1,
      COMPLETED: 0,
      CANCELLED: 2,
    });
  });
});
