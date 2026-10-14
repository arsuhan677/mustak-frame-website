"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { ReactNode, useState } from "react";
import { AdminHeader } from "./Header";
import { AdminSidebar } from "./Sidebar";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

interface Props {
  children: ReactNode;
}

export function AdminLayout({ children }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, isStaff, isLoading, signOut } = useAuth();
  const isLoginPage =
    pathname === "/admin/login" || pathname === "/admin/register";

  useEffect(() => {
    if (!isLoading && !isLoginPage) {
      if (!user) {
        router.replace("/admin/login");
      } else if (!isAdmin && !isStaff) {
        if (pathname !== "/admin") {
          router.replace("/admin");
        }
      }
    }
  }, [user, isAdmin, isStaff, isLoading, isLoginPage, pathname, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
          <p className="text-xs font-semibold text-muted-foreground animate-pulse">
            Verifying access...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Render simplified Customer Portal layout if authenticated but not admin/staff
  if (!isAdmin && !isStaff) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <header className="h-16 border-b bg-card flex items-center justify-between px-6 sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-foreground">Customer Portal</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden md:inline text-sm text-muted-foreground">{user.email}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await signOut();
                router.replace("/admin/login");
              }}
              className="text-red-500 hover:text-red-600 hover:bg-red-50/50 border-red-200 cursor-pointer"
            >
              Logout
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-6xl mx-auto w-full">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex sticky top-0 h-screen shrink-0">
        <AdminSidebar />
      </div>

      <div className="flex flex-col flex-1 min-w-0 min-h-screen">
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 z-50">
          <div className="h-16 border-b bg-background flex items-center px-4">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button size="icon" variant="ghost">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>

              <SheetContent
                side="left"
                className="p-0 w-[280px] gap-0 h-full max-h-dvh overflow-hidden border-r"
                showCloseButton={false}
              >
                <AdminSidebar mobile closeSidebar={() => setOpen(false)} />
              </SheetContent>
            </Sheet>

            <div className="ml-3 font-bold text-lg">Admin Panel</div>
          </div>
        </div>

        <AdminHeader />

        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
