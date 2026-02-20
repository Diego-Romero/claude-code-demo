"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow } from "@/lib/utils";

const SEVERITIES = ["P0", "P1", "P2", "P3"] as const;

const severityStyles: Record<string, string> = {
  P0: "bg-red-100 text-red-700 border-red-200",
  P1: "bg-orange-100 text-orange-700 border-orange-200",
  P2: "bg-yellow-100 text-yellow-700 border-yellow-200",
  P3: "bg-blue-100 text-blue-700 border-blue-200",
};

export default function DashboardPage() {
  const incidents = useQuery(api.incidents.list, { status: "active" });
  const createIncident = useMutation(api.incidents.create);
  const resolveIncident = useMutation(api.incidents.resolve);
  const removeIncident = useMutation(api.incidents.remove);

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleCreate(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const form = new FormData(e.currentTarget);
    await createIncident({
      title: form.get("title") as string,
      description: form.get("description") as string,
      severity: form.get("severity") as "P0" | "P1" | "P2" | "P3",
      assignee: (form.get("assignee") as string) || undefined,
    });
    (e.target as HTMLFormElement).reset();
    setShowForm(false);
    setSaving(false);
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {incidents?.length ?? "—"} active incident{incidents?.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : "New incident"}
        </Button>
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="mb-6 rounded-lg border bg-gray-50 p-5 space-y-4">
          <h2 className="font-medium text-sm">New incident</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1">
              <label htmlFor="title" className="text-xs font-medium text-muted-foreground">Title</label>
              <Input id="title" name="title" required placeholder="Short description of the issue" />
            </div>
            <div className="space-y-1">
              <label htmlFor="severity" className="text-xs font-medium text-muted-foreground">Severity</label>
              <select id="severity" name="severity" required className="w-full rounded-md border px-3 py-2 text-sm bg-white">
                {SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="assignee" className="text-xs font-medium text-muted-foreground">Assignee (email)</label>
              <Input id="assignee" name="assignee" type="email" placeholder="who@team.dev" />
            </div>
            <div className="col-span-2 space-y-1">
              <label htmlFor="description" className="text-xs font-medium text-muted-foreground">Description</label>
              <textarea
                id="description"
                name="description"
                required
                rows={3}
                className="w-full rounded-md border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="What's happening? What's the impact?"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Creating…" : "Create incident"}</Button>
          </div>
        </form>
      )}

      {/* Incident list */}
      {incidents === undefined ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : incidents.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">No active incidents. All clear! 🎉</p>
        </div>
      ) : (
        <div className="space-y-3">
          {incidents.map((incident) => (
            <div key={incident._id} data-testid="incident-card" className="rounded-lg border bg-white p-5 flex items-start gap-4">
              <span className={`mt-0.5 shrink-0 rounded border px-2 py-0.5 text-xs font-semibold ${severityStyles[incident.severity]}`}>
                {incident.severity}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{incident.title}</p>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{incident.description}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  {incident.assignee && <span>Assigned to {incident.assignee}</span>}
                  <span>{formatDistanceToNow(incident._creationTime)} ago</span>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => resolveIncident({ id: incident._id as Id<"incidents"> })}
                >
                  Resolve
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-500 hover:text-red-600"
                  onClick={() => removeIncident({ id: incident._id as Id<"incidents"> })}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
