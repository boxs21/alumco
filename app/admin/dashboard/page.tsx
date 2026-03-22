import Topbar from "@/components/layout/Topbar";

export default function DashboardPage() {
  return (
    <>
      <Topbar title="Dashboard" subtitle="Resumen general" />
      <div className="page-content p-7">
        <p className="text-muted text-lg">Dashboard en construcción.</p>
      </div>
    </>
  );
}
