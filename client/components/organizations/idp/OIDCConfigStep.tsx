import { useState, useRef } from "react";
import { Bookmark, ArrowRight, Plus, X, Download, ChevronDown, AlertCircle } from "lucide-react";
import type { OIDCFormData, OIDCVariant, AttributeMapping, AuthMethod, CertSource } from "./types";
import { DEFAULT_OIDC_DATA } from "./types";

// ─── Constants ────────────────────────────────────────────────────────────────

const AUTH_METHODS: { value: AuthMethod; label: string }[] = [
  { value: "none",               label: "No Authentication" },
  { value: "client_secret_basic", label: "Client secret basic" },
  { value: "client_secret_post", label: "Client secret post" },
  { value: "client_secret_jwt",  label: "Client secret JWT" },
  { value: "private_key_jwt",    label: "Private key JWT" },
  { value: "client_tls",         label: "Client TLS" },
];

const SIGNATURE_TYPES = ["RS256", "RS384", "RS512", "ES256", "ES384", "ES512", "PS256", "PS384", "PS512"];

const REDIRECT_URIS = [
  "https://broker.your-domain.onewelcome.net/broker/authentication/callback",
];

const SECTIONS = ["Basic information", "Connection details", "Variants", "Attribute mappings"];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ number, title }: { number: number; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold shrink-0">
        {number}
      </span>
      <h2 className="text-base font-semibold text-blue-700">{title}</h2>
    </div>
  );
}

