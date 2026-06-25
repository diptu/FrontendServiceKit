"use client";

import { useState, useMemo } from "react";
import PlatformAdminShell from "@/components/platform-admin/PlatformAdminShell";
import {
  AdminFooter,
  AdminTable,
  PageHeader,
  PreviewBanner,
  SearchFilterBar,
  StatCard,
  StatGrid,
  StatusBadge,
  TabBar,
} from "@/components/platform-admin/ui";
import { ChevronLeft, ChevronRight, Eye, LayoutGrid, Layers, List, Plus, Search, Shield, Star, Zap } from "lucide-react";

type FeatureCategory = "Security"|"Integration"|"Compliance"|"Customization"|"Analytics"|"Support";

interface Feature { id:string; name:string; category:FeatureCategory; description:string; active:boolean; plans:string[] }
interface Plan { id:string; name:string; price:number; subscribers:number; features:number; status:"Active"|"Inactive"; badge?:string }

const MOCK_FEATURES: Feature[] = [
  { id:"f1",  name:"MFA Enforcement",           category:"Security",      description:"Require MFA for all admin roles.",                          active:true,  plans:["Enterprise","Growth"]           },
  { id:"f2",  name:"SSO / SAML 2.0",            category:"Integration",   description:"Single sign-on via SAML 2.0 identity providers.",           active:true,  plans:["Enterprise"]                   },
  { id:"f3",  name:"ABAC Policy Engine",        category:"Security",      description:"Attribute-based access control with fine-grained policies.", active:true,  plans:["Enterprise","Growth"]           },
  { id:"f4",  name:"GDPR Data Export",          category:"Compliance",    description:"One-click GDPR-compliant data portability export.",          active:true,  plans:["Enterprise","Growth","Starter"] },
  { id:"f5",  name:"Custom Branding",           category:"Customization", description:"Tenant-specific logo, colours, and domain configuration.",   active:true,  plans:["Enterprise","Growth"]           },
  { id:"f6",  name:"Advanced Analytics",        category:"Analytics",     description:"Real-time usage dashboards, cohort analysis, and export.",   active:true,  plans:["Enterprise"]                   },
  { id:"f7",  name:"Dedicated Support",         category:"Support",       description:"SLA-backed 24/7 support with named account manager.",        active:true,  plans:["Enterprise"]                   },
  { id:"f8",  name:"Audit Logs (Full)",         category:"Compliance",    description:"Immutable, tamper-evident audit trail for all IAM actions.",  active:true,  plans:["Enterprise","Growth"]           },
  { id:"f9",  name:"Webhook Events",            category:"Integration",   description:"Real-time event delivery to external endpoints.",            active:true,  plans:["Enterprise","Growth"]           },
  { id:"f10", name:"SCIM Provisioning",         category:"Integration",   description:"Automated user sync via SCIM.",                             active:false, plans:["Enterprise"]                   },
  { id:"f11", name:"IP Allowlisting",           category:"Security",      description:"Restrict access to trusted IP ranges.",                      active:true,  plans:["Enterprise","Growth"]           },
  { id:"f12", name:"Department-Level ABAC",     category:"Security",      description:"Apply access policies scoped to organisational departments.", active:true,  plans:["Enterprise"]                   },
  { id:"f13", name:"SOC 2 Type II Report",      category:"Compliance",    description:"Annual SOC 2 Type II compliance audit report.",              active:true,  plans:["Enterprise"]                   },
  { id:"f14", name:"Custom Roles",              category:"Customization", description:"Define tenant-specific roles beyond the default hierarchy.",  active:false, plans:["Enterprise","Growth"]           },
  { id:"f15", name:"Basic Audit Log",           category:"Compliance",    description:"Last 30-day audit log from the admin console.",              active:true,  plans:["Starter","Growth"]              },
  { id:"f16", name:"Email Support",             category:"Support",       description:"Ticket-based support with 2-business-day response SLA.",     active:true,  plans:["Starter","Growth"]              },
  { id:"f17", name:"REST API Access",           category:"Integration",   description:"Full REST API for programmatic tenant and user management.",  active:true,  plans:["Enterprise","Growth","Starter"] },
  { id:"f18", name:"Usage Analytics",           category:"Analytics",     description:"Monthly summary reports on seat usage and active users.",     active:true,  plans:["Growth","Starter"]              },
  { id:"f19", name:"MFA (TOTP only)",           category:"Security",      description:"Time-based OTP MFA enforced for admin accounts only.",       active:true,  plans:["Starter"]                      },
  { id:"f20", name:"Clearance Levels",          category:"Security",      description:"Five-tier document clearance model for data access control.", active:true,  plans:["Enterprise","Growth"]           },
  { id:"f21", name:"Tenant Isolation",          category:"Security",      description:"Guaranteed cross-tenant data isolation at the policy layer.", active:true,  plans:["Enterprise","Growth","Starter"] },
  { id:"f22", name:"White-glove Onboarding",    category:"Support",       description:"Hands-on migration and onboarding assistance.",              active:true,  plans:["Enterprise"]                   },
  { id:"f23", name:"Session Management",        category:"Security",      description:"Configurable session timeout, concurrent session limits.",    active:true,  plans:["Enterprise","Growth"]           },
  { id:"f24", name:"Okta / Azure AD Sync",      category:"Integration",   description:"Native connector for Okta and Azure Active Directory.",      active:false, plans:["Enterprise"]                   },
  { id:"f25", name:"Custom CSS Overrides",      category:"Customization", description:"Inject custom stylesheets into the tenant dashboard.",       active:false, plans:["Enterprise"]                   },
  { id:"f26", name:"HIPAA BAA Available",       category:"Compliance",    description:"Business Associate Agreement for HIPAA-covered entities.",   active:true,  plans:["Enterprise"]                   },
  { id:"f27", name:"Geo-restriction",           category:"Security",      description:"Block or allow access based on geographic region.",          active:false, plans:["Enterprise"]                   },
  { id:"f28", name:"AI Policy Review",          category:"Analytics",     description:"Flagging overly permissive ABAC rules using AI analysis.",   active:false, plans:["Enterprise"]                   },
];

