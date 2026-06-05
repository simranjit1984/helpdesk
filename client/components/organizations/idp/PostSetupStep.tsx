import { useState } from "react";
import { CheckCircle2, ChevronLeft, Info } from "lucide-react";
import { getOrgAccessRoles } from "@/components/organizations/accessRolesMockData";
import { MOCK_ADMIN_ROLES } from "@/components/administrators/mockData";
import { getScopesForOrg } from "@/lib/federationMockData";
import type { ChildOrg, PostSetupData, AccessRoleClaim, AdminRoleClaim, ScopeClaim } from "./types";

// ─── Section header ───────────────────────────────────────────────────────────

function SectionTitle({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-base font-semibold text-blue-700">{title}</h2>
      <p className="text-sm text-bluegrey-600 mt-1 leading-relaxed">{description}</p>
    </div>
  );
}

// ─── Generic 3-column claim table ─────────────────────────────────────────────

function ClaimTable({
  headerLabel,
  rows,
  onChangeName,
  onChangeValue,
}: {
  headerLabel: string;
  rows: Array<{ id: string; label: string; claimName: string; claimValue: string }>;
  onChangeName: (index: number, v: string) => void;
  onChangeValue: (index: number, v: string) => void;
}) {
  return (
    <div className="border border-bluegrey-200 rounded-md overflow-hidden">
      <div className="grid grid-cols-[1fr_1fr_1fr] gap-3 px-4 py-2.5 bg-bluegrey-50 border-b border-bluegrey-200 text-xs font-semibold text-bluegrey-500 uppercase tracking-wider">
        <span>{headerLabel}</span>
        <span>Claim name</span>
        <span>Claim value</span>
      </div>
      <div className="divide-y divide-bluegrey-100">
        {rows.map((row, i) => (
          <div key={row.id} className="grid grid-cols-[1fr_1fr_1fr] gap-3 items-center px-4 py-3">
            <span className="text-sm font-medium text-bluegrey-900 truncate" title={row.label}>
              {row.label}
            </span>
            <input
              type="text"
              value={row.claimName}
              onChange={(e) => onChangeName(i, e.target.value)}
              placeholder="e.g. role"
              className="h-9 px-3 text-sm border border-bluegrey-300 rounded-sm bg-white text-bluegrey-900 placeholder:text-bluegrey-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-mono"
            />
            <input
              type="text"
              value={row.claimValue}
              onChange={(e) => onChangeValue(i, e.target.value)}
              placeholder="e.g. admin"
              className="h-9 px-3 text-sm border border-bluegrey-300 rounded-sm bg-white text-bluegrey-900 placeholder:text-bluegrey-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-mono"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  orgId: string;
  orgName: string;
  childOrgs: ChildOrg[];
  idpDisplayName: string;
  onComplete: (data: PostSetupData) => void;
  onBack: () => void;
}

export default function PostSetupStep({
  orgId,
  orgName,
  childOrgs,
  idpDisplayName,
  onComplete,
  onBack,
}: Props) {
  const accessRoles = getOrgAccessRoles(orgId);
  const adminRoles  = MOCK_ADMIN_ROLES;
  const scopes      = getScopesForOrg(orgId);

  const [audienceValue, setAudienceValue] = useState("");
  const [sameIdpForChildren, setSameIdpForChildren] = useState<boolean | null>(null);
  const [childAudiences, setChildAudiences] = useState<Record<string, string>>(
    Object.fromEntries(childOrgs.map((c) => [c.id, ""]))
  );
  const [accessRoleClaims, setAccessRoleClaims] = useState<AccessRoleClaim[]>(
    accessRoles.map((r) => ({ roleId: r.id, roleName: r.name, claimName: "", claimValue: "" }))
  );
  const [adminRoleClaims, setAdminRoleClaims] = useState<AdminRoleClaim[]>(
    adminRoles.map((r) => ({ roleId: r.id, roleName: r.name, claimName: "", claimValue: "" }))
  );
  const [scopeClaims, setScopeClaims] = useState<ScopeClaim[]>(
    scopes.map((s) => ({ scopeId: s.id, scopeName: s.name, claimName: "", claimValue: "" }))
  );

  function handleFinish() {
    onComplete({
      audienceValue,
      sameIdpForChildren: sameIdpForChildren ?? false,
      childOrgAudiences: childOrgs.map((c) => ({
        orgId: c.id,
        orgName: c.name,
        audience: childAudiences[c.id] ?? "",
      })),
      accessRoleClaims,
      adminRoleClaims,
      scopeClaims,
    });
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-bluegrey-200 shrink-0">
        <div>
          <h1 className="text-sm font-semibold text-bluegrey-900">
            Configure IDP settings — {idpDisplayName || "OpenID Connect"}
          </h1>
          <p className="text-xs text-bluegrey-500 mt-0.5">
            Step 2 of 2 · Additional configuration for <strong>{orgName}</strong>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="h-8 px-3 text-sm text-bluegrey-700 hover:bg-bluegrey-50 rounded border border-bluegrey-300 flex items-center gap-1.5 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Back
          </button>
          <button
            onClick={handleFinish}
            className="h-8 px-4 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1.5 transition-colors font-medium"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Finish setup
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-2xl space-y-10">

          {/* ── 1. Audience ──────────────────────────────────────────────── */}
          <section>
            <SectionTitle
              title="Audience"
              description={`Specify the audience value this identity provider will use for ${orgName}. This is typically the client ID or a URI that identifies your service as the intended audience.`}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-bluegrey-800">
                Audience value for <strong>{orgName}</strong>
              </label>
              <input
                type="text"
                value={audienceValue}
                onChange={(e) => setAudienceValue(e.target.value)}
                placeholder="e.g. https://api.acme-corp.com"
                className="w-full h-10 px-3 text-sm border border-bluegrey-300 rounded-sm bg-white text-bluegrey-900 placeholder:text-bluegrey-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </section>

          {/* ── 2. Child organizations ───────────────────────────────────── */}
          {childOrgs.length > 0 && (
            <section>
              <SectionTitle
                title="Child organizations"
                description={`${orgName} has ${childOrgs.length} child organization${childOrgs.length > 1 ? "s" : ""}. Will the same identity provider work for ${childOrgs.length === 1 ? "it" : "them"}?`}
              />

              <div className="flex gap-3 mb-5">
                {[
                  { val: true,  label: "Yes" },
                  { val: false, label: "No"  },
                ].map(({ val, label }) => (
                  <button
                    key={String(val)}
                    onClick={() => setSameIdpForChildren(val)}
                    className={`h-9 px-5 text-sm rounded-sm border transition-colors font-medium ${
                      sameIdpForChildren === val
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-bluegrey-700 border-bluegrey-300 hover:bg-bluegrey-50"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {sameIdpForChildren === true && (
                <div className="space-y-3">
                  <p className="text-sm text-bluegrey-600">
                    Specify the audience value for each child organization:
                  </p>
                  {childOrgs.map((child) => (
                    <div key={child.id} className="flex items-center gap-3">
                      <label className="text-sm font-medium text-bluegrey-800 w-44 shrink-0 truncate" title={child.name}>
                        {child.name}
                      </label>
                      <input
                        type="text"
                        value={childAudiences[child.id] ?? ""}
                        onChange={(e) =>
                          setChildAudiences((prev) => ({ ...prev, [child.id]: e.target.value }))
                        }
                        placeholder="e.g. https://api.acme-europe.com"
                        className="flex-1 h-10 px-3 text-sm border border-bluegrey-300 rounded-sm bg-white text-bluegrey-900 placeholder:text-bluegrey-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  ))}
                </div>
              )}

              {sameIdpForChildren === false && (
                <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-700">
                  <Info className="w-4 h-4 mt-0.5 shrink-0 text-amber-500" />
                  <span>
                    Child organizations will need their own IDP configuration. You can add them
                    from each organization's IDP tab.
                  </span>
                </div>
              )}
            </section>
          )}

          {/* ── 3. Access role claim mapping ─────────────────────────────── */}
          {accessRoles.length > 0 && (
            <section>
              <SectionTitle
                title="Access role claim mapping"
                description={`Specify the claim name and value the IDP sends to grant each access role in ${orgName}.`}
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
                  setAccessRoleClaims((prev) =>
                    prev.map((r, j) => (j === i ? { ...r, claimName: v } : r))
                  )
                }
                onChangeValue={(i, v) =>
                  setAccessRoleClaims((prev) =>
                    prev.map((r, j) => (j === i ? { ...r, claimValue: v } : r))
                  )
                }
              />
            </section>
          )}

          {/* ── 4. Admin role claim mapping ──────────────────────────────── */}
          <section>
            <SectionTitle
              title="Admin role claim mapping"
              description="Specify the claim name and value the IDP sends to grant each admin role. Admin role claims are evaluated independently of scope claims."
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
                  prev.map((r, j) => (j === i ? { ...r, claimName: v } : r))
                )
              }
              onChangeValue={(i, v) =>
                setAdminRoleClaims((prev) =>
                  prev.map((r, j) => (j === i ? { ...r, claimValue: v } : r))
                )
              }
            />
          </section>

          {/* ── 5. Scope claim mapping ───────────────────────────────────── */}
          <section className="pb-10">
            <SectionTitle
              title="Scope claim mapping"
              description="Specify the claim name and value the IDP sends to activate each scope. Scope claims are evaluated independently from admin role claims."
            />
            {scopes.length > 0 ? (
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
                    prev.map((s, j) => (j === i ? { ...s, claimName: v } : s))
                  )
                }
                onChangeValue={(i, v) =>
                  setScopeClaims((prev) =>
                    prev.map((s, j) => (j === i ? { ...s, claimValue: v } : s))
                  )
                }
              />
            ) : (
              <p className="text-sm text-bluegrey-400 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                No scopes are configured for this organization yet. You can add them later.
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
