"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Heart, ShoppingBasket, User, Store } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/hooks/useWishlist";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { totalItems } = useCart();
  const { wishlistCount } = useWishlist();

  if (pathname?.startsWith("/product")) {
    return null;
  }

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Shop", href: "/shop", icon: Store },
    { name: "Wishlist", href: "/wishlist", icon: Heart, count: wishlistCount },
    { name: "Cart", href: "/cart", icon: ShoppingBasket, count: totalItems },
    { name: "Account", href: "/admin", icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border/40 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] pb-safe">
      <nav className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`relative flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
                isActive ? "text-accent" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="relative">
                <Icon className={`h-5 w-5 ${isActive ? "fill-accent/20" : ""}`} />
                {item.count !== undefined && item.count > 0 && (
                  <span className="absolute -top-1 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-accent-foreground shadow-xs">
                    {item.count}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium leading-none">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
