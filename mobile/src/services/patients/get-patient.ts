import { api } from '@/lib/api';
import type { Patient } from '@/types/patient';

export async function getPatient(id: string) {
  const response = await api.get<Patient>(`/patients/${id}`);
  return response.data;
}
