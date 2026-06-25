"use client";

import { useState, useMemo } from "react";
import {
  Package,
  CheckCircle2,
  Users,
  DollarSign,
  Plus,
  Search,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
  Eye,
} from "lucide-react";

interface Plan {
  id: string;
  name: string;
  price: number;
  billingCycle: "Monthly" | "Annual";
  totalUsers: number;
  status: "Active" | "Inactive";
}

interface Feature {
  id: string;
  name: string;
  category: string;
  description: string;
  status: "Active" | "Inactive";
}

const MOCK_PLANS: Plan[] = [
  { id: "1", name: "Enterprise Plan", price: 299, billingCycle: "Monthly", totalUsers: 10, status: "Active" },
  { id: "2", name: "Business Plan", price: 200, billingCycle: "Annual", totalUsers: 5, status: "Active" },
  { id: "3", name: "Starter Plan", price: 49, billingCycle: "Monthly", totalUsers: 15, status: "Inactive" },
];

const MOCK_FEATURES: Feature[] = [
  { id: "1",  name: "Customer Data Access",       category: "Security",       description: "Create and manage customer data records securely",          status: "Active"   },
  { id: "2",  name: "Role Based Access Control",  category: "Security",       description: "Manage role-based permissions for users",                   status: "Active"   },
  { id: "3",  name: "Advanced SSO / SAML",        category: "Security",       description: "Enterprise single sign-on with SAML 2.0 support",           status: "Active"   },
  { id: "4",  name: "API Access",                 category: "Integration",    description: "RESTful API access with rate limiting",                     status: "Active"   },
  { id: "5",  name: "Multi-Factor Authentication",category: "Security",       description: "Two-factor authentication for enhanced security",           status: "Active"   },
  { id: "6",  name: "Audit Logs",                 category: "Compliance",     description: "Track all system events and user actions",                  status: "Active"   },
  { id: "7",  name: "Custom Branding",            category: "Customization",  description: "White-label branding and theming options",                  status: "Inactive" },
  { id: "8",  name: "Advanced Analytics",         category: "Analytics",      description: "In-depth analytics with reporting dashboard",               status: "Active"   },
  { id: "9",  name: "Webhook Notifications",      category: "Integration",    description: "Real-time event notifications via webhooks",                status: "Active"   },
  { id: "10", name: "Priority Support",           category: "Support",        description: "24/7 priority customer support access",                    status: "Inactive" },
  { id: "11", name: "Data Export",                category: "Compliance",     description: "Export tenant data in CSV, JSON and PDF formats",           status: "Active"   },
  { id: "12", name: "Custom Domains",             category: "Customization",  description: "Map custom domains to tenant workspaces",                   status: "Active"   },
  { id: "13", name: "IP Allowlisting",            category: "Security",       description: "Restrict access to specific IP address ranges",             status: "Active"   },
  { id: "14", name: "SCIM Provisioning",          category: "Integration",    description: "Automated user provisioning with SCIM 2.0",                 status: "Inactive" },
  { id: "15", name: "Session Management",         category: "Security",       description: "Manage and revoke active user sessions",                    status: "Active"   },
  { id: "16", name: "Password Policies",          category: "Security",       description: "Enforce password complexity and rotation rules",            status: "Active"   },
  { id: "17", name: "Slack Integration",          category: "Integration",    description: "Send alerts and notifications to Slack channels",           status: "Active"   },
  { id: "18", name: "GDPR Compliance Tools",      category: "Compliance",     description: "Data subject request handling and consent management",      status: "Active"   },
  { id: "19", name: "Tenant Isolation",           category: "Security",       description: "Strict data isolation between tenant workspaces",           status: "Active"   },
  { id: "20", name: "Custom Roles",               category: "Customization",  description: "Define custom roles beyond the default ADMIN/MOD/MEMBER",   status: "Inactive" },
  { id: "21", name: "Rate Limiting Controls",     category: "Integration",    description: "Configure per-tenant API rate limit thresholds",            status: "Active"   },
  { id: "22", name: "Onboarding Flows",           category: "Customization",  description: "Custom onboarding steps for new tenant users",              status: "Active"   },
  { id: "23", name: "SLA Monitoring",             category: "Analytics",      description: "Track uptime and response-time SLAs per service",          status: "Active"   },
  { id: "24", name: "Storage Quotas",             category: "Compliance",     description: "Set and enforce per-tenant data storage limits",            status: "Active"   },
  { id: "25", name: "Email Templates",            category: "Customization",  description: "Branded transactional email templates per tenant",          status: "Inactive" },
  { id: "26", name: "AI Insights",               category: "Analytics",      description: "AI-powered usage patterns and anomaly detection",           status: "Active"   },
  { id: "27", name: "Cross-Tenant Reporting",     category: "Analytics",      description: "Aggregate metrics across all tenant workspaces",            status: "Active"   },
  { id: "28", name: "Dedicated Infrastructure",   category: "Support",        description: "Isolated compute resources for enterprise tenants",         status: "Inactive" },
];

