import Link from "next/link";
import { Leaf } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFBFF] p-6">
      <div className="flex flex-col items-center text-center max-w-sm">
        <div className="h-14 w-14 rounded-2xl bg-[#EEF2FF] flex items-center justify-center mb-4">
          <Leaf className="h-7 w-7 text-[#8A9BC8]" />
        </div>
        <h1 className="text-5xl font-bold text-[#2B4BA8] mb-2">404</h1>
        <h2 className="text-xl font-semibold text-[#1A2F6B] mb-2">Página no encontrada</h2>
        <p className="text-sm text-[#6B7AB0] mb-6">
          La página que buscas no existe o fue movida.
        </p>
        <Link
          href="/admin/dashboard"
          className="h-10 px-6 rounded-xl bg-[#2B4BA8] text-white text-sm font-medium hover:bg-[#1A2F6B] transition-colors inline-flex items-center"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
