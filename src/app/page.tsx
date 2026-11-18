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
 *
 * The graph also includes Organization and WebSite so the brand, its social
 * profiles, and the homepage itself are tied together for crawlers and for the
 * sitelinks/search shortcut surface.
 */
function buildJsonLd(base: string) {
  const appUrl = base;
  const appNodeId = `${base}/#app`;
  const faqNodeId = `${base}/#faq`;
  const siteNodeId = `${base}/#website`;
  const orgNodeId = `${base}/#organization`;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': orgNodeId,
        name: 'ResumOrph',
        url: appUrl,
        description:
          'AI resume tailoring for any job description. ResumOrph rewrites your experience to match the role, scores it against the posting, and exports an ATS-ready PDF or DOCX.',
        sameAs: [
          'https://github.com/resumorph',
          'https://linkedin.com/company/resumorph',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': siteNodeId,
        url: appUrl,
        name: 'ResumOrph',
        description:
          'Tailor your resume to any job description. ResumOrph rewrites your existing experience to match the role, scores it against the posting, and exports an ATS-ready PDF or DOCX.',
        publisher: { '@id': orgNodeId },
        potentialAction: {
          '@type': 'SearchAction',
          target: { 
            '@type': 'EntryPoint',
            urlTemplate: `${appUrl}/?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'SoftwareApplication',
        '@id': appNodeId,
        name: 'ResumOrph',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        url: appUrl,
        description:
          'Tailor your resume to any job description. ResumOrph rewrites your existing experience to match the role, scores it against the posting, and exports an ATS-ready PDF or DOCX.',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
          description: 'Free tier includes up to 10 resume optimizations per hour.',
        },
        publisher: { '@id': orgNodeId },
      },
      {
        '@type': 'FAQPage',
        '@id': faqNodeId,
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd(siteUrl())) }}
      />
      <LandingClient initialStats={stats} />
    </>
  );
}
