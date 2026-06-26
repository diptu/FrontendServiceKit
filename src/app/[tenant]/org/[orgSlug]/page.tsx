import PreviewBanner from "@/components/platform-admin/ui/PreviewBanner";
import OrgWelcomeBanner from "@/components/org/OrgWelcomeBanner";
import OrgStatGrid from "@/components/org/OrgStatGrid";
import OrgActivityChart from "@/components/org/OrgActivityChart";
import OrgUsersByRole from "@/components/org/OrgUsersByRole";
import OrgSystemHealth from "@/components/org/OrgSystemHealth";
import OrgTopApps from "@/components/org/OrgTopApps";
import OrgRecentActivity from "@/components/org/OrgRecentActivity";

interface OrgOverviewPageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function OrgOverviewPage({ params }: OrgOverviewPageProps) {
  const { orgSlug } = await params;
  const displayName = orgSlug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return (
    <div className="flex flex-col gap-6">
      <PreviewBanner showIcon>
        Preview mode — use the user switcher in the top-right to test Owner, Admin, and Member views.
        Auth gating will be enforced before GA.
      </PreviewBanner>

      <OrgWelcomeBanner orgDisplayName={displayName} />

      <OrgStatGrid />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <OrgActivityChart />
        </div>
        <div className="lg:col-span-1">
          <OrgUsersByRole />
        </div>
        <div className="lg:col-span-1">
          <OrgSystemHealth />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <OrgTopApps orgSlug={orgSlug} />
        </div>
        <div className="lg:col-span-1">
          <OrgRecentActivity orgSlug={orgSlug} />
        </div>
      </div>
    </div>
  );
}
