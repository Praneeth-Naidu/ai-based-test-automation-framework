import 'dotenv/config';

/**
 * Single source of truth for environment-driven config.
 * Never read process.env directly outside this file — that's how
 * frameworks end up with the same var spelled three different ways.
 */
function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required env var: ${name}. Did you copy .env.example to .env?`);
  }
  return value;
}

export const config = {
  conduit: {
    baseUrl: required('CONDUIT_BASE_URL', 'http://localhost:8092'),
    apiUrl: required('CONDUIT_API_URL', 'http://localhost:3000/api'),
  },
  booker: {
    apiUrl: required('BOOKER_API_URL', 'https://restful-booker.herokuapp.com'),
    username: required('BOOKER_USERNAME', 'admin'),
    password: required('BOOKER_PASSWORD', 'password123'),
  },
  headless: (process.env.HEADLESS ?? 'true') === 'true',
};
