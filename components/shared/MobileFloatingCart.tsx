"use client";
import { useCart } from "@/contexts/CartContext";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function MobileFloatingCart() {
  const { totalItems, subtotal } = useCart();
  const pathname = usePathname();

  // Hide on cart/checkout pages
  if (pathname === "/cart" || pathname === "/checkout") {
    return null;
  }

  return (
    <Link
      href="/cart"
      className="md:hidden fixed top-1/2 right-0 -translate-y-1/2 z-50 bg-[#135d74] text-white p-2.5 rounded-l-xl shadow-[0_4px_12px_rgba(0,0,0,0.15)] flex flex-col items-center justify-center gap-1 border border-white/10 border-r-0 transition-transform active:scale-95 cursor-pointer"
    >
      <ShoppingCart className="h-5 w-5 mb-0.5" />
      <span className="text-[10px] font-bold whitespace-nowrap leading-none">{totalItems} items</span>
      <div className="bg-black/20 px-2 py-0.5 rounded text-[11px] font-extrabold whitespace-nowrap mt-0.5">
        ৳ {subtotal.toLocaleString("en-IN")}
      </div>
    </Link>
  );
}
