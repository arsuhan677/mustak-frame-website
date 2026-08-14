"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { useProducts } from "@/hooks/useShopData";
import { useWishlist } from "@/hooks/useWishlist";
import {
  ArrowRight,
  ChevronRight,
  Heart,
  Home,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Trash2,
  Truck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { ProductCard } from "./products/ProductCard";

export default function WishlistPage() {
  const { productIds, wishlistCount, removeFromWishlist } = useWishlist();
  const { data: allProducts = [], isLoading } = useProducts();
  const { addItem } = useCart();
  const { t, formatCurrency } = useSiteSettings();

  // Filter all products that are saved in wishlist
  const wishlistProducts = allProducts.filter((p) => productIds.includes(p.id));

  const handleAddAllToCart = () => {
    if (wishlistProducts.length === 0) return;

    wishlistProducts.forEach((product) => {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        salePrice: product.sale_price || undefined,
        image: product.images[0] || "/placeholder.svg",
        quantity: 1,
        stock: product.stock || 10,
      });
    });

    toast.success(`Added ${wishlistProducts.length} items to cart! 🛍️`);
  };

  const handleClearAllWishlist = () => {
    if (productIds.length === 0) return;
    productIds.forEach((id) => removeFromWishlist(id));
  };

  // Empty Wishlist View
  if (!isLoading && wishlistProducts.length === 0) {
    return (
      <div className="bg-background min-h-[75vh] flex items-center justify-center py-16">
        <div className="container-shop max-w-lg text-center px-4">
          <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center rounded-3xl bg-secondary/80 border border-border/80 shadow-xs">
            <Heart className="h-12 w-12 text-muted-foreground/60" />
            <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center shadow-xs">
              0
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground mb-2">
            Your Wishlist is Empty
          </h1>
          <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
            You haven't saved any items to your wishlist yet. Tap the heart icon on any product to save your favorites for later!
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
      {/* Header Banner Section */}
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
            <span className="text-foreground font-medium">My Wishlist</span>
          </nav>

          {/* Title and features badges */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
                  My Saved Wishlist
                </h1>
                <Badge className="bg-accent/10 text-accent border border-accent/20 text-xs px-2.5 py-0.5 rounded-full font-bold">
                  {wishlistCount} {wishlistCount === 1 ? "Item" : "Items"} Saved
                </Badge>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                Your favorite sports gear and merchandise saved for easy shopping.
              </p>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center gap-2.5 shrink-0">
              <Button
                onClick={handleAddAllToCart}
                className="bg-accent text-accent-foreground hover:opacity-90 font-extrabold px-4 md:px-5 h-10 rounded-xl text-xs shadow-sm flex items-center gap-2"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>Add All to Cart</span>
              </Button>
              <Button
                variant="outline"
                onClick={handleClearAllWishlist}
                className="px-3.5 h-10 rounded-xl text-xs font-semibold text-muted-foreground hover:text-destructive hover:border-destructive/40 border-border/80 flex items-center gap-1.5 transition-colors"
                title="Clear all wishlist items"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Clear All</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-shop">
        {/* Loading Skeleton */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] bg-card border border-border/80 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {wishlistProducts.map((product) => (
              <div key={product.id} className="relative group">
                {/* 1-Click Delete Button Overlay */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeFromWishlist(product.id);
                  }}
                  className="absolute top-2 right-2 z-30 w-7.5 h-7.5 rounded-full bg-background/90 backdrop-blur-sm border border-border/80 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shadow-xs flex items-center justify-center transition-all duration-200"
                  title="Remove from Wishlist"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>

                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
