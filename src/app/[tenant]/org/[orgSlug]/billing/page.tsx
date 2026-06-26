import PreviewBanner from "@/components/platform-admin/ui/PreviewBanner";
import { CreditCard, TrendingUp, Users, AppWindow, Download } from "lucide-react";

interface Props { params: Promise<{ orgSlug: string }> }

const INVOICES = [
  { id: "inv-2026-06", period: "Jun 2026", amount: "$1,248.00", status: "paid",    date: "Jun 1, 2026"  },
  { id: "inv-2026-05", period: "May 2026", amount: "$1,200.00", status: "paid",    date: "May 1, 2026"  },
  { id: "inv-2026-04", period: "Apr 2026", amount: "$1,150.00", status: "paid",    date: "Apr 1, 2026"  },
  { id: "inv-2026-03", period: "Mar 2026", amount: "$1,100.00", status: "paid",    date: "Mar 1, 2026"  },
  { id: "inv-2026-07", period: "Jul 2026", amount: "$1,300.00", status: "upcoming", date: "Jul 1, 2026" },
];

export default async function BillingPage({ params }: Props) {
  const { orgSlug } = await params;
  const display = orgSlug.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join(" ");

  return (
    <div className="flex flex-col gap-6">
      <PreviewBanner showIcon>Preview mode — billing actions are disabled until role gates are enforced.</PreviewBanner>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900">
            <CreditCard className="h-5 w-5 text-indigo-500" />Subscriptions & Billing
          </h1>
          <p className="mt-1 text-sm text-slate-500">Billing overview for <span className="font-medium text-slate-700">{display}</span></p>
        </div>
        <button type="button" className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors">
          Upgrade Plan
        </button>
      </div>

      {/* Current plan */}
      <div className="rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-violet-50 p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-400">Current Plan</p>
            <h2 className="mt-1 text-2xl font-bold text-indigo-900">Pro</h2>
            <p className="mt-1 text-sm text-indigo-700">$1.00 per user / month · billed monthly</p>
          </div>
          <span className="rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">Active</span>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-4">
          {[
            { label: "Users",        used: 1248, limit: 2000, icon: Users    },
            { label: "Applications", used: 28,   limit: 50,   icon: AppWindow},
            { label: "Storage (GB)", used: 64,   limit: 200,  icon: TrendingUp},
          ].map(item => {
            const Icon = item.icon;
            const pct = Math.round((item.used / item.limit) * 100);
            return (
              <div key={item.label} className="rounded-lg bg-white/70 p-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-medium text-slate-700">
                    <Icon className="h-3.5 w-3.5 text-indigo-500" strokeWidth={2} />{item.label}
                  </span>
                  <span className="text-slate-500">{item.used.toLocaleString()} / {item.limit.toLocaleString()}</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
                  <div className={`h-full rounded-full transition-all ${pct > 80 ? "bg-amber-500" : "bg-indigo-500"}`} style={{ width: `${pct}%` }} />
                </div>
                <p className="mt-1 text-right text-[10px] text-slate-400">{pct}% used</p>
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
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <CreditCard className="h-4 w-4 text-indigo-500" />Payment Method
          </h2>
          <button type="button" className="text-xs font-medium text-indigo-600 hover:text-indigo-500">Update</button>
        </div>
        <div className="mt-4 flex items-center gap-4 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
          <div className="flex h-10 w-14 items-center justify-center rounded-md border border-slate-200 bg-white text-xs font-bold text-slate-700">VISA</div>
          <div>
            <p className="text-sm font-medium text-slate-900">Visa ending in 4242</p>
            <p className="text-xs text-slate-400">Expires 08/2028 · Default</p>
          </div>
        </div>
      </div>

      {/* Invoices */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-900">Invoice History</h2>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50">
            <tr>
              <th className="px-5 py-3.5 text-xs font-semibold text-slate-500">Period</th>
              <th className="px-5 py-3.5 text-xs font-semibold text-slate-500">Amount</th>
              <th className="px-5 py-3.5 text-xs font-semibold text-slate-500">Date</th>
              <th className="px-5 py-3.5 text-xs font-semibold text-slate-500">Status</th>
              <th className="px-5 py-3.5 text-xs font-semibold text-slate-500" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {INVOICES.map(inv => (
              <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-5 py-3.5 font-medium text-slate-900">{inv.period}</td>
                <td className="px-5 py-3.5 text-slate-700">{inv.amount}</td>
                <td className="px-5 py-3.5 text-slate-500">{inv.date}</td>
                <td className="px-5 py-3.5">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                    inv.status === "paid" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                  }`}>{inv.status}</span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  {inv.status === "paid" && (
                    <button type="button" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
                      <Download className="h-3 w-3" />PDF
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
