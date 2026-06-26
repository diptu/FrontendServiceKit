"use client";

import { useState, useMemo } from "react";
import { Package, CheckCircle2, Users, DollarSign, Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Eye } from "lucide-react";
import {
  StatCard, Button, Badge, StatusBadge,
  Card, CardHeader, CardBody,
  DataTable, type Column,
  SearchBox, Tabs, Pagination,
  SlideUp, FadeIn, StaggerContainer, StaggerItem,
} from "@/components/ui";

interface Plan {
  id: string; name: string; price: number;
  billingCycle: "Monthly" | "Annual"; totalUsers: number;
  status: "Active" | "Inactive";
}

interface Feature {
  id: string; name: string; category: string;
  description: string; status: "Active" | "Inactive";
}

const MOCK_PLANS: Plan[] = [
  { id:"1", name:"Enterprise Plan", price:299, billingCycle:"Monthly", totalUsers:10, status:"Active"   },
  { id:"2", name:"Business Plan",   price:200, billingCycle:"Annual",  totalUsers:5,  status:"Active"   },
  { id:"3", name:"Starter Plan",    price:49,  billingCycle:"Monthly", totalUsers:15, status:"Inactive" },
];

const MOCK_FEATURES: Feature[] = [
  { id:"1",  name:"Customer Data Access",      category:"Security",      description:"Create and manage customer data records securely",          status:"Active"   },
  { id:"2",  name:"Role Based Access Control", category:"Security",      description:"Manage role-based permissions for users",                   status:"Active"   },
  { id:"3",  name:"Advanced SSO / SAML",       category:"Security",      description:"Enterprise single sign-on with SAML 2.0 support",           status:"Active"   },
  { id:"4",  name:"API Access",                category:"Integration",   description:"RESTful API access with rate limiting",                     status:"Active"   },
  { id:"5",  name:"Multi-Factor Authentication",category:"Security",     description:"Two-factor authentication for enhanced security",           status:"Active"   },
  { id:"6",  name:"Audit Logs",               category:"Compliance",    description:"Track all system events and user actions",                  status:"Active"   },
  { id:"7",  name:"Custom Branding",           category:"Customization", description:"White-label branding and theming options",                  status:"Inactive" },
  { id:"8",  name:"Advanced Analytics",        category:"Analytics",     description:"In-depth analytics with reporting dashboard",               status:"Active"   },
  { id:"9",  name:"Webhook Notifications",     category:"Integration",   description:"Real-time event notifications via webhooks",               status:"Active"   },
  { id:"10", name:"Priority Support",          category:"Support",       description:"24/7 priority customer support access",                    status:"Inactive" },
  { id:"11", name:"Data Export",              category:"Compliance",    description:"Export tenant data in CSV, JSON and PDF formats",           status:"Active"   },
  { id:"12", name:"Custom Domains",            category:"Customization", description:"Map custom domains to tenant workspaces",                   status:"Active"   },
  { id:"13", name:"IP Allowlisting",           category:"Security",      description:"Restrict access to specific IP address ranges",             status:"Active"   },
  { id:"14", name:"SCIM Provisioning",         category:"Integration",   description:"Automated user provisioning with SCIM 2.0",                status:"Inactive" },
  { id:"15", name:"Session Management",        category:"Security",      description:"Manage and revoke active user sessions",                    status:"Active"   },
  { id:"16", name:"Password Policies",         category:"Security",      description:"Enforce password complexity and rotation rules",            status:"Active"   },
  { id:"17", name:"Slack Integration",         category:"Integration",   description:"Send alerts and notifications to Slack channels",           status:"Active"   },
  { id:"18", name:"GDPR Compliance Tools",     category:"Compliance",    description:"Data subject request handling and consent management",      status:"Active"   },
  { id:"19", name:"Tenant Isolation",          category:"Security",      description:"Strict data isolation between tenant workspaces",           status:"Active"   },
  { id:"20", name:"Custom Roles",              category:"Customization", description:"Define custom roles beyond the default ADMIN/MOD/MEMBER",   status:"Inactive" },
  { id:"21", name:"Rate Limiting Controls",    category:"Integration",   description:"Configure per-tenant API rate limit thresholds",            status:"Active"   },
  { id:"22", name:"Onboarding Flows",          category:"Customization", description:"Custom onboarding steps for new tenant users",              status:"Active"   },
  { id:"23", name:"SLA Monitoring",            category:"Analytics",     description:"Track uptime and response-time SLAs per service",          status:"Active"   },
  { id:"24", name:"Storage Quotas",            category:"Compliance",    description:"Set and enforce per-tenant data storage limits",            status:"Active"   },
  { id:"25", name:"Email Templates",           category:"Customization", description:"Branded transactional email templates per tenant",          status:"Inactive" },
  { id:"26", name:"AI Insights",              category:"Analytics",     description:"AI-powered usage patterns and anomaly detection",           status:"Active"   },
  { id:"27", name:"Cross-Tenant Reporting",    category:"Analytics",     description:"Aggregate metrics across all tenant workspaces",            status:"Active"   },
  { id:"28", name:"Dedicated Infrastructure",  category:"Support",       description:"Isolated compute resources for enterprise tenants",         status:"Inactive" },
];

