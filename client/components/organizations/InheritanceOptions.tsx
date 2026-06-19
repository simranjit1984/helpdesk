import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";

export interface ChildOrg {
  id: string;
  name: string;
  referenceId: string;
}

export type InheritMode = "none" | "all" | "selected";

interface Props {
  enabled: boolean;
  onEnabledChange: (v: boolean) => void;
  inheritMode: InheritMode;
  onInheritModeChange: (mode: InheritMode) => void;
  childOrgs: ChildOrg[];
  selectedChildren: string[];
  onSelectedChildrenChange: (ids: string[]) => void;
}

const INHERIT_OPTIONS: { value: InheritMode; label: string; description: string }[] = [
  {
    value: "none",
    label: "No inheritance",
    description: "Roles are assigned to this organization only.",
  },
  {
    value: "all",
    label: "Inherit to all children",
    description: "All child organizations will automatically receive the same roles.",
  },
  {
    value: "selected",
    label: "Inherit to selected children",
    description: "Choose which child organizations should receive these roles.",
  },
];

export default function InheritanceOptions({
  enabled,
  onEnabledChange,
  inheritMode,
  onInheritModeChange,
  childOrgs,
  selectedChildren,
  onSelectedChildrenChange,
}: Props) {
  const toggleChild = (id: string) => {
    if (selectedChildren.includes(id)) {
      onSelectedChildrenChange(selectedChildren.filter((c) => c !== id));
    } else {
      onSelectedChildrenChange([...selectedChildren, id]);
    }
  };

  return (
    <div className="rounded-lg border border-bluegrey-200 bg-white overflow-hidden">
      {/* Header row with toggle */}
      <div className="flex items-center justify-between px-4 py-3 bg-bluegrey-50 border-b border-bluegrey-200">
        <div>
          <p className="text-sm font-semibold text-bluegrey-900">Inheritance options</p>
          <p className="text-xs text-bluegrey-500 mt-0.5">
            Propagate selected roles to child organizations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-bluegrey-500">{enabled ? "On" : "Off"}</span>
          <Switch
            checked={enabled}
            onCheckedChange={onEnabledChange}
            aria-label="Inherit to child organizations"
          />
        </div>
      </div>

      {enabled && (
        <div className="px-4 py-4 space-y-3">
          {/* Radio options */}
          <div className="space-y-2">
            {INHERIT_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  inheritMode === opt.value
                    ? "border-blue-500 bg-blue-50"
                    : "border-bluegrey-200 hover:border-blue-300 hover:bg-blue-50/30"
                }`}
              >
                <input
                  type="radio"
                  name="inherit-mode"
                  value={opt.value}
                  checked={inheritMode === opt.value}
                  onChange={() => onInheritModeChange(opt.value)}
                  className="mt-0.5 w-4 h-4 accent-blue-600 cursor-pointer flex-shrink-0"
                />
                <div className="min-w-0">
                  <span className="text-sm font-medium text-bluegrey-900 block">
                    {opt.label}
                  </span>
                  <span className="text-xs text-bluegrey-500">{opt.description}</span>
                </div>
              </label>
            ))}
          </div>

          {/* Child org selector */}
          {inheritMode === "selected" && (
            <div className="ml-1 mt-1 rounded-lg border border-bluegrey-200 bg-bluegrey-25 overflow-hidden">
              <div className="px-3 py-2 border-b border-bluegrey-200 bg-white flex items-center justify-between">
                <span className="text-xs font-semibold text-bluegrey-600 uppercase tracking-wide">
                  Select child organizations
                </span>
                <span className="text-xs text-bluegrey-400">
                  {selectedChildren.length} of {childOrgs.length} selected
                </span>
              </div>

              {childOrgs.length === 0 ? (
                <p className="text-xs text-bluegrey-400 italic px-3 py-3">
                  No child organizations available.
                </p>
              ) : (
                <div className="divide-y divide-bluegrey-100">
                  {/* Select all */}
                  <label className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-white transition-colors">
                    <Checkbox
                      id="select-all-children"
                      checked={selectedChildren.length === childOrgs.length}
                      onCheckedChange={(v) =>
                        onSelectedChildrenChange(
                          v === true ? childOrgs.map((c) => c.id) : []
                        )
                      }
                    />
                    <span className="text-xs font-semibold text-bluegrey-700">
                      Select all
                    </span>
                  </label>

                  {childOrgs.map((child) => (
                    <label
                      key={child.id}
                      className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-white transition-colors"
                    >
                      <Checkbox
                        id={`child-${child.id}`}
                        checked={selectedChildren.includes(child.id)}
                        onCheckedChange={() => toggleChild(child.id)}
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-sm text-bluegrey-900 block leading-tight">
                          {child.name}
                        </span>
                        <span className="text-[10px] text-bluegrey-400">
                          {child.referenceId}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