const ALL_CATEGORIES = ["All Categories", "Security", "Integration", "Compliance", "Customization", "Analytics", "Support"];
const FEATURES_PER_PAGE = 10;

const CATEGORY_COLORS: Record<string, string> = {
  Security:      "bg-red-50 text-red-700",
  Integration:   "bg-blue-50 text-blue-700",
  Compliance:    "bg-purple-50 text-purple-700",
  Customization: "bg-amber-50 text-amber-700",
  Analytics:     "bg-cyan-50 text-cyan-700",
  Support:       "bg-emerald-50 text-emerald-700",
};

function StatusBadge({ status }: { status: "Active" | "Inactive" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
        status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${status === "Active" ? "bg-emerald-500" : "bg-gray-400"}`} />
      {status}
    </span>
  );
}

export default function PlansAndFeaturesPage() {
  const [featureTab, setFeatureTab] = useState<"all" | "categories">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [currentPage, setCurrentPage] = useState(1);
  const [features, setFeatures] = useState<Feature[]>(MOCK_FEATURES);
  const [plans] = useState<Plan[]>(MOCK_PLANS);

  const filteredFeatures = useMemo(() => {
    return features.filter((f) => {
      const matchesSearch =
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "All Categories" || f.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [features, searchQuery, selectedCategory]);

  const totalPages = Math.ceil(filteredFeatures.length / FEATURES_PER_PAGE);
  const paginatedFeatures = filteredFeatures.slice(
    (currentPage - 1) * FEATURES_PER_PAGE,
    currentPage * FEATURES_PER_PAGE
  );

  const groupedFeatures = useMemo(() => {
    return ALL_CATEGORIES.slice(1).reduce<Record<string, Feature[]>>((acc, cat) => {
      acc[cat] = filteredFeatures.filter((f) => f.category === cat);
      return acc;
    }, {});
  }, [filteredFeatures]);

  function toggleFeatureStatus(id: string) {
    setFeatures((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, status: f.status === "Active" ? "Inactive" : "Active" } : f
      )
    );
  }

  const activeCount = features.filter((f) => f.status === "Active").length;

  return (
    <div className="flex flex-col gap-8">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-800">Plans &amp; Features</h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-600">
              <Eye className="h-3 w-3" />
              Preview
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Manage subscription plans and the features available to tenants.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2">
          <Plus className="h-4 w-4" />
          Create New Plan
        </button>
      </div>

      {/* Stats cards */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Total Plans",
            value: String(plans.length),
            sub: `Active: ${plans.filter((p) => p.status === "Active").length}`,
            icon: Package,
            color: "text-indigo-600",
            bg: "bg-indigo-50",
          },
          {
            label: "Total Features",
            value: String(features.length),
            sub: `Enabled: ${activeCount}`,
            icon: CheckCircle2,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
          },
          {
            label: "Plan Subscribers",
            value: "3",
            sub: "Plan comparison: +4.7%",
            icon: Users,
            color: "text-violet-600",
            bg: "bg-violet-50",
          },
          {
            label: "Avg. Monthly Revenue",
            value: "$990",
            sub: "Revenue per plan: $4.3k",
            icon: DollarSign,
            color: "text-amber-600",
            bg: "bg-amber-50",
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg} ${stat.color}`}>
                <Icon className="h-5 w-5" strokeWidth={2} />
              </span>
              <div className="mt-4">
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-800">{stat.value}</p>
              </div>
              <p className="mt-3 border-t border-gray-100 pt-3 text-xs text-slate-400">{stat.sub}</p>
            </div>
          );
        })}
      </section>

      {/* Subscription Plans */}
      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-slate-800">Subscription Plans</h2>
            <p className="text-xs text-slate-400">Showing 1–{plans.length} of {plans.length} results</p>
          </div>
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100">
            <Plus className="h-3.5 w-3.5" />
            Add New Plan
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Plan Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Price</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Billing Cycle</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Total Users</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {plans.map((plan) => (
                <tr key={plan.id} className="transition-colors hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-slate-800">{plan.name}</td>
                  <td className="px-6 py-4 text-slate-600">
                    <span className="font-semibold text-slate-800">${plan.price}</span>
                    <span className="ml-1 text-xs text-slate-400">/{plan.billingCycle === "Monthly" ? "mo" : "yr"}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{plan.billingCycle}</td>
                  <td className="px-6 py-4 text-slate-600">{plan.totalUsers}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={plan.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-gray-50">
                        <Edit2 className="h-3 w-3" />
                        Edit
                      </button>
                      <button className="inline-flex items-center gap-1.5 rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50">
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Top Features */}
      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-800">Top Features</h2>
            <button className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3.5 py-2 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-100">
              <Plus className="h-3.5 w-3.5" />
              Manage Features
            </button>
          </div>

          {/* Tabs + filters */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-0.5">
              {(["all", "categories"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setFeatureTab(tab); setCurrentPage(1); }}
                  className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                    featureTab === tab
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {tab === "all" ? "All Features" : "By Categories"}
                </button>
              ))}
            </div>

            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search features..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-8 pr-3 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {ALL_CATEGORIES.map((cat) => (
                <option key={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {featureTab === "all" ? (
            <>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Feature Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedFeatures.map((feature) => (
                    <tr key={feature.id} className="transition-colors hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-slate-800">{feature.name}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${CATEGORY_COLORS[feature.category] ?? "bg-gray-100 text-gray-600"}`}>
                          {feature.category}
                        </span>
                      </td>
                      <td className="max-w-xs px-6 py-4 text-slate-500">{feature.description}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={feature.status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-gray-50">
                            <Edit2 className="h-3 w-3" />
                            Edit
                          </button>
                          <button
                            onClick={() => toggleFeatureStatus(feature.id)}
                            className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                              feature.status === "Active"
                                ? "border-red-200 text-red-600 hover:bg-red-50"
                                : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                            }`}
                          >
                            {feature.status === "Active" ? (
                              <ToggleRight className="h-3.5 w-3.5" />
                            ) : (
                              <ToggleLeft className="h-3.5 w-3.5" />
                            )}
                            {feature.status === "Active" ? "Disable" : "Enable"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="flex items-center justify-between border-t border-gray-100 px-6 py-3">
                <span className="text-xs text-slate-400">
                  {filteredFeatures.length === 0
                    ? "No results"
                    : `${(currentPage - 1) * FEATURES_PER_PAGE + 1}–${Math.min(currentPage * FEATURES_PER_PAGE, filteredFeatures.length)} of ${filteredFeatures.length} features`}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    className="rounded-md border border-gray-200 p-1.5 text-slate-400 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`min-w-[28px] rounded-md border px-2 py-1 text-xs font-medium transition-colors ${
                        page === currentPage
                          ? "border-indigo-600 bg-indigo-600 text-white"
                          : "border-gray-200 text-slate-600 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    disabled={currentPage === totalPages || totalPages === 0}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="rounded-md border border-gray-200 p-1.5 text-slate-400 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="divide-y divide-gray-100">
              {ALL_CATEGORIES.slice(1).map((cat) => {
                const catFeatures = groupedFeatures[cat] ?? [];
                if (catFeatures.length === 0) return null;
                return (
                  <div key={cat} className="px-6 py-4">
                    <div className="mb-3 flex items-center gap-2">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${CATEGORY_COLORS[cat] ?? "bg-gray-100 text-gray-600"}`}>
                        {cat}
                      </span>
                      <span className="text-xs text-slate-400">{catFeatures.length} feature{catFeatures.length !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {catFeatures.map((feature) => (
                        <div
                          key={feature.id}
                          className="flex items-start justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3"
                        >
                          <div className="flex-1 min-w-0 pr-2">
                            <p className="truncate text-sm font-medium text-slate-800">{feature.name}</p>
                            <p className="mt-0.5 truncate text-xs text-slate-400">{feature.description}</p>
                          </div>
                          <div className="flex shrink-0 flex-col items-end gap-1.5">
                            <StatusBadge status={feature.status} />
                            <button
                              onClick={() => toggleFeatureStatus(feature.id)}
                              className="text-xs font-medium text-indigo-600 hover:underline"
                            >
                              {feature.status === "Active" ? "Disable" : "Enable"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
