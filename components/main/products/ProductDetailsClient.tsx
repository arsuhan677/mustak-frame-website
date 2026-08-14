"use client";

import { ProductCard } from "@/components/main/products/ProductCard";
import { VariantSelector } from "@/components/main/products/VariantSelector";
import { WishlistButton } from "@/components/main/products/WishlistButton";
import { ReviewForm } from "@/components/main/ReviewForm";
import { ReviewList } from "@/components/main/ReviewList";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  useProductReviews,
  useProductRatingStats,
  useHideStockMap,
} from "@/hooks/useProductReviews";
import { useProduct, useRelatedProducts } from "@/hooks/useShopData";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { ProductVariant, useProductVariants } from "@/hooks/useVariants";
import { trackAddToCart, trackViewContent } from "@/lib/facebook-pixel";
import {
  CheckCircle2,
  ChevronRight,
  Clock,
  Loader2,
  MessageCircle,
  Minus,
  Plus,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Star,
  Store,
  Truck,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { WhatsAppBanner } from "@/components/main/WhatsAppBanner";

const DEFAULT_FABRIC_DESCS: Record<string, string> = {
  "dri-fit (ড্রাই-ফিট)": "Lightweight, stretchable & sweat-wicking. Best for playing.",
  "dri-fit": "Lightweight, stretchable & sweat-wicking. Best for playing.",
  "pin mesh (পিন মেশ)": "Tiny micro-holes for premium cooling & ventilation.",
  "pin mesh": "Tiny micro-holes for premium cooling & ventilation.",
  "dot knit (ডট নিট)": "Textured structure, durable, soft & comfortable for activewear.",
  "dot knit": "Textured structure, durable, soft & comfortable for activewear.",
  "honeycomb (হানিকম্ব)": "Unique waffle-knit style, thick, premium & highly durable.",
  "honeycomb": "Unique waffle-knit style, thick, premium & highly durable.",
};

const getFabricDescription = (name: string) => {
  const normalized = name.toLowerCase().trim();
  return DEFAULT_FABRIC_DESCS[normalized] || "Premium quality fabric for comfort & style.";
};

export default function ProductDetailsClient() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { addItem } = useCart();
  const { t, formatCurrency, settings } = useSiteSettings();
  const { data: product, isLoading } = useProduct(slug || "");
  const { data: relatedProducts = [] } = useRelatedProducts(product);
  const { data: variants = [] } = useProductVariants(product?.id || "");
  const { data: reviews = [] } = useProductReviews(product?.id || "", true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null,
  );
  const [sizeQuantities, setSizeQuantities] = useState<Record<string, number>>({});
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedFabric, setSelectedFabric] = useState<string>("Dri-Fit (ড্রাই-ফিট)");
  const [activeTab, setActiveTab] = useState<"description" | "additional" | "reviews">("description");
  const isMobile = useIsMobile();
  const { data: storeSettings } = useStoreSettings();

  const fabricOptions = useMemo(() => {
    if (variants.length === 0) return [];
    const fabrics = [
      ...new Set(
        variants
          .filter((v) => v.fabric && v.is_active)
          .map((v) => {
            const match = v.fabric!.match(/^(.*?)\s*\((Short Sleeve|Long Sleeve)\)$/);
            return match ? match[1].trim() : v.fabric!.trim();
          })
          .filter(Boolean)
      )
    ];

    return fabrics.map((name: string, idx: number) => ({
      id: `fabric-${idx}`,
      name: name,
      desc: getFabricDescription(name),
    }));
  }, [variants]);

  useEffect(() => {
    if (fabricOptions.length > 0) {
      const fabricNames = fabricOptions.map((f) => f.name);
      const baseSelectedFabric = selectedFabric ? (selectedFabric.match(/^(.*?)\s*\((Short Sleeve|Long Sleeve)\)$/)?.[1]?.trim() || selectedFabric.trim()) : "";
      
      if (!selectedFabric || !fabricNames.includes(baseSelectedFabric)) {
        setSelectedFabric(fabricOptions[0].name);
      }
    } else {
      setSelectedFabric("");
    }
  }, [fabricOptions, selectedFabric]);

  useEffect(() => {
    if (variants.length > 0) {
      const normFabric = selectedFabric ? selectedFabric.toLowerCase().trim() : "";
      const normColor = selectedColor ? selectedColor.toLowerCase().trim() : "";
      const activeSize = Object.keys(sizeQuantities).find(s => sizeQuantities[s] > 0) || null;

      const match =
        variants.find((v) => {
          const fabricMatch = v.fabric && v.fabric.toLowerCase().trim() === normFabric;
          const sizeMatch = activeSize ? v.size === activeSize : !v.size;
          const colors = v.color ? v.color.split(",").map((c) => c.trim().toLowerCase()) : [];
          const colorMatch = normColor ? colors.includes(normColor) : !v.color;
          return fabricMatch && sizeMatch && colorMatch && v.is_active;
        }) ||
        variants.find((v) => {
          const fabricMatch = v.fabric && v.fabric.toLowerCase().trim() === normFabric;
          const sizeMatch = activeSize ? v.size === activeSize : !v.size;
          return fabricMatch && sizeMatch && v.is_active;
        }) ||
        variants.find((v) => {
          const fabricMatch = v.fabric && v.fabric.toLowerCase().trim() === normFabric;
          return fabricMatch && v.is_active;
        }) ||
        variants.find((v) => {
          const sizeMatch = activeSize ? v.size === activeSize : !v.size;
          const colors = v.color ? v.color.split(",").map((c) => c.trim().toLowerCase()) : [];
          const colorMatch = normColor ? colors.includes(normColor) : !v.color;
          return sizeMatch && colorMatch && v.is_active;
        }) ||
        variants.find((v) => {
          const sizeMatch = activeSize ? v.size === activeSize : !v.size;
          return sizeMatch && v.is_active;
        });

      if (match && match.id !== selectedVariant?.id) {
        setSelectedVariant(match);
      }
    }
  }, [selectedFabric, sizeQuantities, selectedColor, variants, selectedVariant?.id]);

  const whatsappEnabled =
    storeSettings?.whatsapp_order_enabled === "true" &&
    !!storeSettings?.whatsapp_number;

  useEffect(() => {
    if (product) {
      trackViewContent({
        contentId: product.id,
        contentName: product.name,
        value: product.sale_price || product.price,
        currency: settings.currency_code,
      });
      document.title = `${product.name} | Suyeb Online Sports`;
    }
  }, [product, settings.currency_code]);

  useEffect(() => {
    if (variants.length > 0 && !selectedVariant) {
      const availableVariant = variants.find((v) => v.is_active && v.stock > 0) || variants[0];
      if (availableVariant) {
        setSelectedVariant(availableVariant);
        if (availableVariant.size && Object.keys(sizeQuantities).length === 0) {
          setSizeQuantities({ [availableVariant.size]: 1 });
        }
        if (availableVariant.color && !selectedColor) {
          const colors = availableVariant.color.split(",").map((c) => c.trim()).filter(Boolean);
          if (colors.length > 0) setSelectedColor(colors[0]);
        }
        if (availableVariant.fabric && !selectedFabric) setSelectedFabric(availableVariant.fabric);
      }
    }
  }, [variants, selectedVariant, sizeQuantities, selectedColor, selectedFabric]);

  const selectedFabricVariant = useMemo(() => {
    if (!selectedFabric || variants.length === 0) return null;
    const normFabric = selectedFabric.toLowerCase().trim();
    return variants.find(
      (v) => v.fabric && v.fabric.toLowerCase().trim() === normFabric && v.is_active
    ) || null;
  }, [selectedFabric, variants]);

  const effectivePrice = useMemo(() => {
    const activeVar = selectedFabricVariant || selectedVariant;
    if (activeVar) {
      if (activeVar.variant_sale_price != null) {
        return activeVar.variant_sale_price;
      }
      if (activeVar.variant_price != null) {
        return activeVar.variant_price;
      }
    }
    return product?.sale_price || product?.price || 0;
  }, [product, selectedVariant, selectedFabricVariant]);

  const effectiveStock = selectedVariant?.stock ?? product?.stock ?? 0;
  const hasVariants = variants.length > 0 && (product as any)?.is_variable;

  const { getProductRating } = useProductRatingStats();
  const { data: hideStockMap = {} } = useHideStockMap();

  const isStockHidden = product
    ? hideStockMap[product.id] ?? (product as any)?.hide_stock ?? false
    : false;
  const isOutOfStock = effectiveStock <= 0 || isStockHidden;

  const avgRating = useMemo(() => {
    if (product) {
      const ratingInfo = getProductRating(product.id);
      if (ratingInfo.avgRating > 0) return ratingInfo.avgRating;
    }
    if (reviews.length === 0) return 5.0;
    return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  }, [product, reviews, getProductRating]);

  if (isLoading) {
    return (
      <div className="container-shop section-padding">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl bg-muted animate-pulse" />
            <div className="flex gap-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-20 h-20 rounded-xl bg-muted animate-pulse"
                />
              ))}
            </div>
          </div>
          <div className="space-y-5">
            <div className="h-5 bg-muted rounded animate-pulse w-1/4" />
            <div className="h-10 bg-muted rounded animate-pulse w-3/4" />
            <div className="h-8 bg-muted rounded animate-pulse w-1/3" />
            <div className="h-px bg-border" />
            <div className="h-20 bg-muted rounded animate-pulse" />
            <div className="h-12 bg-muted rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-shop section-padding text-center py-20">
        <h1 className="text-2xl font-bold mb-4">{t("common.noResults")}</h1>
        <Link
          href="/shop"
          className="text-accent font-semibold hover:underline"
        >
          {t("cart.continueShopping")}
        </Link>
      </div>
    );
  }

  const hasDiscount = product.sale_price && product.sale_price < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.sale_price!) / product.price) * 100)
    : 0;

  const handleAddToCart = async () => {
    const activeSizes = Object.keys(sizeQuantities).filter(s => sizeQuantities[s] > 0);
    const hasSizes = variants.some(v => v.size);

    if (hasVariants && !selectedVariant) {
      toast.error("Please select a variant");
      return;
    }

    if (hasSizes && activeSizes.length === 0) {
      toast.error("Please select at least one size quantity");
      return;
    }

    setIsAddingToCart(true);
    await new Promise((resolve) => setTimeout(resolve, 300));

    const fabricSuffix = selectedFabric ? `-${selectedFabric}` : "";
    let totalAdded = 0;

    const addToCartLogic = (size: string | undefined, qty: number) => {
      const specificVariant = hasSizes && size ? variants.find(v =>
        v.size === size &&
        (!selectedColor || v.color?.includes(selectedColor)) &&
        (!selectedFabric || v.fabric === selectedFabric)
      ) || selectedVariant : selectedVariant;

      const cartItemId = specificVariant
        ? `${product.id}-${specificVariant.id}${fabricSuffix}`
        : `${product.id}${fabricSuffix}`;

      const variantSpecs = [
        size || specificVariant?.size,
        selectedColor || specificVariant?.color,
        selectedFabric
      ].filter(Boolean);

      const activeVarForPrice = specificVariant || selectedVariant;

      addItem({
        id: cartItemId,
        productId: product.id,
        slug: product.slug,
        name: variantSpecs.length > 0
          ? `${product.name} (${variantSpecs.join(" / ")})`
          : product.name,
        price:
          activeVarForPrice?.variant_price != null
            ? activeVarForPrice.variant_price
            : product.price,
        salePrice:
          activeVarForPrice?.variant_sale_price != null
            ? activeVarForPrice.variant_sale_price
            : activeVarForPrice?.variant_price != null
              ? undefined
              : product.sale_price || undefined,
        image: product.images[0] || "/placeholder.svg",
        quantity: qty,
        stock: activeVarForPrice?.stock || effectiveStock,
        variantId: activeVarForPrice?.id || undefined,
        variantInfo: {
          size: size || specificVariant?.size || undefined,
          color: selectedColor || specificVariant?.color || undefined,
          fabric: selectedFabric || undefined,
        },
      });

      trackAddToCart({
        contentId: product.id,
        contentName: product.name,
        value: (activeVarForPrice?.variant_sale_price ?? activeVarForPrice?.variant_price ?? effectivePrice) * qty,
        currency: settings.currency_code,
        quantity: qty,
      });

      totalAdded += qty;
    };

    if (hasSizes && activeSizes.length > 0) {
      activeSizes.forEach(size => {
        addToCartLogic(size, sizeQuantities[size]);
      });
    } else {
      addToCartLogic(undefined, quantity);
    }

    toast.success(t("product.addedToCart") || "Product added to cart", {
      description: `${totalAdded}x ${product.name}`,
    });

    setIsAddingToCart(false);
  };

  const handleBuyNow = async () => {
    const activeSizes = Object.keys(sizeQuantities).filter(s => sizeQuantities[s] > 0);
    const hasSizes = variants.some(v => v.size);

    if (hasVariants && !selectedVariant) {
      toast.error("Please select a variant");
      return;
    }

    if (hasSizes && activeSizes.length === 0) {
      toast.error("Please select at least one size quantity");
      return;
    }

    setIsBuyingNow(true);

    const fabricSuffix = selectedFabric ? `-${selectedFabric}` : "";

    const addToCartLogic = (size: string | undefined, qty: number) => {
      const specificVariant = hasSizes && size ? variants.find(v =>
        v.size === size &&
        (!selectedColor || v.color?.includes(selectedColor)) &&
        (!selectedFabric || v.fabric === selectedFabric)
      ) || selectedVariant : selectedVariant;

      const cartItemId = specificVariant
        ? `${product.id}-${specificVariant.id}${fabricSuffix}`
        : `${product.id}${fabricSuffix}`;

      const variantSpecs = [
        size || specificVariant?.size,
        selectedColor || specificVariant?.color,
        selectedFabric
      ].filter(Boolean);

      const activeVarForPrice = specificVariant || selectedVariant;

      addItem({
        id: cartItemId,
        productId: product.id,
        slug: product.slug,
        name: variantSpecs.length > 0
          ? `${product.name} (${variantSpecs.join(" / ")})`
          : product.name,
        price:
          activeVarForPrice?.variant_price != null
            ? activeVarForPrice.variant_price
            : product.price,
        salePrice:
          activeVarForPrice?.variant_sale_price != null
            ? activeVarForPrice.variant_sale_price
            : activeVarForPrice?.variant_price != null
              ? undefined
              : product.sale_price || undefined,
        image: product.images[0] || "/placeholder.svg",
        quantity: qty,
        stock: activeVarForPrice?.stock || effectiveStock,
        variantId: activeVarForPrice?.id || undefined,
        variantInfo: {
          size: size || specificVariant?.size || undefined,
          color: selectedColor || specificVariant?.color || undefined,
          fabric: selectedFabric || undefined,
        },
      });

      trackAddToCart({
        contentId: product.id,
        contentName: product.name,
        value: (activeVarForPrice?.variant_sale_price ?? activeVarForPrice?.variant_price ?? effectivePrice) * qty,
        currency: settings.currency_code,
        quantity: qty,
      });
    };

    if (hasSizes && activeSizes.length > 0) {
      activeSizes.forEach(size => {
        addToCartLogic(size, sizeQuantities[size]);
      });
    } else {
      addToCartLogic(undefined, quantity);
    }

    router.push("/checkout?mode=buynow");
  };

  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": product.images || [],
    "description": product.description || product.short_description || `${product.name} - Premium sports gear from Suyeb Online Sports.`,
    "sku": product.sku,
    "brand": {
      "@type": "Brand",
      "name": "Suyeb Online Sports",
    },
    "offers": {
      "@type": "Offer",
      "url": `${process.env.NEXT_PUBLIC_SITE_URL || "https://suyeb-online-sports.vercel.app"}/products/${product.slug}`,
      "priceCurrency": settings.currency_code || "BDT",
      "price": product.sale_price || product.price,
      "availability": effectiveStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "itemCondition": "https://schema.org/NewCondition",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />

      <div
        className={`container-shop section-padding ${isMobile ? "pb-28" : ""}`}
      >
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mb-6 flex-wrap select-none">
          <Link href="/" className="hover:text-foreground transition-colors">
            {t("nav.home")}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link
            href="/shop"
            className="hover:text-foreground transition-colors"
          >
            {t("nav.shop")}
          </Link>
          {product.category && (
            <>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link
                href={`/shop?category=${product.category.slug}`}
                className="hover:text-foreground transition-colors"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <ChevronRight className="h-3.5 w-3.5 text-accent" />
          <span className="text-foreground font-bold line-clamp-1">
            {product.name}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-start">
          {/* Product Gallery Section */}
          <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div
              className="aspect-square rounded-2xl overflow-hidden bg-card border border-border/80 group cursor-zoom-in relative shadow-sm hover:shadow-md transition-shadow"
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                const img = e.currentTarget.querySelector("img");
                if (img) {
                  img.style.transformOrigin = `${x}% ${y}%`;
                }
              }}
            >
              {hasDiscount && (
                <div className="absolute top-3.5 left-3.5 z-20 bg-destructive text-destructive-foreground px-3 py-1 text-xs font-extrabold rounded-lg shadow-sm tracking-wide">
                  -{discountPercent}% OFF
                </div>
              )}

              <div className="absolute top-3.5 right-3.5 z-20">
                <WishlistButton productId={product.id} size="md" className="bg-background/90 backdrop-blur-md border border-border/60 shadow-sm" />
              </div>

              <Image
                src={product.images[selectedImage] || "/placeholder.svg"}
                alt={product.name}
                height={700}
                width={700}
                priority
                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.8]"
              />
            </div>

            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-18 h-18 shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-200 cursor-pointer ${selectedImage === index
                      ? "border-accent ring-2 ring-accent/30 scale-105 shadow-sm"
                      : "border-border/60 hover:border-accent/40 opacity-80 hover:opacity-100"
                      }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                      width={72}
                      height={72}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info & Action Details */}
          <div className="space-y-6">
            <div className="space-y-3">
              {product.category && (
                <Link
                  href={`/shop?category=${product.category.slug}`}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-accent/10 text-accent uppercase tracking-wider hover:bg-accent/20 transition-colors"
                >
                  <span>{product.category.name}</span>
                </Link>
              )}

              <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-foreground">
                {product.name}
              </h1>

              <div className="flex items-center gap-3 pt-1">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${star <= Math.round(avgRating || 5)
                        ? "fill-amber-400 text-amber-400"
                        : "text-border fill-muted/20"
                        }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-foreground">
                  {(avgRating || 5.0).toFixed(1)}
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  ({reviews.length} {reviews.length === 1 ? "customer review" : "verified reviews"})
                </span>
              </div>
            </div>

            <div className="bg-card border border-border/80 rounded-2xl p-5 space-y-3 shadow-xs">
              <div className="flex flex-wrap items-baseline gap-3">
                {selectedVariant?.variant_price != null ? (
                  selectedVariant.variant_sale_price != null &&
                    selectedVariant.variant_sale_price <
                    selectedVariant.variant_price ? (
                    <>
                      <span className="text-3xl md:text-4xl font-black text-foreground">
                        {formatCurrency(selectedVariant.variant_sale_price)}
                      </span>
                      <span className="text-lg text-muted-foreground/70 line-through font-semibold">
                        {formatCurrency(selectedVariant.variant_price)}
                      </span>
                      <span className="bg-destructive/10 text-destructive border border-destructive/20 px-2.5 py-1 text-xs font-extrabold rounded-lg">
                        Save {formatCurrency(selectedVariant.variant_price - selectedVariant.variant_sale_price)}
                      </span>
                    </>
                  ) : (
                    <span className="text-3xl md:text-4xl font-black text-foreground">
                      {formatCurrency(selectedVariant.variant_price)}
                    </span>
                  )
                ) : hasDiscount ? (
                  <>
                    <span className="text-3xl md:text-4xl font-black text-foreground">
                      {formatCurrency(product.sale_price!)}
                    </span>
                    <span className="text-lg text-muted-foreground/70 line-through font-semibold">
                      {formatCurrency(product.price)}
                    </span>
                    <span className="bg-destructive/10 text-destructive border border-destructive/20 px-2.5 py-1 text-xs font-extrabold rounded-lg">
                      Save {formatCurrency(product.price - product.sale_price!)}
                    </span>
                  </>
                ) : (
                  <span className="text-3xl md:text-4xl font-black text-foreground">
                    {formatCurrency(product.price)}
                  </span>
                )}
              </div>

              {!isStockHidden && (
                <div className="flex items-center justify-between text-xs font-semibold pt-1 border-t border-border/40">
                  <div className="flex items-center gap-2">
                    {effectiveStock > 0 ? (
                      <>
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </span>
                        <span className="text-emerald-600 font-bold">
                          In Stock ({effectiveStock} available)
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="h-2.5 w-2.5 rounded-full bg-destructive" />
                        <span className="text-destructive font-bold">Out of Stock</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 text-amber-500" />
                    <span>Ships in 24 Hours</span>
                  </div>
                </div>
              )}
            </div>

            {hasVariants && (
              <div className="bg-card border border-border/50 rounded-2xl p-4.5 shadow-2xs">
                <VariantSelector
                  variants={variants.filter((v) => v.is_active)}
                  selectedVariant={selectedVariant}
                  onSelect={setSelectedVariant}
                  sizeQuantities={sizeQuantities}
                  onSizeQuantityChange={(size, qty) => {
                    setSizeQuantities(prev => ({ ...prev, [size]: qty }));
                  }}
                  selectedColor={selectedColor}
                  onColorSelect={setSelectedColor}
                  fabricOptions={fabricOptions}
                  selectedFabric={selectedFabric}
                  onFabricSelect={(fabric) => {
                    setSelectedFabric(fabric);
                    const validColorsForFabric = new Set(
                      variants
                        .filter(v => v.fabric === fabric)
                        .flatMap(v => v.color?.split(",").map(c => c.trim()) || [])
                    );
                    if (selectedColor && !validColorsForFabric.has(selectedColor)) {
                      setSelectedColor(null);
                    }
                  }}
                />
              </div>
            )}

            <div className="space-y-4 pt-2">
              {!variants.some(v => v.size) && (
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider">Qty</span>
                  <div className="inline-flex items-center border border-border/80 rounded-xl overflow-hidden bg-card">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-none hover:bg-secondary cursor-pointer"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <div className="h-10 w-12 flex items-center justify-center text-sm font-bold border-x border-border/80">
                      {quantity}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-none hover:bg-secondary cursor-pointer"
                      onClick={() =>
                        setQuantity(Math.min(effectiveStock, quantity + 1))
                      }
                      disabled={quantity >= effectiveStock}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="hidden md:flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-13 rounded-xl font-bold text-sm border-border/90 hover:border-accent hover:bg-accent/10 hover:text-accent transition-all gap-2 cursor-pointer"
                    onClick={handleAddToCart}
                    disabled={
                      isAddingToCart ||
                      isOutOfStock ||
                      (hasVariants && !selectedVariant)
                    }
                  >
                    {isAddingToCart ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <ShoppingBag className="h-5 w-5 text-accent" />
                    )}
                    <span>{isOutOfStock ? "Stock Out" : t("product.addToCart")}</span>
                  </Button>

                  <Button
                    size="lg"
                    className="btn-accent h-13 rounded-xl font-extrabold text-sm shadow-md hover:shadow-lg hover:shadow-accent/20 active:scale-95 transition-all gap-2 cursor-pointer"
                    onClick={handleBuyNow}
                    disabled={
                      isBuyingNow ||
                      isOutOfStock ||
                      (hasVariants && !selectedVariant)
                    }
                  >
                    {isBuyingNow ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Zap className="h-5 w-5" />
                    )}
                    <span>{isOutOfStock ? "Stock Out" : "Order Now"}</span>
                  </Button>
                </div>

                {whatsappEnabled && (
                  <a
                    href={`https://wa.me/${storeSettings!.whatsapp_number.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hi, I want to order:\n\n*${product.name}*\nPrice: ${formatCurrency(effectivePrice)}\nQuantity: ${quantity}${selectedVariant ? `\nVariant: ${[selectedVariant.size, selectedVariant.color].filter(Boolean).join(" / ")}` : ""}\n\nPlease confirm my order.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2.5 w-full py-3.5 px-6 bg-[#25D366] hover:bg-[#1fb855] text-white rounded-xl font-bold text-sm transition-all shadow-sm hover:shadow-md cursor-pointer"
                  >
                    <MessageCircle className="h-5 w-5 fill-white" />
                    <span>Order via WhatsApp</span>
                  </a>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="flex flex-col items-center text-center gap-1.5 p-3 rounded-xl bg-card border border-border/80">
                <Truck className="h-5 w-5 text-accent" />
                <span className="text-[11px] font-bold text-foreground leading-tight">
                  Fast Delivery
                </span>
                <span className="text-[10px] text-muted-foreground">All over Bangladesh</span>
              </div>

              <div className="flex flex-col items-center text-center gap-1.5 p-3 rounded-xl bg-card border border-border/80">
                <ShieldCheck className="h-5 w-5 text-accent" />
                <span className="text-[11px] font-bold text-foreground leading-tight">
                  100% Authentic
                </span>
                <span className="text-[10px] text-muted-foreground">Original Guarantee</span>
              </div>

              <div className="flex flex-col items-center text-center gap-1.5 p-3 rounded-xl bg-card border border-border/80">
                <RefreshCw className="h-5 w-5 text-accent" />
                <span className="text-[11px] font-bold text-foreground leading-tight">
                  Easy Returns
                </span>
                <span className="text-[10px] text-muted-foreground">7 Days Exchange</span>
              </div>

              <div className="flex flex-col items-center text-center gap-1.5 p-3 rounded-xl bg-card border border-border/80">
                <CheckCircle2 className="h-5 w-5 text-accent" />
                <span className="text-[11px] font-bold text-foreground leading-tight">
                  Cash on Delivery
                </span>
                <span className="text-[10px] text-muted-foreground">Pay on Hand</span>
              </div>
            </div>

            <div className="text-xs text-muted-foreground font-semibold flex items-center justify-between pt-1">
              <span>SKU: <strong className="text-foreground">{product.sku}</strong></span>
              <span>Cat: <strong className="text-foreground">{product.category?.name || "General"}</strong></span>
            </div>
          </div>
        </div>

        <div className="pt-10 mt-12 border-t border-border/80">
          <div className="flex items-center gap-2 border-b border-border/80 overflow-x-auto scrollbar-none mb-6">
            <button
              onClick={() => setActiveTab("description")}
              className={`px-6 py-3.5 text-sm font-extrabold transition-all relative border-b-2 cursor-pointer ${activeTab === "description"
                ? "border-accent text-accent bg-accent/5 rounded-t-xl"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                }`}
            >
              Description
            </button>

            <button
              onClick={() => setActiveTab("additional")}
              className={`px-6 py-3.5 text-sm font-extrabold transition-all relative border-b-2 cursor-pointer ${activeTab === "additional"
                ? "border-accent text-accent bg-accent/5 rounded-t-xl"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                }`}
            >
              Additional information
            </button>

            <button
              onClick={() => setActiveTab("reviews")}
              className={`px-6 py-3.5 text-sm font-extrabold transition-all relative border-b-2 cursor-pointer ${activeTab === "reviews"
                ? "border-accent text-accent bg-accent/5 rounded-t-xl"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                }`}
            >
              Reviews ({reviews.length})
            </button>
          </div>

          {activeTab === "description" && (
            <div className="bg-card border border-border/80 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xs">
              <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
                Description
              </h2>
              <div className="text-muted-foreground text-sm md:text-base leading-relaxed whitespace-pre-line">
                {product.description || "High-quality product crafted for maximum durability, style, and everyday comfort."}
              </div>
            </div>
          )}

          {activeTab === "description" && (
            <div className="container mx-auto px-0 md:px-2 mt-12 -mb-4">
              <WhatsAppBanner className="w-full" />
            </div>
          )}

          {activeTab === "additional" && (
            <div className="bg-card border border-border/80 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xs">
              <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
                Additional information
              </h2>
              <div className="rounded-xl overflow-hidden border border-border/60 max-w-2xl">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="bg-secondary/30 border-b border-border/40">
                      <td className="py-3 px-4 font-bold text-foreground w-1/3">SKU</td>
                      <td className="py-3 px-4 text-muted-foreground font-medium">{product.sku}</td>
                    </tr>
                    <tr className="bg-card border-b border-border/40">
                      <td className="py-3 px-4 font-bold text-foreground">Category</td>
                      <td className="py-3 px-4 text-muted-foreground font-medium">{product.category?.name || "General"}</td>
                    </tr>
                    <tr className="bg-secondary/30 border-b border-border/40">
                      <td className="py-3 px-4 font-bold text-foreground">Stock Status</td>
                      <td className="py-3 px-4 text-muted-foreground font-medium">{product.stock || 0} Items Available</td>
                    </tr>
                    {(product as any).specifications &&
                      Array.isArray((product as any).specifications) &&
                      ((product as any).specifications as { label: string; value: string }[]).map((spec, i) => (
                        <tr key={i} className={`${i % 2 === 0 ? "bg-card" : "bg-secondary/30"} border-b border-border/40`}>
                          <td className="py-3 px-4 font-bold text-foreground">{spec.label}</td>
                          <td className="py-3 px-4 text-muted-foreground font-medium">{spec.value}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="bg-card border border-border/80 rounded-2xl p-6 sm:p-8 space-y-8 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
                <div>
                  <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
                    Customer Reviews ({reviews.length})
                  </h2>
                  <p className="text-xs text-muted-foreground font-medium mt-1">
                    Have you purchased this product? Leave your rating & feedback below!
                  </p>
                </div>
              </div>

              <div className="bg-secondary/40 rounded-2xl p-6 border border-border/60 space-y-4">
                <h3 className="text-base font-bold text-foreground">Write Your Review</h3>
                <ReviewForm
                  productId={product.id}
                  productName={product.name}
                  onSuccess={() => { }}
                />
              </div>

              <ReviewList reviews={reviews} />
            </div>
          )}
        </div>

        {relatedProducts.length > 0 && (
          <section className="mt-16 pt-10 border-t border-border/60">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">
                  {t("product.relatedProducts") || "Related Product"}
                </h2>
                <p className="text-xs text-muted-foreground font-medium mt-1">
                  Explore top recommended items from this collection
                </p>
              </div>
              <Link
                href="/shop"
                className="text-xs font-bold text-accent hover:underline"
              >
                View All →
              </Link>
            </div>
            <div className="product-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {relatedProducts.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      {isMobile && product && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border/80 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:hidden shadow-lg">
          <div className="flex items-center gap-2 max-w-md mx-auto">
            <Link
              href="/shop"
              className="h-12 w-12 shrink-0 flex items-center justify-center bg-secondary/80 text-foreground hover:bg-secondary rounded-xl border border-border/80 transition-colors"
              aria-label="Go to Shop"
            >
              <Store className="h-5 w-5" />
            </Link>

            <Button
              variant="outline"
              className="flex-1 h-12 text-xs font-bold rounded-xl border-border/90 gap-1.5"
              onClick={handleAddToCart}
              disabled={
                isAddingToCart ||
                isOutOfStock ||
                (hasVariants && !selectedVariant)
              }
            >
              {isAddingToCart ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ShoppingBag className="h-4 w-4 text-accent" />
              )}
              <span>{isOutOfStock ? "Stock Out" : "Add to Cart"}</span>
            </Button>

            <Button
              className="btn-accent flex-1 h-12 text-xs font-extrabold rounded-xl shadow-md gap-1.5"
              onClick={handleBuyNow}
              disabled={
                isBuyingNow ||
                isOutOfStock ||
                (hasVariants && !selectedVariant)
              }
            >
              {isBuyingNow ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
              <span>{isOutOfStock ? "Stock Out" : "Order Now"}</span>
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
