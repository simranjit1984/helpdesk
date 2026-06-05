import { useState, useEffect } from "react";
import IdpTypeStep from "./idp/IdpTypeStep";
import OIDCConfigStep from "./idp/OIDCConfigStep";
import PostSetupStep from "./idp/PostSetupStep";
import type {
  IdpType,
  OIDCFormData,
  PostSetupData,
  ChildOrg,
  ConfiguredIdp,
} from "./idp/types";
import { DEFAULT_OIDC_DATA } from "./idp/types";

// ─── Wizard phases ────────────────────────────────────────────────────────────

type Phase = "type-selection" | "oidc-config" | "post-setup";

// ─── Props ────────────────────────────────────────────────────────────────────

interface AddIdpWizardProps {
  orgId: string;
  orgName: string;
  childOrgs: ChildOrg[];
  onClose: () => void;
  onComplete: (idp: ConfiguredIdp) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AddIdpWizard({
  orgId,
  orgName,
  childOrgs,
  onClose,
  onComplete,
}: AddIdpWizardProps) {
  const [phase, setPhase] = useState<Phase>("type-selection");
  const [selectedType, setSelectedType] = useState<IdpType>("oidc");
  const [oidcData, setOidcData] = useState<OIDCFormData>(DEFAULT_OIDC_DATA);

  // Prevent background scroll while wizard is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  function handleTypeSelect(type: IdpType) {
    setSelectedType(type);
    // For now only OIDC has a full form; others fall through to OIDC as placeholder
    setPhase("oidc-config");
  }

  function handleOIDCComplete(data: OIDCFormData) {
    setOidcData(data);
    setPhase("post-setup");
  }

  function handlePostSetupComplete(postSetup: PostSetupData) {
    const idp: ConfiguredIdp = {
      id: `idp-custom-${Date.now()}`,
      type: selectedType,
      oidc: oidcData,
      postSetup,
    };
    onComplete(idp);
  }

  return (
    // Full-screen overlay — covers the entire viewport
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {phase === "type-selection" && (
        <IdpTypeStep onSelect={handleTypeSelect} onCancel={onClose} />
      )}

      {phase === "oidc-config" && (
        <OIDCConfigStep
          initialData={oidcData}
          onComplete={handleOIDCComplete}
          onCancel={onClose}
        />
      )}

      {phase === "post-setup" && (
        <PostSetupStep
          orgId={orgId}
          orgName={orgName}
          childOrgs={childOrgs}
          idpDisplayName={oidcData.displayName || "OpenID Connect"}
          onComplete={handlePostSetupComplete}
          onBack={() => setPhase("oidc-config")}
        />
      )}
    </div>
  );
}
