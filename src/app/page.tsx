import { createAnonClient } from '../lib/supabase/server';
import LandingClient from '../components/landing/LandingClient';
import { FAQ_ITEMS } from '../lib/faq';
import { siteUrl } from '../lib/siteUrl';

export const revalidate = 60; // Revalidate stats every 60 seconds (ISR)

/**
 * Structured data, emitted from the server component so it is present in the
 * initial HTML.
 *
 * FAQPage matters twice over here: the accordion unmounts closed answers, so
 * without this the answers appear nowhere in the markup, and it is the format
 * both Google rich results and AI assistants read question-and-answer content
 * from.
 */
function buildJsonLd(base: string) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        '@id': `${base}/#app`,
        name: 'ResumOrph',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        url: base,
        description:
          'Tailor your resume to any job description. ResumOrph rewrites your existing experience to match the role, scores it against the posting, and exports an ATS-ready PDF or DOCX.',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
          description: 'Free plan includes up to 10 resume optimizations per hour.',
        },
      },
      {
        '@type': 'FAQPage',
        '@id': `${base}/#faq`,
        mainEntity: FAQ_ITEMS.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      },
    ],
  };
}

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
