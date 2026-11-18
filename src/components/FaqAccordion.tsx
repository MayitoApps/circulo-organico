"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FaqItem {
  question: string;
  answer: string;
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-[#E4DDD1] overflow-hidden rounded-3xl border border-[#E4DDD1] bg-white shadow-xs">
      {items.map((item, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div
            key={item.question}
            className="px-6 py-5 transition-colors duration-200 hover:bg-[#FAF8F5]/75"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : idx)}
              aria-expanded={isOpen}
              className="group flex w-full items-center justify-between gap-4 text-left"
            >
              <span className="font-editorial text-xl font-medium text-[#1B3B2B] transition-colors group-hover:text-[#9E6B4B]">
                {item.question}
              </span>
              <ChevronDown
                className={cn(
                  "h-5 w-5 shrink-0 text-[#9E6B4B] transition-transform duration-300 ease-out",
                  isOpen && "rotate-180"
                )}
              />
            </button>
            <div
              className={cn(
                "grid transition-all duration-300 ease-out",
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              )}
            >
              <div className="overflow-hidden">
                <p className="pt-3 text-sm leading-relaxed text-[#4C524E]">{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
