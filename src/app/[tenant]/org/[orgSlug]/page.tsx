import { Banner } from "@/components/ui";
import { SlideUp, FadeIn, SlideIn } from "@/components/ui";
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

      <FadeIn>
        <Banner variant="info" showIcon>
          Preview mode — use the user switcher in the top-right to test Owner, Admin, and Member views.
          Auth gating will be enforced before GA.
        </Banner>
      </FadeIn>

      <SlideUp delay={0.05}>
        <OrgWelcomeBanner orgDisplayName={displayName} />
      </SlideUp>

      {/* Stat grid already has internal stagger via OrgStatGrid */}
      <SlideUp delay={0.08}>
        <OrgStatGrid />
      </SlideUp>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        <SlideIn from="left"  delay={0.1} className="lg:col-span-3"><OrgActivityChart /></SlideIn>
        <SlideIn from="right" delay={0.15} className="lg:col-span-1"><OrgUsersByRole /></SlideIn>
        <SlideIn from="right" delay={0.2}  className="lg:col-span-1"><OrgSystemHealth /></SlideIn>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <SlideUp delay={0.05} className="lg:col-span-2"><OrgTopApps orgSlug={orgSlug} /></SlideUp>
        <SlideUp delay={0.12} className="lg:col-span-1"><OrgRecentActivity orgSlug={orgSlug} /></SlideUp>
      </div>

    </div>
  );
}
