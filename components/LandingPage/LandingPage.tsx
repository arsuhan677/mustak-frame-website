"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { useAuth } from "@/hooks/useAuth";
import { useLandingPage } from "@/hooks/useLandingPages";
import { useCreateOrder } from "@/hooks/useOrders";
import { usePaymentMethods } from "@/hooks/usePaymentMethods";
import { useShippingMethods } from "@/hooks/useShippingMethods";
import { Product, useReviews } from "@/hooks/useShopData";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { useProductVariants } from "@/hooks/useVariants";
import { createClient } from "@/utils/supabase/client";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BadgePercent,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  Flame,
  HelpCircle,
  Lock,
  MapPin,
  MessageCircle,
  Minus,
  Package,
  PackageCheck,
  Phone,
  PhoneCall,
  Plus,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

// Safe image helper to prevent Next.js image domain runtime crashes
function SafeImage({
  src,
  alt,
  className,
  fill,
  width,
  height,
  priority,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
}) {
  const [hasError, setHasError] = useState(false);
  const defaultPlaceholder = "/placeholder.svg";
  const imageSrc = hasError || !src ? defaultPlaceholder : src;

  // Use standard img tag if external host not in remotePatterns or if data URL
  const isExternal =
    typeof imageSrc === "string" &&
    imageSrc.startsWith("http") &&
    !imageSrc.includes("supabase.co") &&
    !imageSrc.includes("unsplash.com") &&
    !imageSrc.includes("steadfast.com.bd");

  if (isExternal) {
    return (
      <img
        src={imageSrc}
        alt={alt}
        className={className}
        onError={() => setHasError(true)}
        loading="lazy"
      />
    );
  }

  return (
    <Image
      src={imageSrc}
      alt={alt}
      width={fill ? undefined : width || 400}
      height={fill ? undefined : height || 400}
      fill={fill}
      priority={priority}
      className={className}
      onError={() => setHasError(true)}
    />
  );
}

// Fetch products by IDs
const useLandingProducts = (ids: string[]) => {
  const supabase = createClient();
  return useQuery({
    queryKey: ["landing_products", ids],
    queryFn: async () => {
      if (!ids.length) return [];
      const { data, error } = await supabase
        .from("products")
        .select("*, category:categories(*)")
        .in("id", ids);
      if (error) throw error;
      const map = new Map((data || []).map((p) => [p.id, p]));
      return ids.map((id) => map.get(id)).filter(Boolean) as Product[];
    },
    enabled: ids.length > 0,
  });
};

