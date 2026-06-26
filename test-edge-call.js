import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sfrnqtooaixmzdcdebgo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmcm5xdG9vYWl4bXpkY2RlYmdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxMTk0NzYsImV4cCI6MjA5NzY5NTQ3Nn0.n5GFVhJ-gTYH12s2aRSJDYM5rT0MyyKZXbisg3V-TcA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const email = 'test1782491136295@gmail.com';
  const password = 'TestPassword123!';
  
  console.log(`Signing in as ${email}...`);
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (authError) {
    console.error('Sign in error:', authError);
    return;
  }
  
  const token = authData.session?.access_token;
  console.log('Sign in success! Token length:', token?.length);
  
  console.log('Calling /transform Edge Function...');
  const response = await fetch(`${supabaseUrl}/functions/v1/transform`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      resume_text: 'Experienced Software Engineer with 5 years of experience in full-stack development, Python, Node.js, and SQL. Built multiple projects using React, Docker, and AWS.',
      job_description_text: 'Looking for a Machine Learning Engineer with strong Python experience, knowledge of TensorFlow and Keras, and building NLP pipelines.'
    })
  });
  
  const result = await response.json();
  console.log('Edge Function Response Status:', response.status);
  console.log('Edge Function Response Body:');
  console.log(JSON.stringify(result, null, 2));
}

run();
