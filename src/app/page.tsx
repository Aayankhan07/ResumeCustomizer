import { createAnonClient } from '../lib/supabase/server';
import LandingClient from '../components/landing/LandingClient';

export const revalidate = 60; // Revalidate stats every 60 seconds (ISR)

export default async function LandingPage() {
  let stats = { total_transformations: 12400, total_users: 3800 };
  try {
    const supabase = createAnonClient();
    const { data } = await supabase
      .from('usage_stats')
      .select('total_transformations, total_users')
      .maybeSingle();
    if (data && data.total_transformations > 0) {
      stats = data;
    }
  } catch (err) {
    console.error('Failed to load global stats on server:', err);
  }

  return <LandingClient initialStats={stats} />;
}
