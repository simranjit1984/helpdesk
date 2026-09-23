import { useEffect, useState } from "react";
import { Check, ChevronLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getOrgAccessRoles } from "@/components/organizations/accessRolesMockData";
import { MOCK_ADMIN_ROLES } from "@/components/administrators/mockData";
import { getScopesForOrg } from "@/lib/federationMockData";
import { getChildInheritanceForOrg } from "@/lib/idpInheritanceMockData";
import type {
  AccessRoleClaim,
  AdminRoleClaim,
  ChildInheritanceMode,
  ChildOrgInheritance,
  ConfiguredIdp,
  ScopeClaim,
} from "../types";
import IdpClaimsStep from "./IdpClaimsStep";
import ApplyToChildrenStep from "./ApplyToChildrenStep";
import ReviewSaveStep from "./ReviewSaveStep";
import ChildClaimsDialog from "./ChildClaimsDialog";
import AddIdpWizard from "../../AddIdpWizard";

type FlowStep = "claims" | "apply" | "review";

const STEPS: { id: FlowStep; label: string }[] = [
  { id: "claims", label: "IDP & Claims" },
  { id: "apply", label: "Apply to child organizations" },
  { id: "review", label: "Review & Save" },
];

interface Props {
  orgId: string;
  orgName: string;
  idps: ConfiguredIdp[];
  onClose: () => void;
}

