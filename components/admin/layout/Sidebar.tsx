"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { ADMIN_NAVIGATION } from "@/config/admin-nav";
import { useAuth } from "@/hooks/useAuth";
import { getSidebarItems } from "@/lib/permission";
import { ChevronRight, LogOut, Store, X } from "lucide-react";

interface Props {
  mobile?: boolean;
  closeSidebar?: () => void;
}

export function AdminSidebar({ mobile, closeSidebar }: Props) {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const router = useRouter();

  const sidebarItems = getSidebarItems("admin");
  const sections = ["Main", "Store", "System"] as const;

  const handleLogout = async () => {
    await signOut();
    router.push("/admin/login");
  };

  return (
    <aside
      className={`
      w-[280px]
      h-full
      ${mobile ? "max-h-dvh" : "h-screen"}
      border-r
      bg-card
      flex
      flex-col
      overflow-hidden
    `}
    >
      {/* Sidebar Header */}
      <div className="h-16 border-b flex items-center justify-between px-6 shrink-0 bg-card">
        <h2 className="font-bold text-xl tracking-tight text-foreground">
          STORE ADMIN
        </h2>
        {mobile && (
          <button
            type="button"
            onClick={() => closeSidebar?.()}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Scrollable Navigation Area - min-h-0 is required in flex column to enable scrolling */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 space-y-4 touch-pan-y">
        {sections.map((section) => {
          const items = sidebarItems.filter((i) => i.section === section);
          if (items.length === 0) return null;
          return (
            <div key={section}>
              <p className="px-3 mb-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                {section}
              </p>

              <nav className="space-y-1">
                {items.map((item) => {
                  const Icon = item.icon;

                  const active =
                    item.href === "/admin"
                      ? pathname === "/admin"
                      : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => closeSidebar?.()}
                      className={`
                        flex
                        items-center
                        gap-3
                        px-3.5
                        py-2.5
                        rounded-xl
                        text-sm
                        font-medium
                        transition-all

                        ${
                          active
                            ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                            : "hover:bg-muted text-foreground/80 hover:text-foreground"
                        }
                      `}
                    >
                      <Icon className="h-4 w-4 shrink-0" />

                      <span className="truncate">{item.name}</span>

                      {active && (
                        <ChevronRight className="ml-auto h-4 w-4 shrink-0" />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          );
        })}
      </div>

      {/* Sidebar Footer (Fixed at bottom) */}
      <div className="border-t p-4 shrink-0 bg-card space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium hover:bg-muted text-foreground/80 hover:text-foreground transition-colors"
        >
          <Store className="h-4 w-4 shrink-0" />
          <span>Back to Store</span>
        </Link>
        <button
          type="button"
          className="flex items-center gap-3 text-destructive w-full px-3.5 py-2.5 rounded-xl text-sm font-medium hover:bg-destructive/10 transition-colors"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
