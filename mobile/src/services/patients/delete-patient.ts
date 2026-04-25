import { api } from '@/lib/api';

export async function deletePatient(id: string) {
  await api.delete(`/patients/${id}`);
}
