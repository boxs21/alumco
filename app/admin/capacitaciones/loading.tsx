function Bone({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-lg bg-[#EEF2FF] ${className}`} />;
}

export default function CapacitacionesLoading() {
  return (
    <div>
      {/* Topbar skeleton */}
      <div className="h-16 border-b border-[#C8D4EC] bg-[#FAFBFF] flex items-center justify-between px-4 lg:px-6">
        <Bone className="h-5 w-36" />
        <Bone className="h-8 w-8 rounded-full" />
      </div>

      <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
        {/* Filter bar + button */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex flex-wrap gap-2 flex-1">
            <Bone className="h-9 w-52 rounded-lg" />
            <Bone className="h-9 w-48 rounded-lg" />
          </div>
          <Bone className="h-10 w-44 rounded-xl" />
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-[#C8D4EC] bg-[#FAFBFF] overflow-hidden">
              <div className="h-[2px] bg-[#EEF2FF]" />
              <div className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <Bone className="h-10 w-10 rounded-xl" />
                  <Bone className="h-5 w-20 rounded-full" />
                </div>
                <div className="space-y-2">
                  <Bone className="h-4 w-3/4" />
                  <Bone className="h-3 w-1/2" />
                </div>
                <Bone className="h-5 w-24 rounded-full" />
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <Bone className="h-3 w-20" />
                    <Bone className="h-3 w-8" />
                  </div>
                  <Bone className="h-2 w-full rounded-full" />
                  <Bone className="h-3 w-28" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
