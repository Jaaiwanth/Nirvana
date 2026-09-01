import ky from 'ky';
import { supabase } from './supabaseClient';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const apiClient = ky.create({
  prefix: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Accept': 'application/json',
  },
  hooks: {
    beforeRequest: [
      async ({ request }) => {
        try {
          const { data } = await supabase.auth.getSession();
          const token = data.session?.access_token;
          if (token) {
            request.headers.set('Authorization', `Bearer ${token}`);
          }
        } catch (err) {
          console.warn('[API Client] Could not attach Supabase auth token:', err);
        }
      },
    ],
  },
});
