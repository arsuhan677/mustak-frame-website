"use client";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { MobileBottomNav } from "./MobileBottomNav";
import { MobileFloatingCart } from "./MobileFloatingCart";

const Footer = dynamic(() => import("./Footer").then((m) => m.Footer));
const WhatsAppBanner = dynamic(() => import("@/components/main/WhatsAppBanner").then((m) => m.WhatsAppBanner));
const WhatsAppFloatingButton = dynamic(() => import("@/components/main/WhatsAppFloatingButton").then((m) => m.WhatsAppFloatingButton));
const MobileMarquee = dynamic(() => import("@/components/main/MobileMarquee").then((m) => m.MobileMarquee));

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const pathname = usePathname();
  const isAdmin =
    pathname?.startsWith("/admin") || pathname?.startsWith("/login");
    
  const showBanner = 
    pathname === "/" || 
    pathname === "/shop" || 
    pathname?.startsWith("/product/");

  return (
    <div className="min-h-screen flex flex-col">
      {!isAdmin && <Header />}
      <main className="flex-1">{children}</main>
      {!isAdmin && showBanner && <WhatsAppBanner />}
      {!isAdmin && <WhatsAppFloatingButton />}
      {!isAdmin && <Footer />}
      {!isAdmin && <MobileMarquee />}
      {!isAdmin && <MobileBottomNav />}
      {!isAdmin && <MobileFloatingCart />}
    </div>
  );
}
// Force Next.js re-evaluation of layout after removing TopBar
