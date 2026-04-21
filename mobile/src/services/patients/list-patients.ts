import { api } from '@/lib/api';
import type { Patient } from '@/types/patient';

export async function listPatients() {
  const response = await api.get<Patient[]>('/patients');
  return response.data;
}
