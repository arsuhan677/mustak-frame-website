"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import {
  ArrowRight,
  ChevronRight,
  Home,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Tag,
  Trash2,
  Truck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, clearCart } = useCart();
  const { t, formatCurrency } = useSiteSettings();
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.trim()) {
      setAppliedCoupon(couponCode.trim().toUpperCase());
    }
  };

  // Empty Cart View
  if (items.length === 0) {
    return (
      <div className="bg-background min-h-[75vh] flex items-center justify-center py-16">
        <div className="container-shop max-w-lg text-center px-4">
          <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center rounded-3xl bg-secondary/80 border border-border/80 shadow-xs">
            <ShoppingBag className="h-12 w-12 text-muted-foreground/60" />
            <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center shadow-xs">
              0
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground mb-2">
            Your Cart is Empty
          </h1>
          <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
            Looks like you haven't added anything to your cart yet. Explore our fresh collection and find your favorite sports merchandise!
          </p>
          <Link href="/shop">
            <Button className="bg-accent text-accent-foreground hover:opacity-90 font-bold px-8 h-12 rounded-xl text-sm shadow-sm transition-all flex items-center gap-2 mx-auto">
              <span>Explore Shop Catalog</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen pb-20">
      {/* Header Banner Section (Matching Shop Page Aesthetic) */}
      <div className="border-b border-border/60 bg-muted/20 py-6 mb-8">
        <div className="container-shop">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            <Link href="/" className="hover:text-foreground flex items-center gap-1 transition-colors">
              <Home className="h-3.5 w-3.5" />
              <span>Home</span>
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/shop" className="hover:text-foreground transition-colors">
              Shop
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">Shopping Cart</span>
          </nav>

          {/* Title and features badges */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
                  Shopping Cart
                </h1>
                <Badge className="bg-accent/10 text-accent border border-accent/20 text-xs px-2.5 py-0.5 rounded-full font-bold">
                  {totalItemCount} {totalItemCount === 1 ? "Item" : "Items"}
                </Badge>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                Review your items, apply discount codes, and proceed to secure checkout.
              </p>
            </div>

            {/* Feature Badges */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-background px-3 py-1.5 rounded-full border border-border/80 shadow-xs">
                <ShieldCheck className="h-3.5 w-3.5 text-accent" />
                <span>100% Secure Checkout</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-background px-3 py-1.5 rounded-full border border-border/80 shadow-xs">
                <Truck className="h-3.5 w-3.5 text-accent" />
                <span>Fast Shipping BD</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-shop">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Item Cards */}
            {items.map((item) => {
              const price = item.salePrice ?? item.price;
              const itemTotal = price * item.quantity;

              return (
                <div
                  key={item.id}
                  className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-accent/40 transition-all flex flex-col sm:flex-row gap-4 sm:items-center justify-between group"
                >
                  {/* Image & Details */}
                  <div className="flex gap-4 items-center min-w-0">
                    <Link
                      href={`/products/${item.slug || item.id.split("-").slice(0, 5).join("-")}`}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-secondary shrink-0 relative border border-border/60 group-hover:border-accent/30 transition-colors"
                    >
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </Link>

                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/products/${item.slug || item.id.split("-").slice(0, 5).join("-")}`}
                        className="font-bold text-sm sm:text-base text-foreground hover:text-accent transition-colors line-clamp-2 leading-snug"
                      >
                        {item.name}
                      </Link>

                      {/* Stock status */}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-accent/10 text-accent">
                          In Stock
                        </span>
                      </div>

                      {/* Price breakdown */}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="font-bold text-sm text-foreground">
                          {formatCurrency(price)}
                        </span>
                        {item.salePrice && item.salePrice < item.price && (
                          <span className="text-xs text-muted-foreground line-through">
                            {formatCurrency(item.price)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quantity Counter & Subtotal */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-border/60">
                    {/* Quantity Control Pill */}
                    <div className="flex items-center border border-border/80 rounded-xl bg-background overflow-hidden p-1 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-foreground/80 hover:bg-secondary hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-foreground">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-foreground/80 hover:bg-secondary hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Subtotal */}
                    <div className="text-right shrink-0">
                      <span className="block text-sm font-extrabold text-foreground">
                        {formatCurrency(itemTotal)}
                      </span>
                    </div>

                    {/* Trash / Delete button */}
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                      title="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Bottom Actions Bar */}
            <div className="flex items-center justify-between pt-2">
              <Link href="/shop">
                <Button variant="outline" size="sm" className="rounded-xl text-xs gap-2 border-border/80">
                  <ArrowRight className="h-3.5 w-3.5 rotate-180" />
                  <span>Continue Shopping</span>
                </Button>
              </Link>

              <Button
                variant="ghost"
                size="sm"
                onClick={clearCart}
                className="text-xs text-muted-foreground hover:text-destructive gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Clear Cart</span>
              </Button>
            </div>
          </div>

          {/* Sticky Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-xs sticky top-24 space-y-5">
              <div className="flex items-center justify-between border-b border-border/60 pb-4">
                <h2 className="font-extrabold text-base text-foreground flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-accent" />
                  <span>Order Summary</span>
                </h2>
                <span className="text-xs text-muted-foreground font-medium">
                  {totalItemCount} items
                </span>
              </div>

              {/* Subtotal & Delivery details */}
              <div className="space-y-3 text-xs font-medium">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-bold text-foreground">{formatCurrency(subtotal)}</span>
                </div>

                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping Estimate</span>
                  <span className="text-accent font-bold">
                    Calculated at Checkout
                  </span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between items-center text-accent bg-accent/10 px-3 py-1.5 rounded-lg border border-accent/20">
                    <span className="flex items-center gap-1 font-bold">
                      <Tag className="h-3 w-3" />
                      Coupon: {appliedCoupon}
                    </span>
                    <span className="font-bold">-Applied</span>
                  </div>
                )}
              </div>

              {/* Coupon Code Box */}
              <form onSubmit={handleApplyCoupon} className="pt-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Discount Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter promo code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 bg-background border border-border/80 rounded-xl px-3.5 py-2 text-xs font-medium text-foreground placeholder:text-muted-foreground outline-none focus:border-accent transition-colors"
                  />
                  <Button
                    type="submit"
                    variant="outline"
                    size="sm"
                    className="rounded-xl text-xs font-bold px-4 shrink-0"
                  >
                    Apply
                  </Button>
                </div>
              </form>

              <hr className="border-border/60" />

              {/* Total Row */}
              <div className="flex justify-between items-baseline pt-1">
                <div>
                  <span className="block font-extrabold text-sm text-foreground">Total Amount</span>
                  <span className="text-[11px] text-muted-foreground font-medium">Inclusive of all taxes</span>
                </div>
                <span className="text-2xl font-black tracking-tight text-accent">
                  {formatCurrency(subtotal)}
                </span>
              </div>

              {/* Checkout Button */}
              <Link href="/checkout" className="block pt-2">
                <Button className="w-full bg-accent text-accent-foreground hover:opacity-90 font-extrabold h-12 rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2">
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>

              {/* Trust & Guarantee Info */}
              <div className="pt-2 border-t border-border/60 space-y-2 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-accent shrink-0" />
                  <span>Guaranteed safe & secure checkout</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="h-3.5 w-3.5 text-accent shrink-0" />
                  <span>Cash on Delivery available all over Bangladesh</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
