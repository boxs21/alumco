import { redirect } from "next/navigation";

// Página raíz: redirige automáticamente al login
export default function Home() {
  redirect("/login");
}
