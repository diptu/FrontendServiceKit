import { Settings, Shield, Bell, Globe, Fingerprint, Trash2, ArrowRightLeft } from "lucide-react";
import {
  Banner, Button, Badge,
  Card, CardHeader, CardBody, CardFooter,
  Alert,
} from "@/components/ui";

interface Props { params: Promise<{ orgSlug: string }> }

export default async function SettingsPage({ params }: Props) {
  const { orgSlug } = await params;
  const display = orgSlug.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join(" ");

  return (
    <div className="flex flex-col gap-6">
      <Banner variant="info" showIcon>
        Preview mode — settings are read-only until role gates are enforced.
      </Banner>

      <div>
        <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900">
          <Settings className="h-5 w-5 text-indigo-500" />Organization Settings
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Configuration for <span className="font-medium text-slate-700">{display}</span>
        </p>
      </div>

      {/* General */}
      <Card>
        <CardHeader
          title="General"
          icon={<Globe className="h-4 w-4 text-indigo-500" />}
        />
        <CardBody>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { label: "Organization Name", value: display,                        hint: "Displayed across the platform."          },
              { label: "Organization Slug", value: orgSlug,                        hint: "Used in URLs. Cannot be changed."        },
              { label: "Primary Domain",    value: `${orgSlug}.nutratenant.com`,   hint: "Canonical subdomain for this org."       },
              { label: "Time Zone",         value: "America/New_York (UTC-5)",     hint: "Used for audit log timestamps."          },
            ].map(field => (
              <div key={field.label}>
                <label className="block text-xs font-medium text-slate-600">{field.label}</label>
                <input
                  type="text"
                  defaultValue={field.value}
                  readOnly
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:outline-none"
                />
                <p className="mt-1 text-[11px] text-slate-400">{field.hint}</p>
              </div>
            ))}
          </div>
        </CardBody>
        <CardFooter align="right">
          <Button>Save Changes</Button>
        </CardFooter>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader
          title="Security Policies"
          icon={<Shield className="h-4 w-4 text-indigo-500" />}
        />
        <CardBody>
          <div className="flex flex-col gap-4">
            {[
              { label: "Require MFA for Admins",    hint: "All Admin and Super Admin accounts must have MFA enabled.",    enabled: true  },
              { label: "Enforce MFA org-wide",       hint: "Require MFA for every user in this organization.",            enabled: false },
              { label: "Session timeout (8 hours)",  hint: "Automatically revoke sessions after 8 hours of inactivity.", enabled: true  },
              { label: "IP allowlist enforcement",   hint: "Restrict login to approved IP ranges only.",                  enabled: false },
              { label: "Password complexity policy", hint: "Require min 12 characters, mixed case, numbers, and symbols.",enabled: true  },
            ].map(toggle => (
              <div key={toggle.label} className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-900">{toggle.label}</p>
                  <p className="text-xs text-slate-400">{toggle.hint}</p>
                </div>
                <button
                  type="button"
                  className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors ${toggle.enabled ? "bg-indigo-600" : "bg-slate-200"}`}
                  aria-checked={toggle.enabled}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${toggle.enabled ? "translate-x-4" : "translate-x-0"}`} />
                </button>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* MFA */}
      <Card>
        <CardHeader
          title="MFA Configuration"
          icon={<Fingerprint className="h-4 w-4 text-indigo-500" />}
        />
        <CardBody>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { method: "TOTP (Authenticator App)", enabled: true,  recommended: true  },
              { method: "SMS / OTP",                enabled: true,  recommended: false },
              { method: "Hardware Key (WebAuthn)",  enabled: false, recommended: false },
            ].map(method => (
              <div key={method.method} className={`rounded-lg border p-4 ${method.enabled ? "border-indigo-200 bg-indigo-50" : "border-slate-200 bg-slate-50"}`}>
                <div className="flex items-center justify-between">
                  <span className={`h-2 w-2 rounded-full ${method.enabled ? "bg-indigo-500" : "bg-slate-300"}`} />
                  {method.recommended && <Badge variant="violet" size="xs">Recommended</Badge>}
                </div>
                <p className="mt-2 text-xs font-semibold text-slate-800">{method.method}</p>
                <p className="mt-0.5 text-[11px] text-slate-400">{method.enabled ? "Enabled" : "Disabled"}</p>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader
          title="Notification Preferences"
          icon={<Bell className="h-4 w-4 text-indigo-500" />}
        />
        <CardBody>
          <div className="flex flex-col gap-3">
            {[
              { label: "New user joined",         email: true,  inApp: true  },
              { label: "Failed login attempts",   email: true,  inApp: true  },
              { label: "Policy change",           email: true,  inApp: false },
              { label: "Billing invoice ready",   email: true,  inApp: false },
              { label: "Session from new device", email: false, inApp: true  },
            ].map(n => (
              <div key={n.label} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
                <p className="text-sm text-slate-700">{n.label}</p>
                <div className="flex items-center gap-6 text-xs font-medium">
                  <label className="flex items-center gap-1.5 text-slate-600">
                    <input type="checkbox" defaultChecked={n.email} readOnly className="h-3.5 w-3.5 rounded border-slate-300 accent-indigo-600" />
                    Email
                  </label>
                  <label className="flex items-center gap-1.5 text-slate-600">
                    <input type="checkbox" defaultChecked={n.inApp} readOnly className="h-3.5 w-3.5 rounded border-slate-300 accent-indigo-600" />
                    In-app
                  </label>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Danger zone */}
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="text-sm font-semibold text-red-900">Danger Zone</h2>
        <Alert variant="error" compact className="mt-3">
          These actions are irreversible. Proceed with caution.
        </Alert>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button variant="outline" icon={ArrowRightLeft}>Transfer Ownership</Button>
          <Button variant="danger" icon={Trash2}>Delete Organization</Button>
        </div>
      </div>
    </div>
  );
}
