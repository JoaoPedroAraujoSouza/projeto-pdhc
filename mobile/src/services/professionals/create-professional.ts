import { api } from '@/lib/api';
import type { Professional } from '@/types/professional';

type CreateProfessionalPayload = {
  fullName: string;
  specialtyId: string;
};

export async function createProfessional(payload: CreateProfessionalPayload) {
  const response = await api.post<Professional>('/professionals', payload);
  return response.data;
}