const ALL_CATEGORIES = ["Security", "Integration", "Compliance", "Customization", "Analytics", "Support"];

const CATEGORY_VARIANT: Record<string, "error"|"info"|"violet"|"warning"|"muted"|"success"> = {
  Security:      "error",
  Integration:   "info",
  Compliance:    "violet",
  Customization: "warning",
  Analytics:     "muted",
  Support:       "success",
};

const FEATURES_PER_PAGE = 10;

const PLAN_COLUMNS: Column<Plan>[] = [
  { key:"name",         header:"Plan Name", render: p => <span className="font-medium text-slate-800">{p.name}</span> },
  {
    key:"price",        header:"Price",
    render: p => <><span className="font-semibold text-slate-800">${p.price}</span><span className="ml-1 text-xs text-slate-400">/{p.billingCycle === "Monthly" ? "mo" : "yr"}</span></>,
  },
  { key:"billingCycle", header:"Billing Cycle", className:"text-slate-600" },
  { key:"totalUsers",   header:"Total Users",   className:"text-slate-600" },
  { key:"status",       header:"Status",        render: p => <StatusBadge status={p.status} dot /> },
  {
    key:"actions", header:"", align:"right" as const,
    render: () => (
      <div className="flex items-center justify-end gap-2">
        <Button variant="secondary" size="xs" icon={Edit2}>Edit</Button>
        <Button variant="danger"    size="xs" icon={Trash2}>Delete</Button>
      </div>
    ),
  },
];

