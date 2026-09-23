import { Shield, ExternalLink, Tag } from "lucide-react";
import { getOrgAccessRoles } from "@/components/organizations/accessRolesMockData";
import { MOCK_ADMIN_ROLES } from "@/components/administrators/mockData";
import { getScopesForOrg } from "@/lib/federationMockData";
import type {
  ConfiguredIdp,
  AccessRoleClaim,
  AdminRoleClaim,
  ScopeClaim,
} from "../types";
import { SectionTitle, ClaimTable } from "./ClaimTable";

interface Props {
  orgId: string;
  orgName: string;
  idps: ConfiguredIdp[];
  selectedIdpId: string;
  onSelectIdp: (id: string) => void;
  claimName: string;
  claimValue: string;
  onChangeClaimName: (v: string) => void;
  onChangeClaimValue: (v: string) => void;
  accessRoleClaims: AccessRoleClaim[];
  onChangeAccessRoleClaims: (rows: AccessRoleClaim[]) => void;
  adminRoleClaims: AdminRoleClaim[];
  onChangeAdminRoleClaims: (rows: AdminRoleClaim[]) => void;
  scopeClaims: ScopeClaim[];
  onChangeScopeClaims: (rows: ScopeClaim[]) => void;
}

export default function IdpClaimsStep({
  orgId,
  orgName,
  idps,
  selectedIdpId,
  onSelectIdp,
  claimName,
  claimValue,
  onChangeClaimName,
  onChangeClaimValue,
  accessRoleClaims,
  onChangeAccessRoleClaims,
  adminRoleClaims,
  onChangeAdminRoleClaims,
  scopeClaims,
  onChangeScopeClaims,
}: Props) {
  const selectedIdp = idps.find((i) => i.id === selectedIdpId) ?? idps[0];
  const accessRoles = getOrgAccessRoles(orgId);
  const adminRoles = MOCK_ADMIN_ROLES;
  const scopes = getScopesForOrg(orgId);

  return (
    <div className="max-w-3xl space-y-10">
      {idps.length > 1 && (
        <section>
          <SectionTitle
            title="Identity providers"
            description={`${orgName} has ${idps.length} identity providers configured. Select one to configure its claims and inheritance.`}
          />
          <div className="flex flex-wrap gap-2">
            {idps.map((idp) => (
              <button
                key={idp.id}
                type="button"
                onClick={() => onSelectIdp(idp.id)}
                className={`inline-flex items-center gap-2 h-9 px-3 rounded-md border text-sm font-medium transition-colors ${
                  idp.id === selectedIdpId
                    ? "bg-blue-50 border-blue-500 text-blue-700"
                    : "bg-white border-bluegrey-300 text-bluegrey-700 hover:bg-bluegrey-50"
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                {idp.oidc.displayName || "Unnamed IDP"}
              </button>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-base font-semibold text-blue-700">
          IDP claims configuration
        </h2>
        <p className="text-sm text-bluegrey-600 mt-1 leading-relaxed">
          Define how this identity provider sends claims to DMv2 for this
          organization.
        </p>

        <div className="mt-4 flex items-center justify-between gap-4 p-4 border border-bluegrey-200 rounded-md bg-bluegrey-25">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-blue-50 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <div className="text-sm font-semibold text-bluegrey-900">
                {selectedIdp?.oidc.displayName || "Unnamed IDP"}
              </div>
              <div className="text-xs text-bluegrey-500 flex items-center gap-2 mt-0.5">
                <span>OpenID Connect</span>
                <span
                  className={`text-[11px] px-1.5 py-0.5 rounded-full font-medium ${
                    selectedIdp?.oidc.active
                      ? "bg-green-50 text-green-700"
                      : "bg-bluegrey-100 text-bluegrey-500"
                  }`}
                >
                  {selectedIdp?.oidc.active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium shrink-0"
          >
            View IDP details
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* Organization claim mapping */}
      <section>
        <SectionTitle
          title="Organization claim mapping"
          description={`This claim identifies ${orgName} to the identity provider. Use the same claim name across the organization, and a unique claim value per organization.`}
        />
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-bluegrey-800">
              Claim name
            </label>
            <input
              type="text"
              value={claimName}
              onChange={(e) => onChangeClaimName(e.target.value)}
              placeholder="e.g. org"
              className="h-10 px-3 text-sm border border-bluegrey-300 rounded-sm bg-white text-bluegrey-900 placeholder:text-bluegrey-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-mono"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-bluegrey-800">
              Claim value for {orgName}
            </label>
            <input
              type="text"
              value={claimValue}
              onChange={(e) => onChangeClaimValue(e.target.value)}
              placeholder="e.g. https://api.acme-corp.com"
              className="h-10 px-3 text-sm border border-bluegrey-300 rounded-sm bg-white text-bluegrey-900 placeholder:text-bluegrey-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-mono"
            />
          </div>
        </div>
      </section>

      {/* Access role claim mapping */}
      {accessRoles.length > 0 && (
        <section>
          <SectionTitle
            title="Access role claim mapping"
            description="Specify the claim name and value the IDP sends to grant each access role."
          />
          <ClaimTable
            headerLabel="Access role"
            rows={accessRoleClaims.map((r) => ({
              id: r.roleId,
              label: r.roleName,
              claimName: r.claimName,
              claimValue: r.claimValue,
            }))}
            onChangeName={(i, v) =>
              onChangeAccessRoleClaims(
                accessRoleClaims.map((r, j) =>
                  j === i ? { ...r, claimName: v } : r,
                ),
              )
            }
            onChangeValue={(i, v) =>
              onChangeAccessRoleClaims(
                accessRoleClaims.map((r, j) =>
                  j === i ? { ...r, claimValue: v } : r,
                ),
              )
            }
          />
        </section>
      )}

      {/* Admin role claim mapping */}
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
            onChangeAdminRoleClaims(
              adminRoleClaims.map((r, j) =>
                j === i ? { ...r, claimName: v } : r,
              ),
            )
          }
          onChangeValue={(i, v) =>
            onChangeAdminRoleClaims(
              adminRoleClaims.map((r, j) =>
                j === i ? { ...r, claimValue: v } : r,
              ),
            )
          }
        />
      </section>

      {/* Scope claim mapping */}
      {scopes.length > 0 && (
        <section className="pb-4">
          <SectionTitle
            title="Scope claim mapping"
            description="Specify the claim name and value the IDP sends to activate each scope."
          />
          <ClaimTable
            headerLabel="Scope"
            rows={scopeClaims.map((s) => ({
              id: s.scopeId,
              label: s.scopeName,
              claimName: s.claimName,
              claimValue: s.claimValue,
            }))}
            onChangeName={(i, v) =>
              onChangeScopeClaims(
                scopeClaims.map((s, j) =>
                  j === i ? { ...s, claimName: v } : s,
                ),
              )
            }
            onChangeValue={(i, v) =>
              onChangeScopeClaims(
                scopeClaims.map((s, j) =>
                  j === i ? { ...s, claimValue: v } : s,
                ),
              )
            }
          />
        </section>
      )}
    </div>
  );
}
