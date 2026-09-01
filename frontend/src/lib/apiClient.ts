import ky from 'ky';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const apiClient = ky.create({
  prefix: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Accept': 'application/json',
  },
});
