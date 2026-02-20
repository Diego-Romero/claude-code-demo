import { auth } from "@/auth";
import { redirect } from "next/navigation";
import IncidentDetailClient from "./IncidentDetailClient";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function IncidentDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/signin");

  return (
    <IncidentDetailClient
      incidentId={id}
      userEmail={session.user.email ?? ""}
      userName={session.user.name ?? ""}
    />
  );
}
