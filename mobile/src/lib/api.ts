import axios from 'axios';
import { supabase } from '@/lib/supabase';

const apiBaseUrl = buildApiBaseUrl(process.env.EXPO_PUBLIC_API_URL);

const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10000,
});

function buildApiBaseUrl(baseUrl?: string) {
  if (!baseUrl) {
    return undefined;
  }

  const normalizedBaseUrl = baseUrl.trim().replace(/\/+$/, '');

  if (normalizedBaseUrl.endsWith('/api')) {
    return normalizedBaseUrl;
  }

  return `${normalizedBaseUrl}/api`;
}

api.interceptors.request.use(
  async (config) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const token = session?.access_token;

    config.headers = config.headers ?? {};

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const responseMessage =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      'Não foi possível concluir a requisição.';

    const normalizedMessage = Array.isArray(responseMessage)
      ? responseMessage.join(', ')
      : responseMessage;

    return Promise.reject(new Error(normalizedMessage));
  },
);

export { api };
