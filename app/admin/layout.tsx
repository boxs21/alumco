import Sidebar from "@/components/layout/Sidebar";
import BottomNav from "@/components/layout/BottomNav";
import { Toaster } from "sonner";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FAFBFF]">
      <Sidebar />
      <main className="lg:ml-64 pb-16 lg:pb-0">{children}</main>
      <BottomNav />
      <Toaster position="bottom-right" richColors />
    </div>
  );
}
