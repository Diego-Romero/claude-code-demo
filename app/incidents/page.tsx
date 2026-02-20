"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "@/lib/utils";

const severityStyles: Record<string, string> = {
  P0: "bg-blue-100 text-blue-700 border-blue-200",
  P1: "bg-orange-100 text-orange-700 border-orange-200",
  P2: "bg-yellow-100 text-yellow-700 border-yellow-200",
  P3: "bg-red-100 text-red-700 border-red-200",
};

const statusStyles: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  resolved: "bg-gray-100 text-gray-500",
};

export default function AllIncidentsPage() {
  const incidents = useQuery(api.incidents.list, {});
  const resolveIncident = useMutation(api.incidents.resolve);
  const removeIncident = useMutation(api.incidents.remove);

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">All Incidents</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {incidents?.length ?? "—"} total
        </p>
      </div>

      {incidents === undefined ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : incidents.length === 0 ? (
        <p className="text-sm text-muted-foreground">No incidents yet.</p>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Severity</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Title</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Assignee</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Created</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {incidents.map((incident) => (
                <tr key={incident._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className={`rounded border px-2 py-0.5 text-xs font-semibold ${severityStyles[incident.severity]}`}>
                      {incident.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{incident.title}</p>
                    <p className="text-muted-foreground line-clamp-1 text-xs mt-0.5">{incident.description}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[incident.status]}`}>
                      {incident.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {incident.assignee ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                    {formatDistanceToNow(incident._creationTime)} ago
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      {incident.status === "active" && (
                        <Button size="sm" variant="outline" onClick={() => resolveIncident({ id: incident._id as Id<"incidents"> })}>
                          Resolve
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600" onClick={() => removeIncident({ id: incident._id as Id<"incidents"> })}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
