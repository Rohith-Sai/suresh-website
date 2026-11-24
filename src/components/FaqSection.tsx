import { ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { FAQ_ITEMS } from '../data/siteData';

export function FaqSection() {
  const [openId, setOpenId] = useState<string | null>(FAQ_ITEMS[0].id);

  const toggleItem = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="faq" className="border-b border-slate-200/80 bg-[#F7F7F7] py-24 sm:py-32">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="font-mono text-xs font-medium tracking-[0.18em] text-[#C81922] uppercase">
            Questions &amp; Clarity
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#1A2232] sm:text-5xl">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="mt-12 divide-y divide-slate-300/80 border-y border-slate-300/80">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openId === item.id;
            const panelId = `${item.id}-panel`;
            return (
              <div key={item.id} className="py-1">
                <h3>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggleItem(item.id)}
                    className="group flex min-h-[64px] w-full items-center justify-between gap-4 py-4 text-left transition-colors"
                  >
                    <span className="flex items-baseline gap-4">
                      <span className="font-mono text-xs text-slate-500 tabular-nums">
                        0{idx + 1}
                      </span>
                      <span className="text-base font-bold text-[#1A2232] transition-colors group-hover:text-[#C81922] sm:text-lg">
                        {item.question}
                      </span>
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-slate-600 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[#C81922]' : 'group-hover:text-[#C81922]'
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                </h3>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={panelId}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="pb-6 pl-8 text-sm leading-relaxed text-slate-600 sm:text-base">
                        {item.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
