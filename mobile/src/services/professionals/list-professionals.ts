import { api } from '@/lib/api';
import type { Professional } from '@/types/professional';

export async function listProfessionals() {
  const response = await api.get<Professional[]>('/professionals');
  return response.data;
}
