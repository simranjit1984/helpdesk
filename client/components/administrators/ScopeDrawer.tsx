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
import { MultiSelect } from "@/components/ui/multi-select";
import { type Scope, SCOPE_ENTITY_OPTIONS } from "./mockData";

interface ScopeDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scope: Scope | null;
  onSave: (scope: Omit<Scope, "id">) => void;
}

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
  const [selectedEntities, setSelectedEntities] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setName(scope?.name ?? "");
      setDescription(scope?.description ?? "");
      setType(scope?.type ?? "Global");
      // Map entity labels back to option values
      const entityValues = (scope?.entities ?? []).map((label) => {
        const opt = SCOPE_ENTITY_OPTIONS.find(
          (o) => o.label === label || o.value === label,
        );
        return opt ? opt.value : label;
      });
      setSelectedEntities(entityValues);
    }
  }, [open, scope]);

  const handleTypeChange = (val: string) => {
    setType(val as Scope["type"]);
    if (val === "Global") setSelectedEntities([]);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    const entityLabels = selectedEntities.map(
      (val) =>
        SCOPE_ENTITY_OPTIONS.find((o) => o.value === val)?.label ?? val,
    );
    onSave({
      name: name.trim(),
      description: description.trim(),
      type,
      entities: type === "Global" ? [] : entityLabels,
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
          {/* Name */}
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

          {/* Type */}
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
                <SelectItem value="Group">Group</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Entities — only when not Global */}
          {type !== "Global" && (
            <div className="space-y-1.5">
              <MultiSelect
                label={type === "Organization" ? "Organizations" : "Groups"}
                options={SCOPE_ENTITY_OPTIONS}
                selectedValues={selectedEntities}
                onChange={setSelectedEntities}
                placeholder={`Select ${type === "Organization" ? "organizations" : "groups"}...`}
              />
            </div>
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
          <Button onClick={handleSave} disabled={!name.trim()}>
            {isEditing ? "Save changes" : "Create Scope"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
