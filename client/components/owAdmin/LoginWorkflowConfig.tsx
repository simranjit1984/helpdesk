import { useState, useCallback } from "react";
import {
  Copy, Check, Plus, Trash2, ChevronUp, ChevronDown,
  Terminal, Loader2, ChevronRight, ChevronDown as ChevronDownIcon,
  AlertCircle, Info, CheckCircle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type AuthType = "none" | "oauth2";
type HttpMethod = "POST";

export interface PayloadMapping {
  id: string;
  field: string;
  attribute: string;
}

interface WorkflowEndpointState {
  baseUrl: string;
  path: string;
  method: HttpMethod;
}

interface WorkflowAuthState {
  type: AuthType;
  oauthClientId: string;
  scopes: string[];
}

interface WorkflowState {
  endpoint: WorkflowEndpointState;
  auth: WorkflowAuthState;
  mappings: PayloadMapping[];
}

interface AuthSectionState {
  oidcClientId: string;
  scopes: string[];
}

interface TestResult {
  url: string;
  method: string;
  scopes: string[];
  tokenStatus: string;
  payload: string;
  statusCode: number;
  responseHeaders: Record<string, string>;
  responseBody: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_OIDC_CLIENTS = [
  { id: "oidc-dmv2-admin",  label: "DMv2 Admin Client",       redirectUriConfigured: true,  pkceConfigured: true,  allowedScopes: ["openid", "profile", "email", "roles", "offline_access"] },
  { id: "oidc-portal",      label: "Customer Portal OIDC",    redirectUriConfigured: false, pkceConfigured: true,  allowedScopes: ["openid", "profile", "email"] },
  { id: "oidc-backoffice",  label: "Back-Office OIDC Client", redirectUriConfigured: true,  pkceConfigured: false, allowedScopes: ["profile", "roles"] },  // openid missing — demo
];

const OIDC_OPTIONAL_SCOPES = ["profile", "email", "roles", "offline_access", "phone", "address"];

const MOCK_OAUTH_CLIENTS = [
  { id: "oauth-webhooks",       label: "Webhook Service Client",   privateKeyJwtEnabled: true,  publicKeyUrlConfigured: true,
    scopes: ["invitation.send", "users.manage", "notifications.create"] },
  { id: "oauth-notifications",  label: "Notifications Client",     privateKeyJwtEnabled: false, publicKeyUrlConfigured: false,
    scopes: ["notifications.create", "notifications.read", "org.read"] },
  { id: "oauth-api",            label: "Internal API Client",      privateKeyJwtEnabled: true,  publicKeyUrlConfigured: false,
    scopes: ["users.manage", "org.read", "audit.write", "password.reset"] },
];

const MOCK_TENANT_URLS = [
  "https://dmv2.customer.example.com",
  "https://dmv2-eu.customer.example.com",
  "https://dmv2-us.customer.example.com",
  "https://dmv2-apac.customer.example.com",
];

const DEFAULT_TENANT_BASE_URL = MOCK_TENANT_URLS[0];
const REDIRECT_URI = `${DEFAULT_TENANT_BASE_URL}/oauth/callback`;

// ─── Attribute catalog ────────────────────────────────────────────────────────

interface AttrOption { label: string; value: string; }

const INVITATION_ATTRS: { group: string; options: AttrOption[] }[] = [
  {
    group: "User",
    options: [
      { label: "User ID",      value: "user.id" },
      { label: "External ID",  value: "user.externalId" },
      { label: "Username",     value: "user.username" },
      { label: "Email",        value: "user.email" },
      { label: "First Name",   value: "user.firstName" },
      { label: "Last Name",    value: "user.lastName" },
    ],
  },
  {
    group: "Organization",
    options: [
      { label: "Organization ID",   value: "organization.id" },
      { label: "Organization Name", value: "organization.name" },
    ],
  },
  {
    group: "Invitation",
    options: [
      { label: "Invitation ID",          value: "invitation.id" },
      { label: "Invitation Expiry Date", value: "invitation.expiryDate" },
    ],
  },
];

const PASSWORD_RESET_ATTRS: { group: string; options: AttrOption[] }[] = [
  {
    group: "User",
    options: [
      { label: "User ID",      value: "user.id" },
      { label: "External ID",  value: "user.externalId" },
      { label: "Username",     value: "user.username" },
      { label: "Email",        value: "user.email" },
      { label: "First Name",   value: "user.firstName" },
      { label: "Last Name",    value: "user.lastName" },
    ],
  },
  {
    group: "Password Reset",
    options: [
      { label: "Reset Expiry Date", value: "reset.expiryDate" },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

function buildJsonPreview(mappings: PayloadMapping[]): string {
  if (mappings.length === 0) return "{}";
  const obj: Record<string, string> = {};
  mappings.forEach((m) => {
    if (m.field && m.attribute) obj[m.field] = `{{${m.attribute}}}`;
  });
  return JSON.stringify(obj, null, 2);
}

// ─── Shared small components ──────────────────────────────────────────────────

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      title="Copy to clipboard"
      onClick={() => {
        navigator.clipboard.writeText(value).catch(() => {});
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-md border border-bluegrey-200 hover:bg-bluegrey-50 transition-colors text-bluegrey-500 hover:text-blue-600"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function ReadOnlyField({
  label, value, copyable = false, helperText, badge,
}: {
  label: string; value: string; copyable?: boolean; helperText?: string; badge?: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <label className="block text-xs font-medium text-bluegrey-600">{label}</label>
        {badge && (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-bluegrey-100 text-bluegrey-500">
            {badge}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-bluegrey-50 border border-bluegrey-200 rounded-md px-3 py-2 text-sm text-bluegrey-700 font-mono truncate">
          {value}
        </div>
        {copyable && <CopyButton value={value} />}
      </div>
      {helperText && (
        <p className="text-xs text-bluegrey-500 flex items-start gap-1">
          <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
          {helperText}
        </p>
      )}
    </div>
  );
}

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <label className="block text-xs font-medium text-bluegrey-600 mb-1">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

function SelectField({
  id, value, onChange, placeholder, required, error, children,
}: {
  id: string; value: string; onChange: (v: string) => void;
  placeholder?: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className={`w-full border rounded-md px-3 py-2 text-sm text-bluegrey-900 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white ${
          error ? "border-red-400" : "border-bluegrey-300"
        }`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {children}
      </select>
      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
}

function TextField({
  id, value, onChange, placeholder, required, error, helperText,
}: {
  id: string; value: string; onChange: (v: string) => void;
  placeholder?: string; required?: boolean; error?: string; helperText?: string;
}) {
  return (
    <div className="space-y-1">
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className={`w-full border rounded-md px-3 py-2 text-sm text-bluegrey-900 focus:outline-none focus:ring-2 focus:ring-blue-300 ${
          error ? "border-red-400" : "border-bluegrey-300"
        }`}
      />
      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
      {helperText && <p className="text-xs text-bluegrey-500">{helperText}</p>}
    </div>
  );
}

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2.5 text-xs text-blue-700 flex items-start gap-2">
      <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
      <span>{children}</span>
    </div>
  );
}

function SubSectionTitle({ title, description }: { title: string; description?: string }) {
  return (
    <div className="border-t border-bluegrey-100 pt-5 mt-1">
      <p className="text-xs font-bold uppercase tracking-widest text-bluegrey-400 mb-1">{title}</p>
      {description && <p className="text-xs text-bluegrey-500 mb-3">{description}</p>}
    </div>
  );
}

// ─── Private Key JWT info panel ───────────────────────────────────────────────

const DMV2_PUBLIC_KEY_URL = "https://dmv2.customer.example.com/.well-known/jwks.json";

function PrivateKeyJwtInfo() {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(DMV2_PUBLIC_KEY_URL).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white uppercase tracking-wide">
          Required
        </span>
        <p className="text-sm font-semibold text-blue-900">
          Authentication method: Private Key JWT
        </p>
      </div>

      <p className="text-xs text-blue-800">
        DMv2 always uses <strong>Private Key JWT</strong> (RFC 7523) to authenticate to the
        selected OAuth Client. Client secrets are not supported.
      </p>

      <div className="space-y-1">
        <p className="text-xs font-semibold text-blue-800">DMv2 public key URL (JWKS)</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-white border border-blue-200 rounded-md px-3 py-2 text-xs font-mono text-blue-900 truncate">
            {DMV2_PUBLIC_KEY_URL}
          </div>
          <button
            type="button"
            onClick={copy}
            title="Copy URL"
            className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-md border border-blue-300 hover:bg-blue-100 transition-colors text-blue-600"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      <div className="rounded-md bg-white border border-blue-200 px-3 py-2.5 space-y-1">
        <p className="text-xs font-semibold text-blue-800">Configuration instructions</p>
        <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
          <li>Open the selected OAuth Client in your tenant's client configuration.</li>
          <li>Enable <strong>Private Key JWT</strong> as the token endpoint authentication method.</li>
          <li>Add the DMv2 JWKS URL above as the trusted public key source.</li>
          <li>Save the client configuration before testing this webhook.</li>
        </ol>
      </div>
    </div>
  );
}

// ─── Scope multi-select ───────────────────────────────────────────────────────

function ScopeSelector({
  selected, onChange, availableScopes,
}: {
  selected: string[];
  onChange: (scopes: string[]) => void;
  availableScopes: string[];
}) {
  const toggle = (s: string) =>
    onChange(selected.includes(s) ? selected.filter((x) => x !== s) : [...selected, s]);

  if (availableScopes.length === 0) {
    return (
      <p className="text-xs text-bluegrey-400 italic">
        Select an OAuth Client above to see available scopes.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="rounded-md border border-bluegrey-200 p-3 bg-white space-y-1.5">
        {availableScopes.map((s) => (
          <label key={s} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selected.includes(s)}
              onChange={() => toggle(s)}
              className="w-4 h-4 accent-blue-600"
            />
            <span className="text-sm text-bluegrey-800 font-mono">{s}</span>
          </label>
        ))}
      </div>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selected.map((s) => (
            <span key={s} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-mono">
              {s}
              <button type="button" onClick={() => onChange(selected.filter((x) => x !== s))} className="hover:text-red-600">×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Payload mapping table ────────────────────────────────────────────────────

function PayloadMappingTable({
  mappings, onChange, attrGroups,
}: {
  mappings: PayloadMapping[];
  onChange: (m: PayloadMapping[]) => void;
  attrGroups: { group: string; options: AttrOption[] }[];
}) {
  const addRow = () =>
    onChange([...mappings, { id: uid(), field: "", attribute: "" }]);

  const removeRow = (id: string) => onChange(mappings.filter((m) => m.id !== id));

  const updateRow = (id: string, patch: Partial<PayloadMapping>) =>
    onChange(mappings.map((m) => (m.id === id ? { ...m, ...patch } : m)));

  const move = (id: string, dir: -1 | 1) => {
    const idx = mappings.findIndex((m) => m.id === id);
    const next = idx + dir;
    if (next < 0 || next >= mappings.length) return;
    const arr = [...mappings];
    [arr[idx], arr[next]] = [arr[next], arr[idx]];
    onChange(arr);
  };

  // Duplicate field validation
  const fieldCounts: Record<string, number> = {};
  mappings.forEach((m) => { if (m.field) fieldCounts[m.field] = (fieldCounts[m.field] ?? 0) + 1; });

  return (
    <div className="space-y-2">
      {/* Table */}
      <div className="rounded-md border border-bluegrey-200 overflow-hidden">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-bluegrey-50 border-b border-bluegrey-200">
              <th className="text-left px-3 py-2 text-xs font-semibold text-bluegrey-500 uppercase tracking-wide">
                Payload field
              </th>
              <th className="text-left px-3 py-2 text-xs font-semibold text-bluegrey-500 uppercase tracking-wide">
                Source attribute
              </th>
              <th className="w-24" />
            </tr>
          </thead>
          <tbody>
            {mappings.length === 0 && (
              <tr>
                <td colSpan={3} className="px-3 py-6 text-center text-xs text-bluegrey-400 italic">
                  No mappings configured. Add a row to begin.
                </td>
              </tr>
            )}
            {mappings.map((m, idx) => {
              const isDuplicate = m.field && fieldCounts[m.field] > 1;
              return (
                <tr key={m.id} className="border-b border-bluegrey-100 last:border-0">
                  <td className="px-3 py-2 align-top">
                    <input
                      type="text"
                      value={m.field}
                      placeholder="e.g. email"
                      onChange={(e) => updateRow(m.id, { field: e.target.value })}
                      className={`w-full border rounded px-2 py-1 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-blue-300 ${
                        isDuplicate ? "border-red-400 bg-red-50" : "border-bluegrey-300"
                      }`}
                    />
                    {isDuplicate && (
                      <p className="text-[10px] text-red-600 mt-0.5">Duplicate field name</p>
                    )}
                    {!m.field && m.attribute && (
                      <p className="text-[10px] text-red-600 mt-0.5">Field name required</p>
                    )}
                  </td>
                  <td className="px-3 py-2 align-top">
                    <select
                      value={m.attribute}
                      onChange={(e) => updateRow(m.id, { attribute: e.target.value })}
                      className={`w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white ${
                        m.field && !m.attribute ? "border-red-400" : "border-bluegrey-300"
                      }`}
                    >
                      <option value="">Select attribute…</option>
                      {attrGroups.map((g) => (
                        <optgroup key={g.group} label={g.group}>
                          {g.options.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                    {m.field && !m.attribute && (
                      <p className="text-[10px] text-red-600 mt-0.5">Attribute required</p>
                    )}
                  </td>
                  <td className="px-2 py-2 align-top">
                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => move(m.id, -1)}
                        disabled={idx === 0}
                        className="h-7 w-7 flex items-center justify-center rounded hover:bg-bluegrey-100 disabled:opacity-30 transition-colors"
                        title="Move up"
                      >
                        <ChevronUp className="w-3.5 h-3.5 text-bluegrey-500" />
                      </button>
                      <button
                        type="button"
                        onClick={() => move(m.id, 1)}
                        disabled={idx === mappings.length - 1}
                        className="h-7 w-7 flex items-center justify-center rounded hover:bg-bluegrey-100 disabled:opacity-30 transition-colors"
                        title="Move down"
                      >
                        <ChevronDown className="w-3.5 h-3.5 text-bluegrey-500" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeRow(m.id)}
                        className="h-7 w-7 flex items-center justify-center rounded hover:bg-red-50 text-red-500 hover:text-red-700 transition-colors"
                        title="Remove row"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={addRow}
        className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
      >
        <Plus className="w-3.5 h-3.5" /> Add row
      </button>

      {/* Payload structure */}
      {mappings.length > 0 && (
        <PayloadStructureEditor mappings={mappings} />
      )}
    </div>
  );
}

// ─── Payload structure editor ─────────────────────────────────────────────────

function PayloadStructureEditor({ mappings }: { mappings: PayloadMapping[] }) {
  const [customTemplate, setCustomTemplate] = useState<string | null>(null);
  const [editingPayload, setEditingPayload] = useState(false);
  const [payloadError, setPayloadError] = useState("");

  const mappedAttrs = new Set(mappings.map((m) => m.attribute).filter(Boolean));
  const autoJson = buildJsonPreview(mappings);
  const displayJson = customTemplate !== null ? customTemplate : autoJson;

  const validateTemplate = (text: string): string => {
    const matches = text.match(/\{\{([^}]+)\}\}/g) ?? [];
    const bad = matches.map((m) => m.slice(2, -2)).filter((a) => !mappedAttrs.has(a));
    if (bad.length > 0)
      return `Disallowed reference${bad.length > 1 ? "s" : ""}: ${bad.join(", ")}. Only mapped attributes may be used.`;
    return "";
  };

  const handleTemplateChange = (value: string) => {
    setCustomTemplate(value);
    setPayloadError(validateTemplate(value));
  };

  const startEditing = () => {
    if (customTemplate === null) setCustomTemplate(autoJson);
    setEditingPayload(true);
    setPayloadError("");
  };

  const doneEditing = () => {
    if (payloadError) return;
    setEditingPayload(false);
  };

  const resetToAuto = () => {
    setCustomTemplate(null);
    setEditingPayload(false);
    setPayloadError("");
  };

  // Mappings whose attribute isn't referenced in the custom template
  const missingInCustom =
    customTemplate !== null
      ? mappings
          .filter((m) => m.attribute && !customTemplate.includes(`{{${m.attribute}}}`))
          .map((m) => m.field || m.attribute)
      : [];

  return (
    <div className="mt-3 space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-bluegrey-500 uppercase tracking-wide">
          Payload structure
          {customTemplate !== null && (
            <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-700">
              Custom
            </span>
          )}
        </p>
        <div className="flex items-center gap-3">
          {customTemplate !== null && !editingPayload && (
            <button
              type="button"
              onClick={resetToAuto}
              className="text-xs text-bluegrey-500 hover:text-red-600 transition-colors"
            >
              Reset to auto
            </button>
          )}
          {!editingPayload ? (
            <button
              type="button"
              onClick={startEditing}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              Edit structure
            </button>
          ) : (
            <button
              type="button"
              onClick={doneEditing}
              disabled={!!payloadError}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Done
            </button>
          )}
        </div>
      </div>

      {/* Warning: mappings not yet reflected in custom template */}
      {missingInCustom.length > 0 && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 flex items-start gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <span>
            The following mapped fields are not referenced in your custom structure:{" "}
            <strong>{missingInCustom.join(", ")}</strong>.
          </span>
        </div>
      )}

      {/* Editor or read-only view */}
      {editingPayload ? (
        <textarea
          value={displayJson}
          onChange={(e) => handleTemplateChange(e.target.value)}
          spellCheck={false}
          rows={Math.max(6, displayJson.split("\n").length + 1)}
          className={`w-full rounded-md bg-bluegrey-900 text-green-300 text-xs p-4 font-mono leading-relaxed resize-y focus:outline-none focus:ring-2 ${
            payloadError ? "ring-2 ring-red-500" : "focus:ring-blue-500"
          }`}
        />
      ) : (
        <pre className="rounded-md bg-bluegrey-900 text-green-300 text-xs p-4 overflow-x-auto font-mono leading-relaxed">
          {displayJson}
        </pre>
      )}

      {/* Validation error */}
      {payloadError && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> {payloadError}
        </p>
      )}

      {/* Help text */}
      {customTemplate === null ? (
        <p className="text-[10px] text-bluegrey-400">
          Auto-generated from the mapping table above. Click{" "}
          <span className="font-medium">Edit structure</span> to wrap in arrays, add nesting,
          or rename keys — only mapped attribute references may be used.
        </p>
      ) : (
        <p className="text-[10px] text-bluegrey-400">
          Custom structure active. Only{" "}
          <span className="font-mono">{`{{attribute}}`}</span> references from the mapping
          table above are allowed.
        </p>
      )}
    </div>
  );
}

// ─── Test webhook panel ───────────────────────────────────────────────────────

interface CallResult {
  name: string;
  statusCode: number;
  success: boolean;
  /** shown only when success=false, OR for webhook success */
  body?: string;
  /** payload sent (webhook call only) */
  payload?: string;
}

function sampleAttrValue(attr: string): string {
  const a = attr.toLowerCase();
  if (a.includes("email"))  return "john.doe@example.com";
  if (a.includes("first"))  return "John";
  if (a.includes("last"))   return "Doe";
  if (a.includes("phone"))  return "+44 123 456 789";
  if (a.includes("org"))    return "Acme Corp";
  if (a.includes("url") || a.includes("link")) return "https://example.com/invite/abc123";
  if (a.includes("id"))     return "user-abc-123";
  return `sample-${attr.split(".").pop()}`;
}

function CallResultCard({ call, index }: { call: CallResult; index: number }) {
  const [expanded, setExpanded] = useState(true);
  const statusColor = call.success ? "text-green-700" : "text-red-600";
  const borderColor = call.success ? "border-green-200" : "border-red-200";
  const headerBg   = call.success ? "bg-green-50"    : "bg-red-50";

  return (
    <div className={`rounded-md border ${borderColor} overflow-hidden text-xs`}>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 ${headerBg} text-left`}
      >
        <div className="flex items-center gap-2">
          <span className="font-semibold text-bluegrey-500 uppercase tracking-wide">
            Call {index + 1}: {call.name}
          </span>
          <span className={`font-bold ${statusColor}`}>
            {call.statusCode} {call.success ? "OK" : "Error"}
          </span>
          {call.success
            ? <CheckCircle className="w-3.5 h-3.5 text-green-600" />
            : <AlertCircle className="w-3.5 h-3.5 text-red-500" />}
        </div>
        {expanded ? <ChevronDownIcon className="w-3.5 h-3.5 text-bluegrey-400" /> : <ChevronRight className="w-3.5 h-3.5 text-bluegrey-400" />}
      </button>

      {expanded && (
        <div className="divide-y divide-bluegrey-100 bg-white">
          {/* Success auth: show status only, no body */}
          {call.success && !call.body && !call.payload && (
            <div className="px-3 py-2.5 text-green-700 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" />
              Token acquired successfully. Token details are not shown for security.
            </div>
          )}

          {/* Payload (webhook call) */}
          {call.payload && (
            <div className="px-3 py-2">
              <p className="font-medium text-bluegrey-500 mb-1">Request payload</p>
              <pre className="rounded bg-bluegrey-900 text-green-300 p-2 overflow-x-auto font-mono text-[11px]">
                {call.payload}
              </pre>
            </div>
          )}

          {/* Response body (webhook success or any failure) */}
          {call.body && (
            <div className="px-3 py-2">
              <p className={`font-medium mb-1 ${call.success ? "text-bluegrey-500" : "text-red-600"}`}>
                Response body
              </p>
              <pre className={`rounded border p-2 font-mono text-[11px] overflow-x-auto ${
                call.success
                  ? "bg-bluegrey-50 border-bluegrey-200 text-bluegrey-800"
                  : "bg-red-50 border-red-200 text-red-800"
              }`}>
                {call.body}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TestWebhookPanel({
  url, method, authType, scopes, mappings,
}: {
  url: string; method: string; authType: AuthType; scopes: string[]; mappings: PayloadMapping[];
}) {
  const attributes = [...new Set(mappings.map((m) => m.attribute))].sort();
  const [phase, setPhase] = useState<"idle" | "fill" | "running" | "done">("idle");
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [callResults, setCallResults] = useState<CallResult[]>([]);
  const [simulateFail, setSimulateFail] = useState(false);

  const handleClickTest = () => {
    setCallResults([]);
    // Pre-fill with sensible defaults
    const defaults: Record<string, string> = {};
    attributes.forEach((attr) => { defaults[attr] = fieldValues[attr] ?? sampleAttrValue(attr); });
    setFieldValues(defaults);
    setPhase("fill");
  };

  const runTest = async () => {
    setPhase("running");
    const results: CallResult[] = [];

    if (authType === "oauth2") {
      await new Promise((r) => setTimeout(r, 900));
      const ok = !simulateFail;
      results.push({
        name: "Token acquisition (OAuth 2.0)",
        statusCode: ok ? 200 : 401,
        success: ok,
        body: ok ? undefined : '{\n  "error": "invalid_client",\n  "error_description": "Client authentication failed — check client credentials"\n}',
      });
      setCallResults([...results]);
      if (!ok) { setPhase("done"); return; } // stop here if auth failed
    }

    await new Promise((r) => setTimeout(r, 1100));
    // Build payload substituting field values
    let payload = buildJsonPreview(mappings);
    attributes.forEach((attr) => {
      payload = payload.replace(new RegExp(`"{{${attr}}}"`, "g"), `"${fieldValues[attr] ?? sampleAttrValue(attr)}"`);
      payload = payload.replace(new RegExp(`{{${attr}}}`, "g"), fieldValues[attr] ?? sampleAttrValue(attr));
    });
    const webhookOk = !simulateFail;
    results.push({
      name: "Webhook call",
      statusCode: webhookOk ? 200 : 500,
      success: webhookOk,
      payload,
      body: webhookOk
        ? '{\n  "status": "accepted",\n  "reference": "inv_mock_1234",\n  "timestamp": "2025-06-30T12:00:00Z"\n}'
        : '{\n  "error": "internal_server_error",\n  "message": "Failed to process request — endpoint returned an unexpected response"\n}',
    });

    setCallResults([...results]);
    setPhase("done");
  };

  const reset = () => { setPhase("idle"); setCallResults([]); };

  return (
    <div className="space-y-4">
      <p className="text-xs text-bluegrey-500">
        Sends a test request to verify the endpoint and authentication are correctly configured.
        {authType === "oauth2" && <span className="font-medium"> Two calls will be made: token acquisition, then the webhook.</span>}
      </p>

      {/* Idle: show Test Webhook button */}
      {phase === "idle" && (
        <button
          type="button"
          onClick={handleClickTest}
          disabled={!url}
          className="flex items-center gap-2 h-9 px-4 rounded-md bg-bluegrey-800 hover:bg-bluegrey-900 text-white text-sm font-medium disabled:opacity-50 transition-colors"
        >
          <Terminal className="w-4 h-4" />
          Test Webhook
        </button>
      )}

      {/* Fill fields */}
      {phase === "fill" && (
        <div className="rounded-md border border-bluegrey-200 bg-bluegrey-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-bluegrey-200 bg-white">
            <p className="text-sm font-semibold text-bluegrey-800">Provide test field values</p>
            <p className="text-xs text-bluegrey-500 mt-0.5">
              Enter representative values for the mapped fields. These will be substituted into the payload before sending.
            </p>
          </div>
          <div className="px-4 py-4 space-y-3">
            {attributes.length === 0 ? (
              <p className="text-xs text-bluegrey-400 italic">No fields mapped — using empty payload.</p>
            ) : (
              attributes.map((attr) => (
                <div key={attr} className="grid grid-cols-[180px_1fr] items-center gap-3">
                  <label className="text-xs font-medium text-bluegrey-600 font-mono truncate" title={attr}>
                    {attr}
                  </label>
                  <input
                    type="text"
                    value={fieldValues[attr] ?? ""}
                    onChange={(e) => setFieldValues((prev) => ({ ...prev, [attr]: e.target.value }))}
                    className="w-full px-2.5 py-1.5 border border-bluegrey-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                    placeholder={sampleAttrValue(attr)}
                  />
                </div>
              ))
            )}
            {/* Simulate failure toggle */}
            <label className="flex items-center gap-2 mt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={simulateFail}
                onChange={(e) => setSimulateFail(e.target.checked)}
                className="w-3.5 h-3.5 accent-red-600"
              />
              <span className="text-xs text-bluegrey-500">Simulate failure response (for testing error display)</span>
            </label>
          </div>
          <div className="px-4 pb-4 flex gap-2">
            <button
              type="button"
              onClick={runTest}
              className="flex items-center gap-2 h-8 px-4 rounded-md bg-bluegrey-800 hover:bg-bluegrey-900 text-white text-xs font-medium transition-colors"
            >
              <Terminal className="w-3.5 h-3.5" />
              Run test
            </button>
            <button type="button" onClick={reset} className="h-8 px-3 rounded-md text-xs text-bluegrey-500 hover:text-bluegrey-800 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Running spinner */}
      {phase === "running" && (
        <div className="flex items-center gap-2 text-xs text-bluegrey-500">
          <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
          {callResults.length === 0 && authType === "oauth2"
            ? "Acquiring token…"
            : "Calling webhook…"}
        </div>
      )}

      {/* Results */}
      {(phase === "running" || phase === "done") && callResults.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-bluegrey-600 uppercase tracking-wide">Test results</p>
          {callResults.map((call, i) => (
            <CallResultCard key={i} call={call} index={i} />
          ))}
          {phase === "done" && (
            <button type="button" onClick={reset} className="text-xs text-blue-600 hover:underline">
              Run again
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Workflow section (reused for Invitation + Password Reset) ────────────────

function WorkflowSection({
  title, description, pathPlaceholder, attrGroups,
  state, onChange, dirty, onDirty,
}: {
  title: string;
  description: string;
  pathPlaceholder: string;
  attrGroups: { group: string; options: AttrOption[] }[];
  state: WorkflowState;
  onChange: (s: WorkflowState) => void;
  dirty: boolean;
  onDirty: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const baseUrl = state.endpoint.baseUrl || DEFAULT_TENANT_BASE_URL;
  const resultingUrl = state.endpoint.path ? `${baseUrl}${state.endpoint.path}` : baseUrl + pathPlaceholder;

  const pathError =
    state.endpoint.path && !state.endpoint.path.startsWith("/")
      ? "Path must start with /"
      : undefined;

  const patch = <K extends keyof WorkflowState>(key: K, val: WorkflowState[K]) => {
    onChange({ ...state, [key]: val });
    onDirty();
  };

  // Scopes available for the currently selected OAuth client
  const selectedClient = MOCK_OAUTH_CLIENTS.find((c) => c.id === state.auth.oauthClientId);
  const clientScopes = selectedClient?.scopes ?? [];

  const collapsed_summary = state.endpoint.path
    ? `${baseUrl}${state.endpoint.path} · ${state.auth.type === "oauth2" ? "OAuth 2.0" : "No auth"} · ${state.mappings.length} field${state.mappings.length !== 1 ? "s" : ""} mapped`
    : "Not configured";

  return (
    <div className="rounded-lg border border-bluegrey-200 bg-white overflow-hidden">
      {/* Card header */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-start justify-between gap-3 px-4 py-3 text-left hover:bg-bluegrey-25 transition-colors"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-bluegrey-900">{title}</p>
            {dirty && (
              <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" title="Unsaved changes" />
            )}
          </div>
          <p className="text-xs text-bluegrey-500 mt-0.5">{expanded ? description : collapsed_summary}</p>
        </div>
        <span className="mt-0.5 text-bluegrey-400 flex-shrink-0">
          {expanded
            ? <ChevronDownIcon className="w-4 h-4" />
            : <ChevronRight className="w-4 h-4" />}
        </span>
      </button>

      {expanded && (
        <div className="px-4 pb-5 pt-1 space-y-4 border-t border-bluegrey-100">
          {/* Endpoint */}
          <SubSectionTitle title="Endpoint configuration" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <FieldLabel label="Base URL" required />
              <SelectField
                id={`${title}-baseurl`}
                value={state.endpoint.baseUrl || DEFAULT_TENANT_BASE_URL}
                onChange={(v) => patch("endpoint", { ...state.endpoint, baseUrl: v })}
              >
                {MOCK_TENANT_URLS.map((url) => (
                  <option key={url} value={url}>{url}</option>
                ))}
              </SelectField>
              <p className="text-xs text-bluegrey-500">Tenant DNS URLs configured in the platform.</p>
            </div>
            <div className="space-y-1">
              <FieldLabel label="HTTP Method" />
              <div className="flex items-center h-10 px-3 rounded-md border border-bluegrey-200 bg-bluegrey-50 text-sm text-bluegrey-700">
                POST
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <FieldLabel label="Path" required />
            <TextField
              id={`${title}-path`}
              value={state.endpoint.path}
              onChange={(v) => patch("endpoint", { ...state.endpoint, path: v })}
              placeholder={pathPlaceholder}
              required
              error={pathError}
              helperText={`Must start with "/". Example: ${pathPlaceholder}`}
            />
          </div>
          <ReadOnlyField
            label="Resulting URL"
            value={resultingUrl}
            copyable
            badge="Auto-generated"
          />

          {/* Auth */}
          <SubSectionTitle
            title="Authentication"
            description="Secure the webhook invocation with an OAuth 2.0 access token."
          />
          <div className="space-y-1">
            <FieldLabel label="Authentication type" />
            <SelectField
              id={`${title}-authtype`}
              value={state.auth.type}
              onChange={(v) => patch("auth", { ...state.auth, type: v as AuthType })}
            >
              <option value="none">None</option>
              <option value="oauth2">OAuth 2.0 Client Credentials</option>
            </SelectField>
          </div>
          {state.auth.type === "oauth2" && (
            <div className="pl-4 border-l-2 border-blue-200 space-y-4">
              <div className="space-y-1">
                <FieldLabel label="OAuth Client" required />
                <SelectField
                  id={`${title}-oauthclient`}
                  value={state.auth.oauthClientId}
                  onChange={(v) =>
                    patch("auth", {
                      ...state.auth,
                      oauthClientId: v,
                      scopes: [],
                    })
                  }
                  placeholder="Select an OAuth Client…"
                  required
                >
                  {MOCK_OAUTH_CLIENTS.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </SelectField>
                <p className="text-xs text-bluegrey-500">
                  DMv2 will use this client to obtain an access token before invoking the webhook.
                </p>
              </div>
              {selectedClient && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-bluegrey-600 uppercase tracking-wide">Configuration status</p>
                  <ConfigStatusCard
                    ok={selectedClient.privateKeyJwtEnabled}
                    okTitle="Private Key JWT enabled"
                    okBody="This client uses Private Key JWT (RFC 7523) — the required authentication method for DMv2 webhook calls."
                    failTitle="Private Key JWT not enabled"
                    failBody="This client does not use Private Key JWT. In Access, go to Clients → Authentication and set the method to Private Key JWT. Client secrets are not supported."
                  />
                  <ConfigStatusCard
                    ok={selectedClient.publicKeyUrlConfigured}
                    okTitle="DMv2 public key URL registered"
                    okBody={<>The DMv2 JWKS endpoint is registered in this client.<CopyableUrl url={DMV2_PUBLIC_KEY_URL} theme="green" /></>}
                    failTitle="DMv2 public key URL not registered"
                    failBody={<>In Access, go to <strong>Clients → Keys</strong> and add the following JWKS URI:<CopyableUrl url={DMV2_PUBLIC_KEY_URL} theme="red" /></>}
                  />
                </div>
              )}
              <div className="space-y-1">
                <FieldLabel label="Scopes" />
                <ScopeSelector
                  selected={state.auth.scopes}
                  onChange={(scopes) => patch("auth", { ...state.auth, scopes })}
                  availableScopes={clientScopes}
                />
                <p className="text-xs text-bluegrey-500">
                  Selected scopes will be included in the token request.
                </p>
              </div>
            </div>
          )}

          {/* Payload */}
          <SubSectionTitle
            title="Payload configuration"
            description="Map approved DMv2 attributes to webhook payload fields. Arbitrary variables are not supported."
          />
          <InfoBox>
            Only attributes from the approved catalog below may be used. Passwords, secrets, and
            sensitive security attributes are not available.
          </InfoBox>
          <PayloadMappingTable
            mappings={state.mappings}
            onChange={(m) => patch("mappings", m)}
            attrGroups={attrGroups}
          />

          {/* Test */}
          <SubSectionTitle
            title="Test configuration"
            description="Send a sample request to verify endpoint and authentication are working."
          />
          <TestWebhookPanel
            url={resultingUrl}
            method="POST"
            authType={state.auth.type}
            scopes={state.auth.scopes}
            mappings={state.mappings}
          />
        </div>
      )}
    </div>
  );
}

// ─── DMv2 Authentication section ─────────────────────────────────────────────

function CopyableUrl({ url, theme = "red" }: { url: string; theme?: "red" | "green" }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const border = theme === "red" ? "border-red-300 bg-white" : "border-green-300 bg-white";
  const btn   = theme === "red" ? "border-red-300 hover:bg-red-100 text-red-600" : "border-green-300 hover:bg-green-100 text-green-700";
  return (
    <div className="flex items-center gap-2 mt-1.5">
      <div className={`flex-1 border ${border} rounded-md px-2.5 py-1.5 font-mono text-[11px] truncate`}>{url}</div>
      <button type="button" onClick={copy} title="Copy URL"
        className={`flex-shrink-0 h-7 w-7 flex items-center justify-center rounded-md border ${btn} transition-colors`}>
        {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
      </button>
    </div>
  );
}

function ConfigStatusCard({
  ok, okTitle, okBody, failTitle, failBody,
}: {
  ok: boolean;
  okTitle: string;
  okBody: React.ReactNode;
  failTitle: string;
  failBody: React.ReactNode;
}) {
  if (ok) {
    return (
      <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2.5 flex items-start gap-2.5">
        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-green-800">{okTitle}</p>
          <div className="text-xs text-green-700 mt-0.5">{okBody}</div>
        </div>
      </div>
    );
  }
  return (
    <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2.5 flex items-start gap-2.5">
      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-red-800">{failTitle}</p>
        <div className="text-xs text-red-700 mt-0.5">{failBody}</div>
      </div>
    </div>
  );
}

function AuthSection({
  state, onChange, dirty, onDirty,
}: {
  state: AuthSectionState;
  onChange: (s: AuthSectionState) => void;
  dirty: boolean;
  onDirty: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const selectedClient = MOCK_OIDC_CLIENTS.find((c) => c.id === state.oidcClientId);
  const oidcError = expanded && !state.oidcClientId ? "An OIDC Client must be selected." : undefined;

  const collapsed_summary = selectedClient
    ? `${selectedClient.label} · Authorization Code + PKCE`
    : "Not configured";

  const toggleScope = (scope: string) => {
    const current = state.scopes ?? [];
    const next = current.includes(scope)
      ? current.filter((s) => s !== scope)
      : [...current, scope];
    onChange({ ...state, scopes: next });
    onDirty();
  };

  return (
    <div className="rounded-lg border border-bluegrey-200 bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-start justify-between gap-3 px-4 py-3 text-left hover:bg-bluegrey-25 transition-colors"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-bluegrey-900">DMv2 Administrator Authentication</p>
            {dirty && <span className="w-2 h-2 rounded-full bg-amber-400" title="Unsaved changes" />}
          </div>
          <p className="text-xs text-bluegrey-500 mt-0.5">
            {expanded
              ? "Configure the OIDC Client used for administrator authentication into DMv2."
              : collapsed_summary}
          </p>
        </div>
        <span className="mt-0.5 text-bluegrey-400 flex-shrink-0">
          {expanded ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </span>
      </button>

      {expanded && (
        <div className="px-4 pb-5 pt-1 space-y-5 border-t border-bluegrey-100">
          <InfoBox>
            DMv2 only supports <strong>Authorization Code Flow with PKCE</strong> for administrator
            authentication. Ensure the OIDC Client is configured accordingly.
          </InfoBox>

          {/* OIDC Client */}
          <div className="space-y-1">
            <FieldLabel label="OIDC Client" required />
            <SelectField
              id="oidcClient"
              value={state.oidcClientId}
              onChange={(v) => { onChange({ ...state, oidcClientId: v }); onDirty(); }}
              placeholder="Select an OIDC Client…"
              required
              error={oidcError}
            >
              {MOCK_OIDC_CLIENTS.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </SelectField>
          </div>

          {/* Auto-validation cards — shown immediately when client is selected */}
          {selectedClient && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-bluegrey-600 uppercase tracking-wide">Configuration status</p>
              <ConfigStatusCard
                ok={selectedClient.redirectUriConfigured}
                okTitle="Redirect URI configured"
                okBody={`${REDIRECT_URI} is whitelisted in this OIDC Client's allowed redirect URIs.`}
                failTitle="Redirect URI not configured"
                failBody={`${REDIRECT_URI} is not in this client's allowed redirect URIs. Add it in the OIDC Client settings before using DMv2 authentication.`}
              />
              <ConfigStatusCard
                ok={selectedClient.pkceConfigured}
                okTitle="Public authentication (PKCE) enabled"
                okBody="This client uses Authorization Code Flow with PKCE — the only supported flow for DMv2 administrator authentication."
                failTitle="PKCE not enabled"
                failBody="This client is not configured for Authorization Code Flow with PKCE. Update the client authentication settings in Access to enable public authentication."
              />
            </div>
          )}

          {/* Redirect URI */}
          <ReadOnlyField
            label="Redirect URI"
            value={REDIRECT_URI}
            copyable
            badge="Auto-generated"
            helperText="This URI must be added to the selected OIDC Client's allowed redirect URIs."
          />

          {/* Authorization flow — read-only */}
          <div className="space-y-1">
            <FieldLabel label="Authorization flow" />
            <div className="flex items-center h-10 px-3 rounded-md border border-bluegrey-200 bg-bluegrey-50 text-sm text-bluegrey-700">
              Authorization Code + PKCE
            </div>
          </div>

          {/* Scopes */}
          <div className="space-y-2">
            <div>
              <FieldLabel label="Scopes" />
              <p className="text-xs text-bluegrey-500 mt-0.5">
                <strong>openid</strong> is mandatory and always included. Add additional scopes from those configured in the selected client.
              </p>
            </div>

            {/* ── Selected scopes ───────────────────────────────────────── */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-bluegrey-600 uppercase tracking-wide">Selected scopes</p>
              <div className="flex flex-wrap gap-2">
                {/* openid — mandatory, check if in client */}
                {(() => {
                  const openidInClient = !selectedClient || selectedClient.allowedScopes.includes("openid");
                  return (
                    <>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                        openidInClient ? "bg-blue-100 text-blue-800 border-blue-200" : "bg-red-50 text-red-700 border-red-300"
                      }`}>
                        {openidInClient
                          ? <CheckCircle className="w-3 h-3 flex-shrink-0" />
                          : <AlertCircle className="w-3 h-3 flex-shrink-0" />}
                        openid
                        <span className={`text-[10px] font-semibold ${openidInClient ? "text-blue-600" : "text-red-500"}`}>required</span>
                      </span>
                      {!openidInClient && (
                        <div className="w-full rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 flex items-start gap-2">
                          <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                          <span><strong>openid</strong> is not configured in this client. Add it in Access before proceeding.</span>
                        </div>
                      )}
                    </>
                  );
                })()}

                {/* additional selected scopes */}
                {(state.scopes ?? []).length === 0 && (
                  <span className="text-xs text-bluegrey-400 italic self-center">No additional scopes selected.</span>
                )}
                {(state.scopes ?? []).map((s) => (
                  <span key={s} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-green-50 text-green-800 border-green-300">
                    <CheckCircle className="w-3 h-3 flex-shrink-0" />
                    {s}
                    <button
                      type="button"
                      onClick={() => toggleScope(s)}
                      className="opacity-60 hover:opacity-100 transition-opacity ml-0.5"
                      title={`Remove ${s}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* ── Available scopes (from client only) ───────────────────── */}
            {selectedClient && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-bluegrey-600 uppercase tracking-wide">Available in client</p>
                {(() => {
                  const available = selectedClient.allowedScopes.filter(
                    (s) => s !== "openid" && !(state.scopes ?? []).includes(s)
                  );
                  return available.length === 0 ? (
                    <p className="text-xs text-bluegrey-400 italic">All available scopes have been selected.</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {available.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => toggleScope(s)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border border-dashed border-green-400 bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                        >
                          <Plus className="w-3 h-3 flex-shrink-0" />
                          {s}
                        </button>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function LoginWorkflowConfig() {
  const [authState, setAuthState] = useState<AuthSectionState>({ oidcClientId: "", scopes: [] });
  const [authDirty, setAuthDirty] = useState(false);

  const defaultWorkflow = (): WorkflowState => ({
    endpoint: { baseUrl: DEFAULT_TENANT_BASE_URL, path: "", method: "POST" },
    auth: { type: "none", oauthClientId: "", scopes: [] },
    mappings: [],
  });

  const [invState, setInvState] = useState<WorkflowState>(() => ({
    ...defaultWorkflow(),
    endpoint: { baseUrl: DEFAULT_TENANT_BASE_URL, path: "/api/invitations", method: "POST" },
    mappings: [
      { id: uid(), field: "email",          attribute: "user.email" },
      { id: uid(), field: "firstName",      attribute: "user.firstName" },
      { id: uid(), field: "organizationId", attribute: "organization.id" },
      { id: uid(), field: "invitationId",   attribute: "invitation.id" },
    ],
  }));
  const [invDirty, setInvDirty] = useState(false);

  const [pwState, setPwState] = useState<WorkflowState>(() => ({
    ...defaultWorkflow(),
    endpoint: { baseUrl: DEFAULT_TENANT_BASE_URL, path: "/api/password-reset", method: "POST" },
    mappings: [
      { id: uid(), field: "email",      attribute: "user.email" },
      { id: uid(), field: "firstName",  attribute: "user.firstName" },
    ],
  }));
  const [pwDirty, setPwDirty] = useState(false);

  return (
    <div className="space-y-3">
      <AuthSection
        state={authState}
        onChange={setAuthState}
        dirty={authDirty}
        onDirty={() => setAuthDirty(true)}
      />
      <WorkflowSection
        title="User Invitation Workflow"
        description="Configure the webhook invoked when DMv2 generates a user invitation."
        pathPlaceholder="/api/invitations"
        attrGroups={INVITATION_ATTRS}
        state={invState}
        onChange={setInvState}
        dirty={invDirty}
        onDirty={() => setInvDirty(true)}
      />
      <WorkflowSection
        title="Password Reset Workflow"
        description="Configure the webhook invoked when DMv2 generates a password reset request."
        pathPlaceholder="/api/password-reset"
        attrGroups={PASSWORD_RESET_ATTRS}
        state={pwState}
        onChange={setPwState}
        dirty={pwDirty}
        onDirty={() => setPwDirty(true)}
      />
    </div>
  );
}
