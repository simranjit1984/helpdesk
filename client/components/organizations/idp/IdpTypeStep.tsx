import { X } from "lucide-react";
import type { IdpType } from "./types";

// ─── Provider definitions ─────────────────────────────────────────────────────

interface IdpTypeDef {
  id: IdpType;
  label: string;
  initials: string;
  bg: string;
  fg: string;
  font?: string;
}

const IDP_TYPES: IdpTypeDef[] = [
  { id: "oidc",        label: "OpenID Connect",      initials: "OC", bg: "#dc2626", fg: "#fff" },
  { id: "saml",        label: "SAML",                initials: "S",  bg: "#ea6c00", fg: "#fff" },
  { id: "digid",       label: "DigiD",               initials: "D",  bg: "#154273", fg: "#fff", font: "font-bold" },
  { id: "eherkenning", label: "eHerkenning",         initials: "EH", bg: "#1a7e6e", fg: "#fff" },
  { id: "apple",       label: "Sign in with Apple",  initials: "",   bg: "#000",    fg: "#fff" },
  { id: "prosante",    label: "ProSanté Connect",    initials: "PS", bg: "#1d4ed8", fg: "#fff" },
  { id: "facebook",    label: "Facebook",            initials: "f",  bg: "#1877f2", fg: "#fff", font: "font-bold italic" },
  { id: "oauth",       label: "OAuth",               initials: "O",  bg: "#374151", fg: "#fff" },
];

// ─── Apple SVG icon (simple  logo-style) ─────────────────────────────────────

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  onSelect: (type: IdpType) => void;
  onCancel: () => void;
}

export default function IdpTypeStep({ onSelect, onCancel }: Props) {
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-bluegrey-200">
        <div>
          <h1 className="text-lg font-semibold text-bluegrey-900">Add identity provider</h1>
          <p className="text-sm text-bluegrey-500 mt-0.5">
            Select the type of identity provider you want to configure.
          </p>
        </div>
        <button
          onClick={onCancel}
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-bluegrey-100 text-bluegrey-500 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Provider list */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <p className="text-xs font-semibold text-bluegrey-500 uppercase tracking-wider mb-3">
            Choose provider type
          </p>
          <div className="bg-white border border-bluegrey-200 rounded-lg overflow-hidden shadow-md">
            {IDP_TYPES.map((idp, i) => (
              <button
                key={idp.id}
                onClick={() => onSelect(idp.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left text-bluegrey-900 hover:bg-blue-50 hover:text-blue-700 transition-colors ${
                  i > 0 ? "border-t border-bluegrey-100" : ""
                }`}
              >
                {/* Provider badge */}
                <span
                  className="w-8 h-8 rounded flex items-center justify-center text-[11px] shrink-0 select-none"
                  style={{ backgroundColor: idp.bg, color: idp.fg }}
                >
                  {idp.id === "apple" ? (
                    <AppleIcon />
                  ) : (
                    <span className={idp.font ?? "font-semibold"}>{idp.initials}</span>
                  )}
                </span>
                <span className="flex-1 font-medium">{idp.label}</span>
                <svg className="w-4 h-4 text-bluegrey-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
