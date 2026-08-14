"use client";
import React from "react";
import { useStoreSettings } from "@/hooks/useStoreSettings";

export function MobileMarquee() {
  const { data: storeSettings, isLoading } = useStoreSettings();

  if (isLoading) return null;

  // Show by default unless explicitly set to "false"
  const isEnabled = storeSettings?.mobile_marquee_enabled !== "false";
  if (!isEnabled) return null;

  const defaultText =
    "Welcome to our store! Enjoy free shipping on orders over 1000 Taka. | Order Your Favourite Club Jersey | Custom Jersey & Sports Equipment Available";
  const rawText = storeSettings?.mobile_marquee_text?.trim() || defaultText;

  // Split multiple messages by '|', newlines, or treat single text as array
  const items = rawText.includes("|")
    ? rawText.split("|").map((s) => s.trim()).filter(Boolean)
    : rawText.includes("\n")
    ? rawText.split("\n").map((s) => s.trim()).filter(Boolean)
    : [rawText];

  return (
    <>
      {/* Spacer to prevent overlapping page footer content */}
      <div className="h-[44px] w-full flex-shrink-0 bg-foreground" />

      {/* Fixed Bottom Marquee Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-[#1a1a2e] text-white py-2.5 overflow-hidden border-t border-white/10 z-40 shadow-lg">
        <div className="w-full relative flex items-center whitespace-nowrap overflow-hidden">
          {/* Continuous scrolling text container */}
          <div className="animate-marquee inline-flex items-center text-[14px] font-semibold tracking-wide">
            {[...Array(4)].map((_, loopIdx) => (
              <React.Fragment key={loopIdx}>
                {items.map((item, itemIdx) => (
                  <span key={itemIdx} className="mx-6 inline-flex items-center gap-3">
                    <span className="text-emerald-400 font-bold">⚽</span>
                    <span>{item}</span>
                  </span>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
