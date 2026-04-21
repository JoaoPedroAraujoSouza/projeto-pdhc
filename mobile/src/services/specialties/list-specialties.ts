import { api } from '@/lib/api';
import type { Specialty } from '@/types/specialty';

export async function listSpecialties() {
  const response = await api.get<Specialty[]>('/specialties');
  return response.data;
}
