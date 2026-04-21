import { api } from '@/lib/api';
import type { Patient } from '@/types/patient';

type CreatePatientPayload = {
  fullName: string;
  cpf: string;
  birthDate: string;
  phone: string;
};

export async function createPatient(payload: CreatePatientPayload) {
  const response = await api.post<Patient>('/patients', payload);
  return response.data;
}
