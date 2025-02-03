import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://wqnbawipmolofzivwixt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxbmJhd2lwbW9sb2Z6aXZ3aXh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU0NjM5MzUsImV4cCI6MjA1MTAzOTkzNX0.1h5Mzd6UEjc5PGyra1kdEu65NcXKLQ7VzEkv8DONInU';
const supabaseRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxbmJhd2lwbW9sb2Z6aXZ3aXh0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTQ2MzkzNSwiZXhwIjoyMDUxMDM5OTM1fQ.WZiMuXWTlEKS2kgKPfSvfjACA74aWoMHndaZLf9LmC0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'implicit',
    url: supabaseUrl,
  },
  db: {
    schema: 'public'
  },
});

// 接続状態の確認
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Supabase auth state changed:', event, session?.user?.id);
});

// データベース接続テスト
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }
    
    console.log('Supabase connection test successful:', data);
    return true;
  } catch (error) {
    console.error('Supabase connection test error:', error);
    return false;
  }
};