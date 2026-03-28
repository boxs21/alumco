"use client";

/** Props del componente SedeFilter */
interface SedeFilterProps {
  value: string;                                // sede actualmente seleccionada
  onChange: (value: string) => void;            // función que se llama al cambiar la sede
  options?: { key: string; label: string }[];   // opciones personalizables (por defecto: todas + sedes)
}

/** Opciones por defecto: todas las sedes más cada una individualmente */
const defaultOptions = [
  { key: "ALL", label: "Todas" },
  { key: "CONCEPCION", label: "Concepción" },
  { key: "COYHAIQUE", label: "Coyhaique" },
];

/**
 * Filtro de sede tipo "tabs" que permite seleccionar entre sedes.
 * Accesible con roles ARIA para lectores de pantalla.
 */
export default function SedeFilter({ value, onChange, options = defaultOptions }: SedeFilterProps) {
  return (
    // Contenedor accesible como lista de pestañas
    <div className="flex rounded-lg bg-[#f0f2eb] p-1 w-fit" role="tablist" aria-label="Filtrar por sede">
      {options.map((tab) => (
        <button
          key={tab.key}
          role="tab"
          aria-selected={value === tab.key}
          onClick={() => onChange(tab.key)}
          className={`px-3 lg:px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
            value === tab.key
              ? "bg-[#faf9f6] text-[#1e2d1c] shadow-sm"   // pestaña activa
              : "text-[#6b7260] hover:text-[#1e2d1c]"      // pestaña inactiva
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
