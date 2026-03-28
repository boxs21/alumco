import Sidebar from "@/components/layout/Sidebar";
import BottomNav from "@/components/layout/BottomNav";

/**
 * Layout del panel de administración.
 * En escritorio muestra la barra lateral fija (Sidebar).
 * En móvil la reemplaza con la navegación inferior (BottomNav).
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#faf9f6]">
      {/* Sidebar visible solo en pantallas grandes (lg+) */}
      <Sidebar />
      {/* Contenido principal — margen izquierdo para dejar espacio al Sidebar en escritorio */}
      <main className="lg:ml-64 pb-16 lg:pb-0">{children}</main>
      {/* Navegación inferior visible solo en móvil */}
      <BottomNav />
    </div>
  );
}
