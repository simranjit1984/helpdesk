import { AlertTriangle, CheckCircle2, Link2, PencilLine, Unlink } from "lucide-react";
import type { ChildOrgInheritance } from "../types";

interface Props {
  idpName: string;
  orgName: string;
  childOrgs: ChildOrgInheritance[];
}

export default function ReviewSaveStep({ idpName, orgName, childOrgs }: Props) {
  const inheritAll = childOrgs.filter((c) => c.mode === "inherit_all").length;
  const customClaims = childOrgs.filter(
    (c) => c.mode === "inherit_idp_custom_claims",
  ).length;
  const own = childOrgs.filter((c) => c.mode === "own").length;
  const missingClaimValue = childOrgs.filter(
    (c) => c.mode !== "own" && !c.orgClaimValue,
  ).length;

  return (
    <div className="max-w-2xl space-y-8">
      <section>
        <h2 className="text-base font-semibold text-blue-700">Review & save</h2>
        <p className="text-sm text-bluegrey-600 mt-1 leading-relaxed">
          Confirm the claims configuration and how it will be applied across{" "}
          {orgName}'s child organizations before saving.
        </p>
      </section>

      <section className="border border-bluegrey-200 rounded-md divide-y divide-bluegrey-100">
        <div className="grid grid-cols-[200px_1fr] gap-4 px-4 py-3">
          <span className="text-xs font-semibold text-bluegrey-500 uppercase tracking-wider">
            IDP
          </span>
          <span className="text-sm text-bluegrey-900 font-medium">{idpName}</span>
        </div>
        <div className="grid grid-cols-[200px_1fr] gap-4 px-4 py-3">
          <span className="text-xs font-semibold text-bluegrey-500 uppercase tracking-wider">
            Claims mapping
          </span>
          <span className="text-sm text-green-700 font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            Configured
          </span>
        </div>
        <div className="grid grid-cols-[200px_1fr] gap-4 px-4 py-3">
          <span className="text-xs font-semibold text-bluegrey-500 uppercase tracking-wider">
            Child organizations
          </span>
          <span className="text-sm text-bluegrey-900 font-medium">
            {childOrgs.length} total
          </span>
        </div>
      </section>

      {missingClaimValue > 0 && (
        <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-md text-sm text-red-800">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
          <span>
            <strong>{missingClaimValue}</strong> organization
            {missingClaimValue > 1 ? "s" : ""} still need an organization claim
            value defined before this configuration can reliably identify
            them. Go back to "Apply to child organizations" to set it.
          </span>
        </div>
      )}

      <section className="space-y-3">
        <div className="flex items-center gap-3 p-3.5 rounded-md border border-green-200 bg-green-50">
          <Link2 className="w-4 h-4 text-green-600 shrink-0" />
          <span className="text-sm text-green-800">
            <strong>{inheritAll}</strong> — Inherit IDP & claims mapping.{" "}
            {inheritAll} organizations will inherit future changes to this IDP
            and claims mapping.
          </span>
        </div>
        <div className="flex items-center gap-3 p-3.5 rounded-md border border-amber-200 bg-amber-50">
          <PencilLine className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="text-sm text-amber-800">
            <strong>{customClaims}</strong> — Inherit IDP, customize claims
            mapping. {customClaims} organizations will inherit future IDP
            changes but retain their own claims mapping.
          </span>
        </div>
        <div className="flex items-center gap-3 p-3.5 rounded-md border border-bluegrey-200 bg-bluegrey-50">
          <Unlink className="w-4 h-4 text-bluegrey-500 shrink-0" />
          <span className="text-sm text-bluegrey-700">
            <strong>{own}</strong> — Use own IDP & claims mapping. {own}{" "}
            organizations are independent.
          </span>
        </div>
      </section>
    </div>
  );
}
