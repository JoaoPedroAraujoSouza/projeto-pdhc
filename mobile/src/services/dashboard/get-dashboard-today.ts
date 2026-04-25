import { api } from '@/lib/api';
import { DashboardTodayResponse } from '@/types/dashboard';

// IANA timezone used for horário de Brasília (BRT/BRST).
// "America/Brasilia" is not supported in modern Intl implementations.
const BRASILIA_TIME_ZONE = 'America/Sao_Paulo';

function getTodayInBrasiliaTimezone(): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: BRASILIA_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return formatter.format(new Date());
}

export async function getDashboardToday(): Promise<DashboardTodayResponse> {
  const dateString = getTodayInBrasiliaTimezone();

  const response = await api.get<DashboardTodayResponse>(
    `/dashboard/today?date=${dateString}`,
  );
  return response.data;
}
