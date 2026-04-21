import { Appointment } from './appointment';

export interface DashboardMetrics {
  total: number;
  SCHEDULED: number;
  CONFIRMED: number;
  COMPLETED: number;
  CANCELLED: number;
}

export interface DashboardTodayResponse {
  metrics: DashboardMetrics;
  upcomingAppointments: Appointment[];
}
