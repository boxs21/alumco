function Bone({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-lg bg-[#EEF2FF] ${className}`} />;
}

export default function CalendarioLoading() {
  return (
    <div>
      <div className="h-16 border-b border-[#C8D4EC] bg-[#FAFBFF] flex items-center justify-between px-4 lg:px-6">
        <Bone className="h-5 w-28" />
        <Bone className="h-8 w-8 rounded-full" />
      </div>

      <div className="p-4 lg:p-6 space-y-4 lg:space-y-5">
        {/* Nav controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bone className="h-9 w-9 rounded-lg" />
            <Bone className="h-5 w-40" />
            <Bone className="h-9 w-9 rounded-lg" />
          </div>
          <div className="flex items-center gap-3">
            <Bone className="hidden sm:block h-4 w-48" />
            <Bone className="h-9 w-32 rounded-lg" />
          </div>
        </div>

        {/* Calendar grid */}
        <div className="rounded-2xl border border-[#C8D4EC] bg-[#FAFBFF] overflow-hidden">
          {/* Week headers */}
          <div className="grid grid-cols-7 bg-[#EEF2FF] border-b border-[#C8D4EC]">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="py-2 flex justify-center">
                <Bone className="h-3 w-6" />
              </div>
            ))}
          </div>
          {/* Day cells — 6 rows × 7 cols */}
          <div className="grid grid-cols-7">
            {Array.from({ length: 42 }).map((_, i) => {
              const isLastRow = i >= 35;
              const isLastCol = (i + 1) % 7 === 0;
              return (
                <div
                  key={i}
                  className={`min-h-[76px] lg:min-h-[96px] p-1.5 border-[#C8D4EC] ${
                    !isLastRow ? "border-b" : ""
                  } ${!isLastCol ? "border-r" : ""}`}
                >
                  <div className="flex justify-end mb-1">
                    <Bone className="h-5 w-5 rounded-full animate-pulse" />
                  </div>
                  {i % 5 === 0 && <Bone className="h-4 w-full rounded-full mt-0.5" />}
                  {i % 8 === 0 && <Bone className="h-4 w-4/5 rounded-full mt-0.5" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
