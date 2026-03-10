type Environment = 'development' | 'staging' | 'production';

const ENV: Environment = (process.env.EXPO_PUBLIC_ENV as Environment) || 'development';

const API_URLS: Record<Environment, string> = {
  development: 'http://localhost:3000',
  staging: 'https://api-staging.pina.app',
  production: 'https://api.pina.app',
};

export const API_BASE_URL = API_URLS[ENV];