const MOCK_PLANS: Plan[] = [
  { id:"p1", name:"Enterprise", price:2399, subscribers:1, features:28, status:"Active", badge:"Most Popular" },
  { id:"p2", name:"Growth",     price:499,  subscribers:1, features:18, status:"Active" },
  { id:"p3", name:"Starter",    price:72,   subscribers:1, features:8,  status:"Active" },
];

const CATEGORY_ICON: Record<FeatureCategory, React.ElementType> = {
  Security:Shield, Integration:Zap, Compliance:Layers, Customization:Star, Analytics:LayoutGrid, Support:Eye,
};
const CATEGORY_COLORS: Record<FeatureCategory, { bg:string; text:string }> = {
  Security:      { bg:"bg-red-50",     text:"text-red-600"     },
  Integration:   { bg:"bg-blue-50",    text:"text-blue-600"    },
  Compliance:    { bg:"bg-violet-50",  text:"text-violet-600"  },
  Customization: { bg:"bg-amber-50",   text:"text-amber-600"   },
  Analytics:     { bg:"bg-emerald-50", text:"text-emerald-600" },
  Support:       { bg:"bg-slate-100",  text:"text-slate-600"   },
};
const CATEGORIES = ["All","Security","Integration","Compliance","Customization","Analytics","Support"] as const;
const PAGE_SIZE  = 10;
const PLAN_STATUS_COLORS: Record<string,string> = { Active:"bg-emerald-50 text-emerald-700", Inactive:"bg-gray-100 text-gray-500" };

