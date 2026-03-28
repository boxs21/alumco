import type { Metadata } from "next";
import { PT_Sans, PT_Serif } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/providers/ThemeProvider";
import FontSizeProvider from "@/components/providers/FontSizeProvider";

// Fuente sans-serif principal — humanista y legible
const ptSans = PT_Sans({
  variable: "--font-pt-sans",
  subsets: ["latin"],
  weight: ["400", "700"],
});

// Fuente serif para títulos y el logo — clásica y sólida
const ptSerif = PT_Serif({
  variable: "--font-pt-serif",
  subsets: ["latin"],
  weight: ["400", "700"],
});

/** Metadatos de la aplicación (usados por Next.js para el <head>) */
export const metadata: Metadata = {
  title: "ALUMCO - Plataforma de Capacitación",
  description: "Plataforma de capacitación interna para la ONG ALUMCO",
};

/**
 * Layout raíz de la aplicación.
 * Envuelve toda la app con los proveedores de tema y tamaño de fuente.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // lang="es" para accesibilidad y SEO en español
    <html lang="es" className={`${ptSans.variable} ${ptSerif.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {/* ThemeProvider aplica el tema visual; FontSizeProvider controla el tamaño de fuente */}
        <ThemeProvider>
          <FontSizeProvider>{children}</FontSizeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
