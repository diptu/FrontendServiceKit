import { Palette, Upload, Eye } from "lucide-react";
import {
  Banner, Button, Badge,
  Card, CardHeader, CardBody, CardFooter,
} from "@/components/ui";

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
      <Banner variant="info" showIcon>
        Preview mode — branding changes are disabled until role gates are enforced.
      </Banner>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900">
            <Palette className="h-5 w-5 text-indigo-500" />Branding
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Customise the visual identity of <span className="font-medium text-slate-700">{display}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon={Eye}>Preview</Button>
          <Button>Save Branding</Button>
        </div>
      </div>

      {/* Logo */}
      <Card>
        <CardHeader title="Logo" description="Displayed in the sidebar and login page. Recommended: 200×200 px PNG with transparent background." />
        <CardBody>
          <div className="flex items-start gap-6">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-lg font-bold text-white">
                {display[0]}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Button variant="secondary" size="sm" icon={Upload}>Upload Logo</Button>
              <p className="text-[11px] text-slate-400">SVG, PNG or JPG · Max 2 MB</p>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-5">
            <p className="text-xs font-semibold text-slate-700">Favicon</p>
            <p className="mt-0.5 text-[11px] text-slate-400">Shown in browser tabs. 32×32 px ICO or PNG.</p>
            <div className="mt-3 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-xs font-bold text-indigo-700">
                {display[0]}
              </div>
              <Button variant="secondary" size="sm" icon={Upload}>Upload Favicon</Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Color palette */}
      <Card>
        <CardHeader title="Color Palette" description="These tokens are applied across your org's portal and login page." />
        <CardBody>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {COLOR_TOKENS.map(token => (
              <div key={token.name} className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
                <div className="h-10 w-10 shrink-0 rounded-lg border border-slate-200 shadow-sm" style={{ backgroundColor: token.hex }} />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800">{token.name}</p>
                  <p className="font-mono text-[11px] text-slate-500">{token.hex}</p>
                  <p className="font-mono text-[10px] text-slate-400">{token.var}</p>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
        <CardFooter>
          <Button variant="ghost" size="sm">Reset to Defaults</Button>
          <Button variant="ghost" size="sm">Import from Brand Kit</Button>
        </CardFooter>
      </Card>

      {/* Typography */}
      <Card>
        <CardHeader title="Typography" description="Choose fonts for headings and body text." />
        <CardBody>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              { label: "Heading Font", current: "Inter", preview: "The quick brown fox" },
              { label: "Body Font",    current: "Inter", preview: "The quick brown fox jumps over the lazy dog." },
            ].map(f => (
              <div key={f.label} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-semibold text-slate-600">{f.label}</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{f.preview}</p>
                <div className="mt-3 flex items-center justify-between">
                  <Badge variant="muted">{f.current}</Badge>
                  <Button variant="link" size="sm">Change</Button>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Login page */}
      <Card>
        <CardHeader
          title="Login Page"
          action={<Button variant="link" size="sm" icon={Eye}>Preview Login</Button>}
        />
        <CardBody>
          <div className="flex flex-col gap-3">
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
        </CardBody>
      </Card>
    </div>
  );
}
