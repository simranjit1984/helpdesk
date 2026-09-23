import { AlertTriangle, Link2, Unlink } from "lucide-react";
import type { ChildInheritanceMode } from "../types";

const MODE_META: Record<
  ChildInheritanceMode,
  { label: string; icon: JSX.Element; className: string }
> = {
  inherit_idp: {
    label: "Inherited IDP",
    icon: <Link2 className="w-3 h-3" />,
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  own: {
    label: "Own configuration",
    icon: <Unlink className="w-3 h-3" />,
    className: "bg-bluegrey-100 text-bluegrey-700 border-bluegrey-200",
  },
};

export function InheritanceBadge({ mode }: { mode: ChildInheritanceMode }) {
  const meta = MODE_META[mode];
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded-full border ${meta.className}`}
    >
      {meta.icon}
      {meta.label}
    </span>
  );
}

export function ClaimsRequiredBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded-full border bg-red-50 text-red-700 border-red-200">
      <AlertTriangle className="w-3 h-3" />
      Claims mapping required
    </span>
  );
}

export const MODE_LABELS: Record<ChildInheritanceMode, string> = {
  inherit_idp: "Inherit IDP, define claims mapping",
  own: "Use own IDP & claims mapping",
};

export const MODE_SHORT_DESCRIPTIONS: Record<ChildInheritanceMode, string> = {
  inherit_idp:
    "Child organizations use the same IDP, but must always define their own organization claim, access role, admin role, and scope claims mapping.",
  own: "Child organizations define their own IDP and claims mapping independently.",
};
