"use client";

interface SedeFilterProps {
  value: string;
  onChange: (value: string) => void;
  options?: { key: string; label: string }[];
}

const defaultOptions = [
  { key: "ALL", label: "Todas" },
  { key: "CONCEPCION", label: "Concepción" },
  { key: "COYHAIQUE", label: "Coyhaique" },
];

export default function SedeFilter({ value, onChange, options = defaultOptions }: SedeFilterProps) {
  return (
    <div className="flex rounded-lg bg-[#EEF2FF] p-1 w-fit" role="tablist" aria-label="Filtrar por sede">
      {options.map((tab) => (
        <button
          key={tab.key}
          role="tab"
          aria-selected={value === tab.key}
          onClick={() => onChange(tab.key)}
          className={`px-3 lg:px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
            value === tab.key
              ? "bg-[#FAFBFF] text-[#1A2F6B] shadow-sm"
              : "text-[#4A5C8A] hover:text-[#1A2F6B]"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
