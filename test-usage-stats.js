import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sfrnqtooaixmzdcdebgo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmcm5xdG9vYWl4bXpkY2RlYmdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxMTk0NzYsImV4cCI6MjA5NzY5NTQ3Nn0.n5GFVhJ-gTYH12s2aRSJDYM5rT0MyyKZXbisg3V-TcA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Querying usage_stats table...');
  const { data, error } = await supabase
    .from('usage_stats')
    .select('*');
    
  if (error) {
    console.error('ERROR QUERYING USAGE_STATS:', error);
  } else {
    console.log('USAGE_STATS DATA:', data);
  }
}

run();
