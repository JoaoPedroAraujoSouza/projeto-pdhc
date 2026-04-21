import { api } from '@/lib/api';
import type { Appointment } from '@/types/appointment';

export async function getAppointment(id: string) {
  const response = await api.get<Appointment>(`/appointments/${id}`);
  return response.data;
}
