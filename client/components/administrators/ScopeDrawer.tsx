import { useState, useEffect } from "react";
import { X } from "lucide-react";
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
import { type Scope, type ScopeInclusionMode, SCOPE_ORG_OPTIONS } from "./mockData";

interface ScopeDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scope: Scope | null;
  onSave: (scope: Omit<Scope, "id">) => void;
}

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

export default function ScopeDrawer({
  open,
  onOpenChange,
  scope,
  onSave,
}: ScopeDrawerProps) {
  const isEditing = scope !== null;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<Scope["type"]>("Global");
  const [selectedOrg, setSelectedOrg] = useState("");
  const [inclusionMode, setInclusionMode] = useState<ScopeInclusionMode>("only");

  useEffect(() => {
    if (open) {
      setName(scope?.name ?? "");
      setDescription(scope?.description ?? "");
      setType(scope?.type ?? "Global");
      setSelectedOrg(
        scope?.organization
          ? (SCOPE_ORG_OPTIONS.find((o) => o.label === scope.organization)?.value ?? "")
          : "",
      );
      setInclusionMode(scope?.inclusionMode ?? "only");
    }
  }, [open, scope]);

  const handleTypeChange = (val: string) => {
    setType(val as Scope["type"]);
    if (val === "Global") {
      setSelectedOrg("");
      setInclusionMode("only");
    }
  };

  const selectedOrgLabel =
    SCOPE_ORG_OPTIONS.find((o) => o.value === selectedOrg)?.label ?? "";

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      description: description.trim(),
      type,
      organization: type === "Organization" ? selectedOrgLabel : undefined,
      inclusionMode: type === "Organization" ? inclusionMode : undefined,
    });
    onOpenChange(false);
  };

  const canSave = name.trim() && (type === "Global" || (type === "Organization" && selectedOrg));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[480px] sm:max-w-[480px] p-0 flex flex-col gap-0"
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

          {/* Scope Type */}
          <div className="space-y-1.5">
            <Label htmlFor="scope-type" className="text-sm font-medium text-bluegrey-900">
              Scope Type
            </Label>
            <Select value={type} onValueChange={handleTypeChange}>
              <SelectTrigger id="scope-type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Global">Global</SelectItem>
                <SelectItem value="Organization">Organization</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Organization-specific fields */}
          {type === "Organization" && (
            <>
              {/* Organization picker */}
              <div className="space-y-1.5">
                <Label htmlFor="scope-org" className="text-sm font-medium text-bluegrey-900">
                  Organization
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

              {/* Inclusion mode — shown once an org is picked */}
              {selectedOrg && (
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
                        <RadioGroupItem value={mode} id={`inclusion-${mode}`} />
                        <Label
                          htmlFor={`inclusion-${mode}`}
                          className="text-sm font-normal text-bluegrey-900 cursor-pointer leading-snug"
                        >
                          {inclusionLabel(mode, selectedOrgLabel)}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}
            </>
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
          <Button onClick={handleSave} disabled={!canSave}>
            {isEditing ? "Save changes" : "Create Scope"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
