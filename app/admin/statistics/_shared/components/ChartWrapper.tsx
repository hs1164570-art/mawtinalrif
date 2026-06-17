'use client';

import { useEffect, useRef, useState } from 'react';
import { Drawer } from 'vaul';
import { Maximize2, X } from 'lucide-react';
import type { ChartWrapperProps } from '../types';

export default function ChartWrapper({
  title,
  description,
  children,
  className = '',
  minHeight = 300,
}: ChartWrapperProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Register hotkey when wrapper is in focus region
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) setIsExpanded(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isExpanded]);

  const Header = () => (
    <div className="flex items-start justify-between gap-3 mb-4">
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-[#3D2B1F] leading-snug truncate">{title}</h3>
        {description && (
          <p className="text-xs text-[#A89585] mt-0.5 leading-relaxed">{description}</p>
        )}
      </div>
      <button
        onClick={() => setIsExpanded(true)}
        aria-label={`توسيع شارت ${title}`}
        title="Focus Mode"
        className="flex-shrink-0 p-1.5 rounded-lg text-[#A89585] hover:bg-[#F5EFE6]
                   hover:text-[#B89A5A] transition-colors focus-visible:outline-none
                   focus-visible:ring-2 focus-visible:ring-[#B89A5A]"
      >
        <Maximize2 size={14} />
      </button>
    </div>
  );

  return (
    <>
      {/* ── Inline card ── */}
      <div
        ref={wrapperRef}
        className={`
          relative bg-white rounded-2xl border border-[#EDE5D8] p-5 shadow-sm
          hover:shadow-md transition-shadow duration-200 min-w-0 ${className}
        `}
      >
        <Header />
        <div style={{ minHeight }}>{children}</div>
      </div>

      {/* ── Expanded Drawer (vaul) ── */}
      <Drawer.Root
        open={isExpanded}
        onOpenChange={setIsExpanded}
        direction="bottom"
      >
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
          <Drawer.Content
            className="fixed inset-0 z-50 flex flex-col bg-white rounded-t-3xl
                       md:rounded-2xl md:inset-4 md:h-auto overflow-hidden"
            dir="rtl"
            aria-label={`${title} - وضع التركيز`}
          >
            {/* Handle (mobile) */}
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-[#EDE5D8] flex-shrink-0">
              <div className="min-w-0 flex-1">
                <Drawer.Title className="text-base font-semibold text-[#3D2B1F] truncate">
                  {title}
                </Drawer.Title>
                {description && (
                  <p className="text-xs text-[#A89585] mt-0.5">{description}</p>
                )}
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                aria-label="إغلاق وضع التركيز"
                className="flex-shrink-0 p-2 rounded-xl text-[#A89585] hover:bg-[#F5EFE6]
                           hover:text-[#3D2B1F] transition-colors ml-2 mr-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* Chart — full height */}
            <div className="flex-1 overflow-auto p-5" style={{ minHeight: 400 }}>
              {children}
            </div>

            {/* Keyboard hint */}
            <div className="px-5 py-2 border-t border-[#EDE5D8] flex-shrink-0 hidden md:flex items-center gap-1.5">
              <kbd className="text-[10px] bg-[#F5EFE6] text-[#A89585] px-1.5 py-0.5 rounded border border-[#EDE5D8] font-mono">
                Esc
              </kbd>
              <span className="text-[10px] text-[#A89585]">للإغلاق</span>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  );
}
