import { api } from '@/lib/api';

type MeResponse = {
  id: string;
  email: string;
};

export async function getMe() {
  const response = await api.get<MeResponse>('/auth/me');
  return response.data;
}
