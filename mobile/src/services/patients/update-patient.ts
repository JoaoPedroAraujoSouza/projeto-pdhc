import { api } from '@/lib/api';
import type { Patient } from '@/types/patient';

type UpdatePatientPayload = {
  fullName?: string;
  cpf?: string;
  birthDate?: string;
  phone?: string;
};

export async function updatePatient(id: string, payload: UpdatePatientPayload) {
  const response = await api.patch<Patient>(`/patients/${id}`, payload);
  return response.data;
}
