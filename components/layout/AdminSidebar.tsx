"use client";

import { ReactNode } from "react";

interface NavItem {
  key: string;
  label: string;
  icon: ReactNode;
}

interface AdminSidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  userName?: string;
  onLogout: () => void;
}

const navItems: NavItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="7" height="8" rx="1.5" />
        <rect x="11" y="2" width="7" height="5" rx="1.5" />
        <rect x="2" y="12" width="7" height="6" rx="1.5" />
        <rect x="11" y="9" width="7" height="9" rx="1.5" />
      </svg>
    ),
  },
  {
    key: "capacitaciones",
    label: "Capacitaciones",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 2h12a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" />
        <path d="M7 6h6M7 10h6M7 14h4" />
      </svg>
    ),
  },
  {
    key: "colaboradores",
    label: "Colaboradores",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="7" cy="7" r="3" />
        <path d="M2 17c0-3 2.5-5 5-5s5 2 5 5" />
        <circle cx="14" cy="7" r="2.5" />
        <path d="M13 12c1.5 0 4 1.5 4 4" />
      </svg>
    ),
  },
  {
    key: "reportes",
    label: "Reportes",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 17V7l4-4h8a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <path d="M7 3v4H3" />
        <path d="M7 13h6M7 16h4" />
      </svg>
    ),
  },
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function AdminSidebar({
  currentPage,
  onNavigate,
  userName = "Valentina Lagos",
  onLogout,
}: AdminSidebarProps) {
  return (
    <aside className="sidebar-desktop fixed top-0 left-0 h-screen w-[240px] bg-ink flex flex-col z-50">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-forest flex items-center justify-center">
            <span className="text-white font-serif font-bold text-lg">A</span>
          </div>
          <div>
            <h1 className="font-serif text-white text-lg font-bold leading-tight">
              ALUMCO
            </h1>
            <p className="text-white/40 text-xs">Capacitación</p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="px-5 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-forest-mid flex items-center justify-center shrink-0">
            <span className="text-white text-sm font-medium">
              {getInitials(userName)}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">
              {userName}
            </p>
            <span className="inline-block mt-0.5 text-[11px] font-medium text-forest-light bg-forest-light/15 rounded-full px-2 py-0.5">
              Admin
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = currentPage === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`
                w-full flex items-center gap-3
                rounded-lg px-3 py-2.5
                text-base font-sans font-medium
                transition-colors duration-150
                cursor-pointer border-0
                ${
                  isActive
                    ? "bg-forest text-white"
                    : "bg-transparent text-white/60 hover:text-white hover:bg-white/5"
                }
              `}
            >
              <span className="shrink-0">{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={onLogout}
          className="
            w-full flex items-center gap-3
            rounded-lg px-3 py-2.5
            text-base font-sans font-medium
            text-white/50 hover:text-white hover:bg-white/5
            transition-colors duration-150
            cursor-pointer border-0 bg-transparent
          "
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 17H4a1 1 0 01-1-1V4a1 1 0 011-1h3" />
            <path d="M14 14l4-4-4-4" />
            <path d="M18 10H8" />
          </svg>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
