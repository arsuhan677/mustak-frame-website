"use client";

import { useStoreSettings } from "@/hooks/useStoreSettings";
import { MessageCircle } from "lucide-react";
import { useState } from "react";

export function WhatsAppFloatingButton() {
  const { data: storeSettings, isLoading } = useStoreSettings();
  const [isHovered, setIsHovered] = useState(false);

  // Default to enabled if not explicitly set to "false"
  const isEnabled = storeSettings?.whatsapp_float_enabled !== "false";

  if (isLoading || !isEnabled) return null;

  const number =
    storeSettings?.whatsapp_number || storeSettings?.whatsapp_banner_number || "";
  const cleanNumber = number.replace(/[^0-9]/g, "");

  if (!cleanNumber) return null;

  const defaultMsg = "আসসালামু আলাইকুম! আমি কাস্টম জার্সি তৈরি করতে চাই। বিস্তারিত ও প্রাইস জানাবেন প্লিজ।";
  const autoMessage = defaultMsg;
  const waUrl = `https://wa.me/${cleanNumber}${autoMessage ? `?text=${encodeURIComponent(autoMessage)}` : ""}`;

  return (
    <div className="fixed bottom-[85px] md:bottom-8 right-4 md:right-8 z-[180] flex items-center gap-2 group">
      {/* Tooltip text pill */}
      <span
        className={`px-3 py-1.5 bg-gray-900/90 text-white text-xs font-semibold rounded-full shadow-lg backdrop-blur-sm transition-all duration-300 pointer-events-none ${
          isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2 hidden sm:inline-block"
        }`}
      >
        Chat on WhatsApp
      </span>

      {/* Floating Button */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label="Chat on WhatsApp"
        className="relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white shadow-xl hover:shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 border-2 border-white/20"
      >
        {/* Pulsing ring animation */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30 pointer-events-none" />

        <MessageCircle className="w-7 h-7 relative z-10 drop-shadow-md" />
      </a>
    </div>
  );
}
