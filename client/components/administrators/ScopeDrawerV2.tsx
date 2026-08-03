import { useState, useEffect } from "react";
import { X, Search, AlertTriangle, Info } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  type Scope,
  type ScopeInclusionMode,
  type ScopeOrgContextMode,
  type ScopeAccessRoleContext,
  SCOPE_ORG_OPTIONS,
} from "./mockData";
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

const USER_MEMBERSHIP_ORG_LABEL = "User membership org";

// ─── Access roles picker ──────────────────────────────────────────────────────

function AccessRolesSection({
  mode,
  selectedIds,
  onModeChange,
  onToggle,
  allowCustom,
  lockedMessage,
  sourceNote,
}: {
  mode: "all" | "custom";
  selectedIds: string[];
  onModeChange: (m: "all" | "custom") => void;
  onToggle: (id: string) => void;
  allowCustom: boolean;
  lockedMessage: string;
  sourceNote?: string;
}) {
  const [roleSearch, setRoleSearch] = useState("");

  const filtered = ALL_ACCESS_ROLES.filter(
    (r) =>
      r.name.toLowerCase().includes(roleSearch.toLowerCase()) ||
      r.description.toLowerCase().includes(roleSearch.toLowerCase()),
  );

  if (!allowCustom) {
    return (
      <div className="space-y-2">
        <p className="text-sm font-medium text-bluegrey-900">Access roles in scope</p>
        <div className="flex items-start gap-2 rounded-md border border-bluegrey-200 bg-bluegrey-25 px-3 py-2.5">
          <Info className="w-4 h-4 text-bluegrey-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-bluegrey-600">{lockedMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium text-bluegrey-900">Access roles in scope</p>
        {sourceNote && <p className="text-xs text-bluegrey-500 mt-0.5">{sourceNote}</p>}
      </div>

      <RadioGroup
        value={mode}
        onValueChange={(v) => onModeChange(v as "all" | "custom")}
        className="space-y-2"
      >
        <div className="flex items-center gap-2.5">
          <RadioGroupItem value="all" id="role-mode-all-v2" />
          <Label htmlFor="role-mode-all-v2" className="text-sm font-normal text-bluegrey-900 cursor-pointer">
            All access roles
          </Label>
        </div>
        <div className="flex items-center gap-2.5">
          <RadioGroupItem value="custom" id="role-mode-custom-v2" />
          <Label htmlFor="role-mode-custom-v2" className="text-sm font-normal text-bluegrey-900 cursor-pointer">
            Custom selection
          </Label>
        </div>
      </RadioGroup>

      {mode === "custom" && (
        <div className="mt-2 border border-bluegrey-200 rounded-md overflow-hidden">
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-bluegrey-100 bg-bluegrey-25">
            <Search className="w-4 h-4 text-bluegrey-400 shrink-0" />
            <input
              type="text"
              value={roleSearch}
              onChange={(e) => setRoleSearch(e.target.value)}
              placeholder="Search"
              className="flex-1 bg-transparent text-sm text-bluegrey-900 placeholder:text-bluegrey-400 focus:outline-none"
            />
          </div>

          {/* Header */}
          <div className="grid grid-cols-[32px_1fr_1fr] px-3 py-2 border-b border-bluegrey-100 bg-bluegrey-25">
            <div />
            <span className="text-xs font-semibold text-bluegrey-600 uppercase tracking-wider">Name</span>
            <span className="text-xs font-semibold text-bluegrey-600 uppercase tracking-wider">Description</span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-bluegrey-50 max-h-52 overflow-y-auto">
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

// ─── Main drawer ──────────────────────────────────────────────────────────────

interface ScopeDrawerV2Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scope: Scope | null;
  onSave: (scope: Omit<Scope, "id">) => void;
}

export default function ScopeDrawerV2({
  open,
  onOpenChange,
  scope,
  onSave,
}: ScopeDrawerV2Props) {
  const isEditing = scope !== null;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [orgContextMode, setOrgContextMode] = useState<ScopeOrgContextMode>("user-membership");
  const [selectedOrg, setSelectedOrg] = useState("");
  const [inclusionMode, setInclusionMode] = useState<ScopeInclusionMode>("only");
  const [accessRoleContext, setAccessRoleContext] = useState<ScopeAccessRoleContext>("org");
  const [accessRoleMode, setAccessRoleMode] = useState<"all" | "custom">("all");
  const [accessRoleIds, setAccessRoleIds] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setName(scope?.name ?? "");
      setDescription(scope?.description ?? "");
      setOrgContextMode(scope?.orgContextMode ?? (scope ? "select" : "user-membership"));
      setSelectedOrg(
        scope?.organization
          ? (SCOPE_ORG_OPTIONS.find((o) => o.label === scope.organization)?.value ?? "")
          : "",
      );
      setInclusionMode(scope?.inclusionMode ?? "only");
      setAccessRoleContext(scope?.accessRoleContext ?? "org");
      setAccessRoleMode(scope?.accessRoleMode ?? "all");
      setAccessRoleIds(scope?.accessRoleIds ?? []);
    }
  }, [open, scope]);

  // Access roles can be custom-selected either when scoped to a specific,
  // manually-selected organization, or when the context is "Any access
  // role" (system-wide list, not tied to an organization). Only when the
  // org context is the user's own membership org is custom selection not
  // meaningful, so we force "All access roles" in that case. When "No
  // access roles" is chosen, the picker is hidden entirely.
  const allowCustomAccessRoles =
    accessRoleContext === "any" || (accessRoleContext === "org" && orgContextMode === "select");
  useEffect(() => {
    if (accessRoleContext === "none") {
      if (accessRoleMode !== "custom" || accessRoleIds.length > 0) {
        setAccessRoleMode("custom");
        setAccessRoleIds([]);
      }
      return;
    }
    if (!allowCustomAccessRoles && accessRoleMode !== "all") {
      setAccessRoleMode("all");
      setAccessRoleIds([]);
    }
  }, [accessRoleContext, allowCustomAccessRoles, accessRoleMode, accessRoleIds]);

  const selectedOrgLabel = SCOPE_ORG_OPTIONS.find((o) => o.value === selectedOrg)?.label ?? "";

  const toggleRole = (id: string) => {
    setAccessRoleIds((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id],
    );
  };

  const [confirmOpen, setConfirmOpen] = useState(false);

  const canSave =
    name.trim() && (orgContextMode === "user-membership" || selectedOrg);

  const handleSaveClick = () => {
    if (!canSave) return;
    if (isEditing) {
      setConfirmOpen(true); // show warning before committing
    } else {
      commitSave();
    }
  };

  const commitSave = () => {
    onSave({
      name: name.trim(),
      description: description.trim(),
      organization: orgContextMode === "user-membership" ? USER_MEMBERSHIP_ORG_LABEL : selectedOrgLabel,
      inclusionMode,
      accessRoleMode,
      accessRoleIds: accessRoleMode === "custom" ? accessRoleIds : [],
      orgContextMode,
      accessRoleContext,
    });
    setConfirmOpen(false);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[500px] sm:max-w-[500px] p-0 flex flex-col gap-0"
      >
        {/* Header */}
        <SheetHeader className="px-6 py-5 border-b border-bluegrey-100 flex-row items-center justify-between space-y-0">
          <SheetTitle className="text-lg font-semibold text-bluegrey-900">
            {isEditing ? "Edit Scope" : "Create Scope"}
          </SheetTitle>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1.5 rounded hover:bg-bluegrey-50 text-bluegrey-500 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </SheetHeader>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Scope Name */}
          <div className="space-y-1.5">
            <Label htmlFor="scope-name" className="text-sm font-medium text-bluegrey-900">
              Scope Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="scope-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter scope name"
            />
          </div>

          {/* Org context */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-bluegrey-900">
              Org context <span className="text-red-500">*</span>
            </Label>
            <RadioGroup
              value={orgContextMode}
              onValueChange={(v) => setOrgContextMode(v as ScopeOrgContextMode)}
              className="space-y-2"
            >
              <div className="flex items-center gap-2.5">
                <RadioGroupItem value="user-membership" id="org-context-membership" />
                <Label
                  htmlFor="org-context-membership"
                  className="text-sm font-normal text-bluegrey-900 cursor-pointer"
                >
                  User membership org
                </Label>
              </div>
              <div className="flex items-center gap-2.5">
                <RadioGroupItem value="select" id="org-context-select" />
                <Label
                  htmlFor="org-context-select"
                  className="text-sm font-normal text-bluegrey-900 cursor-pointer"
                >
                  Select the org
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Organization — only shown when "Select the org" is chosen */}
          {orgContextMode === "select" && (
            <div className="space-y-1.5">
              <Label htmlFor="scope-org" className="text-sm font-medium text-bluegrey-900">
                Organization <span className="text-red-500">*</span>
              </Label>
              <Select value={selectedOrg} onValueChange={setSelectedOrg}>
                <SelectTrigger id="scope-org">
                  <SelectValue placeholder="Select organization" />
                </SelectTrigger>
                <SelectContent>
                  {SCOPE_ORG_OPTIONS.map((org) => (
                    <SelectItem key={org.value} value={org.value}>
                      {org.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Inclusion mode — shown once an org is picked */}
          {orgContextMode === "select" && selectedOrg && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-bluegrey-900">
                Select organizations to include
              </p>
              <RadioGroup
                value={inclusionMode}
                onValueChange={(v) => setInclusionMode(v as ScopeInclusionMode)}
                className="space-y-3"
              >
                {INCLUSION_MODES.map((mode) => (
                  <div key={mode} className="flex items-center gap-3">
                    <RadioGroupItem value={mode} id={`inclusion-${mode}-v2`} />
                    <Label
                      htmlFor={`inclusion-${mode}-v2`}
                      className="text-sm font-normal text-bluegrey-900 cursor-pointer leading-snug"
                    >
                      {inclusionLabel(mode, selectedOrgLabel)}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Access role context */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-bluegrey-900">
              Access role context <span className="text-red-500">*</span>
            </Label>
            <RadioGroup
              value={accessRoleContext}
              onValueChange={(v) => setAccessRoleContext(v as ScopeAccessRoleContext)}
              className="space-y-2"
            >
              <div className="flex items-center gap-2.5">
                <RadioGroupItem value="org" id="access-role-context-org" />
                <Label
                  htmlFor="access-role-context-org"
                  className="text-sm font-normal text-bluegrey-900 cursor-pointer"
                >
                  Access role from organization
                </Label>
              </div>
              <div className="flex items-center gap-2.5">
                <RadioGroupItem value="any" id="access-role-context-any" />
                <Label
                  htmlFor="access-role-context-any"
                  className="text-sm font-normal text-bluegrey-900 cursor-pointer"
                >
                  Any access role
                </Label>
              </div>
              <div className="flex items-center gap-2.5">
                <RadioGroupItem value="none" id="access-role-context-none" />
                <Label
                  htmlFor="access-role-context-none"
                  className="text-sm font-normal text-bluegrey-900 cursor-pointer"
                >
                  No access roles
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Access roles in scope */}
          {accessRoleContext === "none" ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-bluegrey-900">Access roles in scope</p>
              <div className="flex items-start gap-2 rounded-md border border-bluegrey-200 bg-bluegrey-25 px-3 py-2.5">
                <Info className="w-4 h-4 text-bluegrey-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-bluegrey-600">
                  No access roles will be granted through this scope.
                </p>
              </div>
            </div>
          ) : (
            <AccessRolesSection
              mode={accessRoleMode}
              selectedIds={accessRoleIds}
              onModeChange={(m) => {
                setAccessRoleMode(m);
                if (m === "all") setAccessRoleIds([]);
              }}
              onToggle={toggleRole}
              allowCustom={allowCustomAccessRoles}
              lockedMessage="All access roles available within the user's membership organization."
              sourceNote={
                accessRoleContext === "any"
                  ? "Showing every access role in the system — not limited to an organization."
                  : orgContextMode === "select"
                    ? `Showing access roles available in ${selectedOrgLabel || "the selected organization"}.`
                    : undefined
              }
            />
          )}

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="scope-description" className="text-sm font-medium text-bluegrey-900">
              Description
            </Label>
            <Textarea
              id="scope-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the scope"
              rows={3}
            />
          </div>
        </div>

        {/* Footer */}
        <SheetFooter className="px-6 py-4 border-t border-bluegrey-100 flex flex-row justify-end gap-2 sm:space-x-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveClick} disabled={!canSave}>
            {isEditing ? "Save changes" : "Create Scope"}
          </Button>
        </SheetFooter>
      </SheetContent>

      {/* Save confirmation dialog */}
      {confirmOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setConfirmOpen(false)}
          />
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
                  Updating the access roles in this scope may affect all administrators
                  and policies that reference it.
                </p>
                <p className="text-sm text-bluegrey-600 mt-2">
                  Please review your changes carefully before proceeding.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                Go back
              </Button>
              <Button
                className="bg-amber-600 hover:bg-amber-700 text-white"
                onClick={commitSave}
              >
                I understand, save changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </Sheet>
  );
}
