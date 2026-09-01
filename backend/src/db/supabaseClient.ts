import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://fmdpxswtcqyfgxgttzfd.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtZHB4c3d0Y3F5Zmd4Z3R0emZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyOTA3NjksImV4cCI6MjEwMzg2Njc2OX0.Gygd2Og7Bq6x_OzdDn38CHbsQzwPlL0JU7Jyup-ioZs';

export const supabase = createClient(supabaseUrl, supabaseKey);
