'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface AccordionItem {
  question: string;
  answer: string;
}

interface AccordionProps {
  items: AccordionItem[];
}

export default function Accordion({ items = [] }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full flex flex-col divide-y divide-slate-100/80">
      {items.map((item, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div key={idx} className="py-4.5 first:pt-0 last:pb-0">
            <button
              onClick={() => toggle(idx)}
              className="w-full flex items-center justify-between text-left font-sans text-[15px] sm:text-base font-semibold text-slate-800 hover:text-blue-650 dark:hover:text-indigo-400 dark:text-white transition-colors focus:outline-none cursor-pointer group"
            >
              <span>{item.question}</span>
              <motion.span
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="text-slate-400 shrink-0 ml-4 p-1.5 bg-slate-50 dark:bg-slate-850 group-hover:bg-blue-50 dark:group-hover:bg-slate-800 group-hover:text-blue-600 rounded-full transition-colors"
              >
                <ChevronDown size={14} className="stroke-[2.5]" />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <p className="pt-3 text-sm text-graphite dark:text-slate-400 leading-relaxed">
                    {item.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