export default function PlansAndFeaturesPage() {
  const [featureTab,        setFeatureTab]        = useState<"all" | "categories">("all");
  const [searchQuery,       setSearchQuery]        = useState("");
  const [selectedCategory,  setSelectedCategory]   = useState("");
  const [currentPage,       setCurrentPage]        = useState(1);
  const [features,          setFeatures]           = useState<Feature[]>(MOCK_FEATURES);
  const [plans]                                    = useState<Plan[]>(MOCK_PLANS);

  const filteredFeatures = useMemo(() => features.filter(f => {
    const matchQ    = f.name.toLowerCase().includes(searchQuery.toLowerCase()) || f.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat  = !selectedCategory || f.category === selectedCategory;
    return matchQ && matchCat;
  }), [features, searchQuery, selectedCategory]);

  const totalFeaturePages = Math.ceil(filteredFeatures.length / FEATURES_PER_PAGE);
  const paginatedFeatures = filteredFeatures.slice((currentPage - 1) * FEATURES_PER_PAGE, currentPage * FEATURES_PER_PAGE);

  const groupedFeatures = useMemo(() => ALL_CATEGORIES.reduce<Record<string, Feature[]>>((acc, cat) => {
    acc[cat] = filteredFeatures.filter(f => f.category === cat);
    return acc;
  }, {}), [filteredFeatures]);

  function toggleFeatureStatus(id: string) {
    setFeatures(prev => prev.map(f => f.id === id ? { ...f, status: f.status === "Active" ? "Inactive" : "Active" } : f));
  }

  const activeCount  = features.filter(f => f.status === "Active").length;

  const featureColumns: Column<Feature>[] = [
    { key:"name",        header:"Feature Name", render: f => <span className="font-medium text-slate-800">{f.name}</span> },
    { key:"category",    header:"Category",     render: f => <Badge variant={CATEGORY_VARIANT[f.category] ?? "muted"} size="xs">{f.category}</Badge> },
    { key:"description", header:"Description",  className:"max-w-xs text-slate-500" },
    { key:"status",      header:"Status",       render: f => <StatusBadge status={f.status} dot /> },
    {
      key:"actions", header:"", align:"right" as const,
      render: f => (
        <div className="flex items-center justify-end gap-2">
          <Button variant="secondary" size="xs" icon={Edit2}>Edit</Button>
          <Button
            variant={f.status === "Active" ? "danger" : "success"}
            size="xs"
            icon={f.status === "Active" ? ToggleRight : ToggleLeft}
            onClick={() => toggleFeatureStatus(f.id)}
          >
            {f.status === "Active" ? "Disable" : "Enable"}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <SlideUp>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-800">Plans &amp; Features</h1>
              <Badge variant="info" size="xs"><Eye className="h-3 w-3" />Preview</Badge>
            </div>
            <p className="mt-1 text-sm text-slate-500">Manage subscription plans and the features available to tenants.</p>
          </div>
          <Button icon={Plus} variant="success">Create New Plan</Button>
        </div>
      </SlideUp>

      <StaggerContainer stagger={0.09} delayChildren={0.05} className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StaggerItem><StatCard icon={Package}      label="Total Plans"          value={String(plans.length)}        color="indigo"  sub={`Active: ${plans.filter(p => p.status === "Active").length}`} /></StaggerItem>
        <StaggerItem><StatCard icon={CheckCircle2} label="Total Features"       value={String(features.length)}     color="emerald" sub={`Enabled: ${activeCount}`} /></StaggerItem>
        <StaggerItem><StatCard icon={Users}        label="Plan Subscribers"     value="3"                           color="violet"  sub="Plan comparison: +4.7%" /></StaggerItem>
        <StaggerItem><StatCard icon={DollarSign}   label="Avg. Monthly Revenue" value="$990"                        color="amber"   sub="Revenue per plan: $4.3k" /></StaggerItem>
      </StaggerContainer>

      {/* Subscription Plans */}
      <SlideUp delay={0.05}><Card>
        <CardHeader
          title="Subscription Plans"
          description={`Showing 1–${plans.length} of ${plans.length} results`}
          action={<Button variant="success" size="sm" icon={Plus}>Add New Plan</Button>}
        />
        <DataTable<Plan>
          columns={PLAN_COLUMNS}
          data={plans}
          rowKey={p => p.id}
        />
      </Card></SlideUp>

      {/* Features */}
      <FadeIn delay={0.08}><Card>
        <CardHeader
          title="Top Features"
          action={<Button variant="secondary" size="sm" icon={Plus}>Manage Features</Button>}
        />
        <CardBody>
          <div className="flex flex-wrap items-center gap-3">
            <Tabs
              tabs={[{ key:"all", label:"All Features" }, { key:"categories", label:"By Categories" }]}
              activeKey={featureTab}
              onChange={v => { setFeatureTab(v as "all"|"categories"); setCurrentPage(1); }}
              variant="pills"
              size="sm"
            />
            <SearchBox
              value={searchQuery}
              onChange={v => { setSearchQuery(v); setCurrentPage(1); }}
              placeholder="Search features…"
              size="sm"
              className="w-52"
            />
            <select
              value={selectedCategory}
              onChange={e => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Categories</option>
              {ALL_CATEGORIES.map(cat => <option key={cat}>{cat}</option>)}
            </select>
          </div>
        </CardBody>

        {featureTab === "all" ? (
          <DataTable<Feature>
            columns={featureColumns}
            data={paginatedFeatures}
            rowKey={f => f.id}
            footer={
              <Pagination
                page={currentPage}
                total={filteredFeatures.length}
                pageSize={FEATURES_PER_PAGE}
                onPageChange={setCurrentPage}
              />
            }
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {ALL_CATEGORIES.map(cat => {
              const catFeatures = groupedFeatures[cat] ?? [];
              if (catFeatures.length === 0) return null;
              return (
                <div key={cat} className="px-6 py-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Badge variant={CATEGORY_VARIANT[cat] ?? "muted"} size="xs">{cat}</Badge>
                    <span className="text-xs text-slate-400">{catFeatures.length} feature{catFeatures.length !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {catFeatures.map(feature => (
                      <div key={feature.id} className="flex items-start justify-between rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
                        <div className="flex-1 min-w-0 pr-2">
                          <p className="truncate text-sm font-medium text-slate-800">{feature.name}</p>
                          <p className="mt-0.5 truncate text-xs text-slate-400">{feature.description}</p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1.5">
                          <StatusBadge status={feature.status} dot />
                          <button type="button" onClick={() => toggleFeatureStatus(feature.id)}
                            className="text-xs font-medium text-indigo-600 hover:underline">
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
      </Card></FadeIn>
    </div>
  );
}
