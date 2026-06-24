import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Search, AlertTriangle } from "lucide-react";
import Layout from "@/components/Layout";
import {
  type Scope,
  type ScopeInclusionMode,
  MOCK_SCOPES,
  SCOPE_ORG_OPTIONS,
} from "@/components/administrators/mockData";
import { ALL_ACCESS_ROLES } from "@/components/organizations/accessRolesMockData";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function inclusionLabel(mode: ScopeInclusionMode, org: string): string {
  switch (mode) {
    case "only":
      return `${org} only`;
    case "direct-children":
      return `${org} and organizations directly under it`;
    case "all-children":
      return `${org} and all organizations under it`;
    case "direct-children-excluding":
      return `Organizations directly under ${org}, excluding ${org}`;
    case "all-children-excluding":
      return `All organizations under ${org}, excluding ${org}`;
  }
}

const INCLUSION_MODES: ScopeInclusionMode[] = [
  "only",
  "direct-children",
  "all-children",
  "direct-children-excluding",
  "all-children-excluding",
];

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-bluegrey-900">{title}</h2>
        <hr className="mt-3 border-bluegrey-200" />
      </div>
      {children}
    </section>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-bluegrey-800">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

// ─── Access roles picker ──────────────────────────────────────────────────────

function AccessRolesPicker({
  mode,
  selectedIds,
  onModeChange,
  onToggle,
}: {
  mode: "all" | "custom";
  selectedIds: string[];
  onModeChange: (m: "all" | "custom") => void;
  onToggle: (id: string) => void;
}) {
  const [roleSearch, setRoleSearch] = useState("");

  const filtered = ALL_ACCESS_ROLES.filter(
    (r) =>
      r.name.toLowerCase().includes(roleSearch.toLowerCase()) ||
      r.description.toLowerCase().includes(roleSearch.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-bluegrey-700">Select access roles to include</p>

      <div className="space-y-3">
        {(["all", "custom"] as const).map((opt) => (
          <label key={opt} className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="access-role-mode"
              value={opt}
              checked={mode === opt}
              onChange={() => onModeChange(opt)}
              className="w-4 h-4 accent-blue-600"
            />
            <span className="text-sm text-bluegrey-900">
              {opt === "all" ? "All access roles" : "Custom selection"}
            </span>
          </label>
        ))}
      </div>

      {mode === "custom" && (
        <div className="border border-bluegrey-200 rounded-md overflow-hidden max-w-lg">
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-bluegrey-100 bg-bluegrey-25">
            <Search className="w-4 h-4 text-bluegrey-400 shrink-0" />
            <input
              type="text"
              value={roleSearch}
              onChange={(e) => setRoleSearch(e.target.value)}
              placeholder="Search roles"
              className="flex-1 bg-transparent text-sm text-bluegrey-900 placeholder:text-bluegrey-400 focus:outline-none"
            />
          </div>
          {/* Column headers */}
          <div className="grid grid-cols-[32px_1fr_1fr] px-3 py-2 border-b border-bluegrey-100 bg-bluegrey-25">
            <div />
            <span className="text-xs font-semibold text-bluegrey-600 uppercase tracking-wider">Name</span>
            <span className="text-xs font-semibold text-bluegrey-600 uppercase tracking-wider">Description</span>
          </div>
          {/* Rows */}
          <div className="divide-y divide-bluegrey-50 max-h-56 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="px-3 py-4 text-sm text-bluegrey-400 italic text-center">No roles found</p>
            ) : (
              filtered.map((role) => {
                const checked = selectedIds.includes(role.id);
                return (
                  <label
                    key={role.id}
                    className={`grid grid-cols-[32px_1fr_1fr] items-center px-3 py-2.5 cursor-pointer transition-colors ${
                      checked ? "bg-blue-50" : "hover:bg-bluegrey-25"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggle(role.id)}
                      className="accent-blue-600 w-4 h-4"
                    />
                    <span className="text-sm font-medium text-bluegrey-900">{role.name}</span>
                    <span className="text-sm text-bluegrey-500 truncate">{role.description || "—"}</span>
                  </label>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Save confirmation dialog ─────────────────────────────────────────────────

function SaveConfirmDialog({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 space-y-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-bluegrey-900 mb-1">
              Confirm scope changes
            </h3>
            <p className="text-sm text-bluegrey-600">
              Updating this scope may affect all administrators and policies that reference it.
              Users currently relying on this scope may gain or lose access immediately after
              saving.
            </p>
            <p className="text-sm text-bluegrey-600 mt-2">
              Please review your changes carefully before proceeding.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="h-9 px-4 rounded-sm border border-bluegrey-300 text-sm font-medium text-bluegrey-700 hover:bg-bluegrey-50 transition-colors"
          >
            Go back
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-9 px-4 rounded-sm bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium transition-colors"
          >
            I understand, save changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ScopeDetail() {
  const { scopeId } = useParams<{ scopeId: string }>();
  const navigate = useNavigate();

  const scope = MOCK_SCOPES.find((s) => s.id === scopeId) ?? null;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedOrg, setSelectedOrg] = useState("");
  const [inclusionMode, setInclusionMode] = useState<ScopeInclusionMode>("only");
  const [accessRoleMode, setAccessRoleMode] = useState<"all" | "custom">("all");
  const [accessRoleIds, setAccessRoleIds] = useState<string[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [nameError, setNameError] = useState("");

  useEffect(() => {
    if (scope) {
      setName(scope.name);
      setDescription(scope.description);
      setSelectedOrg(
        SCOPE_ORG_OPTIONS.find((o) => o.label === scope.organization)?.value ?? ""
      );
      setInclusionMode(scope.inclusionMode);
      setAccessRoleMode(scope.accessRoleMode);
      setAccessRoleIds(scope.accessRoleIds);
    }
  }, [scope]);

  const orgLabel =
    SCOPE_ORG_OPTIONS.find((o) => o.value === selectedOrg)?.label ?? scope?.organization ?? "";

  const toggleRole = (id: string) => {
    setAccessRoleIds((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const handleSaveClick = () => {
    if (!name.trim()) {
      setNameError("Scope name is required.");
      return;
    }
    setNameError("");
    setShowConfirm(true);
  };

  const commitSave = () => {
    if (!scope) return;
    // Mutate the mock array in place so the list reflects changes on remount
    const idx = MOCK_SCOPES.findIndex((s) => s.id === scope.id);
    if (idx !== -1) {
      MOCK_SCOPES[idx] = {
        ...MOCK_SCOPES[idx],
        name: name.trim(),
        description: description.trim(),
        organization: orgLabel,
        inclusionMode,
        accessRoleMode,
        accessRoleIds: accessRoleMode === "custom" ? accessRoleIds : [],
      };
    }
    setShowConfirm(false);
    navigate("/administrators/all?tab=scopes");
  };

  if (!scope) {
    return (
      <Layout>
        <div className="min-h-screen bg-bluegrey-25 flex items-center justify-center">
          <p className="text-bluegrey-500">Scope not found.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-white">
        {/* Sticky page header */}
        <div className="sticky top-16 bg-white border-b border-bluegrey-100 z-20">
          <div className="px-6 lg:px-8 pt-5 pb-4">
            <button
              type="button"
              onClick={() => navigate("/administrators/all?tab=scopes")}
              className="flex items-center gap-1.5 text-sm text-bluegrey-600 hover:text-bluegrey-900 transition-colors mb-3"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to scopes
            </button>
            <h1 className="text-2xl font-semibold text-bluegrey-900">{scope.name}</h1>
          </div>
        </div>

        {/* Form body */}
        <div className="px-6 lg:px-8 py-8 max-w-2xl space-y-10">

          {/* Basic information */}
          <Section title="Basic information">
            <Field label="Scope name" required>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setNameError(""); }}
                className={`w-full max-w-sm border rounded-sm px-3 py-2 text-sm text-bluegrey-900 focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                  nameError ? "border-red-400" : "border-bluegrey-300"
                }`}
              />
              {nameError && <p className="text-xs text-red-600 mt-1">{nameError}</p>}
            </Field>

            <Field label="Description">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full max-w-sm border border-bluegrey-300 rounded-sm px-3 py-2 text-sm text-bluegrey-900 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
              />
            </Field>
          </Section>

          {/* Organizations in scope */}
          <Section title="Organizations in scope">
            <div className="space-y-4">
              <p className="text-sm font-medium text-bluegrey-700">
                Select organizations to include
              </p>
              <div className="space-y-3">
                {INCLUSION_MODES.map((mode) => (
                  <label key={mode} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="inclusion-mode"
                      value={mode}
                      checked={inclusionMode === mode}
                      onChange={() => setInclusionMode(mode)}
                      className="w-4 h-4 accent-blue-600"
                    />
                    <span className="text-sm text-bluegrey-900">
                      {inclusionLabel(mode, orgLabel)}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </Section>

          {/* Access roles in scope */}
          <Section title="Access roles in scope">
            <AccessRolesPicker
              mode={accessRoleMode}
              selectedIds={accessRoleIds}
              onModeChange={(m) => {
                setAccessRoleMode(m);
                if (m === "all") setAccessRoleIds([]);
              }}
              onToggle={toggleRole}
            />
          </Section>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleSaveClick}
              className="inline-flex items-center gap-2 h-9 px-4 rounded-sm bg-bluegrey-900 hover:bg-bluegrey-800 text-white text-sm font-medium transition-colors"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
            <button
              type="button"
              onClick={() => navigate("/administrators/all?tab=scopes")}
              className="h-9 px-4 rounded-sm text-sm font-medium text-bluegrey-700 hover:bg-bluegrey-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {showConfirm && (
        <SaveConfirmDialog
          onConfirm={commitSave}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </Layout>
  );
}
