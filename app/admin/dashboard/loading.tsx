function Bone({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-lg bg-[#f0f2eb] ${className}`} />;
}

export default function DashboardLoading() {
  return (
    <div>
      {/* Topbar skeleton */}
      <div className="h-16 border-b border-[#dde0d4] bg-[#faf9f6] flex items-center justify-between px-4 lg:px-6">
        <Bone className="h-5 w-28" />
        <Bone className="h-8 w-8 rounded-full" />
      </div>

      <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
        {/* 4 stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-[#dde0d4] bg-[#faf9f6] p-5 space-y-3">
              <div className="flex items-center justify-between">
                <Bone className="h-3 w-28" />
                <Bone className="h-8 w-8 rounded-xl" />
              </div>
              <Bone className="h-8 w-20" />
              <Bone className="h-3 w-16" />
            </div>
          ))}
        </div>

        {/* 3-col bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-[#dde0d4] bg-[#faf9f6] p-4 lg:p-6 space-y-4">
              <Bone className="h-4 w-36" />
              {Array.from({ length: 2 }).map((_, j) => (
                <div key={j} className="space-y-2">
                  <div className="flex justify-between">
                    <Bone className="h-3 w-24" />
                    <Bone className="h-3 w-10" />
                  </div>
                  <Bone className="h-3 w-full rounded-full" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
