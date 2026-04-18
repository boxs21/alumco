function Bone({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-lg bg-[#eaf0fb] ${className}`} />;
}

export default function AdminLoading() {
  return (
    <div>
      {/* Topbar skeleton */}
      <div className="h-16 border-b border-[#e8e4dc] bg-[#f6f3ee] flex items-center justify-between px-4 lg:px-6">
        <Bone className="h-5 w-32" />
        <Bone className="h-8 w-8 rounded-full" />
      </div>

      <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
        {/* Stat cards row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-[#e8e4dc] bg-[#f6f3ee] p-5 space-y-3">
              <Bone className="h-3 w-24" />
              <Bone className="h-7 w-16" />
            </div>
          ))}
        </div>

        {/* Content cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-[#e8e4dc] bg-[#f6f3ee] overflow-hidden">
              <div className="h-[2px] bg-[#eaf0fb]" />
              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <Bone className="h-10 w-10 rounded-xl" />
                  <Bone className="h-5 w-20 rounded-full" />
                </div>
                <Bone className="h-4 w-3/4" />
                <Bone className="h-3 w-1/2" />
                <Bone className="h-2 w-full rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
