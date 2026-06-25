interface StatusBadgeProps {
  status: string;
  colorMap: Record<string, string>;
  className?: string;
}

export default function StatusBadge({ status, colorMap, className = "" }: StatusBadgeProps) {
  const colorClass = colorMap[status] ?? "bg-gray-100 text-gray-600";
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${colorClass} ${className}`}
    >
      {status}
    </span>
  );
}
