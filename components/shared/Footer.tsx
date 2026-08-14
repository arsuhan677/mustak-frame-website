"use client";

import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import {
  ChevronRight,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";

export function Footer() {
  const { t } = useSiteSettings();
  const { data: storeSettings } = useStoreSettings();

  const footerLinks = {
    shop: [
      { name: t("nav.shop"), href: "/shop" },
      { name: t("home.newArrivals") || "New Arrivals", href: "/shop?filter=new" },
      { name: t("home.bestSellers") || "Best Sellers", href: "/shop?filter=bestsellers" },
      { name: "Featured Products", href: "/shop?filter=featured" },
      { name: t("product.sale") || "On Sale", href: "/shop?filter=sale" },
    ],
    company: [
      { name: t("footer.aboutUs") || "About Us", href: "/about" },
      { name: t("nav.contact") || "Contact Us", href: "/contact" },
      { name: "Track Your Order", href: "/track-order" },
      { name: t("nav.faq") || "FAQ", href: "/faq" },
    ],
  };

  // Build social links dynamically from database settings
  const socialLinks = [];
  if (storeSettings?.facebook_url) {
    socialLinks.push({
      name: "Facebook",
      href: storeSettings.facebook_url,
      icon: FaFacebook,
    });
  }
  if (storeSettings?.instagram_url) {
    socialLinks.push({
      name: "Instagram",
      href: storeSettings.instagram_url,
      icon: FaInstagram,
    });
  }
  if (storeSettings?.twitter_url) {
    socialLinks.push({
      name: "Twitter",
      href: storeSettings.twitter_url,
      icon: FaTwitter,
    });
  }
  if (storeSettings?.youtube_url) {
    socialLinks.push({
      name: "YouTube",
      href: storeSettings.youtube_url,
      icon: FaYoutube,
    });
  }

  // Fallback if no social links configured in admin
  if (socialLinks.length === 0) {
    socialLinks.push(
      { name: "Facebook", href: "#", icon: FaFacebook },
      { name: "Instagram", href: "#", icon: FaInstagram },
    );
  }

  const storeName = storeSettings?.store_name || "ONLINE STORE";
  const storeTagline =
    storeSettings?.store_tagline ||
    "Your premium destination for authentic sports gear, apparel, and accessories.";
  const storePhone = storeSettings?.store_phone || "";
  const storeEmail = storeSettings?.store_email || "";
  const storeAddress = storeSettings?.store_address || "";
  const storeCity = storeSettings?.store_city || "";
  const footerText = storeSettings?.footer_text || "";
  const whatsappNumber = storeSettings?.whatsapp_number || "";

  const fullAddress = [storeAddress, storeCity].filter(Boolean).join(", ");

  return (
    <footer className="bg-foreground text-background border-t border-border/20 pt-12 pb-10 md:pb-8">
      <div className="container-shop">
        {/* Main Footer Columns */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 pb-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1 lg:col-span-1 space-y-4">
            <Link href="/" className="inline-block">
              {storeSettings?.store_logo ? (
                <Image
                  src={storeSettings?.store_logo}
                  alt={storeName}
                  height={48}
                  width={180}
                  className="h-12 w-auto object-contain rounded-xl"
                  priority
                />
              ) : (
                <span className="text-2xl font-black tracking-tight text-background">
                  {storeName}
                </span>
              )}
            </Link>

            <p className="text-xs md:text-sm text-background/70 leading-relaxed max-w-sm">
              {storeTagline}
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-2.5 pt-2">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-background/10 text-background flex items-center justify-center hover:bg-accent hover:text-accent-foreground hover:scale-110 transition-all cursor-pointer"
                  aria-label={social.name}
                  title={social.name}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
              {whatsappNumber && (
                <a
                  href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center hover:bg-emerald-500 hover:text-white hover:scale-110 transition-all cursor-pointer"
                  aria-label="WhatsApp"
                  title="WhatsApp"
                >
                  <MessageCircle className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="col-span-1 md:col-span-1 lg:col-span-1 space-y-4">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-background flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent inline-block" />
              <span>Explore Shop</span>
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs md:text-sm text-background/70 hover:text-accent hover:translate-x-1.5 transition-all flex items-center gap-1.5 group"
                  >
                    <ChevronRight className="h-3 w-3 text-background/40 group-hover:text-accent transition-colors" />
                    <span>{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Customer Care */}
          <div className="col-span-1 md:col-span-1 lg:col-span-1 space-y-4">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-background flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent inline-block" />
              <span>Customer Care</span>
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs md:text-sm text-background/70 hover:text-accent hover:translate-x-1.5 transition-all flex items-center gap-1.5 group"
                  >
                    <ChevronRight className="h-3 w-3 text-background/40 group-hover:text-accent transition-colors" />
                    <span>{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact & Address */}
          <div className="col-span-2 md:col-span-1 lg:col-span-1 space-y-4">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-background flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent inline-block" />
              <span>Contact Us</span>
            </h3>
            <div className="space-y-3 text-xs md:text-sm text-background/70">
              {fullAddress && (
                <div className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{fullAddress}</span>
                </div>
              )}

              {storePhone && (
                <a
                  href={`tel:${storePhone}`}
                  className="flex items-center gap-2.5 hover:text-accent transition-colors block"
                >
                  <Phone className="h-4 w-4 text-accent shrink-0" />
                  <span className="font-medium">{storePhone}</span>
                </a>
              )}

              {storeEmail && (
                <a
                  href={`mailto:${storeEmail}`}
                  className="flex items-center gap-2.5 hover:text-accent transition-colors block"
                >
                  <Mail className="h-4 w-4 text-accent shrink-0" />
                  <span className="truncate">{storeEmail}</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom copyright and legal bar */}
        <div className="pt-8 border-t border-background/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-background/60 text-center md:text-left">
            {footerText ||
              `© ${new Date().getFullYear()} ${storeName}. All rights reserved.`}
          </p>

          {/* Legal Links & Developer */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-4 md:gap-6">
            <Link
              href="/privacy"
              className="text-xs text-background/60 hover:text-background transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-xs text-background/60 hover:text-background transition-colors"
            >
              Terms of Service
            </Link>
            <div className="hidden md:block w-px h-3 bg-background/20"></div>
            <a
              href="https://softzeniqit.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-background/60 hover:text-accent transition-colors"
            >
              Developed by <strong className="font-semibold text-background">Softzeniq IT</strong>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
