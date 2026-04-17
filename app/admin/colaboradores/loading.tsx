function Bone({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-lg bg-[#EEF2FF] ${className}`} />;
}

export default function ColaboradoresLoading() {
  return (
    <div>
      <div className="h-16 border-b border-[#C8D4EC] bg-[#FAFBFF] flex items-center justify-between px-4 lg:px-6">
        <Bone className="h-5 w-32" />
        <Bone className="h-8 w-8 rounded-full" />
      </div>

      <div className="p-4 lg:p-6 space-y-4">
        {/* Filter tabs + search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Bone className="h-9 w-64 rounded-lg" />
          <Bone className="h-9 w-48 rounded-lg" />
          <Bone className="h-9 flex-1 rounded-lg" />
        </div>

        {/* Table skeleton */}
        <div className="rounded-2xl border border-[#C8D4EC] bg-[#FAFBFF] overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-4 gap-4 px-5 py-3 border-b border-[#C8D4EC] bg-[#EEF2FF]">
            {["w-24", "w-20", "w-16", "w-14"].map((w, i) => (
              <Bone key={i} className={`h-3 ${w}`} />
            ))}
          </div>
          {/* Rows */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="grid grid-cols-4 gap-4 px-5 py-4 border-b border-[#C8D4EC] last:border-0">
              <div className="flex items-center gap-3">
                <Bone className="h-8 w-8 rounded-full flex-shrink-0" />
                <Bone className="h-3 w-24" />
              </div>
              <Bone className="h-3 w-20 self-center" />
              <Bone className="h-5 w-16 rounded-full self-center" />
              <Bone className="h-3 w-12 self-center" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