export default function AdminPlansFeaturesPage() {
  const [featureTab,      setFeatureTab]      = useState<"list"|"categories">("list");
  const [search,          setSearch]          = useState("");
  const [categoryFilter,  setCategoryFilter]  = useState<typeof CATEGORIES[number]>("All");
  const [page,            setPage]            = useState(1);
  const [activeStates,    setActiveStates]    = useState<Record<string,boolean>>(
    Object.fromEntries(MOCK_FEATURES.map((f) => [f.id, f.active]))
  );

  const filteredFeatures = useMemo(() => MOCK_FEATURES.filter((f) => {
    const ms = !search || f.name.toLowerCase().includes(search.toLowerCase());
    const mc = categoryFilter === "All" || f.category === categoryFilter;
    return ms && mc;
  }), [search, categoryFilter]);

  const totalPages = Math.ceil(filteredFeatures.length / PAGE_SIZE);
  const paginated  = filteredFeatures.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const byCategory = useMemo(() => {
    const map: Partial<Record<FeatureCategory, Feature[]>> = {};
    for (const f of MOCK_FEATURES) (map[f.category] ??= []).push(f);
    return map;
  }, []);

  return (
    <PlatformAdminShell adminEmail="admin@nutratenant.com" adminId="preview">
      <div className="flex flex-col gap-6">
        <PreviewBanner showIcon>Preview mode — Plans & Features management. Auth gate disabled for local dev.</PreviewBanner>

        <PageHeader
          title="Plans & Features"
          subtitle="Manage platform subscription plans and feature availability across all tiers."
          actions={
            <button type="button" className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700">
              <Plus className="h-4 w-4" /> Create New Plan
            </button>
          }
        />

        <StatGrid cols={4}>
          <StatCard icon={Layers} value={MOCK_PLANS.length}                   label="Total Plans"      sub="Across all tiers"         bg="bg-violet-50"  color="text-violet-600"  />
          <StatCard icon={Star}   value={MOCK_FEATURES.length}                label="Total Features"   sub="Platform-wide features"   bg="bg-blue-50"    color="text-blue-600"    />
          <StatCard icon={Eye}    value={MOCK_PLANS.reduce((s,p)=>s+p.subscribers,0)} label="Plan Subscribers" sub="Active paying tenants" bg="bg-emerald-50" color="text-emerald-600" />
          <StatCard icon={Zap}    value={`$${Math.round(MOCK_PLANS.reduce((s,p)=>s+p.price,0)/MOCK_PLANS.length).toLocaleString()}`} label="Avg. Monthly Rev" sub="Per plan average" bg="bg-amber-50" color="text-amber-600" />
        </StatGrid>

        {/* Plans table */}
        <AdminTable title="Subscription Plans">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {["Plan Name","Price / mo","Subscribers","Features","Status","Actions"].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_PLANS.map((plan) => (
                <tr key={plan.id} className="transition-colors hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">{plan.name}</span>
                      {plan.badge && <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700">{plan.badge}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-900">${plan.price.toLocaleString()}</td>
                  <td className="px-6 py-4 text-slate-700">{plan.subscribers}</td>
                  <td className="px-6 py-4 text-slate-700">{plan.features}</td>
                  <td className="px-6 py-4"><StatusBadge status={plan.status} colorMap={PLAN_STATUS_COLORS} /></td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button type="button" className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">Edit</button>
                      <button type="button" className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminTable>

        {/* Features section */}
        <AdminTable
          title="Top Features"
          toolbar={
            <TabBar
              tabs={[{ label:"All Features" }, { label:"By Categories" }]}
              active={featureTab === "list" ? "All Features" : "By Categories"}
              onChange={(l) => setFeatureTab(l === "All Features" ? "list" : "categories")}
            />
          }
        >
          {featureTab === "list" && (
            <>
              <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-6 py-3">
                <SearchFilterBar
                  searchSlot={
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                      <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search features…" className="h-8 rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500" />
                    </div>
                  }
                >
                  <div className="flex gap-1 overflow-x-auto">
                    {CATEGORIES.map((cat) => (
                      <button key={cat} type="button" onClick={() => { setCategoryFilter(cat); setPage(1); }}
                        className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold transition-colors ${categoryFilter === cat ? "bg-green-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                        {cat}
                      </button>
                    ))}
                  </div>
                </SearchFilterBar>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {["Feature","Category","Plans","Status"].map((h) => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginated.map((feat) => {
                    const isActive = activeStates[feat.id] ?? feat.active;
                    const cc = CATEGORY_COLORS[feat.category];
                    return (
                      <tr key={feat.id} className="transition-colors hover:bg-slate-50">
                        <td className="px-6 py-3.5">
                          <p className="font-semibold text-slate-900">{feat.name}</p>
                          <p className="text-xs text-slate-400">{feat.description}</p>
                        </td>
                        <td className="px-6 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cc.bg} ${cc.text}`}>{feat.category}</span>
                        </td>
                        <td className="px-6 py-3.5">
                          <div className="flex flex-wrap gap-1">
                            {feat.plans.map((p) => <span key={p} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">{p}</span>)}
                          </div>
                        </td>
                        <td className="px-6 py-3.5">
                          <button type="button" onClick={() => setActiveStates((prev) => ({ ...prev, [feat.id]: !prev[feat.id] }))}
                            className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${isActive ? "bg-green-500" : "bg-slate-300"}`}>
                            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${isActive ? "translate-x-4" : "translate-x-0.5"}`} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="flex items-center justify-between border-t border-slate-100 px-6 py-3">
                <span className="text-xs text-slate-400">
                  {filteredFeatures.length === 0 ? "No results" : `${(page-1)*PAGE_SIZE+1}–${Math.min(page*PAGE_SIZE, filteredFeatures.length)} of ${filteredFeatures.length}`}
                </span>
                <div className="flex items-center gap-1">
                  <button disabled={page===1} onClick={() => setPage((p)=>p-1)} className="rounded-md border border-slate-200 p-1.5 text-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft className="h-3.5 w-3.5" /></button>
                  {Array.from({length:totalPages},(_,i)=>i+1).map((p) => (
                    <button key={p} onClick={()=>setPage(p)} className={`min-w-[28px] rounded-md border px-2 py-1 text-xs font-medium ${p===page?"border-green-600 bg-green-600 text-white":"border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{p}</button>
                  ))}
                  <button disabled={page===totalPages||totalPages===0} onClick={() => setPage((p)=>p+1)} className="rounded-md border border-slate-200 p-1.5 text-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"><ChevronRight className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            </>
          )}
          {featureTab === "categories" && (
            <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
              {(Object.entries(byCategory) as [FeatureCategory, Feature[]][]).map(([cat, features]) => {
                const Icon = CATEGORY_ICON[cat];
                const cc   = CATEGORY_COLORS[cat];
                const activeCount = features.filter((f) => activeStates[f.id] ?? f.active).length;
                return (
                  <div key={cat} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${cc.bg} ${cc.text}`}><Icon className="h-4 w-4" strokeWidth={2} /></span>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{cat}</p>
                        <p className="text-[11px] text-slate-400">{activeCount}/{features.length} active</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {features.map((f) => {
                        const isActive = activeStates[f.id] ?? f.active;
                        return (
                          <div key={f.id} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 shadow-sm">
                            <p className="text-xs font-medium text-slate-700">{f.name}</p>
                            <button type="button" onClick={() => setActiveStates((prev) => ({ ...prev, [f.id]: !prev[f.id] }))}
                              className={`relative inline-flex h-4 w-7 shrink-0 items-center rounded-full transition-colors ${isActive ? "bg-green-500" : "bg-slate-300"}`}>
                              <span className={`inline-block h-3 w-3 transform rounded-full bg-white shadow transition-transform ${isActive ? "translate-x-3.5" : "translate-x-0.5"}`} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </AdminTable>

        <AdminFooter />
      </div>
    </PlatformAdminShell>
  );
}
