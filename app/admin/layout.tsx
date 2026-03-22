"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import AdminSidebar from "@/components/layout/AdminSidebar";
import MobileNav from "@/components/layout/MobileNav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("alumco-role");
    if (role !== "admin") {
      router.replace("/login");
    } else {
      setAuthorized(true);
    }
  }, [router]);

  function currentPage(): string {
    if (pathname.includes("/capacitaciones")) return "capacitaciones";
    if (pathname.includes("/colaboradores")) return "colaboradores";
    if (pathname.includes("/reportes")) return "reportes";
    return "dashboard";
  }

  function handleNavigate(page: string) {
    router.push(`/admin/${page}`);
  }

  function handleLogout() {
    localStorage.removeItem("alumco-role");
    router.replace("/login");
  }

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-3" role="status" aria-label="Cargando">
          <div className="w-10 h-10 rounded-full border-4 border-border border-t-forest animate-spin" />
          <span className="text-base text-muted">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-surface">
      <AdminSidebar
        currentPage={currentPage()}
        onNavigate={handleNavigate}
        userName="Valentina Lagos"
        onLogout={handleLogout}
      />

      <main className="main-content flex-1 flex flex-col min-w-0 ml-[240px]" aria-label="Contenido principal">
        {children}
      </main>

      <MobileNav
        currentPage={currentPage()}
        onNavigate={handleNavigate}
        role="ADMIN"
      />
    </div>
  );
}
