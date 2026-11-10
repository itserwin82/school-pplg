import { redirect } from "next/navigation";
import { auth } from "@/app/api/auth/[...nextauth]/route";

export default async function HomePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role === "SISWA") {
    redirect("/dashboard-siswa");
  } else if (session.user.role === "GURU") {
    redirect("/dashboard-guru");
  } else if (session.user.role === "ADMIN") {
    redirect("/dashboard-admin");
  } else {
    redirect("/login");
  }
}