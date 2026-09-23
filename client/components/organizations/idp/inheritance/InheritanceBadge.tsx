import { AlertTriangle, Link2, PencilLine, Unlink } from "lucide-react";
import type { ChildInheritanceMode } from "../types";

const MODE_META: Record<
  ChildInheritanceMode,
  { label: string; icon: JSX.Element; className: string }
> = {
  inherit_all: {
    label: "Inherited",
    icon: <Link2 className="w-3 h-3" />,
    className: "bg-green-50 text-green-700 border-green-200",
  },
  inherit_idp_custom_claims: {
    label: "Inherited IDP",
    icon: <PencilLine className="w-3 h-3" />,
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

export function CustomClaimsBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded-full border bg-blue-50 text-blue-700 border-blue-200">
      <PencilLine className="w-3 h-3" />
      Custom claims
    </span>
  );
}

export function ClaimValueRequiredBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded-full border bg-red-50 text-red-700 border-red-200">
      <AlertTriangle className="w-3 h-3" />
      Claim value required
    </span>
  );
}

export const MODE_LABELS: Record<ChildInheritanceMode, string> = {
  inherit_all: "Inherit IDP & claims mapping",
  inherit_idp_custom_claims: "Inherit IDP, customize claims mapping",
  own: "Use own IDP & claims mapping",
};

export const MODE_SHORT_DESCRIPTIONS: Record<ChildInheritanceMode, string> = {
  inherit_all:
    "Child organizations use the same IDP and claims mapping as this organization. Each organization still defines its own organization claim value.",
  inherit_idp_custom_claims:
    "Child organizations use the same IDP but can define their own claims mapping.",
  own: "Child organizations define their own IDP and claims mapping independently.",
};
