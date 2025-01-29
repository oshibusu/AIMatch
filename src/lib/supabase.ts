import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://wqnbawipmolofzivwixt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxbmJhd2lwbW9sb2Z6aXZ3aXh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU0NjM5MzUsImV4cCI6MjA1MTAzOTkzNX0.1h5Mzd6UEjc5PGyra1kdEu65NcXKLQ7VzEkv8DONInU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
    url: supabaseUrl,
  },
});