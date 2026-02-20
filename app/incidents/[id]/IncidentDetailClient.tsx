"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "@/lib/utils";

const severityStyles: Record<string, string> = {
  P0: "bg-blue-100 text-blue-700 border-blue-200",
  P1: "bg-orange-100 text-orange-700 border-orange-200",
  P2: "bg-yellow-100 text-yellow-700 border-yellow-200",
  P3: "bg-red-100 text-red-700 border-red-200",
};

interface Props {
  incidentId: string;
  userEmail: string;
  userName: string;
}

export default function IncidentDetailClient({ incidentId, userEmail, userName }: Props) {
  const incident = useQuery(api.incidents.get, { id: incidentId as Id<"incidents"> });
  const comments = useQuery(api.comments.list, { incidentId: incidentId as Id<"incidents"> });
  const addComment = useMutation(api.comments.add);

  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;
    setSubmitting(true);
    await addComment({
      incidentId: incidentId as Id<"incidents">,
      body: trimmed,
      authorEmail: userEmail,
      authorName: userName,
    });
    setBody("");
    setSubmitting(false);
  }

  if (incident === undefined) {
    return <div className="p-8 text-sm text-muted-foreground">Loading…</div>;
  }

  if (incident === null) {
    return (
      <div className="p-8 space-y-2">
        <p className="text-sm text-muted-foreground">Incident not found.</p>
        <Link href="/incidents" className="text-sm text-primary underline">
          Back to all incidents
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl space-y-8">
      <Link href="/incidents" className="text-sm text-muted-foreground hover:text-foreground">
        ← All incidents
      </Link>

      {/* Incident header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className={`rounded border px-2 py-0.5 text-xs font-semibold ${severityStyles[incident.severity]}`}>
            {incident.severity}
          </span>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${incident.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
            {incident.status}
          </span>
        </div>
        <h1 className="text-2xl font-semibold">{incident.title}</h1>
        <p className="text-sm text-muted-foreground">{incident.description}</p>
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          {incident.assignee && <span>Assigned to {incident.assignee}</span>}
          <span>Opened {formatDistanceToNow(incident._creationTime)} ago</span>
          {incident.resolvedAt && (
            <span>Resolved {formatDistanceToNow(incident.resolvedAt)} ago</span>
          )}
        </div>
      </div>

      {/* Comments section */}
      <div className="space-y-4">
        <h2 className="text-base font-medium">
          Comments ({comments?.length ?? "…"})
        </h2>

        {comments === undefined ? (
          <p className="text-sm text-muted-foreground">Loading comments…</p>
        ) : comments.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-center">
            <p className="text-sm text-muted-foreground">No comments yet. Be the first to add one.</p>
          </div>
        ) : (
          <ul className="space-y-3" data-testid="comment-list">
            {comments.map((comment) => (
              <li key={comment._id} data-testid="comment-item" className="rounded-lg border bg-white p-4 space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{comment.authorName}</span>
                  <span>{comment.authorEmail}</span>
                  <span>·</span>
                  <span>{formatDistanceToNow(comment._creationTime)} ago</span>
                </div>
                <p className="text-sm">{comment.body}</p>
              </li>
            ))}
          </ul>
        )}

        {/* Add comment form */}
        <form onSubmit={handleSubmit} className="space-y-2 pt-2">
          <label htmlFor="comment-body" className="text-xs font-medium text-muted-foreground">
            Add a comment
          </label>
          <textarea
            id="comment-body"
            name="comment-body"
            required
            rows={3}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full rounded-md border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Share an update, findings, or next steps…"
          />
          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={submitting || !body.trim()}>
              {submitting ? "Posting…" : "Post comment"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
