"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Filter, Radio } from "lucide-react";

export type AuditOutcome = "ALLOW" | "DENY";

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorEmail: string;
  action: string;
  resource: string;
  outcome: AuditOutcome;
  ipAddress: string;
}

interface AuditLogStreamProps {
  logs: AuditLogEntry[];
}

const OUTCOME_FILTERS: ReadonlyArray<AuditOutcome | "All"> = ["All", "ALLOW", "DENY"];

function formatTimestamp(timestamp: string): string {
  return new Date(timestamp).toLocaleString(undefined, {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

interface OutcomeBadgeProps {
  outcome: AuditOutcome;
}

function OutcomeBadge({ outcome }: OutcomeBadgeProps) {
  if (outcome === "DENY") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-red-300 bg-red-600 px-2.5 py-0.5 text-xs font-semibold text-white">
        <AlertTriangle className="h-3 w-3" />
        DENY
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">
      <CheckCircle2 className="h-3 w-3" />
      ALLOW
    </span>
  );
}

/**
 * Tenant-scoped security audit log feed. `logs` is always pre-scoped by
 * the caller (see app/[tenant]/(dashboard)/audit-logs/page.tsx, which
 * fetches through lib/db/tenantScopedQuery.ts) -- this component does no
 * fetching of its own, just presentation and client-side filtering of
 * whatever it's handed. "Streaming" here means a live-feed presentation
 * (newest first, monospace timestamps, a pulse indicator) over a static
 * snapshot -- there's no websocket/SSE source to subscribe to yet.
 */
export default function AuditLogStream({ logs }: AuditLogStreamProps) {
  const [actorFilter, setActorFilter] = useState<string>("All");
  const [resourceFilter, setResourceFilter] = useState<string>("All");
  const [outcomeFilter, setOutcomeFilter] = useState<(typeof OUTCOME_FILTERS)[number]>("All");

  const actors = useMemo(() => Array.from(new Set(logs.map((log) => log.actorEmail))).sort(), [logs]);
  const resources = useMemo(() => Array.from(new Set(logs.map((log) => log.resource))).sort(), [logs]);

  const filteredLogs = useMemo(() => {
    return logs
      .filter((log) => actorFilter === "All" || log.actorEmail === actorFilter)
      .filter((log) => resourceFilter === "All" || log.resource === resourceFilter)
      .filter((log) => outcomeFilter === "All" || log.outcome === outcomeFilter)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [logs, actorFilter, resourceFilter, outcomeFilter]);

  const denyCount = useMemo(() => filteredLogs.filter((log) => log.outcome === "DENY").length, [filteredLogs]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-800">Security Audit Log</h1>
          <p className="mt-1 text-sm text-slate-500">Every policy decision evaluated for this tenant.</p>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500">
          <Radio className="h-3.5 w-3.5 animate-pulse text-green-500" />
          Live feed
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
          <Filter className="h-4 w-4" />
          Filter
        </div>

        <select
          value={actorFilter}
          onChange={(event) => setActorFilter(event.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="All">All actors</option>
          {actors.map((actor) => (
            <option key={actor} value={actor}>
              {actor}
            </option>
          ))}
        </select>

        <select
          value={resourceFilter}
          onChange={(event) => setResourceFilter(event.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="All">All resources</option>
          {resources.map((resource) => (
            <option key={resource} value={resource}>
              {resource}
            </option>
          ))}
        </select>

        <div className="flex gap-1.5">
          {OUTCOME_FILTERS.map((outcomeOption) => (
            <button
              key={outcomeOption}
              type="button"
              onClick={() => setOutcomeFilter(outcomeOption)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                outcomeFilter === outcomeOption
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-slate-600 hover:bg-gray-200"
              }`}
            >
              {outcomeOption}
            </button>
          ))}
        </div>

        {denyCount > 0 && (
          <span className="ml-auto rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
            {denyCount} DENY{denyCount === 1 ? "" : "s"} in view
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {filteredLogs.map((log) => (
          <div
            key={log.id}
            className={`flex items-center justify-between gap-4 rounded-lg border px-4 py-3 text-sm ${
              log.outcome === "DENY" ? "border-red-300 bg-red-50/60 shadow-sm" : "border-gray-200 bg-white"
            }`}
          >
            <div className="flex min-w-0 items-center gap-4">
              <span className="shrink-0 font-mono text-xs text-slate-400">{formatTimestamp(log.timestamp)}</span>
              <span className="shrink-0 truncate font-medium text-slate-800">{log.actorEmail}</span>
              <span className="shrink-0 font-mono text-xs uppercase tracking-wide text-slate-500">{log.action}</span>
              <span className="truncate text-slate-500">on {log.resource}</span>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <span className="font-mono text-xs text-slate-400">{log.ipAddress}</span>
              <OutcomeBadge outcome={log.outcome} />
            </div>
          </div>
        ))}

        {filteredLogs.length === 0 && (
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-8 text-center text-sm text-slate-400">
            No audit events match this filter.
          </div>
        )}
      </div>
    </div>
  );
}
