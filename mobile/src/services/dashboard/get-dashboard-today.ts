import { api } from '@/lib/api';
import { DashboardTodayResponse } from '@/types/dashboard';

export async function getDashboardToday(): Promise<DashboardTodayResponse> {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateString = `${year}-${month}-${day}`;

  const response = await api.get<DashboardTodayResponse>(
    `/api/dashboard/today?date=${dateString}`,
  );
  return response.data;
}
