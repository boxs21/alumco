function Bone({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-lg bg-[#f0f2eb] ${className}`} />;
}

export default function ReportesLoading() {
  return (
    <div>
      <div className="h-16 border-b border-[#dde0d4] bg-[#faf9f6] flex items-center justify-between px-4 lg:px-6">
        <Bone className="h-5 w-24" />
        <Bone className="h-8 w-8 rounded-full" />
      </div>

      <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
        {/* Filter card */}
        <div className="rounded-2xl border border-[#dde0d4] bg-[#faf9f6] p-4 lg:p-5 space-y-3">
          <Bone className="h-4 w-16" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Bone key={i} className="h-10 rounded-lg" />
            ))}
          </div>
        </div>

        {/* Comparativa card */}
        <div className="rounded-2xl border border-[#dde0d4] bg-[#faf9f6] p-4 lg:p-6 space-y-4">
          <Bone className="h-4 w-48" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="flex items-center gap-2">
                  <Bone className="h-3 w-3 rounded-full" />
                  <Bone className="h-3 w-24" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <Bone key={j} className="h-16 rounded-lg" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Table card */}
        <div className="rounded-2xl border border-[#dde0d4] bg-[#faf9f6] p-4 lg:p-6 space-y-4">
          <div className="flex justify-between">
            <Bone className="h-4 w-44" />
            <Bone className="h-9 w-32 rounded-lg" />
          </div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-2 border-b border-[#dde0d4] last:border-0">
              <Bone className="h-8 w-8 rounded-full flex-shrink-0" />
              <Bone className="h-3 flex-1" />
              <Bone className="h-3 w-16" />
              <Bone className="h-5 w-14 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
