import { createClient } from '@supabase/supabase-js';

// ============================================================================
// IMPORTANT: SUPABASE CONFIGURATION
// ============================================================================
// You must replace the placeholder values below with your actual Supabase
// project URL and anonymous key for authentication to work.
//
// 1. Go to your Supabase project dashboard.
// 2. Navigate to 'Project Settings' > 'API'.
// 3. Copy the 'Project URL' and 'Project API keys' (use the 'anon' key).
// ============================================================================
const supabaseUrl = process.env.SUPABASE_URL || 'https://ardtcuqisossmgmmvpnc.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyZHRjdXFpc29zc21nbW12cG5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1NDI1OTgsImV4cCI6MjA3NTExODU5OH0.JGJQsV7Ab3oYPYtTd0v2PqMlKiSAjCJt24Dm_wgJ6QE';

export const isSupabaseConfigured = 
    supabaseUrl !== 'https://ardtcuqisossmgmmvpnc.supabase.co' && 
    supabaseAnonKey !== 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyZHRjdXFpc29zc21nbW12cG5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1NDI1OTgsImV4cCI6MjA3NTExODU5OH0.JGJQsV7Ab3oYPYtTd0v2PqMlKiSAjCJt24Dm_wgJ6QE';

if (!isSupabaseConfigured) {
    console.warn(
        "WARNING: Supabase is using placeholder credentials. " +
        "Please replace them in `lib/supabase.ts` with your actual Supabase project URL and anon key for the application to work correctly."
    );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);