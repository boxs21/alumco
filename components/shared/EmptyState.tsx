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
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EEF2FF] mb-4">
        <Icon className="h-8 w-8 text-[#8A9BC8]" />
      </div>
      <h3 className="text-lg font-semibold text-[#1A2F6B] mb-1">{title}</h3>
      <p className="text-sm text-[#6B7AB0] max-w-sm mb-6">{description}</p>
      {action}
    </div>
  );
}
