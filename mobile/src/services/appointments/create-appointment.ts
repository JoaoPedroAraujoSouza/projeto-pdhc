import { api } from '@/lib/api';
import type { Appointment } from '@/types/appointment';

export type CreateAppointmentPayload = {
  patientId: string;
  professionalId: string;
  specialtyId: string;
  startAt: string;
  notes?: string;
};

export async function createAppointment(payload: CreateAppointmentPayload) {
  const response = await api.post<Appointment>('/appointments', payload);
  return response.data;
}
