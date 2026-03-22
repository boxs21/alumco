"use client";

import { ReactNode } from "react";

interface MobileNavItem {
  key: string;
  label: string;
  icon: ReactNode;
}

interface MobileNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  role: "ADMIN" | "COLLABORATOR";
}

const adminItems: MobileNavItem[] = [
  {
    key: "dashboard",
    label: "Inicio",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="7" height="8" rx="1.5" />
        <rect x="12" y="2" width="8" height="5" rx="1.5" />
        <rect x="2" y="12" width="7" height="8" rx="1.5" />
        <rect x="12" y="9" width="8" height="11" rx="1.5" />
      </svg>
    ),
  },
  {
    key: "capacitaciones",
    label: "Capacitaciones",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 2h14a1 1 0 011 1v16a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" />
        <path d="M7 7h8M7 11h8M7 15h5" />
      </svg>
    ),
  },
  {
    key: "colaboradores",
    label: "Personas",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="8" r="3" />
        <path d="M2 19c0-3.5 3-6 6-6s6 2.5 6 6" />
        <circle cx="16" cy="8" r="2.5" />
        <path d="M15 13c2 0 5 1.5 5 5" />
      </svg>
    ),
  },
  {
    key: "reportes",
    label: "Reportes",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 19V8l5-5h9a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <path d="M8 3v5H3" />
      </svg>
    ),
  },
];

const collaboratorItems: MobileNavItem[] = [
  {
    key: "portal",
    label: "Inicio",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l8-6 8 6v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path d="M9 20v-7h4v7" />
      </svg>
    ),
  },
  {
    key: "capacitaciones",
    label: "Capacitaciones",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 2h14a1 1 0 011 1v16a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" />
        <path d="M7 7h8M7 11h8M7 15h5" />
      </svg>
    ),
  },
  {
    key: "historial",
    label: "Historial",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="9" />
        <path d="M11 6v5l3 3" />
      </svg>
    ),
  },
];

export default function MobileNav({
  currentPage,
  onNavigate,
  role,
}: MobileNavProps) {
  const items = role === "ADMIN" ? adminItems : collaboratorItems;

  return (
    <div className="mobile-nav">
      {items.map((item) => {
        const isActive = currentPage === item.key;
        return (
          <button
            key={item.key}
            onClick={() => onNavigate(item.key)}
            className={`mobile-nav-item ${isActive ? "active" : ""}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