export default function LandingPageView({ slug }: { slug?: string }) {
  const router = useRouter();
  const { data: page, isLoading } = useLandingPage(slug || "");
  const { formatCurrency, settings } = useSiteSettings();
  const { data: storeSettings } = useStoreSettings();
  const { user } = useAuth();
  const createOrder = useCreateOrder();
  const { data: shippingMethods = [] } = useShippingMethods(true);
  const { data: paymentMethods = [] } = usePaymentMethods(true);
  const { data: reviews = [] } = useReviews(true);
  const { data: products = [] } = useLandingProducts(page?.product_ids || []);

  // Primary featured product for the landing page
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  // Countdown timer for urgency
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 28, seconds: 45 });
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 4, minutes: 30, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Track if checkout section is visible for mobile bottom order bar
  const [isCheckoutInView, setIsCheckoutInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsCheckoutInView(entry.isIntersecting);
      },
      { threshold: 0.15 }
    );
    const checkoutEl = document.getElementById("lp-checkout");
    if (checkoutEl) observer.observe(checkoutEl);
    return () => observer.disconnect();
  }, [products]);

  // Form states
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    country: settings.default_country_name || "Bangladesh",
    notes: "",
    shippingMethodId: "",
    paymentMethodId: "",
  });
  const [transactionId, setTransactionId] = useState("");

  // Product variants
  const { data: variants = [] } = useProductVariants(selectedProduct?.id || "");
  const selectedVariant = variants.find((v) => v.id === selectedVariantId) || null;

  // Auto-select first product
  useEffect(() => {
    if (products.length > 0 && !selectedProduct) {
      setSelectedProduct(products[0]);
    }
  }, [products, selectedProduct]);

  // Reset variant and active image when product changes
  useEffect(() => {
    if (variants.length > 0) {
      setSelectedVariantId(variants[0].id);
    } else {
      setSelectedVariantId(null);
    }
    setActiveImageIndex(0);
  }, [selectedProduct, variants]);

  // Default shipping
  useEffect(() => {
    if (shippingMethods.length > 0 && !formData.shippingMethodId) {
      setFormData((prev) => ({
        ...prev,
        shippingMethodId: shippingMethods[0].id,
      }));
    }
  }, [shippingMethods, formData.shippingMethodId]);

  // Default payment
  useEffect(() => {
    if (paymentMethods.length > 0 && !formData.paymentMethodId) {
      setFormData((prev) => ({
        ...prev,
        paymentMethodId: paymentMethods[0].id,
      }));
    }
  }, [paymentMethods, formData.paymentMethodId]);

  const selectedShipping = shippingMethods.find(
    (m) => m.id === formData.shippingMethodId,
  );
  const shippingCost = selectedShipping?.base_rate || 0;

  // Calculate pricing
  const basePrice = selectedProduct
    ? (selectedProduct.sale_price ?? selectedProduct.price)
    : 0;
  const effectivePrice =
    selectedVariant?.variant_sale_price ??
    selectedVariant?.variant_price ??
    basePrice;

  const originalPrice = selectedProduct?.price || 0;
  const hasDiscount =
    selectedProduct?.sale_price && selectedProduct.sale_price < selectedProduct.price;
  const discountPercent = hasDiscount
    ? Math.round(
        ((selectedProduct!.price - (selectedProduct!.sale_price ?? selectedProduct!.price)) /
          selectedProduct!.price) *
          100,
      )
    : 0;
  const savingsPerItem = hasDiscount ? selectedProduct!.price - (selectedProduct!.sale_price ?? selectedProduct!.price) : 0;

  const subtotal = effectivePrice * quantity;
  const total = subtotal + shippingCost;

  const selectedPayment = paymentMethods.find(
    (m) => m.id === formData.paymentMethodId,
  );
  const hasPartial = selectedPayment?.allow_partial_delivery_payment || false;
  let advanceAmount = 0;
  let dueOnDelivery = total;
  if (hasPartial && selectedPayment) {
    if (selectedPayment.partial_type === "delivery_charge")
      advanceAmount = shippingCost;
    else if (selectedPayment.partial_type === "fixed_amount")
      advanceAmount = Math.min(
        selectedPayment.fixed_partial_amount || 0,
        total,
      );
    dueOnDelivery = total - advanceAmount;
  }
  const requiresTrxId = selectedPayment?.require_transaction_id || false;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const scrollToCheckout = () => {
    const el = document.getElementById("lp-checkout");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) {
      toast.error("অনুগ্রহ করে একটি প্রোডাক্ট নির্বাচন করুন");
      return;
    }
    if (!formData.fullName.trim()) {
      toast.error("আপনার সম্পূর্ণ নাম প্রদান করুন");
      return;
    }
    if (!formData.phone.trim()) {
      toast.error("আপনার মোবাইল নাম্বার প্রদান করুন");
      return;
    }
    if (formData.phone.trim().length < 10) {
      toast.error("অনুগ্রহ করে সঠিক মোবাইল নাম্বার লিখুন (যেমন: 017xxxxxxxx)");
      return;
    }
    if (!formData.address.trim()) {
      toast.error("আপনার সম্পূর্ণ ডেলিভারি ঠিকানা লিখুন");
      return;
    }
    if (!formData.city.trim()) {
      toast.error("আপনার জেলা / সিটি নাম প্রদান করুন");
      return;
    }
    if (requiresTrxId && !transactionId.trim()) {
      toast.error("পেমেন্ট ট্রানজেকশন আইডি (Transaction ID) প্রয়োজন");
      return;
    }

    const orderNumber = `ORD-${Date.now().toString().slice(-8)}`;
    const partialSnapshot =
      hasPartial && selectedPayment
        ? {
            partial_type: selectedPayment.partial_type,
            fixed_partial_amount: selectedPayment.fixed_partial_amount,
            advance_amount: advanceAmount,
            due_on_delivery: dueOnDelivery,
          }
        : null;

    try {
      await createOrder.mutateAsync({
        order: {
          order_number: orderNumber,
          user_id: user?.id || null,
          customer_name: formData.fullName.trim(),
          customer_phone: formData.phone.trim(),
          customer_email: formData.email.trim() || null,
          shipping_address: formData.address.trim(),
          shipping_city: formData.city.trim(),
          shipping_method: selectedShipping?.name || "Standard Delivery",
          shipping_cost: shippingCost,
          payment_method: selectedPayment?.code || "cod",
          subtotal,
          total,
          status: "pending",
          notes: formData.notes.trim() || null,
          payment_method_id: selectedPayment?.id || null,
          payment_method_name: selectedPayment?.name || "Cash on Delivery",
          payment_status: hasPartial ? "partial_paid" : "unpaid",
          paid_amount: advanceAmount,
          due_amount: dueOnDelivery,
          transaction_id: transactionId.trim() || null,
          partial_rule_snapshot: partialSnapshot,
        },
        items: [
          {
            product_id: selectedProduct.id,
            product_name: selectedProduct.name,
            product_image: selectedProduct.images?.[0] || "",
            quantity,
            price: effectivePrice,
            variant_id: selectedVariant?.id || null,
            variant_info: selectedVariant
              ? {
                  size: selectedVariant.size,
                  color: selectedVariant.color,
                  fabric: selectedVariant.fabric,
                }
              : null,
          },
        ],
      });
      router.push(`/order-success?orderId=${orderNumber}`);
    } catch (error: any) {
      toast.error(error?.message || "অর্ডার প্রক্রিয়াকরণে সমস্যা হয়েছে, আবার চেষ্টা করুন");
    }
  };

  const storePhone = storeSettings?.store_phone || "01700000000";
  const storeWhatsApp = storeSettings?.whatsapp_number || storePhone;
  const cleanPhone = storePhone.replace(/[^0-9+]/g, "");
  const cleanWhatsApp = storeWhatsApp.replace(/[^0-9]/g, "");
  const storeName = storeSettings?.store_name || "Nijumbd";
  const storeLogo = storeSettings?.store_logo;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 rounded-full border-4 border-accent border-t-transparent animate-spin mb-4" />
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-40" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md bg-card border border-border rounded-2xl p-8 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold mb-2">পেজটি পাওয়া যায়নি</h1>
          <p className="text-muted-foreground text-sm mb-6">
            দুঃখিত, আপনি যে ল্যান্ডিং পেজটি খুঁজছেন তা মুছে ফেলা হয়েছে অথবা লিংকটি ভুল।
          </p>
          <Button onClick={() => router.push("/")} className="btn-accent w-full">
            হোম পেজে যান
          </Button>
        </div>
      </div>
    );
  }

  // Active product images (gallery)
  const productImages = selectedProduct?.images?.length
    ? selectedProduct.images
    : page.hero_image
    ? [page.hero_image]
    : ["/placeholder.svg"];
  const currentImage = productImages[activeImageIndex] || productImages[0];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-accent selection:text-accent-foreground">
      {/* 1. Urgency Announcement Bar with Live Countdown */}
      <div className="bg-gradient-to-r from-red-600 via-amber-600 to-rose-600 text-white text-xs sm:text-sm font-semibold py-2.5 px-3 shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5 text-center">
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-yellow-300 animate-pulse fill-yellow-300" />
            <span>স্পেশাল ধামাকা অফার! সীমিত সময়ের জন্য ক্যাশ অন ডেলিভারি সুবিধা</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-white/20">
              <Clock className="w-3.5 h-3.5 text-yellow-300" />
              <span className="text-[11px] font-mono tracking-wider">
                অফার শেষ হতে: {String(timeLeft.hours).padStart(2, "0")}h :{" "}
                {String(timeLeft.minutes).padStart(2, "0")}m :{" "}
                {String(timeLeft.seconds).padStart(2, "0")}s
              </span>
            </div>
            {cleanPhone && (
              <a
                href={`tel:${cleanPhone}`}
                className="hidden md:inline-flex items-center gap-1 text-white hover:text-yellow-200 transition-colors underline text-xs"
              >
                <Phone className="w-3 h-3" /> কল করুন: {storePhone}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* 2. Sleek Landing Header */}
      <header className="bg-card/95 backdrop-blur-md border-b border-border/80 sticky top-[38px] sm:top-[38px] z-40 transition-all">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            {storeLogo ? (
              <SafeImage
                src={storeLogo}
                alt={storeName}
                width={120}
                height={36}
                className="h-8 sm:h-9 w-auto object-contain"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-accent text-accent-foreground font-black flex items-center justify-center text-lg shadow-sm">
                {storeName.slice(0, 1)}
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-extrabold text-base sm:text-lg tracking-tight leading-none group-hover:text-accent transition-colors">
                {storeName}
              </span>
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500 fill-emerald-500/20" />
                ১০০% ভেরিফাইড শপ
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            {cleanWhatsApp && (
              <a
                href={`https://wa.me/${cleanWhatsApp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all border border-emerald-500/30"
              >
                <MessageCircle className="w-4 h-4 fill-emerald-500 text-emerald-500" />
                <span className="hidden sm:inline">WhatsApp</span>
              </a>
            )}

            <Button
              onClick={scrollToCheckout}
              size="sm"
              className="btn-accent shadow-md shadow-accent/20 text-xs sm:text-sm font-bold px-3.5 sm:px-4 py-2 rounded-xl"
            >
              <ShoppingBag className="w-4 h-4 mr-1.5" />
              অর্ডার করুন
            </Button>
          </div>
        </div>
      </header>

      {/* 3. Product-Centric Hero Section (Single Product Sales Funnel) */}
      <section className="relative overflow-hidden pt-6 pb-12 sm:pt-10 sm:pb-16 bg-gradient-to-b from-secondary/30 via-background to-background">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-accent/10 blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-6xl mx-auto px-4 relative z-10">
          {/* Top Banner Tag */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/30 text-accent font-bold text-xs sm:text-sm mb-3 shadow-xs">
              <Sparkles className="w-4 h-4 fill-accent" />
              <span>{page.hero_title || "প্রিমিয়াম স্পেশাল কালেকশন • ১০০% অরিজিনাল"}</span>
            </div>
            {page.hero_subtitle && (
              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto font-medium">
                {page.hero_subtitle}
              </p>
            )}
          </div>

          {/* 2-Column Product Spotlight */}
          {selectedProduct ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start bg-card/70 backdrop-blur-xs border-2 border-border/80 rounded-3xl p-5 sm:p-8 md:p-10 shadow-xl">
              {/* Left Column: Interactive Product Gallery */}
              <div className="lg:col-span-6 space-y-4">
                {/* Main Image Frame */}
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-secondary/40 border border-border shadow-inner group">
                  <SafeImage
                    src={currentImage}
                    alt={selectedProduct.name}
                    fill
                    priority
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Discount Pill Badge */}
                  {hasDiscount && (
                    <div className="absolute top-3 left-3 z-10">
                      <span className="bg-red-600 text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1">
                        <BadgePercent className="w-4 h-4" /> -{discountPercent}% স্পেশাল ছাড়
                      </span>
                    </div>
                  )}

                  {/* Authenticity Pill Badge */}
                  <div className="absolute bottom-3 right-3 z-10">
                    <span className="bg-black/60 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-lg border border-white/20 flex items-center gap-1 shadow-sm">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> ১০০% আসল পণ্য
                    </span>
                  </div>
                </div>

                {/* Thumbnail Strip */}
                {productImages.length > 1 && (
                  <div className="flex items-center gap-3 overflow-x-auto pb-1">
                    {productImages.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveImageIndex(idx)}
                        className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                          activeImageIndex === idx
                            ? "border-accent ring-2 ring-accent/30 shadow-md scale-102"
                            : "border-border opacity-70 hover:opacity-100"
                        }`}
                      >
                        <SafeImage
                          src={img}
                          alt={`Thumbnail ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* Multiple Products Selector (If Admin Added Multiple Related Styles/Colors) */}
                {products.length > 1 && (
                  <div className="pt-2">
                    <p className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-accent" /> অন্যান্য ভ্যারিয়েন্ট / কালার পছন্দ করুন:
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {products.map((p) => {
                        const isPicked = selectedProduct.id === p.id;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              setSelectedProduct(p);
                              setQuantity(1);
                            }}
                            className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all ${
                              isPicked
                                ? "border-accent bg-accent/10 shadow-xs ring-1 ring-accent"
                                : "border-border bg-card/50 hover:bg-secondary/60"
                            }`}
                          >
                            <div className="w-8 h-8 rounded-lg overflow-hidden bg-secondary shrink-0 relative">
                              <SafeImage
                                src={p.images?.[0]}
                                alt={p.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <span className="text-xs font-semibold truncate text-foreground flex-1">
                              {p.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Product Value Props & Direct Action */}
              <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
                <div>
                  {/* Rating Stars & Stock */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 text-amber-500">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-amber-500" />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-foreground">
                        ৫.০ (১২০০+ রিভিউ)
                      </span>
                    </div>

                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      স্টকে সীমিত সংখ্যক আছে
                    </span>
                  </div>

                  {/* Product Title */}
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground tracking-tight leading-snug mb-3">
                    {selectedProduct.name}
                  </h2>

                  {/* Short Description */}
                  {selectedProduct.short_description && (
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
                      {selectedProduct.short_description}
                    </p>
                  )}

                  {/* Big Pricing Display */}
                  <div className="p-4 rounded-2xl bg-secondary/50 border border-border/80 mb-5">
                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl sm:text-4xl font-black text-accent">
                        {formatCurrency(effectivePrice)}
                      </span>
                      {selectedProduct.sale_price && (
                        <span className="text-lg text-muted-foreground line-through font-semibold">
                          {formatCurrency(originalPrice)}
                        </span>
                      )}
                    </div>
                    {hasDiscount && (
                      <p className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                        <Check className="w-4 h-4 stroke-[3]" />
                        আপনি পাচ্ছেন {formatCurrency(savingsPerItem)} টাকার আকর্ষণীয় ডিসকাউন্ট!
                      </p>
                    )}
                  </div>

                  {/* Key Product Bullet Points */}
                  <div className="space-y-2.5 mb-6 text-xs sm:text-sm">
                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <span className="font-medium text-foreground">
                        <strong>ক্যাশ অন ডেলিভারি:</strong> অগ্রিম কোনো টাকা ছাড়া পণ্য হাতে পেয়ে চেক করে টাকা দিন।
                      </span>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <span className="font-medium text-foreground">
                        <strong>সারা দেশে দ্রুত ডেলিভারি:</strong> ঢাকা সহ যেকোনো জেলায় ২৪-৭২ ঘণ্টায় হোম ডেলিভারি।
                      </span>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <span className="font-medium text-foreground">
                        <strong>৭ দিনের রিপ্লেসমেন্ট:</strong> কোনো ত্রুটি থাকলে সহজে পরিবর্তনের শতভাগ গ্যারান্টি।
                      </span>
                    </div>
                  </div>
                </div>

                {/* Primary CTA Buttons */}
                <div className="space-y-3 pt-2">
                  <Button
                    size="lg"
                    onClick={scrollToCheckout}
                    className="btn-accent w-full text-base sm:text-lg py-7 rounded-2xl shadow-xl shadow-accent/25 hover:shadow-accent/40 font-black tracking-wide transition-all transform hover:-translate-y-0.5"
                  >
                    <ShoppingBag className="w-5 h-5 mr-2" />
                    {page.hero_cta_text || "অর্ডার করতে চাই"} ➔
                  </Button>

                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    {cleanPhone && (
                      <a
                        href={`tel:${cleanPhone}`}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border bg-card hover:bg-secondary/70 text-foreground font-bold text-xs sm:text-sm transition-colors shadow-xs"
                      >
                        <PhoneCall className="w-4 h-4 text-accent" />
                        কল করে অর্ডার করুন: {storePhone}
                      </a>
                    )}
                    {cleanWhatsApp && (
                      <a
                        href={`https://wa.me/${cleanWhatsApp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 font-bold text-xs sm:text-sm transition-colors shadow-xs"
                      >
                        <MessageCircle className="w-4 h-4 fill-emerald-500 text-emerald-500" />
                        হোয়াটসঅ্যাপে অর্ডার
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">প্রোডাক্ট লোড হচ্ছে...</p>
            </div>
          )}
        </div>
      </section>

      {/* 4. Why Choose This Product (পণ্যটির বিশেষত্ব / কেন এটি সেরা?) */}
      <section className="py-12 sm:py-16 px-4 border-y border-border/80 bg-card/40">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <Badge variant="outline" className="mb-2 text-xs font-bold uppercase tracking-wider text-accent border-accent/30">
              বিশেষ সুবিধা
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
              কেন এই প্রোডাক্টটি আপনার জন্য সেরা পছন্দ?
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm max-w-xl mx-auto mt-1">
              উন্নত উপাদান এবং আধুনিক ডিজাইনের সংমিশ্রণে তৈরি আসল পণ্য
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <div className="p-6 rounded-2xl bg-card border border-border hover:border-accent/50 transition-all hover:shadow-lg">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base mb-2 text-foreground">১০০% প্রিমিয়াম মেটেরিয়াল</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                উন্নত ও টেকসই উপাদান দিয়ে নিখুঁত ফিনিশিংয়ে তৈরি, যা দীর্ঘদিন ব্যবহারেও নতুনের মতো থাকে।
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border hover:border-accent/50 transition-all hover:shadow-lg">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-4">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base mb-2 text-foreground">সারা দেশে দ্রুত ডেলিভারি</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                সারা বাংলাদেশের যে কোনো প্রান্তে দ্রুততম সময়ে আপনার ঠিকানায় সরাসরি হোম ডেলিভারি।
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border hover:border-accent/50 transition-all hover:shadow-lg">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base mb-2 text-foreground">দেখে নেওয়ার সুযোগ</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                ডেলিভারি ম্যানের সামনে প্রোডাক্ট খুলে দেখে ও যাচাই করে সম্পূর্ণ নিশ্চিন্তে মূল্য দিন।
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border hover:border-accent/50 transition-all hover:shadow-lg">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-4">
                <RefreshCw className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base mb-2 text-foreground">৭ দিনের রিপ্লেসমেন্ট</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                কোনো সমস্যা বা পরিবর্তনের প্রয়োজন হলে ৭ দিনের মধ্যে সহজে রিটার্ন বা এক্সচেঞ্জ সুবিধা।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Product Detailed Description Section */}
      {selectedProduct?.description && (
        <section className="py-12 sm:py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-card border border-border rounded-3xl p-6 sm:p-10 shadow-sm space-y-4">
              <h3 className="text-xl sm:text-2xl font-extrabold text-foreground flex items-center gap-2 border-b border-border/80 pb-3">
                <PackageCheck className="w-6 h-6 text-accent" />
                পণ্যটির বিস্তারিত বিবরণ
              </h3>
              <div className="text-xs sm:text-sm text-foreground/90 leading-relaxed whitespace-pre-line prose prose-sm max-w-none">
                {selectedProduct.description}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 6. How To Use / Features Cards (If Configured) */}
      {page.how_to_use_cards && page.how_to_use_cards.length > 0 && (
        <section className="py-12 sm:py-16 px-4 bg-secondary/30 border-y border-border/80">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <Badge variant="outline" className="mb-2 text-xs font-bold uppercase tracking-wider text-accent border-accent/30">
                নির্দেশিকা ও বৈশিষ্ট্য
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
                পণ্যটির ব্যবহার ও বিশেষ সুবিধা
              </h2>
              <p className="text-muted-foreground text-xs sm:text-sm max-w-xl mx-auto mt-1">
                সহজ কয়েকটি ধাপে পণ্যটি সম্পর্কে জানুন ও ব্যবহার করুন
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {page.how_to_use_cards.map((card, i) => (
                <div
                  key={i}
                  className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all hover:border-accent/40"
                >
                  {card.image && (
                    <div className="aspect-video relative overflow-hidden bg-secondary/50">
                      <SafeImage
                        src={card.image}
                        alt={card.title}
                        width={400}
                        height={250}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-center gap-2.5 mb-2.5">
                      <span className="w-8 h-8 rounded-xl bg-accent text-accent-foreground flex items-center justify-center text-sm font-black shadow-xs shrink-0">
                        0{i + 1}
                      </span>
                      <h3 className="font-bold text-base text-foreground leading-tight">
                        {card.title}
                      </h3>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <Button
                size="lg"
                className="btn-accent px-8 font-bold shadow-lg shadow-accent/20"
                onClick={scrollToCheckout}
              >
                {page.hero_cta_text || "অর্ডার করতে চাই"} ➔
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* 7. Customer Reviews & Social Proof */}
      {page.show_reviews && reviews.length > 0 && (
        <section className="py-12 sm:py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/30 mb-2 font-bold px-3 py-1">
                গ্রাহক সন্তুষ্টি
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
                আমাদের সম্মানিত কাস্টমারদের মতামত
              </h2>
              <p className="text-muted-foreground text-xs sm:text-sm max-w-xl mx-auto mt-1">
                শত শত সন্তুষ্ট গ্রাহকের অভিজ্ঞতা ও রিভিউ
              </p>
            </div>

            {/* Overall Rating Banner */}
            <div className="max-w-xl mx-auto mb-8 p-4 rounded-2xl bg-card border border-border text-center shadow-xs">
              <div className="flex items-center justify-center gap-1.5 text-amber-500 mb-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-500" />
                ))}
              </div>
              <p className="font-bold text-sm text-foreground">
                ৪.৯ / ৫.০ রেটিং • ১,০০০+ এর বেশি সন্তুষ্ট কাস্টমার
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {reviews.slice(0, 6).map((review) => (
                <div
                  key={review.id}
                  className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs hover:border-accent/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? "text-amber-500 fill-amber-500"
                                : "text-muted-foreground/30"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" /> ভেরিফাইড
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-muted-foreground mb-4 line-clamp-4 leading-relaxed italic">
                      "{review.text}"
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 pt-3 border-t border-border/60">
                    <div className="w-8 h-8 rounded-full bg-accent/10 text-accent font-bold text-xs flex items-center justify-center">
                      {review.name.slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">{review.name}</p>
                      <p className="text-[10px] text-muted-foreground">সন্তুষ্ট ক্রেতা</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 8. Conversion-Optimized One-Page Cash on Delivery Checkout Form */}
      <section
        id="lp-checkout"
        className="py-12 sm:py-16 px-4 bg-gradient-to-b from-secondary/40 via-secondary/20 to-background border-t border-border/80"
      >
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accent/10 text-accent font-bold text-xs mb-3 border border-accent/20">
              <ShoppingBag className="w-4 h-4" /> দ্রুত অর্ডার ফর্ম (ক্যাশ অন ডেলিভারি)
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground">
              অর্ডার কনফার্ম করতে নিচের ফর্মে আপনার তথ্য দিন
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-lg mx-auto">
              কোনো অগ্রিম পেমেন্ট ছাড়াই সারা দেশে হোম ডেলিভারি পেতে সঠিক ঠিকানা ও মোবাইল নাম্বার লিখুন।
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Selected Product Card & Package Selector */}
            {selectedProduct && (
              <div className="bg-card border-2 border-accent/40 rounded-3xl p-5 sm:p-6 shadow-md space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border/60">
                  <span className="text-xs font-bold text-accent uppercase tracking-wider flex items-center gap-1.5">
                    <Package className="w-4 h-4" /> আপনার নির্বাচিত প্রোডাক্ট
                  </span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                    ক্যাশ অন ডেলিভারি
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-secondary/50 shrink-0 border border-border relative">
                      <SafeImage
                        src={selectedProduct.images?.[0]}
                        alt={selectedProduct.name}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-sm sm:text-base text-foreground truncate">
                        {selectedProduct.name}
                      </h4>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-accent font-black text-lg sm:text-xl">
                          {formatCurrency(effectivePrice)}
                        </span>
                        {selectedProduct.sale_price && (
                          <span className="text-xs text-muted-foreground line-through">
                            {formatCurrency(originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quantity Counter */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
                    <span className="text-xs font-semibold text-muted-foreground sm:hidden">
                      পরিমাণ (Quantity):
                    </span>
                    <div className="flex items-center gap-1 bg-secondary/80 rounded-xl p-1 border border-border">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg hover:bg-card"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </Button>
                      <span className="w-10 text-center font-bold text-sm">
                        {quantity}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg hover:bg-card"
                        onClick={() => setQuantity(quantity + 1)}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Package Quick Option Pills */}
                <div className="pt-2">
                  <label className="block text-[11px] font-bold text-muted-foreground mb-1.5 uppercase">
                    প্যাকেজ নির্বাচন করুন:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setQuantity(1)}
                      className={`p-2 rounded-xl text-xs font-bold border transition-all text-center ${
                        quantity === 1
                          ? "bg-accent text-accent-foreground border-accent shadow-xs"
                          : "bg-secondary/60 border-border hover:border-accent/40 text-foreground"
                      }`}
                    >
                      ১ পিস ({formatCurrency(effectivePrice)})
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuantity(2)}
                      className={`p-2 rounded-xl text-xs font-bold border transition-all text-center ${
                        quantity === 2
                          ? "bg-accent text-accent-foreground border-accent shadow-xs"
                          : "bg-secondary/60 border-border hover:border-accent/40 text-foreground"
                      }`}
                    >
                      ২ পিস ({formatCurrency(effectivePrice * 2)}) 🔥
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuantity(3)}
                      className={`p-2 rounded-xl text-xs font-bold border transition-all text-center sm:col-span-1 col-span-2 ${
                        quantity === 3
                          ? "bg-accent text-accent-foreground border-accent shadow-xs"
                          : "bg-secondary/60 border-border hover:border-accent/40 text-foreground"
                      }`}
                    >
                      ৩ পিস ({formatCurrency(effectivePrice * 3)})
                    </button>
                  </div>
                </div>

                {/* Variant Options (Size / Color) */}
                {variants.length > 0 && (
                  <div className="pt-3 border-t border-border/60">
                    <label className="block text-xs font-bold text-foreground mb-2">
                      সাইজ বা কালার পছন্দ করুন:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {variants.map((v) => {
                        const isVarSelected = selectedVariantId === v.id;
                        const label = [v.size, v.color, v.fabric].filter(Boolean).join(" - ");
                        return (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => setSelectedVariantId(v.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                              isVarSelected
                                ? "bg-accent text-accent-foreground border-accent shadow-xs"
                                : "bg-card border-border hover:border-accent/40 text-foreground"
                            }`}
                          >
                            {label || "ডিফল্ট"}
                            {v.variant_price && ` (+${formatCurrency(v.variant_price)})`}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Customer Contact & Delivery Info */}
            <div className="bg-card border border-border rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                <div className="w-7 h-7 rounded-lg bg-accent/10 text-accent flex items-center justify-center font-bold text-xs">
                  ১
                </div>
                <h3 className="font-bold text-base text-foreground">
                  আপনার নাম ও ডেলিভারি ঠিকানা
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-foreground mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-accent" /> আপনার পুরো নাম *
                  </label>
                  <Input
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="যেমন: মোঃ সাকিব হাসান"
                    required
                    className="h-11 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-accent" /> মোবাইল নাম্বার *
                  </label>
                  <Input
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="যেমন: 017XXXXXXXX"
                    required
                    className="h-11 rounded-xl font-mono"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    অর্ডার নিশ্চিত করতে এই নাম্বারে কল করা হবে
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-accent" /> জেলা / শহর *
                  </label>
                  <Input
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="যেমন: ঢাকা / চট্টগ্রাম / সিলেট"
                    required
                    className="h-11 rounded-xl"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-foreground mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-accent" /> সম্পূর্ণ ঠিকানা (বাসা/রোড/এলাকা/থানা) *
                  </label>
                  <Input
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="যেমন: বাড়ি নং ১২, রোড নং ৫, ধানমন্ডি, ঢাকা"
                    required
                    className="h-11 rounded-xl"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    কোনো বিশেষ নির্দেশনা থাকলে লিখুন (বিকল্প):
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="যেমন: বিকেলে ডেলিভারি দিলে ভালো হয়..."
                    className="input-shop min-h-[60px] text-xs rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Shipping Method Selection */}
            <div className="bg-card border border-border rounded-3xl p-5 sm:p-7 shadow-xs space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                <div className="w-7 h-7 rounded-lg bg-accent/10 text-accent flex items-center justify-center font-bold text-xs">
                  ২
                </div>
                <h3 className="font-bold text-base text-foreground">
                  ডেলিভারি এরিয়া নির্বাচন করুন
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {shippingMethods.map((m) => {
                  const isChecked = formData.shippingMethodId === m.id;
                  return (
                    <label
                      key={m.id}
                      className={`flex items-center justify-between p-3.5 border-2 rounded-2xl cursor-pointer transition-all ${
                        isChecked
                          ? "border-accent bg-accent/5 shadow-xs"
                          : "border-border hover:border-accent/40"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shippingMethodId"
                          value={m.id}
                          checked={isChecked}
                          onChange={handleChange}
                          className="w-4 h-4 text-accent accent-accent"
                        />
                        <div>
                          <p className="font-bold text-xs sm:text-sm text-foreground">
                            {m.name}
                          </p>
                          {m.estimated_days && (
                            <p className="text-[11px] text-muted-foreground">
                              {m.estimated_days}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="font-extrabold text-sm text-accent">
                        {formatCurrency(m.base_rate)}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Step 4: Payment Method Selection */}
            <div className="bg-card border border-border rounded-3xl p-5 sm:p-7 shadow-xs space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                <div className="w-7 h-7 rounded-lg bg-accent/10 text-accent flex items-center justify-center font-bold text-xs">
                  ৩
                </div>
                <h3 className="font-bold text-base text-foreground">
                  পেমেন্ট পদ্ধতি
                </h3>
              </div>

              <div className="space-y-2.5 pt-1">
                {paymentMethods.map((pm) => {
                  const isChecked = formData.paymentMethodId === pm.id;
                  return (
                    <label
                      key={pm.id}
                      className={`block p-3.5 border-2 rounded-2xl cursor-pointer transition-all ${
                        isChecked
                          ? "border-accent bg-accent/5 shadow-xs"
                          : "border-border hover:border-accent/40"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="paymentMethodId"
                          value={pm.id}
                          checked={isChecked}
                          onChange={handleChange}
                          className="w-4 h-4 text-accent accent-accent mt-0.5"
                        />
                        <div className="flex-1">
                          <p className="font-bold text-xs sm:text-sm text-foreground flex items-center gap-1.5">
                            <CreditCard className="w-4 h-4 text-accent" />
                            {pm.name}
                          </p>
                          {pm.description && (
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              {pm.description}
                            </p>
                          )}
                          {pm.instructions && isChecked && (
                            <div className="mt-2.5 p-2.5 bg-secondary/80 rounded-xl text-xs text-foreground border border-border/80">
                              {pm.instructions}
                            </div>
                          )}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>

              {requiresTrxId && (
                <div className="mt-3 p-3 bg-secondary/40 rounded-xl border border-border">
                  <label className="block text-xs font-bold text-foreground mb-1">
                    ট্রানজেকশন আইডি (Transaction ID) *
                  </label>
                  <Input
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Enter transaction / TrxID"
                    required
                    className="h-10 rounded-lg font-mono"
                  />
                </div>
              )}

              {hasPartial && (
                <div className="mt-3 p-3.5 border border-accent/30 bg-accent/5 rounded-xl text-xs space-y-1.5">
                  <div className="flex justify-between font-medium">
                    <span>অগ্রিম প্রদেয় (Pay now):</span>
                    <span className="font-bold text-accent">{formatCurrency(advanceAmount)}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>ডেলিভারির সময় প্রদেয় (Pay on delivery):</span>
                    <span className="font-bold">{formatCurrency(dueOnDelivery)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Step 5: Itemized Bill Summary */}
            <div className="bg-card border-2 border-border/90 rounded-3xl p-5 sm:p-7 shadow-sm space-y-3">
              <h4 className="font-bold text-sm text-foreground pb-2 border-b border-border/60 flex items-center justify-between">
                <span>মূল্য বিবরণী</span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">ক্যাশ অন ডেলিভারি</span>
              </h4>

              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-muted-foreground">
                  পণ্যের মূল্য ({quantity}টি {selectedProduct ? `× ${formatCurrency(effectivePrice)}` : ""})
                </span>
                <span className="font-bold text-foreground">{formatCurrency(subtotal)}</span>
              </div>

              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-muted-foreground">ডেলিভারি চার্জ</span>
                <span className="font-bold text-foreground">
                  {shippingCost > 0 ? formatCurrency(shippingCost) : "ফ্রি"}
                </span>
              </div>

              <hr className="border-border/80 my-2" />

              <div className="flex justify-between items-baseline pt-1">
                <span className="font-black text-base sm:text-lg text-foreground">
                  সর্বমোট প্রদেয় টাকা:
                </span>
                <span className="text-2xl sm:text-3xl font-black text-accent">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>

            {/* Submit Order Button */}
            <div className="space-y-3 pt-2">
              <Button
                type="submit"
                size="lg"
                disabled={createOrder.isPending || !selectedProduct}
                className="btn-accent w-full text-base sm:text-lg py-7 rounded-2xl shadow-xl shadow-accent/30 hover:shadow-accent/45 font-black tracking-wide transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                {createOrder.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    অর্ডার প্রক্রিয়াকরণ হচ্ছে...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <ShoppingBag className="w-6 h-6" />
                    অর্ডার কনফার্ম করুন • {formatCurrency(total)}
                  </span>
                )}
              </Button>

              {/* Security & Guarantee Badges below Submit */}
              <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-muted-foreground pt-1">
                <span className="flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-emerald-500" /> কোনো অগ্রিম পেমেন্ট নেই
                </span>
                <span className="flex items-center gap-1">
                  <PackageCheck className="w-3.5 h-3.5 text-accent" /> ডেলিভারি পেয়ে টাকা দিন
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> দেখে নেওয়ার সুযোগ
                </span>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* 9. Floating Sticky Order Bar for Mobile Viewports */}
      {selectedProduct && !isCheckoutInView && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border p-3 shadow-2xl animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-11 h-11 rounded-xl overflow-hidden bg-secondary shrink-0 border border-border">
                <SafeImage
                  src={selectedProduct.images?.[0]}
                  alt={selectedProduct.name}
                  width={44}
                  height={44}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-foreground truncate max-w-[130px]">
                  {selectedProduct.name}
                </p>
                <p className="text-sm font-black text-accent">
                  {formatCurrency(effectivePrice * quantity)}
                </p>
              </div>
            </div>

            <Button
              onClick={scrollToCheckout}
              size="sm"
              className="btn-accent text-xs font-black px-4 py-2.5 rounded-xl shadow-lg shadow-accent/25"
            >
              অর্ডার করুন <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* 10. Minimal Dedicated Landing Footer */}
      <footer className="bg-card border-t border-border/80 py-8 px-4 text-center text-xs text-muted-foreground space-y-3">
        <div className="max-w-xl mx-auto flex flex-wrap justify-center items-center gap-4 text-xs font-medium">
          <Link href="/" className="hover:text-foreground transition-colors">
            {storeName} হোমপেজ
          </Link>
          <span>•</span>
          <Link href="/privacy" className="hover:text-foreground transition-colors">
            প্রাইভেসি পলিসি
          </Link>
          <span>•</span>
          <Link href="/terms" className="hover:text-foreground transition-colors">
            শর্তাবলী
          </Link>
          <span>•</span>
          <Link href="/contact" className="hover:text-foreground transition-colors">
            যোগাযোগ
          </Link>
        </div>

        {cleanPhone && (
          <p className="text-xs">
            যেকোনো তথ্য বা সহায়তার জন্য সরাসরি কল করুন:{" "}
            <a href={`tel:${cleanPhone}`} className="font-bold text-foreground hover:underline">
              {storePhone}
            </a>
          </p>
        )}

        <p className="text-[11px] text-muted-foreground/70">
          © {new Date().getFullYear()} {storeName}. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
