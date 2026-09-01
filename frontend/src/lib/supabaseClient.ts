import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://fmdpxswtcqyfgxgttzfd.supabase.co';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtZHB4c3d0Y3F5Zmd4Z3R0emZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyOTA3NjksImV4cCI6MjEwMzg2Njc2OX0.Gygd2Og7Bq6x_OzdDn38CHbsQzwPlL0JU7Jyup-ioZs';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
