import { api } from '@/lib/api';
import type { Appointment, AppointmentStatus } from '@/types/appointment';

export type ListAppointmentsParams = {
  date?: string;
  status?: AppointmentStatus;
  professionalId?: string;
  specialtyId?: string;
};

export async function listAppointments(params?: ListAppointmentsParams) {
  const response = await api.get<Appointment[]>('/appointments', { params });
  return response.data;
}