function FormField({
  label,
  required,
  helpText,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  helpText?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-bluegrey-800">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {helpText && !error && (
        <p className="text-xs text-bluegrey-500 leading-relaxed">{helpText}</p>
      )}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  error,
  type = "text",
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: boolean;
  type?: string;
  className?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full h-10 px-3 text-sm border rounded-sm bg-white text-bluegrey-900 placeholder:text-bluegrey-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
        error ? "border-red-400" : "border-bluegrey-300"
      } ${className}`}
    />
  );
}

// ─── Variant card ─────────────────────────────────────────────────────────────

function VariantCard({
  variant,
  index,
  canRemove,
  onChange,
  onRemove,
  error,
}: {
  variant: OIDCVariant;
  index: number;
  canRemove: boolean;
  onChange: (field: keyof OIDCVariant, value: unknown) => void;
  onRemove: () => void;
  error?: string;
}) {
  return (
    <div className="border border-bluegrey-200 rounded-md overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-bluegrey-25 border-b border-bluegrey-100">
        <span className="text-xs font-medium text-bluegrey-500">Variant {index + 1}</span>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="w-6 h-6 flex items-center justify-center rounded text-bluegrey-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            aria-label="Remove variant"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      <div className="p-4 space-y-4">
        <FormField
          label="Variant name"
          required
          helpText="Sub-configuration named variant. It must be unique in the context of the given configuration."
          error={error}
        >
          <TextInput
            value={variant.variantName}
            onChange={(v) => onChange("variantName", v)}
            error={!!error}
          />
        </FormField>

        <FormField label="Scope names" helpText="Enter the scopes for the user attributes that you need.">
          <div className="relative">
            <select className="w-full h-10 pl-3 pr-8 text-sm border border-bluegrey-300 rounded-sm bg-white text-bluegrey-400 appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
              <option value="">— Select scopes —</option>
              <option>openid</option>
              <option>profile</option>
              <option>email</option>
              <option>phone</option>
              <option>address</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bluegrey-400 pointer-events-none" />
          </div>
        </FormField>

        <FormField label="Claims" helpText="Enter the claims, which are the set of user attributes that a scope returns.">
          <div className="relative">
            <select className="w-full h-10 pl-3 pr-8 text-sm border border-bluegrey-300 rounded-sm bg-white text-bluegrey-400 appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
              <option value="">— Select claims —</option>
              <option>sub</option>
              <option>name</option>
              <option>email</option>
              <option>email_verified</option>
              <option>phone_number</option>
              <option>address</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bluegrey-400 pointer-events-none" />
          </div>
        </FormField>

        <FormField label="ACR values" helpText="Specify the required authentication context class references.">
          <div className="relative">
            <select className="w-full h-10 pl-3 pr-8 text-sm border border-bluegrey-300 rounded-sm bg-white text-bluegrey-400 appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
              <option value="">— Select ACR values —</option>
              <option>urn:mace:incommon:iap:silver</option>
              <option>urn:mace:incommon:iap:gold</option>
              <option>urn:oasis:names:tc:SAML:2.0:ac:classes:Password</option>
              <option>urn:oasis:names:tc:SAML:2.0:ac:classes:SmartCard</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bluegrey-400 pointer-events-none" />
          </div>
        </FormField>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  initialData: OIDCFormData;
  onComplete: (data: OIDCFormData) => void;
  onCancel: () => void;
}

export default function OIDCConfigStep({ initialData, onComplete, onCancel }: Props) {
  const [form, setForm] = useState<OIDCFormData>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeSection, setActiveSection] = useState(0);
  const [isLoadingWellKnown, setIsLoadingWellKnown] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);
  const s1 = useRef<HTMLElement>(null);
  const s2 = useRef<HTMLElement>(null);
  const s3 = useRef<HTMLElement>(null);
  const s4 = useRef<HTMLElement>(null);
  const sectionRefs = [s1, s2, s3, s4];

  function update<K extends keyof OIDCFormData>(key: K, value: OIDCFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  function scrollToSection(index: number) {
    const el = sectionRefs[index].current;
    const container = contentRef.current;
    if (el && container) {
      const top = el.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop - 16;
      container.scrollTo({ top, behavior: "smooth" });
    }
    setActiveSection(index);
  }

  async function handleLoad() {
    if (!form.wellKnownEndpoint.trim() || isLoadingWellKnown) return;
    setIsLoadingWellKnown(true);
    await new Promise((r) => setTimeout(r, 900));
    setForm((prev) => ({
      ...prev,
      issuer: "https://accounts.example.com",
      authorizationEndpoint: "https://accounts.example.com/oauth2/authorize",
      tokenEndpoint: "https://accounts.example.com/oauth2/token",
      userInfoEndpoint: "https://accounts.example.com/oauth2/userinfo",
      jwksUri: "https://accounts.example.com/.well-known/jwks.json",
    }));
    setIsLoadingWellKnown(false);
  }

  function addVariant() {
    update("variants", [
      ...form.variants,
      { id: `v${Date.now()}`, variantName: "", scopeNames: [], claims: [], acrValues: [] },
    ]);
  }

  function removeVariant(id: string) {
    update("variants", form.variants.filter((v) => v.id !== id));
  }

  function updateVariant(id: string, field: keyof OIDCVariant, value: unknown) {
    update(
      "variants",
      form.variants.map((v) => (v.id === id ? { ...v, [field]: value } : v))
    );
  }

  function addAttributeMapping() {
    update("attributeMappings", [
      ...form.attributeMappings,
      { id: `am${Date.now()}`, source: "", target: "" },
    ]);
  }

  function removeAttributeMapping(id: string) {
    update("attributeMappings", form.attributeMappings.filter((am) => am.id !== id));
  }

  function updateAttributeMapping(id: string, field: keyof AttributeMapping, value: string) {
    update(
      "attributeMappings",
      form.attributeMappings.map((am) => (am.id === id ? { ...am, [field]: value } : am))
    );
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!form.displayName.trim()) errs.displayName = "Display name is required.";
    if (!form.clientId.trim()) errs.clientId = "Client ID is required.";
    if (form.authMethod !== "none" && !form.clientSecret.trim())
      errs.clientSecret = "Client secret is required.";
    if (!form.issuer.trim()) errs.issuer = "Issuer is required.";
    if (!form.authorizationEndpoint.trim())
      errs.authorizationEndpoint = "Authorization endpoint is required.";
    if (!form.tokenEndpoint.trim()) errs.tokenEndpoint = "Token endpoint is required.";
    if (form.certSource === "dynamic_jwks" && !form.jwksUri.trim())
      errs.jwksUri = "JWKs URI is required.";
    form.variants.forEach((v, i) => {
      if (!v.variantName.trim()) errs[`variant_${i}`] = "Variant name is required.";
    });
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      // Scroll to first error section
      if (errs.displayName) scrollToSection(0);
      else if (errs.clientId || errs.clientSecret || errs.issuer || errs.authorizationEndpoint || errs.tokenEndpoint || errs.jwksUri) scrollToSection(1);
      else scrollToSection(2);
    }
    return Object.keys(errs).length === 0;
  }

  function handleSubmit() {
    if (validate()) onComplete(form);
  }

  const needsSecret = form.authMethod !== "none" && form.authMethod !== "client_tls" && form.authMethod !== "private_key_jwt";

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      {/* ── Sticky header ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-bluegrey-200 shrink-0">
        <h1 className="text-sm font-semibold text-bluegrey-900">
          Add identity provider — OpenID Connect
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="h-8 px-3 text-sm text-bluegrey-600 hover:bg-bluegrey-50 rounded transition-colors"
          >
            Cancel
          </button>
          <button className="h-8 px-3 text-sm border border-bluegrey-300 rounded text-bluegrey-700 hover:bg-bluegrey-50 flex items-center gap-1.5 transition-colors">
            <Bookmark className="w-3.5 h-3.5" />
            Save draft
          </button>
          <button
            onClick={handleSubmit}
            className="h-8 px-4 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1.5 transition-colors font-medium"
          >
            Submit
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left nav */}
        <nav className="w-52 shrink-0 border-r border-bluegrey-100 py-6 overflow-y-auto bg-bluegrey-25">
          {SECTIONS.map((label, i) => (
            <button
              key={i}
              onClick={() => scrollToSection(i)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors ${
                activeSection === i
                  ? "text-blue-700"
                  : "text-bluegrey-500 hover:text-bluegrey-800"
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-colors ${
                  activeSection === i
                    ? "bg-blue-600 text-white"
                    : "border border-bluegrey-400 text-bluegrey-500 bg-white"
                }`}
              >
                {i + 1}
              </span>
              <span className={activeSection === i ? "font-medium" : ""}>{label}</span>
            </button>
          ))}
        </nav>

        {/* Scrollable form */}
        <div ref={contentRef} className="flex-1 overflow-y-auto">
          <div className="max-w-2xl px-8 py-6 space-y-12">

            {/* ── Section 1: Basic Information ──────────────────────────────── */}
            <section ref={s1}>
              <SectionHeader number={1} title="Basic information" />
              <div className="space-y-5">
                <FormField label="Display name" required error={errors.displayName}>
                  <TextInput
                    value={form.displayName}
                    onChange={(v) => update("displayName", v)}
                    error={!!errors.displayName}
                  />
                </FormField>

                <FormField
                  label="Domain aliases"
                  helpText="Domain names will be used to select an Identity Provider if the authentication request to the Broker contains a login_hint parameter with an email address as a value, provided no IDP is selected via acr_values."
                >
                  <div className="relative">
                    <select className="w-full h-10 pl-3 pr-8 text-sm border border-bluegrey-300 rounded-sm bg-white text-bluegrey-400 appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                      <option value="">— Select domain aliases —</option>
                      <option>acme-corp.com</option>
                      <option>acme.eu</option>
                      <option>acme.io</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bluegrey-400 pointer-events-none" />
                  </div>
                </FormField>

                <FormField label="Description">
                  <TextInput
                    value={form.description}
                    onChange={(v) => update("description", v)}
                    placeholder="Optional description"
                  />
                </FormField>

                <div className="flex flex-col gap-1.5">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.active}
                      onChange={(e) => update("active", e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-bluegrey-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-bluegrey-900">Active</span>
                  </label>
                  <p className="text-xs text-bluegrey-500 ml-[26px] leading-relaxed">
                    Users can select this identity provider only when it's active. When inactive,
                    you can save an incomplete configuration.
                  </p>
                </div>
              </div>
            </section>

            {/* ── Section 2: Connection Details ─────────────────────────────── */}
            <section ref={s2}>
              <SectionHeader number={2} title="Connection details" />
              <div className="space-y-5">
                {/* Redirect URI note */}
                <div className="text-sm text-bluegrey-600 space-y-2 p-4 bg-bluegrey-25 rounded-md border border-bluegrey-100">
                  <p>
                    The OpenID Connect protocol necessitates the whitelisting of all potential
                    redirect URIs. The following list displays all the redirect URIs the identity
                    broker might utilize. The actual domain is determined by the domain specified
                    in the authentication request. Please ensure that the redirect URI used in the
                    authentication request is whitelisted in the external Identity Provider (IDP)
                    you are setting up.
                  </p>
                  <ul className="space-y-1 mt-2">
                    {REDIRECT_URIS.map((uri) => (
                      <li key={uri} className="flex items-start gap-1.5 text-xs">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-bluegrey-400 shrink-0" />
                        <code className="font-mono text-bluegrey-700 break-all">{uri}</code>
                      </li>
                    ))}
                  </ul>
                </div>

                <FormField label="Client ID" required error={errors.clientId}>
                  <TextInput
                    value={form.clientId}
                    onChange={(v) => update("clientId", v)}
                    error={!!errors.clientId}
                  />
                </FormField>

                {/* Authentication method */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-bluegrey-800">Authentication method</label>
                  <div className="space-y-2">
                    {AUTH_METHODS.map((m) => (
                      <label key={m.value} className="flex items-center gap-2.5 cursor-pointer select-none">
                        <input
                          type="radio"
                          name="authMethod"
                          value={m.value}
                          checked={form.authMethod === m.value}
                          onChange={() => update("authMethod", m.value)}
                          className="w-4 h-4 text-blue-600 border-bluegrey-300 focus:ring-blue-500"
                        />
                        <span className="text-sm text-bluegrey-900">{m.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Client secret — shown for methods that need it */}
                {needsSecret && (
                  <FormField label="Client secret" required error={errors.clientSecret}>
                    <TextInput
                      type="password"
                      value={form.clientSecret}
                      onChange={(v) => update("clientSecret", v)}
                      error={!!errors.clientSecret}
                    />
                  </FormField>
                )}

                {/* PKCE */}
                <div className="flex flex-col gap-1.5">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.pkce}
                      onChange={(e) => update("pkce", e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-bluegrey-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-bluegrey-900">PKCE</span>
                  </label>
                  <p className="text-xs text-bluegrey-500 ml-[26px] leading-relaxed">
                    PKCE (Proof Key for Code Exchange) enhances security by mitigating the risk of
                    interception and misuse of authorization codes. We only support the SHA-256
                    transformation method.
                  </p>
                </div>

                {/* Well-known endpoint + Load */}
                <FormField label="Well-known configuration endpoint">
                  <div className="flex gap-2">
                    <TextInput
                      value={form.wellKnownEndpoint}
                      onChange={(v) => update("wellKnownEndpoint", v)}
                      placeholder="https://accounts.example.com/.well-known/openid-configuration"
                      className="flex-1"
                    />
                    <button
                      type="button"
                      onClick={handleLoad}
                      disabled={!form.wellKnownEndpoint.trim() || isLoadingWellKnown}
                      className="h-10 px-3 text-sm border border-bluegrey-300 rounded-sm text-bluegrey-700 hover:bg-bluegrey-50 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" />
                      {isLoadingWellKnown ? "Loading…" : "Load"}
                    </button>
                  </div>
                </FormField>

                <FormField label="Issuer" required error={errors.issuer}>
                  <TextInput value={form.issuer} onChange={(v) => update("issuer", v)} error={!!errors.issuer} />
                </FormField>

                <FormField label="Authorization endpoint" required error={errors.authorizationEndpoint}>
                  <TextInput
                    value={form.authorizationEndpoint}
                    onChange={(v) => update("authorizationEndpoint", v)}
                    error={!!errors.authorizationEndpoint}
                  />
                </FormField>

                <FormField label="Token endpoint" required error={errors.tokenEndpoint}>
                  <TextInput value={form.tokenEndpoint} onChange={(v) => update("tokenEndpoint", v)} error={!!errors.tokenEndpoint} />
                </FormField>

                <FormField label="User information endpoint">
                  <TextInput value={form.userInfoEndpoint} onChange={(v) => update("userInfoEndpoint", v)} />
                </FormField>

                {/* Signature type */}
                <FormField label="Signature type">
                  <div className="relative">
                    <select
                      value={form.signatureType}
                      onChange={(e) => update("signatureType", e.target.value)}
                      className="w-full h-10 pl-3 pr-8 text-sm border border-bluegrey-300 rounded-sm bg-white text-bluegrey-900 appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {SIGNATURE_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bluegrey-400 pointer-events-none" />
                  </div>
                </FormField>

                {/* Certificate source */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-bluegrey-800">Identity provider certificates</label>
                  <div className="space-y-2">
                    {([
                      { value: "dynamic_jwks", label: "Dynamic via JWKs URI" },
                      { value: "manual", label: "Manual file upload" },
                    ] as { value: CertSource; label: string }[]).map((opt) => (
                      <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer select-none">
                        <input
                          type="radio"
                          name="certSource"
                          value={opt.value}
                          checked={form.certSource === opt.value}
                          onChange={() => update("certSource", opt.value)}
                          className="w-4 h-4 text-blue-600 border-bluegrey-300 focus:ring-blue-500"
                        />
                        <span className="text-sm text-bluegrey-900">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* JWKs URI — shown when dynamic_jwks */}
                {form.certSource === "dynamic_jwks" && (
                  <FormField label="Identity provider JWKs URI" required error={errors.jwksUri}>
                    <TextInput value={form.jwksUri} onChange={(v) => update("jwksUri", v)} error={!!errors.jwksUri} />
                  </FormField>
                )}

                {/* Encrypted JWT */}
                <div className="flex flex-col gap-1.5">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.encryptedJwt}
                      onChange={(e) => update("encryptedJwt", e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-bluegrey-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-bluegrey-900">Encrypted JWT</span>
                  </label>
                  <p className="text-xs text-bluegrey-500 ml-[26px]">Support for encrypted JWT</p>
                </div>

                {/* JWT-Secured Authentication Request */}
                <div className="flex flex-col gap-1.5">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.jwtSecuredAuthRequest}
                      onChange={(e) => update("jwtSecuredAuthRequest", e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-bluegrey-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-bluegrey-900">JWT-Secured Authentication Request</span>
                  </label>
                  <p className="text-xs text-bluegrey-500 ml-[26px] leading-relaxed">
                    The request parameters will be encoded and sent to the external identity provider
                    in the request parameter value.
                  </p>
                </div>

                {/* Single logout */}
                <div className="flex flex-col gap-1.5">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.singleLogout}
                      onChange={(e) => update("singleLogout", e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-bluegrey-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-bluegrey-900">Single logout</span>
                  </label>
                  <p className="text-xs text-bluegrey-500 ml-[26px] leading-relaxed">
                    Logout requests are propagated to the identity provider to end the user's session.
                  </p>
                </div>
              </div>
            </section>

            {/* ── Section 3: Variants ───────────────────────────────────────── */}
            <section ref={s3}>
              <SectionHeader number={3} title="Variants" />
              <div className="space-y-4">
                <p className="text-sm text-bluegrey-600 leading-relaxed">
                  Variants allow you to send different authentication requests to a single identity
                  provider. You can use this if you have different services defined under a single
                  connection. Each identity provider needs to have at least one variant.
                </p>

                {form.variants.map((variant, idx) => (
                  <VariantCard
                    key={variant.id}
                    variant={variant}
                    index={idx}
                    canRemove={form.variants.length > 1}
                    onChange={(field, value) => updateVariant(variant.id, field, value)}
                    onRemove={() => removeVariant(variant.id)}
                    error={errors[`variant_${idx}`]}
                  />
                ))}

                <button
                  type="button"
                  onClick={addVariant}
                  className="inline-flex items-center gap-1.5 h-9 px-4 text-sm font-medium text-blue-600 border border-blue-300 rounded-sm hover:bg-blue-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add variant
                </button>
              </div>
            </section>

            {/* ── Section 4: Attribute Mappings ─────────────────────────────── */}
            <section ref={s4} className="pb-12">
              <SectionHeader number={4} title="Attribute mappings" />
              <div className="space-y-5">
                {/* Return original assertion */}
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.returnOriginalAssertion}
                    onChange={(e) => update("returnOriginalAssertion", e.target.checked)}
                    className="w-4 h-4 rounded border-bluegrey-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-bluegrey-900">Return original assertion</span>
                </label>

                <FormField
                  label="User identifier"
                  helpText="Select the attribute from the user attributes-endpoint that uniquely identifies the user."
                >
                  <TextInput
                    value={form.userIdentifier}
                    onChange={(v) => update("userIdentifier", v)}
                    placeholder="e.g. sub"
                  />
                </FormField>

                {/* Attribute mappings table */}
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-bluegrey-800">Attribute mappings</h4>
                    <p className="text-xs text-bluegrey-500 mt-1 leading-relaxed">
                      The identity provider sends user attributes as claims in the authentication
                      response. Configure the attribute mapping from the IDP to your organization.
                      Only mapped attributes are stored and sent to your services.
                    </p>
                  </div>

                  {form.attributeMappings.length > 0 && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-[1fr_auto_1fr_auto] gap-2 px-1 text-xs font-semibold text-bluegrey-500 uppercase tracking-wider">
                        <span>IDP attribute</span>
                        <span />
                        <span>Organization attribute</span>
                        <span />
                      </div>
                      {form.attributeMappings.map((am) => (
                        <div key={am.id} className="grid grid-cols-[1fr_auto_1fr_auto] gap-2 items-center">
                          <input
                            type="text"
                            value={am.source}
                            onChange={(e) => updateAttributeMapping(am.id, "source", e.target.value)}
                            placeholder="e.g. given_name"
                            className="h-9 px-3 text-sm border border-bluegrey-300 rounded-sm bg-white text-bluegrey-900 placeholder:text-bluegrey-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-mono"
                          />
                          <span className="text-bluegrey-400 text-sm font-mono px-1">→</span>
                          <input
                            type="text"
                            value={am.target}
                            onChange={(e) => updateAttributeMapping(am.id, "target", e.target.value)}
                            placeholder="e.g. firstName"
                            className="h-9 px-3 text-sm border border-bluegrey-300 rounded-sm bg-white text-bluegrey-900 placeholder:text-bluegrey-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => removeAttributeMapping(am.id)}
                            className="w-8 h-9 flex items-center justify-center text-bluegrey-400 hover:text-red-500 transition-colors rounded"
                            aria-label="Remove mapping"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={addAttributeMapping}
                    className="inline-flex items-center gap-1.5 h-9 px-4 text-sm font-medium text-blue-600 border border-blue-300 rounded-sm hover:bg-blue-50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add attribute mapping
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