export default function ConfigureIdpClaimsFlow({
  orgId,
  orgName,
  idps,
  onClose,
}: Props) {
  const { toast } = useToast();
  const [step, setStep] = useState<FlowStep>("claims");
  const [selectedIdpId, setSelectedIdpId] = useState(idps[0]?.id ?? "");
  const selectedIdp = idps.find((i) => i.id === selectedIdpId) ?? idps[0];

  const [claimName, setClaimName] = useState(selectedIdp?.postSetup.claimName ?? "");
  const [claimValue, setClaimValue] = useState(
    selectedIdp?.postSetup.claimValue ?? "",
  );
  const [accessRoleClaims, setAccessRoleClaims] = useState<AccessRoleClaim[]>(
    selectedIdp?.postSetup.accessRoleClaims ??
      getOrgAccessRoles(orgId).map((r) => ({
        roleId: r.id,
        roleName: r.name,
        claimName: "",
        claimValue: "",
      })),
  );
  const [adminRoleClaims, setAdminRoleClaims] = useState<AdminRoleClaim[]>(
    selectedIdp?.postSetup.adminRoleClaims ??
      MOCK_ADMIN_ROLES.map((r) => ({
        roleId: r.id,
        roleName: r.name,
        claimName: "",
        claimValue: "",
      })),
  );
  const [scopeClaims, setScopeClaims] = useState<ScopeClaim[]>(
    selectedIdp?.postSetup.scopeClaims ??
      getScopesForOrg(orgId).map((s) => ({
        scopeId: s.id,
        scopeName: s.name,
        claimName: "",
        claimValue: "",
      })),
  );

  const [childOrgs, setChildOrgs] = useState<ChildOrgInheritance[]>(() =>
    getChildInheritanceForOrg(orgId),
  );
  const [claimsDialogChild, setClaimsDialogChild] =
    useState<ChildOrgInheritance | null>(null);
  const [ownIdpWizardChild, setOwnIdpWizardChild] =
    useState<ChildOrgInheritance | null>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  function handleSelectIdp(id: string) {
    setSelectedIdpId(id);
    const idp = idps.find((i) => i.id === id);
    if (!idp) return;
    setClaimName(idp.postSetup.claimName);
    setClaimValue(idp.postSetup.claimValue);
    setAccessRoleClaims(idp.postSetup.accessRoleClaims);
    setAdminRoleClaims(idp.postSetup.adminRoleClaims);
    setScopeClaims(idp.postSetup.scopeClaims);
  }

  function applyToAll(mode: ChildInheritanceMode) {
    setChildOrgs((prev) => prev.map((c) => ({ ...c, mode })));
    toast({
      title: "Inheritance mode applied",
      description: `All ${childOrgs.length} child organizations now use "${
        mode === "inherit_idp"
          ? "Inherit IDP, define claims mapping"
          : "Use own IDP & claims mapping"
      }".`,
    });
  }

  function applyToSelected(orgIds: string[], mode: ChildInheritanceMode) {
    const idSet = new Set(orgIds);
    setChildOrgs((prev) =>
      prev.map((c) => (idSet.has(c.orgId) ? { ...c, mode } : c)),
    );
    toast({
      title: "Inheritance mode applied",
      description: `${orgIds.length} organization${orgIds.length > 1 ? "s" : ""} updated.`,
    });
  }

  function changeMode(orgId: string, mode: ChildInheritanceMode) {
    setChildOrgs((prev) =>
      prev.map((c) => (c.orgId === orgId ? { ...c, mode } : c)),
    );
  }

  function handleSave() {
    toast({
      title: "IDP & claims configuration saved",
      description: `Configuration for "${selectedIdp?.oidc.displayName}" has been applied to ${orgName} and its child organizations.`,
    });
    onClose();
  }

  const stepIndex = STEPS.findIndex((s) => s.id === step);

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-bluegrey-200 shrink-0">
        <div>
          <h1 className="text-sm font-semibold text-bluegrey-900">
            Configure IDP & Claims — {orgName}
          </h1>
          <div className="flex items-center gap-2 mt-1.5">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${
                    i === stepIndex
                      ? "bg-blue-600 text-white"
                      : i < stepIndex
                        ? "bg-green-50 text-green-700"
                        : "bg-bluegrey-100 text-bluegrey-500"
                  }`}
                >
                  {i < stepIndex ? <Check className="w-3 h-3" /> : null}
                  {i + 1}. {s.label}
                </span>
                {i < STEPS.length - 1 && (
                  <span className="w-4 h-px bg-bluegrey-200" />
                )}
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-md flex items-center justify-center text-bluegrey-400 hover:text-bluegrey-700 hover:bg-bluegrey-50"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {step === "claims" && (
          <IdpClaimsStep
            orgId={orgId}
            orgName={orgName}
            idps={idps}
            selectedIdpId={selectedIdpId}
            onSelectIdp={handleSelectIdp}
            claimName={claimName}
            claimValue={claimValue}
            onChangeClaimName={setClaimName}
            onChangeClaimValue={setClaimValue}
            accessRoleClaims={accessRoleClaims}
            onChangeAccessRoleClaims={setAccessRoleClaims}
            adminRoleClaims={adminRoleClaims}
            onChangeAdminRoleClaims={setAdminRoleClaims}
            scopeClaims={scopeClaims}
            onChangeScopeClaims={setScopeClaims}
          />
        )}

        {step === "apply" && (
          <ApplyToChildrenStep
            parentOrgName={orgName}
            childOrgs={childOrgs}
            onApplyToAll={applyToAll}
            onApplyToSelected={applyToSelected}
            onChangeMode={changeMode}
            onConfigureClaims={setClaimsDialogChild}
            onConfigureOwnIdp={setOwnIdpWizardChild}
          />
        )}

        {step === "review" && (
          <ReviewSaveStep
            idpName={selectedIdp?.oidc.displayName ?? "—"}
            orgName={orgName}
            childOrgs={childOrgs}
          />
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-6 py-3.5 border-t border-bluegrey-200 shrink-0">
        <div>
          {stepIndex > 0 ? (
            <Button
              variant="outline"
              onClick={() => setStep(STEPS[stepIndex - 1].id)}
              className="gap-1.5"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Back
            </Button>
          ) : (
            <span />
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {stepIndex < STEPS.length - 1 ? (
            <Button onClick={() => setStep(STEPS[stepIndex + 1].id)}>
              Continue
            </Button>
          ) : (
            <Button onClick={handleSave}>Save and apply</Button>
          )}
        </div>
      </div>

      {/* Per-child claims customization dialog */}
      {claimsDialogChild && (
        <ChildClaimsDialog
          parentOrgName={orgName}
          idpName={selectedIdp?.oidc.displayName ?? "Identity provider"}
          claimName={claimName}
          child={claimsDialogChild}
          onClose={() => setClaimsDialogChild(null)}
          onSave={(claims) => {
            setChildOrgs((prev) =>
              prev.map((c) =>
                c.orgId === claimsDialogChild.orgId
                  ? { ...c, ...claims }
                  : c,
              ),
            );
            setClaimsDialogChild(null);
            toast({
              title: "Claims saved",
              description: `Claims mapping saved for ${claimsDialogChild.orgName}.`,
            });
          }}
        />
      )}

      {/* Reuse existing IDP setup MFE for children configuring their own IDP */}
      {ownIdpWizardChild && (
        <AddIdpWizard
          orgId={ownIdpWizardChild.orgId}
          orgName={ownIdpWizardChild.orgName}
          childOrgs={[]}
          onClose={() => setOwnIdpWizardChild(null)}
          onComplete={(idp) => {
            setChildOrgs((prev) =>
              prev.map((c) =>
                c.orgId === ownIdpWizardChild.orgId
                  ? { ...c, ownIdpName: idp.oidc.displayName || "Custom IDP" }
                  : c,
              ),
            );
            setOwnIdpWizardChild(null);
            toast({
              title: "IDP configured",
              description: `"${idp.oidc.displayName}" configured for ${ownIdpWizardChild.orgName}.`,
            });
          }}
        />
      )}
    </div>
  );
}
