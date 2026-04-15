import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f0f2eb] mb-4">
        <Icon className="h-8 w-8 text-[#a4ac86]" />
      </div>
      <h3 className="text-lg font-semibold text-[#1e2d1c] mb-1">{title}</h3>
      <p className="text-sm text-[#7d8471] max-w-sm mb-6">{description}</p>
      {action}
    </div>
  );
}
