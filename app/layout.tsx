import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/providers/ThemeProvider";
import FontSizeProvider from "@/components/providers/FontSizeProvider";

// Inter — closest free equivalent to Neue Haas Grotesk (DESIGN.md: Haas)
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ALUMCO - Plataforma de Capacitación",
  description: "Plataforma de capacitación interna para la ONG ALUMCO",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <FontSizeProvider>{children}</FontSizeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
