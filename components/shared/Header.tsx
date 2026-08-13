"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "@/contexts/CartContext";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { useAuth } from "@/hooks/useAuth";
import { useCategories } from "@/hooks/useShopData";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { useWishlist } from "@/hooks/useWishlist";
import {
  ChevronDown,
  ChevronRight,
  Heart,
  Home,
  LogOut,
  Menu,
  MessageCircle,
  PackageCheck,
  Search,
  ShoppingBag,
  ShoppingBasket,
  User,
  X
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export function Header() {
  const { totalItems } = useCart();
  const { wishlistCount } = useWishlist();
  const { t } = useSiteSettings();
  const { data: storeSettings, isLoading: isSettingsLoading } = useStoreSettings();
  const { data: categories = [] } = useCategories();
  const { user, signOut, isAdmin, isStaff } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [searchVal, setSearchVal] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<{ name: string; slug: string } | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const storeName = storeSettings?.store_name || "LO";
  const storeLogo = storeSettings?.store_logo || "";
  const whatsappNumber = storeSettings?.whatsapp_number || "";

  const activeCategories = useMemo(() => {
    const headerCategoriesString = storeSettings?.header_categories || "";
    const headerCategoriesSlugs = headerCategoriesString
      ? headerCategoriesString.split(",").map((s: string) => s.trim()).filter(Boolean)
      : [];

    return categories
      .filter((cat: any) => cat.is_active !== false)
      .filter((cat: any) => {
        if (headerCategoriesSlugs.length > 0) {
          return headerCategoriesSlugs.includes(cat.slug);
        }
        return true;
      })
      .sort((a: any, b: any) => {
        if (headerCategoriesSlugs.length > 0) {
          const indexA = headerCategoriesSlugs.indexOf(a.slug);
          const indexB = headerCategoriesSlugs.indexOf(b.slug);
          return indexA - indexB;
        }
        return 0;
      })
      .map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        image: cat.image,
        href: `/shop?category=${cat.slug}`,
      }))
      .slice(0, 8);
  }, [categories, storeSettings?.header_categories]);

  const navigation = useMemo(
    () => [
      { name: "HOME", href: "/" },
      { name: "Shop", href: "/shop" },
      ...activeCategories,
      { name: "Track Order", href: "/track-order" },
    ],
    [activeCategories],
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const queryParts = [];
    if (searchVal.trim()) {
      queryParts.push(`search=${encodeURIComponent(searchVal.trim())}`);
    }
    if (selectedCategory) {
      queryParts.push(`category=${encodeURIComponent(selectedCategory.slug)}`);
    }
    if (queryParts.length > 0) {
      router.push(`/shop?${queryParts.join("&")}`);
      setSearchVal("");
      setSelectedCategory(null);
    } else {
      router.push("/shop");
    }
  };

  return (
    <header
      className={`relative md:sticky top-0 z-50 w-full transition-all duration-300 bg-background/95 backdrop-blur-md border-b border-border/20 ${isScrolled ? "shadow-md" : ""
        }`}
    >
      {/* Main Header Container */}
      <div className={`w-full transition-all duration-300 ${isScrolled ? "py-2" : "py-2.5 md:py-3"}`}>
        <div className="container-shop">
          <div className="flex items-center justify-between gap-2 md:gap-8">
            {/* Mobile Menu Drawer Trigger (Left on Mobile, Hidden on Desktop) */}
            <div className="md:hidden flex-1 flex justify-start">
              <Sheet>
                <SheetTrigger asChild className="md:hidden">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 hover:bg-secondary rounded-xl transition-colors cursor-pointer"
                    aria-label="Open menu"
                  >
                    <Menu className="h-6.5 w-6.5 text-foreground" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[85vw] max-w-xs bg-background p-0 border-r border-border/60">
                  <div className="flex flex-col h-full">
                    {/* Drawer Header */}
                    <div className="p-5 border-b border-border/60 bg-secondary/30 flex items-center justify-between">
                      <Link href="/" className="flex items-center gap-2">
                        {isSettingsLoading ? (
                          <div className="w-32 h-12 bg-muted/65 animate-pulse rounded-xl" />
                        ) : storeLogo ? (
                          <Image
                            src={storeLogo}
                            alt={storeName}
                            height={48}
                            width={200}
                            style={{ width: "auto" }}
                            className="h-12 w-auto object-contain rounded-xl"
                          />
                        ) : (
                          <span className="text-xl font-black tracking-tight text-foreground">{storeName}</span>
                        )}
                      </Link>
                    </div>

                    {/* Drawer Content Body */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-6">
                      {/* Quick Navigation Cards */}
                      <div className="grid grid-cols-2 gap-2">
                        <SheetClose asChild>
                          <Link href="/shop" className="flex items-center gap-2 p-3 bg-secondary/50 rounded-xl hover:bg-accent/10 hover:text-accent transition-all text-xs font-bold border border-border/40">
                            <ShoppingBag className="h-4 w-4 text-accent" />
                            <span>Shop All</span>
                          </Link>
                        </SheetClose>

                        <SheetClose asChild>
                          <Link href="/wishlist" className="flex items-center gap-2 p-3 bg-secondary/50 rounded-xl hover:bg-accent/10 hover:text-accent transition-all text-xs font-bold border border-border/40 justify-between">
                            <div className="flex items-center gap-2">
                              <Heart className="h-4 w-4 text-rose-500" />
                              <span>Wishlist</span>
                            </div>
                            {wishlistCount > 0 && (
                              <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                                {wishlistCount}
                              </span>
                            )}
                          </Link>
                        </SheetClose>
                      </div>

                      {/* Primary Nav Links */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground px-2">Navigation</span>
                        <nav className="flex flex-col gap-1 pt-1">
                          <SheetClose asChild>
                            <Link href="/" className={`flex items-center justify-between p-2.5 rounded-xl text-sm font-bold transition-all ${pathname === "/" ? "bg-accent/10 text-accent" : "text-foreground hover:bg-secondary"}`}>
                              <div className="flex items-center gap-2.5">
                                <Home className="h-4 w-4" />
                                <span>Home</span>
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
                            </Link>
                          </SheetClose>

                          <SheetClose asChild>
                            <Link href="/shop" className={`flex items-center justify-between p-2.5 rounded-xl text-sm font-bold transition-all ${pathname === "/shop" ? "bg-accent/10 text-accent" : "text-foreground hover:bg-secondary"}`}>
                              <div className="flex items-center gap-2.5">
                                <ShoppingBag className="h-4 w-4" />
                                <span>All Products</span>
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
                            </Link>
                          </SheetClose>

                          <SheetClose asChild>
                            <Link href="/track-order" className={`flex items-center justify-between p-2.5 rounded-xl text-sm font-bold transition-all ${pathname === "/track-order" ? "bg-accent/10 text-accent" : "text-foreground hover:bg-secondary"}`}>
                              <div className="flex items-center gap-2.5">
                                <PackageCheck className="h-4 w-4" />
                                <span>Track Order</span>
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
                            </Link>
                          </SheetClose>
                        </nav>
                      </div>

                      {/* Categories List */}
                      {activeCategories.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground px-2">Categories</span>
                          <nav className="flex flex-col gap-1 pt-1">
                            {activeCategories.map((cat) => (
                              <SheetClose key={cat.id} asChild>
                                <Link
                                  href={cat.href}
                                  className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all ${pathname.includes(cat.slug) ? "bg-accent text-accent-foreground" : "text-foreground/90 hover:bg-secondary"
                                    }`}
                                >
                                  <span>{cat.name}</span>
                                  <ChevronRight className="h-3.5 w-3.5 opacity-60" />
                                </Link>
                              </SheetClose>
                            ))}
                          </nav>
                        </div>
                      )}

                      {/* WhatsApp Help Banner */}
                      {whatsappNumber && (
                        <a
                          href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 bg-[#25D366]/10 text-[#25D366] rounded-xl border border-[#25D366]/20 font-bold text-xs hover:bg-[#25D366]/20 transition-all"
                        >
                          <MessageCircle className="h-5 w-5 fill-[#25D366] text-white shrink-0" />
                          <div>
                            <p className="leading-tight">Need Help?</p>
                            <p className="text-[10px] opacity-80 leading-tight">Chat on WhatsApp</p>
                          </div>
                        </a>
                      )}
                    </div>

                    {/* Drawer Footer Account CTA */}
                    <div className="p-4 border-t border-border/60 bg-secondary/20">
                      {user ? (
                        <div className="flex items-center justify-between w-full">
                          {isAdmin || isStaff ? (
                            <SheetClose asChild>
                              <Link href="/admin" className="flex items-center gap-2 text-xs font-bold text-foreground hover:text-accent">
                                <User className="h-4 w-4" />
                                <span>Admin Panel</span>
                              </Link>
                            </SheetClose>
                          ) : (
                            <div className="flex flex-col gap-1 text-left">
                              <SheetClose asChild>
                                <Link href="/admin" className="flex items-center gap-2 text-xs font-bold text-foreground hover:text-accent">
                                  <User className="h-4 w-4 text-accent shrink-0" />
                                  <span>My Dashboard</span>
                                </Link>
                              </SheetClose>
                              <span className="text-[10px] text-muted-foreground ml-6 truncate max-w-[120px]">{user.email}</span>
                            </div>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => signOut()} className="h-8 text-xs text-destructive hover:bg-destructive/10 gap-1 cursor-pointer ml-auto">
                            <LogOut className="h-3.5 w-3.5" />
                            Logout
                          </Button>
                        </div>
                      ) : (
                        <SheetClose asChild>
                          <Link href="/admin/login" className="flex items-center justify-center gap-2 w-full py-2.5 bg-accent text-accent-foreground rounded-xl font-extrabold text-xs shadow-xs hover:bg-accent/90 transition-all">
                            <User className="h-4 w-4" />
                            <span>Login / Register</span>
                          </Link>
                        </SheetClose>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Store Logo (Centered on Mobile, Left-aligned on Desktop) */}
            <div className="flex-1 md:flex-initial flex justify-center md:justify-start shrink-0">
              <Link href="/" className="flex items-center group">
                {isSettingsLoading ? (
                  <div className="w-32 h-10 sm:h-12 md:h-14 bg-muted/65 animate-pulse rounded-xl" />
                ) : storeLogo ? (
                  <div className="relative overflow-hidden transition-transform duration-300 group-hover:scale-105">
                    <Image
                      src={storeLogo}
                      alt={storeName}
                      height={56}
                      width={200}
                      style={{ width: "auto" }}
                      className="h-10 sm:h-12 md:h-14 w-auto object-contain rounded-md"
                    />
                  </div>
                ) : (
                  <span className="text-lg sm:text-xl md:text-2xl font-black tracking-tight text-foreground">
                    {storeName}
                  </span>
                )}
              </Link>
            </div>

            {/* Desktop Wide Search Bar */}
            <form
              onSubmit={handleSearchSubmit}
              className="hidden md:flex items-center flex-1 max-w-xl border border-border/80 rounded-xl bg-background overflow-hidden relative shadow-2xs focus-within:border-accent"
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors shrink-0 outline-none border-none select-none cursor-pointer"
                  >
                    <span className="truncate max-w-[100px]">
                      {selectedCategory ? selectedCategory.name : "All Categories"}
                    </span>
                    <ChevronDown className="h-3 w-3 shrink-0" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48 max-h-60 overflow-y-auto bg-popover border border-border rounded-xl shadow-md z-50 p-1">
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedCategory(null);
                      if (searchVal.trim()) {
                        router.push(`/shop?search=${encodeURIComponent(searchVal.trim())}`);
                      } else {
                        router.push(`/shop`);
                      }
                    }}
                    className="rounded-lg cursor-pointer transition-colors px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
                  >
                    All Categories
                  </DropdownMenuItem>
                  {categories.map((cat: any) => (
                    <DropdownMenuItem
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory({ name: cat.name, slug: cat.slug });
                        const query = searchVal.trim()
                          ? `/shop?category=${cat.slug}&search=${encodeURIComponent(searchVal.trim())}`
                          : `/shop?category=${cat.slug}`;
                        router.push(query);
                      }}
                      className="rounded-lg cursor-pointer transition-colors px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
                    >
                      {cat.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <span className="h-5 w-[1px] bg-border/80 shrink-0" />

              <input
                type="search"
                placeholder={t("nav.searchProducts")}
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-full py-2 pl-3 pr-10 text-sm bg-transparent outline-none border-none placeholder-muted-foreground"
              />
              {searchVal && (
                <button
                  type="button"
                  onClick={() => setSearchVal("")}
                  className="absolute right-14 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                type="submit"
                className="bg-accent text-accent-foreground p-2.5 px-5 hover:bg-accent/90 transition-colors flex items-center justify-center shrink-0 border-l border-border/10 cursor-pointer"
              >
                <Search className="h-4 w-4" />
              </button>
            </form>

            {/* Right Actions & Account Status Info */}
            <div className="flex-1 md:flex-initial flex items-center gap-2.5 sm:gap-4 md:gap-6 justify-end shrink-0 select-none">
              {/* Wishlist Heart Icon */}
              <Link
                href="/wishlist"
                className="hidden md:flex relative items-center justify-center h-9 w-9 rounded-xl hover:bg-secondary text-foreground hover:text-accent transition-colors cursor-pointer"
                title="Wishlist"
              >
                <Heart className="h-5.5 w-5.5 sm:h-6 sm:w-6" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 sm:h-4.5 sm:w-4.5 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-xs">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart Icon */}
              <Link
                href="/cart"
                className="relative flex items-center justify-center h-9 w-9 rounded-xl hover:bg-secondary text-foreground hover:text-accent transition-colors cursor-pointer"
                title="Cart"
              >
                <ShoppingBasket className="h-5.5 w-5.5 sm:h-6 sm:w-6" />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 sm:h-4.5 sm:w-4.5 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-accent-foreground shadow-xs animate-pulse">
                    {totalItems}
                  </span>
                )}
              </Link>

              {/* Account button: Compact icon on mobile, Full text on desktop */}
              <div className="hidden md:block shrink-0">
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-secondary text-foreground hover:text-accent transition-all group shrink-0 outline-none border-none bg-transparent select-none cursor-pointer">
                        <User className="h-5.5 w-5.5 sm:h-6 sm:w-6 text-foreground group-hover:text-accent transition-colors" />
                        <div className="hidden md:flex flex-col text-left">
                          <span className="text-xs md:text-sm font-bold text-foreground group-hover:text-accent transition-colors leading-tight">
                            Account
                          </span>
                          <span className="text-[10px] font-medium text-accent leading-tight">
                            {isAdmin || isStaff ? "Admin Panel" : "Customer Account"}
                          </span>
                        </div>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52 bg-popover border border-border rounded-xl shadow-md z-50 p-1">
                      <div className="px-3 py-2 border-b border-border/40 text-left">
                        <p className="text-[10px] text-muted-foreground leading-none font-bold uppercase">Logged in as</p>
                        <p className="text-xs font-semibold text-foreground truncate mt-1" title={user.email}>{user.email}</p>
                      </div>
                      {(isAdmin || isStaff) ? (
                        <DropdownMenuItem asChild>
                          <Link
                            href="/admin"
                            className="w-full flex items-center gap-2 rounded-lg cursor-pointer transition-colors px-3 py-2 text-xs font-bold text-foreground hover:bg-muted"
                          >
                            <User className="h-3.5 w-3.5" />
                            <span>Admin Panel</span>
                          </Link>
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem asChild>
                          <Link
                            href="/admin"
                            className="w-full flex items-center gap-2 rounded-lg cursor-pointer transition-colors px-3 py-2 text-xs font-bold text-foreground hover:bg-muted"
                          >
                            <User className="h-3.5 w-3.5" />
                            <span>My Dashboard</span>
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => signOut()}
                        className="rounded-lg cursor-pointer transition-colors px-3 py-2 text-xs font-bold text-destructive hover:bg-destructive/10 hover:text-destructive flex items-center gap-2"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>Logout</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link
                    href="/admin/login"
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-secondary text-foreground hover:text-accent transition-all group shrink-0"
                  >
                    <User className="h-5.5 w-5.5 sm:h-6 sm:w-6 text-foreground group-hover:text-accent transition-colors" />
                    <div className="hidden md:flex flex-col text-left">
                      <span className="text-xs md:text-sm font-bold text-foreground group-hover:text-accent transition-colors leading-tight">
                        Account
                      </span>
                      <span className="text-[10px] font-medium text-accent leading-tight">
                        Register or Login
                      </span>
                    </div>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Search Row - Ultra-smooth grid collapse on scroll */}
          <div
            className={`md:hidden grid transition-all duration-300 ease-in-out ${isScrolled
              ? "grid-rows-[0fr] opacity-0 pointer-events-none"
              : "grid-rows-[1fr] opacity-100 mt-2 pt-2 border-t border-border/60"
              }`}
          >
            <div className="overflow-hidden">
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-1.5 bg-muted/40 rounded-xl border border-border/50 p-1 focus-within:border-accent focus-within:bg-background transition-all">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-extrabold text-foreground/80 bg-background/80 rounded-lg shrink-0 border border-border/80 cursor-pointer"
                    >
                      <span className="truncate max-w-[85px]">
                        {selectedCategory ? selectedCategory.name : "All"}
                      </span>
                      <ChevronDown className="h-3 w-3 shrink-0" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-44 max-h-56 overflow-y-auto bg-popover border border-border rounded-xl shadow-md z-50 p-1">
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedCategory(null);
                        if (searchVal.trim()) {
                          router.push(`/shop?search=${encodeURIComponent(searchVal.trim())}`);
                        } else {
                          router.push(`/shop`);
                        }
                      }}
                      className="rounded-lg cursor-pointer text-xs font-bold"
                    >
                      All Categories
                    </DropdownMenuItem>
                    {categories.map((cat: any) => (
                      <DropdownMenuItem
                        key={cat.id}
                        onClick={() => {
                          setSelectedCategory({ name: cat.name, slug: cat.slug });
                          const query = searchVal.trim()
                            ? `/shop?category=${cat.slug}&search=${encodeURIComponent(searchVal.trim())}`
                            : `/shop?category=${cat.slug}`;
                          router.push(query);
                        }}
                        className="rounded-lg cursor-pointer text-xs font-bold"
                      >
                        {cat.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="relative flex-1 flex items-center">
                  <input
                    type="search"
                    placeholder={t("nav.searchProducts")}
                    value={searchVal}
                    onChange={(e) => setSearchVal(e.target.value)}
                    className="w-full py-1.5 pl-2 pr-7 text-xs bg-transparent outline-none border-none placeholder-muted-foreground font-medium"
                  />
                  {searchVal && (
                    <button
                      type="button"
                      onClick={() => setSearchVal("")}
                      className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  className="bg-accent text-accent-foreground p-2 rounded-lg hover:bg-accent/90 transition-colors flex items-center justify-center shrink-0 cursor-pointer"
                  aria-label="Search"
                >
                  <Search className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Desktop Navigation Bar */}
      <div
        className={`hidden md:block border-t border-border/35 bg-background select-none transition-all duration-300 ease-in-out ${isScrolled
          ? "max-h-0 opacity-0 overflow-hidden border-t-0 py-0"
          : "max-h-14 opacity-100 py-1.5"
          }`}
      >
        <div className="container-shop flex items-center justify-start gap-1 flex-nowrap overflow-x-auto scrollbar-none">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`py-1.5 px-2.5 lg:px-4 text-xs lg:text-[14px] font-semibold transition-all duration-300 rounded-md flex items-center gap-1 shrink-0 ${isActive
                  ? "bg-accent text-accent-foreground font-bold shadow-2xs"
                  : "text-foreground hover:text-accent hover:bg-secondary/40"
                  }`}
              >
                <span>{item.name}</span>
                {"hasDropdown" in item && (item as any).hasDropdown && (
                  <ChevronDown className="h-3 w-3 shrink-0" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}

