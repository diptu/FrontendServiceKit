"use client";

import { useState } from "react";
import { Wallet, TrendingUp, TrendingDown, Clock, Plus } from "lucide-react";
import {
  StatCard, Button, Badge, StatusBadge,
  Card, CardHeader, CardBody,
  DataTable, type Column,
  FilterBar, Pagination,
} from "@/components/ui";

interface CreditEntry {
  id: string; date: string; user: string;
  type: "credit" | "debit" | "adjustment";
  amount: number; reason: string; balance: number;
  status: "Completed" | "Pending" | "Reversed";
}

const MOCK_ENTRIES: CreditEntry[] = [
  { id:"1",  date:"2026-06-24", user:"admin@applecorp.test",          type:"credit",     amount:  500, reason:"Monthly plan top-up",           balance:2490, status:"Completed" },
  { id:"2",  date:"2026-06-22", user:"user1.apple_corp@example.test", type:"debit",      amount: -120, reason:"API overage charge",            balance:1990, status:"Completed" },
  { id:"3",  date:"2026-06-20", user:"admin@applecorp.test",          type:"adjustment", amount:   50, reason:"Support credit — SLA breach",   balance:2110, status:"Completed" },
  { id:"4",  date:"2026-06-18", user:"user2.apple_corp@example.test", type:"debit",      amount:  -80, reason:"Storage quota extension",       balance:2060, status:"Completed" },
  { id:"5",  date:"2026-06-15", user:"admin@applecorp.test",          type:"credit",     amount: 1000, reason:"Annual plan renewal credit",    balance:2140, status:"Completed" },
  { id:"6",  date:"2026-06-12", user:"user1.apple_corp@example.test", type:"debit",      amount:  -60, reason:"Additional seat license",      balance:1140, status:"Completed" },
  { id:"7",  date:"2026-06-10", user:"admin@applecorp.test",          type:"adjustment", amount:  -30, reason:"Billing correction",            balance:1200, status:"Reversed"  },
  { id:"8",  date:"2026-06-08", user:"user3.apple_corp@example.test", type:"debit",      amount:  -45, reason:"Premium support add-on",       balance:1230, status:"Completed" },
  { id:"9",  date:"2026-06-05", user:"admin@applecorp.test",          type:"credit",     amount:  200, reason:"Referral bonus credit",        balance:1275, status:"Pending"   },
  { id:"10", date:"2026-06-01", user:"admin@applecorp.test",          type:"credit",     amount:  500, reason:"Monthly plan top-up",          balance:1075, status:"Completed" },
  { id:"11", date:"2026-05-28", user:"user1.apple_corp@example.test", type:"debit",      amount:  -90, reason:"Webhook event volume charge",  balance: 575, status:"Completed" },
  { id:"12", date:"2026-05-25", user:"admin@applecorp.test",          type:"adjustment", amount:   25, reason:"Downtime compensation",        balance: 665, status:"Completed" },
];

const PAGE_SIZE = 8;

const TYPE_VARIANT: Record<CreditEntry["type"], "success"|"error"|"warning"> = {
  credit:     "success",
  debit:      "error",
  adjustment: "warning",
};

const COLUMNS: Column<CreditEntry>[] = [
  { key:"date",   header:"Date",         className:"text-slate-500" },
  { key:"user",   header:"Initiated By", render: e => <span className="font-medium text-slate-800">{e.user}</span> },
  { key:"type",   header:"Type",         render: e => <Badge variant={TYPE_VARIANT[e.type]} size="xs" className="capitalize">{e.type}</Badge> },
  { key:"reason", header:"Reason",       className:"max-w-xs text-slate-500" },
  {
    key:"amount",  header:"Amount", align:"right" as const,
    render: e => (
      <span className={`font-semibold tabular-nums ${e.amount >= 0 ? "text-emerald-600" : "text-red-600"}`}>
        {e.amount >= 0 ? "+" : ""}${Math.abs(e.amount)}
      </span>
    ),
  },
  {
    key:"balance", header:"Balance After", align:"right" as const,
    render: e => <span className="font-medium tabular-nums text-slate-700">${e.balance.toLocaleString()}</span>,
  },
  { key:"status", header:"Status", render: e => <StatusBadge status={e.status.toLowerCase()} dot /> },
];

export default function CreditAdjustmentsPage() {
  const [page,   setPage]   = useState(1);
  const [filter, setFilter] = useState("");

  const filtered = filter ? MOCK_ENTRIES.filter(e => e.type === filter) : MOCK_ENTRIES;
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalCredits   = MOCK_ENTRIES.filter(e => e.amount > 0).reduce((s, e) => s + e.amount, 0);
  const totalDebits    = MOCK_ENTRIES.filter(e => e.amount < 0).reduce((s, e) => s + e.amount, 0);
  const currentBalance = MOCK_ENTRIES[0].balance;
  const pendingCount   = MOCK_ENTRIES.filter(e => e.status === "Pending").length;

  const creditCount     = MOCK_ENTRIES.filter(e => e.type === "credit").length;
  const debitCount      = MOCK_ENTRIES.filter(e => e.type === "debit").length;
  const adjustmentCount = MOCK_ENTRIES.filter(e => e.type === "adjustment").length;

  function handleFilter(v: string) { setFilter(v); setPage(1); }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-800">Credit Balance Adjustments</h1>
          <p className="mt-1 text-sm text-slate-500">
            Track credit top-ups, usage debits, and manual adjustments for this tenant.
          </p>
        </div>
        <Button icon={Plus}>Add Adjustment</Button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={Wallet}      label="Current Balance" value={`$${currentBalance.toLocaleString()}`} color="indigo"  />
        <StatCard icon={TrendingUp}  label="Total Credits"   value={`+$${totalCredits.toLocaleString()}`}  color="emerald" />
        <StatCard icon={TrendingDown} label="Total Debits"   value={`$${totalDebits.toLocaleString()}`}    color="rose"    />
        <StatCard icon={Clock}       label="Pending"         value={String(pendingCount)}                  color="amber"   />
      </div>

      <Card>
        <CardHeader
          title="Transaction History"
          action={
            <FilterBar value={filter} onChange={handleFilter} options={[
              { label: "Credits",     value: "credit",     count: creditCount     },
              { label: "Debits",      value: "debit",      count: debitCount      },
              { label: "Adjustments", value: "adjustment", count: adjustmentCount },
            ]} />
          }
        />
        <DataTable<CreditEntry>
          columns={COLUMNS}
          data={paginated}
          rowKey={e => e.id}
          footer={
            <Pagination
              page={page}
              total={filtered.length}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          }
        />
      </Card>
    </div>
  );
}
