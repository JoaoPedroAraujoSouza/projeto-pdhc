import { api } from '@/lib/api';

type MeResponse = {
  id: string;
  email: string;
  role?: string;
  userMetadata?: Record<string, unknown>;
};

export async function getMe() {
  const response = await api.get<MeResponse>('/auth/me');
  return response.data;
}
