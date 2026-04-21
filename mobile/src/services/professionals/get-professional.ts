import { api } from '@/lib/api';
import type { Professional } from '@/types/professional';

export async function getProfessional(id: string) {
  const response = await api.get<Professional>(`/professionals/${id}`);
  return response.data;
}
