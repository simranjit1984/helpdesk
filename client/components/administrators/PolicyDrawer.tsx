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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MultiSelect } from "@/components/ui/multi-select";
import { type AssignablePolicy, POLICY_ROLE_OPTIONS, POLICY_TAG_OPTIONS } from "./mockData";

type PolicyMode = "all" | "delegatable" | "advanced";

interface PolicyDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  policy: AssignablePolicy | null;
  onSave: (policy: Omit<AssignablePolicy, "id">) => void;
}

function modeFromRuleType(ruleType: AssignablePolicy["ruleType"]): PolicyMode {
  if (ruleType === "All") return "all";
  if (ruleType === "Tag-based") return "delegatable";
  return "advanced";
}

function ruleTypeFromMode(mode: PolicyMode): AssignablePolicy["ruleType"] {
  if (mode === "all") return "All";
  if (mode === "delegatable") return "Tag-based";
  return "Custom";
}

export default function PolicyDrawer({
  open,
  onOpenChange,
  policy,
  onSave,
}: PolicyDrawerProps) {
  const isEditing = policy !== null;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [mode, setMode] = useState<PolicyMode>("all");
  const [includeTags, setIncludeTags] = useState<string[]>([]);
  const [excludeRoles, setExcludeRoles] = useState<string[]>([]);
  const [specificRoles, setSpecificRoles] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setName(policy?.name ?? "");
      setDescription(policy?.description ?? "");
      setMode(policy ? modeFromRuleType(policy.ruleType) : "all");
      setIncludeTags([]);
      setExcludeRoles([]);
      setSpecificRoles(
        (policy?.allowedRoles ?? []).map((label) => {
          const opt = POLICY_ROLE_OPTIONS.find(
            (o) => o.label === label || o.value === label,
          );
          return opt ? opt.value : label;
        }),
      );
    }
  }, [open, policy]);

  const handleSave = () => {
    if (!name.trim()) return;
    const allowedRoles = specificRoles.map(
      (val) =>
        POLICY_ROLE_OPTIONS.find((o) => o.value === val)?.label ?? val,
    );
    onSave({
      name: name.trim(),
      description: description.trim(),
      ruleType: ruleTypeFromMode(mode),
      allowedRoles: mode === "all" ? POLICY_ROLE_OPTIONS.map((o) => o.label) : allowedRoles,
    });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[480px] sm:max-w-[480px] p-0 flex flex-col gap-0"
      >
        {/* Header */}
        <SheetHeader className="px-6 py-5 border-b border-bluegrey-100 flex-row items-center justify-between space-y-0">
          <SheetTitle className="text-lg font-semibold text-bluegrey-900">
            {isEditing ? "Edit Policy" : "Create Policy"}
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
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="policy-name" className="text-sm font-medium text-bluegrey-900">
              Policy Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="policy-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter policy name"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="policy-description" className="text-sm font-medium text-bluegrey-900">
              Description
            </Label>
            <Textarea
              id="policy-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the policy"
              rows={3}
            />
          </div>

          {/* Policy mode */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-bluegrey-900">Policy Rule</p>
            <RadioGroup
              value={mode}
              onValueChange={(val) => setMode(val as PolicyMode)}
              className="space-y-3"
            >
              {/* Simple — All */}
              <div className="flex items-start gap-3 p-4 rounded border border-bluegrey-200 cursor-pointer hover:bg-bluegrey-25">
                <RadioGroupItem value="all" id="mode-all" className="mt-0.5" />
                <div>
                  <Label htmlFor="mode-all" className="text-sm font-medium text-bluegrey-900 cursor-pointer">
                    Allow all roles
                  </Label>
                  <p className="text-xs text-bluegrey-500 mt-0.5">
                    All administrator roles can be assigned without restriction.
                  </p>
                </div>
              </div>

              {/* Tag-based — Delegatable */}
              <div className="flex items-start gap-3 p-4 rounded border border-bluegrey-200 cursor-pointer hover:bg-bluegrey-25">
                <RadioGroupItem value="delegatable" id="mode-delegatable" className="mt-0.5" />
                <div>
                  <Label htmlFor="mode-delegatable" className="text-sm font-medium text-bluegrey-900 cursor-pointer">
                    Delegatable roles only
                  </Label>
                  <p className="text-xs text-bluegrey-500 mt-0.5">
                    Only roles tagged as delegatable can be assigned.
                  </p>
                </div>
              </div>

              {/* Advanced */}
              <div className="flex items-start gap-3 p-4 rounded border border-bluegrey-200 cursor-pointer hover:bg-bluegrey-25">
                <RadioGroupItem value="advanced" id="mode-advanced" className="mt-0.5" />
                <div>
                  <Label htmlFor="mode-advanced" className="text-sm font-medium text-bluegrey-900 cursor-pointer">
                    Advanced configuration
                  </Label>
                  <p className="text-xs text-bluegrey-500 mt-0.5">
                    Fine-grained control using tags, role inclusion, and exclusion lists.
                  </p>
                </div>
              </div>
            </RadioGroup>

            {/* Advanced config fields */}
            {mode === "advanced" && (
              <div className="space-y-4 mt-2 pl-1">
                <MultiSelect
                  label="Include by Tags"
                  options={POLICY_TAG_OPTIONS}
                  selectedValues={includeTags}
                  onChange={setIncludeTags}
                  placeholder="Select tags..."
                />
                <MultiSelect
                  label="Specific Roles"
                  options={POLICY_ROLE_OPTIONS}
                  selectedValues={specificRoles}
                  onChange={setSpecificRoles}
                  placeholder="Select roles to allow..."
                />
                <MultiSelect
                  label="Exclude Roles"
                  options={POLICY_ROLE_OPTIONS}
                  selectedValues={excludeRoles}
                  onChange={setExcludeRoles}
                  placeholder="Select roles to exclude..."
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <SheetFooter className="px-6 py-4 border-t border-bluegrey-100 flex flex-row justify-end gap-2 sm:space-x-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            {isEditing ? "Save changes" : "Create Policy"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
