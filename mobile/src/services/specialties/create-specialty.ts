import { api } from '@/lib/api';
import type { Specialty } from '@/types/specialty';

type CreateSpecialtyPayload = {
  name: string;
};

export async function createSpecialty(payload: CreateSpecialtyPayload) {
  const response = await api.post<Specialty>('/specialties', payload);
  return response.data;
}
