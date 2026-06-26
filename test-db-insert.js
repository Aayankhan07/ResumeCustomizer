import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sfrnqtooaixmzdcdebgo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmcm5xdG9vYWl4bXpkY2RlYmdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxMTk0NzYsImV4cCI6MjA5NzY5NTQ3Nn0.n5GFVhJ-gTYH12s2aRSJDYM5rT0MyyKZXbisg3V-TcA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const email = `test${Date.now()}@gmail.com`;
  const password = 'TestPassword123!';
  
  console.log(`Creating test user: ${email}...`);
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password
  });
  
  if (authError) {
    console.error('Error creating user:', authError);
    return;
  }
  
  const userId = authData.user?.id;
  console.log(`User created. ID: ${userId}`);
  
  console.log('Inserting dummy transformation...');
  const { data, error } = await supabase
    .from('transformations')
    .insert({
      user_id: userId,
      detected_job_title: 'Test ML Engineer',
      detected_company: 'Test Company',
      input_resume_chars: 100,
      input_jd_chars: 100,
      output_json: {
        meta: {
          detected_job_title: 'Test ML Engineer',
          detected_company: 'Test Company',
          match_score: 90,
          keywords_matched: ['python', 'keras'],
          keywords_total: 10
        },
        contact: {
          name: 'Test Candidate',
          email: 'test@example.com',
          phone: '1234567890',
          location: 'Test City'
        },
        summary: 'Test summary',
        skills: {
          technical: ['Python'],
          tools: ['Keras'],
          soft: ['Communication']
        },
        experience: [],
        education: [],
        projects: []
      },
      output_plain_text: 'Test plain text resume content',
      match_score: 90,
      keywords_matched: ['python', 'keras'],
      keywords_total: 10
    })
    .select('id')
    .single();
    
  if (error) {
    console.error('DATABASE INSERT ERROR:', error);
  } else {
    console.log('DATABASE INSERT SUCCESS! Row ID:', data.id);
  }
}

run();
