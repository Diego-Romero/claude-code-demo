import { mutation } from "./_generated/server";

export const run = mutation({
  handler: async (ctx) => {
    const existing = await ctx.db.query("incidents").collect();
    if (existing.length > 0) return { skipped: true };

    const incidents = [
      {
        title: "API gateway returning 503s in eu-west-1",
        description: "Multiple customers reporting intermittent 503 errors. Error rate spiked to 18% at 14:32 UTC. Load balancer health checks failing on 3 of 8 nodes.",
        severity: "P0" as const,
        status: "active" as const,
        assignee: "sarah@team.dev",
      },
      {
        title: "Slow query degrading checkout performance",
        description: "P99 latency on /api/checkout jumped from 200ms to 4.2s after the 14:00 deploy. Identified a missing index on orders.user_id. Rollback in progress.",
        severity: "P1" as const,
        status: "active" as const,
        assignee: "james@team.dev",
      },
      {
        title: "Email notifications delayed by ~30 minutes",
        description: "SQS consumer queue depth growing. Workers appear healthy but throughput dropped after config change. No customer data loss — emails will eventually be delivered.",
        severity: "P2" as const,
        status: "active" as const,
        assignee: "demo@incident.dev",
      },
      {
        title: "Dashboard charts not rendering for Safari users",
        description: "Chart.js version 4.4.0 introduced a Safari 16 incompatibility. Affects approximately 8% of dashboard users. Workaround: use Chrome.",
        severity: "P3" as const,
        status: "active" as const,
        assignee: "demo@incident.dev",
      },
      {
        title: "Database failover caused 4-minute outage",
        description: "Primary RDS instance failed over to replica at 09:14 UTC. Automatic failover completed in 4m12s. Root cause: disk I/O saturation. Added CloudWatch alarm for future detection.",
        severity: "P0" as const,
        status: "resolved" as const,
        assignee: "sarah@team.dev",
        resolvedAt: Date.now() - 1000 * 60 * 60 * 3,
      },
      {
        title: "CDN misconfiguration serving stale assets",
        description: "Cache-Control headers missing from static asset responses after infra change. Users saw stale JS/CSS for ~40 minutes. Cache invalidation completed, headers restored.",
        severity: "P2" as const,
        status: "resolved" as const,
        assignee: "james@team.dev",
        resolvedAt: Date.now() - 1000 * 60 * 60 * 24,
      },
    ];

    for (const incident of incidents) {
      await ctx.db.insert("incidents", incident);
    }

    return { seeded: incidents.length };
  },
});
