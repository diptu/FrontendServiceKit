import { SlideUp, FadeIn } from "@/components/ui";
import OverviewGrid from "@/components/OverviewGrid";
import UserDirectoryTable from "@/components/UserDirectoryTable";

export default function OverviewPage() {
  return (
    <div className="flex flex-col gap-8">
      <SlideUp>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-800">
            Administrative Overview
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Live posture of the NutraTenant IAM control plane across all connected clients.
          </p>
        </div>
      </SlideUp>

      {/* OverviewGrid has internal StaggerContainer */}
      <SlideUp delay={0.06}>
        <OverviewGrid />
      </SlideUp>

      <FadeIn delay={0.1}>
        <UserDirectoryTable />
      </FadeIn>
    </div>
  );
}
