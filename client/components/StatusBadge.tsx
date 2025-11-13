import { CheckCircle } from "lucide-react";

interface StatusBadgeProps {
  status: "active" | "inactive";
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  if (status === "active") {
    return (
      <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 rounded-full">
        <div className="flex items-center gap-1 pr-1.5">
          <CheckCircle className="w-5 h-5 text-green-900" />
          <span className="text-base text-green-900">Active</span>
        </div>
      </div>
    );
  }

  return null;
}
