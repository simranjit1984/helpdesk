import { useState } from "react";
import { Info, Lock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getOrgAccessRoles } from "@/components/organizations/accessRolesMockData";
import { MOCK_ADMIN_ROLES } from "@/components/administrators/mockData";
import { getScopesForOrg } from "@/lib/federationMockData";
import type {
  AccessRoleClaim,
  AdminRoleClaim,
  ChildOrgInheritance,
  ScopeClaim,
} from "../types";
import { SectionTitle, ClaimTable } from "./ClaimTable";

interface Props {
  parentOrgName: string;
  idpName: string;
  child: ChildOrgInheritance;
  claimName: string;
  onClose: () => void;
  onSave: (claims: {
    orgClaimValue: string;
    accessRoleClaims: AccessRoleClaim[];
    adminRoleClaims: AdminRoleClaim[];
    scopeClaims: ScopeClaim[];
  }) => void;
}

export default function ChildClaimsDialog({
  parentOrgName,
  idpName,
  child,
  claimName,
  onClose,
  onSave,
}: Props) {
  const [claimValue, setClaimValue] = useState(child.orgClaimValue ?? "");

  const [accessRoleClaims, setAccessRoleClaims] = useState<AccessRoleClaim[]>(
    child.accessRoleClaims ??
      getOrgAccessRoles(child.orgId).map((r) => ({
        roleId: r.id,
        roleName: r.name,
        claimName: "",
        claimValue: "",
      })),
  );
  const [adminRoleClaims, setAdminRoleClaims] = useState<AdminRoleClaim[]>(
    child.adminRoleClaims ??
      MOCK_ADMIN_ROLES.map((r) => ({
        roleId: r.id,
        roleName: r.name,
        claimName: "",
        claimValue: "",
      })),
  );
  const [scopeClaims, setScopeClaims] = useState<ScopeClaim[]>(
    child.scopeClaims ??
      getScopesForOrg(child.orgId).map((s) => ({
        scopeId: s.id,
        scopeName: s.name,
        claimName: "",
        claimValue: "",
      })),
  );

  function handleSave() {
    onSave({
      orgClaimValue: claimValue,
      accessRoleClaims,
      adminRoleClaims,
      scopeClaims,
    });
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-md shadow-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-bluegrey-200 sticky top-0 bg-white z-10">
          <h3 className="text-sm font-semibold text-bluegrey-900">
            Configure claims — {child.orgName}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-bluegrey-400 hover:text-bluegrey-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-8">
          <div className="flex items-center gap-3 p-3 border border-bluegrey-200 rounded-md bg-bluegrey-25">
            <Lock className="w-4 h-4 text-bluegrey-400 shrink-0" />
            <div>
              <div className="text-sm font-medium text-bluegrey-900">{idpName}</div>
              <div className="text-xs text-bluegrey-500">
                Inherited from {parentOrgName}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 bg-blue-50 border border-blue-100 rounded-md text-sm text-blue-800">
            <Info className="w-4 h-4 mt-0.5 shrink-0 text-blue-500" />
            <span>
              This organization uses the IDP inherited from {parentOrgName}, but
              organization claim, access role, admin role, and scope claims
              mapping can never be shared — they must always be defined for
              this organization.
            </span>
          </div>

          {/* Organization claim */}
          <section>
            <SectionTitle
              title="Organization claim mapping"
              description={`Claim value that identifies ${child.orgName}. The claim name is inherited and cannot be changed here.`}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-bluegrey-800">
                Organization claim value
              </label>
              <div className="text-xs text-bluegrey-500 mb-1">
                Claim name{" "}
                <code className="font-mono text-blue-700">{claimName || "—"}</code>
              </div>
              <input
                type="text"
                value={claimValue}
                onChange={(e) => setClaimValue(e.target.value)}
                placeholder="e.g. https://api.acme-example.com"
                className="h-10 px-3 text-sm border border-bluegrey-300 rounded-sm bg-white text-bluegrey-900 placeholder:text-bluegrey-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-mono"
              />
            </div>
          </section>

          {/* Access role claims */}
          <section>
            <SectionTitle
              title="Access role claim mapping"
              description={`Specify the claim name and value the IDP sends to grant each access role in ${child.orgName}.`}
            />
            {accessRoleClaims.length > 0 ? (
              <ClaimTable
                headerLabel="Access role"
                rows={accessRoleClaims.map((r) => ({
                  id: r.roleId,
                  label: r.roleName,
                  claimName: r.claimName,
                  claimValue: r.claimValue,
                }))}
                onChangeName={(i, v) =>
                  setAccessRoleClaims((prev) =>
                    prev.map((r, j) => (j === i ? { ...r, claimName: v } : r)),
                  )
                }
                onChangeValue={(i, v) =>
                  setAccessRoleClaims((prev) =>
                    prev.map((r, j) => (j === i ? { ...r, claimValue: v } : r)),
                  )
                }
              />
            ) : (
              <p className="text-sm text-bluegrey-400 italic">
                No access roles configured for this organization yet.
              </p>
            )}
          </section>

          {/* Admin role claims */}
          <section>
            <SectionTitle
              title="Admin role claim mapping"
              description="Specify the claim name and value the IDP sends to grant each admin role."
            />
            <ClaimTable
              headerLabel="Admin role"
              rows={adminRoleClaims.map((r) => ({
                id: r.roleId,
                label: r.roleName,
                claimName: r.claimName,
                claimValue: r.claimValue,
              }))}
              onChangeName={(i, v) =>
                setAdminRoleClaims((prev) =>
                  prev.map((r, j) => (j === i ? { ...r, claimName: v } : r)),
                )
              }
              onChangeValue={(i, v) =>
                setAdminRoleClaims((prev) =>
                  prev.map((r, j) => (j === i ? { ...r, claimValue: v } : r)),
                )
              }
            />
          </section>

          {/* Scope claims */}
          <section className="pb-2">
            <SectionTitle
              title="Scope claim mapping"
              description="Specify the claim name and value the IDP sends to activate each scope."
            />
            {scopeClaims.length > 0 ? (
              <ClaimTable
                headerLabel="Scope"
                rows={scopeClaims.map((s) => ({
                  id: s.scopeId,
                  label: s.scopeName,
                  claimName: s.claimName,
                  claimValue: s.claimValue,
                }))}
                onChangeName={(i, v) =>
                  setScopeClaims((prev) =>
                    prev.map((s, j) => (j === i ? { ...s, claimName: v } : s)),
                  )
                }
                onChangeValue={(i, v) =>
                  setScopeClaims((prev) =>
                    prev.map((s, j) => (j === i ? { ...s, claimValue: v } : s)),
                  )
                }
              />
            ) : (
              <p className="text-sm text-bluegrey-400 italic">
                No scopes are configured for this organization yet.
              </p>
            )}
          </section>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-bluegrey-200 sticky bottom-0 bg-white">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save claims</Button>
        </div>
      </div>
    </div>
  );
}
