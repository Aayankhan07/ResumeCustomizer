import React from 'react';
import { Plus } from 'lucide-react';
import { FAQ_ITEMS } from '../../lib/faq';

/**
 * Visible FAQ, from the same source as the FAQPage structured data in
 * app/page.tsx, so the two can never disagree.
 *
 * Native <details> keeps every answer in the HTML (crawlers and assistive
 * technology see it even when closed) and is keyboard-operable with no JS.
 */
export default function IdFaq() {
  return (
    <section
      id="faq"
      className="scroll-mt-28 py-20 md:py-28 px-6 max-w-7xl mx-auto border-t border-slate-100"
    >
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-700">FAQ</p>
          <h2 className="mt-3 text-3xl sm:text-5xl font-medium tracking-tight text-slate-900 leading-tight text-balance">
            Questions, answered
          </h2>
        </div>

        <div className="divide-y divide-slate-200 border-y border-slate-200">
          {FAQ_ITEMS.map((item) => (
            <details key={item.question} className="group py-1">
              <summary className="flex items-center justify-between gap-6 cursor-pointer list-none py-4 text-left text-base sm:text-lg font-medium text-slate-900 hover:text-blue-700 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 [&::-webkit-details-marker]:hidden">
                {item.question}
                <Plus
                  size={20}
                  aria-hidden="true"
                  className="shrink-0 text-slate-500 transition-transform duration-200 group-open:rotate-45"
                />
              </summary>
              <p className="pb-5 pr-10 text-base text-slate-600 leading-relaxed">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
