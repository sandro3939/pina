type Environment = 'development' | 'staging' | 'production';

const defaultEnv: Environment = typeof __DEV__ !== 'undefined' && __DEV__ ? 'development' : 'staging';
const ENV: Environment = (process.env.EXPO_PUBLIC_ENV as Environment) || defaultEnv;

const API_URLS: Record<Environment, string> = {
  development: 'http://localhost:3000',
  staging: 'https://s7sspfmvte.execute-api.eu-south-2.amazonaws.com',
  production: 'https://s7sspfmvte.execute-api.eu-south-2.amazonaws.com',
};

export const API_BASE_URL = API_URLS[ENV];
