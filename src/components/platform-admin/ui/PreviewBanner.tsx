import type { ReactNode } from "react";
import { Eye } from "lucide-react";

interface PreviewBannerProps {
  children: ReactNode;
  showIcon?: boolean;
}

export default function PreviewBanner({ children, showIcon = false }: PreviewBannerProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5">
      <p className="text-xs font-medium text-amber-800">{children}</p>
      {showIcon && (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
          <Eye className="h-3 w-3" />
          Preview
        </span>
      )}
    </div>
  );
}
