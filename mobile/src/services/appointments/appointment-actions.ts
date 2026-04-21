import { api } from '@/lib/api';
import type { Appointment } from '@/types/appointment';

export async function confirmAppointment(id: string) {
  const response = await api.patch<Appointment>(`/appointments/${id}/confirm`);
  return response.data;
}

export async function cancelAppointment(id: string) {
  const response = await api.patch<Appointment>(`/appointments/${id}/cancel`);
  return response.data;
}

export async function completeAppointment(id: string) {
  const response = await api.patch<Appointment>(`/appointments/${id}/complete`);
  return response.data;
}

export async function rescheduleAppointment(id: string, startAt: string) {
  const response = await api.patch<Appointment>(
    `/appointments/${id}/reschedule`,
    { startAt },
  );
  return response.data;
}
