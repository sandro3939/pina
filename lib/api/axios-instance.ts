import axios, { type AxiosRequestConfig } from 'axios';
import { cognitoService } from '@/lib/services/cognito';
import { API_BASE_URL } from '@/lib/config/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

/** Mutator richiesto da Orval — wrappa apiClient restituendo solo i dati */
export const customInstance = <T>(config: AxiosRequestConfig): Promise<T> => {
  return apiClient(config).then(({ data }) => data);
};

// Inject JWT token on every request
apiClient.interceptors.request.use(async (config) => {
  const token = await cognitoService.getIdToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (process.env.EXPO_PUBLIC_ENV !== 'production') {
    // Dev fallback: nessun token Cognito disponibile, usa x-family-id
    config.headers['x-family-id'] = process.env.EXPO_PUBLIC_DEV_FAMILY_ID ?? 'dev-family';
  }
  return config;
});

// Handle 401 — session expired
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired — Amplify refreshes automatically on next getSession()
      const newToken = await cognitoService.getAccessToken();
      if (newToken && error.config) {
        error.config.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(error.config);
      }
    }
    return Promise.reject(error);
  }
);
