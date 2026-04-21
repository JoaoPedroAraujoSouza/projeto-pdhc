import { api } from '@/lib/api';
import type { Professional } from '@/types/professional';

type UpdateProfessionalPayload = {
  fullName?: string;
  specialtyId?: string;
};

export async function updateProfessional(
  id: string,
  payload: UpdateProfessionalPayload,
) {
  const response = await api.patch<Professional>(
    `/professionals/${id}`,
    payload,
  );
  return response.data;
}
