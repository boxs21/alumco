"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app error boundary]", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf9f6] p-6">
      <div className="flex flex-col items-center text-center max-w-sm">
        <div className="h-14 w-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
          <AlertCircle className="h-7 w-7 text-red-500" />
        </div>
        <h1 className="text-xl font-semibold text-[#1e2d1c] mb-2">Algo salió mal</h1>
        <p className="text-sm text-[#7d8471] mb-6">
          Ocurrió un error inesperado. Puedes intentar recargar la página.
        </p>
        <button
          onClick={reset}
          className="h-10 px-6 rounded-xl bg-[#2d4a2b] text-white text-sm font-medium hover:bg-[#1e3a1c] transition-colors"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}
