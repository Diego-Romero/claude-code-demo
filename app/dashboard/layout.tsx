import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/signin");

  return (
    <div className="flex min-h-screen">
      <Sidebar email={session.user?.email} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
