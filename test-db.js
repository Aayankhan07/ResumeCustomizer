import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sfrnqtooaixmzdcdebgo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmcm5xdG9vYWl4bXpkY2RlYmdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxMTk0NzYsImV4cCI6MjA5NzY5NTQ3Nn0.n5GFVhJ-gTYH12s2aRSJDYM5rT0MyyKZXbisg3V-TcA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Fetching transformations...');
  const { data, error, count } = await supabase
    .from('transformations')
    .select('*', { count: 'exact' });
  
  if (error) {
    console.error('Error fetching transformations:', error);
  } else {
    console.log(`Found ${count} transformations:`);
    console.log(JSON.stringify(data, null, 2));
  }
}

run();
