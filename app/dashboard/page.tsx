import { auth } from "@/auth";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await auth();
  // Layout already redirects to /signin if session is null.
  return <DashboardClient currentUserEmail={session?.user?.email ?? null} />;
}
