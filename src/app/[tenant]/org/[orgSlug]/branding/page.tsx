import PreviewBanner from "@/components/platform-admin/ui/PreviewBanner";
import { Palette, Upload, Eye } from "lucide-react";

interface Props { params: Promise<{ orgSlug: string }> }

const COLOR_TOKENS = [
  { name: "Primary",   hex: "#6366f1", var: "--color-primary"   },
  { name: "Secondary", hex: "#8b5cf6", var: "--color-secondary" },
  { name: "Accent",    hex: "#06b6d4", var: "--color-accent"    },
  { name: "Surface",   hex: "#f8fafc", var: "--color-surface"   },
  { name: "Text",      hex: "#0f172a", var: "--color-text"      },
  { name: "Danger",    hex: "#ef4444", var: "--color-danger"    },
];

export default async function BrandingPage({ params }: Props) {
  const { orgSlug } = await params;
  const display = orgSlug.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join(" ");

  return (
    <div className="flex flex-col gap-6">
      <PreviewBanner showIcon>
        Preview mode — branding changes are disabled until role gates are enforced.
      </PreviewBanner>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900">
            <Palette className="h-5 w-5 text-indigo-500" />Branding
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Customise the visual identity of{" "}
            <span className="font-medium text-slate-700">{display}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            <Eye className="h-4 w-4" />Preview
          </button>
          <button type="button" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors">
            Save Branding
          </button>
        </div>
      </div>

      {/* Logo */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Logo</h2>
        <p className="mt-1 text-xs text-slate-400">Displayed in the sidebar and login page. Recommended: 200×200 px PNG with transparent background.</p>
        <div className="mt-4 flex items-start gap-6">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-lg font-bold text-white">
              {display[0]}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button type="button" className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
              <Upload className="h-4 w-4" />Upload Logo
            </button>
            <p className="text-[11px] text-slate-400">SVG, PNG or JPG · Max 2 MB</p>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-xs font-semibold text-slate-700">Favicon</h3>
          <p className="mt-0.5 text-[11px] text-slate-400">Shown in browser tabs. 32×32 px ICO or PNG.</p>
          <div className="mt-3 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-xs font-bold text-indigo-700">
              {display[0]}
            </div>
            <button type="button" className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors">
              <Upload className="h-3.5 w-3.5" />Upload Favicon
            </button>
          </div>
        </div>
      </div>

      {/* Color palette */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Color Palette</h2>
        <p className="mt-1 text-xs text-slate-400">These tokens are applied across your org's portal and login page.</p>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {COLOR_TOKENS.map(token => (
            <div key={token.name} className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
              <div
                className="h-10 w-10 shrink-0 rounded-lg border border-slate-200 shadow-sm"
                style={{ backgroundColor: token.hex }}
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-800">{token.name}</p>
                <p className="font-mono text-[11px] text-slate-500">{token.hex}</p>
                <p className="font-mono text-[10px] text-slate-400">{token.var}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <button type="button" className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            Reset to Defaults
          </button>
          <button type="button" className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            Import from Brand Kit
          </button>
        </div>
      </div>

      {/* Typography */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Typography</h2>
        <p className="mt-1 text-xs text-slate-400">Choose fonts for headings and body text.</p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            { label: "Heading Font",  current: "Inter",    preview: "The quick brown fox" },
            { label: "Body Font",     current: "Inter",    preview: "The quick brown fox jumps over the lazy dog." },
          ].map(f => (
            <div key={f.label} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-600">{f.label}</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{f.preview}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs font-medium text-slate-700">{f.current}</span>
                <button type="button" className="text-xs font-medium text-indigo-600 hover:text-indigo-500">Change</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Login page preview */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Login Page</h2>
          <button type="button" className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-500">
            <Eye className="h-3.5 w-3.5" />Preview Login
          </button>
        </div>
        <div className="mt-4 flex flex-col gap-3">
          {[
            { label: "Welcome Headline",   value: `Welcome to ${display}` },
            { label: "Login Subtext",      value: "Sign in with your organisation account." },
            { label: "Support URL",        value: "https://support.nutratenant.com" },
            { label: "Privacy Policy URL", value: "https://nutratenant.com/privacy" },
          ].map(field => (
            <div key={field.label} className="flex items-center gap-4">
              <label className="w-40 shrink-0 text-xs font-medium text-slate-500">{field.label}</label>
              <input
                type="text"
                defaultValue={field.value}
                readOnly
                className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700 focus:outline-none"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
