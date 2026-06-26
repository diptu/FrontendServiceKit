import { CreditCard, TrendingUp, Users, AppWindow, Download } from "lucide-react";
import {
  Banner, Button, StatusBadge, PlanBadge,
  Card, CardHeader, CardBody,
  DataTable, type Column,
  ProgressBar,
} from "@/components/ui";

interface Props { params: Promise<{ orgSlug: string }> }

const INVOICES = [
  { id: "inv-2026-06", period: "Jun 2026", amount: "$1,248.00", status: "paid",     date: "Jun 1, 2026" },
  { id: "inv-2026-05", period: "May 2026", amount: "$1,200.00", status: "paid",     date: "May 1, 2026" },
  { id: "inv-2026-04", period: "Apr 2026", amount: "$1,150.00", status: "paid",     date: "Apr 1, 2026" },
  { id: "inv-2026-03", period: "Mar 2026", amount: "$1,100.00", status: "paid",     date: "Mar 1, 2026" },
  { id: "inv-2026-07", period: "Jul 2026", amount: "$1,300.00", status: "upcoming", date: "Jul 1, 2026" },
];

type Invoice = typeof INVOICES[0];

const INVOICE_COLS: Column<Invoice>[] = [
  { key: "period", header: "Period",  render: i => <span className="font-medium text-slate-900">{i.period}</span> },
  { key: "amount", header: "Amount",  className: "text-slate-700" },
  { key: "date",   header: "Date",    className: "text-slate-500 text-xs" },
  { key: "status", header: "Status",  render: i => <StatusBadge status={i.status} dot /> },
  {
    key: "actions", header: "", align: "right" as const,
    render: i => i.status === "paid"
      ? <Button variant="secondary" size="xs" icon={Download}>PDF</Button>
      : null,
  },
];

const USAGE = [
  { label: "Users",        icon: Users,       used: 1248, limit: 2000 },
  { label: "Applications", icon: AppWindow,   used: 28,   limit: 50   },
  { label: "Storage (GB)", icon: TrendingUp,  used: 64,   limit: 200  },
];

export default async function BillingPage({ params }: Props) {
  const { orgSlug } = await params;
  const display = orgSlug.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join(" ");

  return (
    <div className="flex flex-col gap-6">
      <Banner variant="info" showIcon>
        Preview mode — billing actions are disabled until role gates are enforced.
      </Banner>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900">
            <CreditCard className="h-5 w-5 text-indigo-500" />Subscriptions & Billing
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Billing overview for <span className="font-medium text-slate-700">{display}</span>
          </p>
        </div>
        <Button>Upgrade Plan</Button>
      </div>

      {/* Current plan */}
      <div className="rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-violet-50 p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-400">Current Plan</p>
            <div className="mt-1 flex items-center gap-2">
              <h2 className="text-2xl font-bold text-indigo-900">Pro</h2>
              <PlanBadge plan="Pro" />
            </div>
            <p className="mt-1 text-sm text-indigo-700">$1.00 per user / month · billed monthly</p>
          </div>
          <StatusBadge status="active" dot />
        </div>
        <div className="mt-5 grid grid-cols-3 gap-4">
          {USAGE.map(item => {
            const Icon = item.icon;
            const pct  = Math.round((item.used / item.limit) * 100);
            return (
              <div key={item.label} className="rounded-lg bg-white/70 p-3">
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700 mb-2">
                  <Icon className="h-3.5 w-3.5 text-indigo-500" strokeWidth={2} />
                  {item.label}
                </div>
                <ProgressBar
                  value={pct}
                  label={`${item.used.toLocaleString()} / ${item.limit.toLocaleString()}`}
                  showValue
                  size="xs"
                  color={pct > 80 ? "amber" : "indigo"}
                />
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-indigo-100 pt-4 text-sm">
          <p className="text-indigo-700">Next billing date: <span className="font-semibold">Jul 1, 2026</span></p>
          <p className="font-semibold text-indigo-900">Est. $1,300.00</p>
        </div>
      </div>

      {/* Payment method */}
      <Card>
        <CardHeader
          title="Payment Method"
          icon={<CreditCard className="h-4 w-4 text-indigo-500" />}
          action={<Button variant="link" size="sm">Update</Button>}
        />
        <CardBody>
          <div className="flex items-center gap-4 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
            <div className="flex h-10 w-14 items-center justify-center rounded-md border border-slate-200 bg-white text-xs font-bold text-slate-700">VISA</div>
            <div>
              <p className="text-sm font-medium text-slate-900">Visa ending in 4242</p>
              <p className="text-xs text-slate-400">Expires 08/2028 · Default</p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Invoices */}
      <Card>
        <CardHeader title="Invoice History" />
        <CardBody padding="none">
          <DataTable<Invoice>
            columns={INVOICE_COLS}
            data={INVOICES}
            rowKey={i => i.id}
          />
        </CardBody>
      </Card>
    </div>
  );
}
