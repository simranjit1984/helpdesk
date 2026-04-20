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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { type AdminRole, PERMISSION_GROUPS } from "./mockData";

interface AdminRoleDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: AdminRole | null;
  onSave: (role: Omit<AdminRole, "id" | "createdDate">) => void;
}

export default function AdminRoleDrawer({
  open,
  onOpenChange,
  role,
  onSave,
}: AdminRoleDrawerProps) {
  const isEditing = role !== null;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setName(role?.name ?? "");
      setDescription(role?.description ?? "");
      setSelectedPermissions(role?.permissions ?? []);
    }
  }, [open, role]);

  const handlePermissionToggle = (permission: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission],
    );
  };

  const handleGroupToggle = (permissions: string[]) => {
    const allSelected = permissions.every((p) =>
      selectedPermissions.includes(p),
    );
    if (allSelected) {
      setSelectedPermissions((prev) =>
        prev.filter((p) => !permissions.includes(p)),
      );
    } else {
      setSelectedPermissions((prev) => [
        ...prev,
        ...permissions.filter((p) => !prev.includes(p)),
      ]);
    }
  };

  const getGroupState = (
    permissions: string[],
  ): "checked" | "unchecked" | "indeterminate" => {
    const selected = permissions.filter((p) =>
      selectedPermissions.includes(p),
    ).length;
    if (selected === 0) return "unchecked";
    if (selected === permissions.length) return "checked";
    return "indeterminate";
  };

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), description: description.trim(), permissions: selectedPermissions });
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
            {isEditing ? "Edit Role" : "Create Role"}
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
            <Label htmlFor="role-name" className="text-sm font-medium text-bluegrey-900">
              Role Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="role-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter role name"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="role-description" className="text-sm font-medium text-bluegrey-900">
              Description
            </Label>
            <Textarea
              id="role-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this role can do"
              rows={3}
            />
          </div>

          {/* Permissions */}
          <div className="space-y-4">
            <p className="text-sm font-medium text-bluegrey-900">Permissions</p>
            {PERMISSION_GROUPS.map((group) => {
              const state = getGroupState(group.permissions);
              return (
                <div key={group.group} className="space-y-2">
                  {/* Group header checkbox */}
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`group-${group.group}`}
                      checked={state === "checked"}
                      data-state={state}
                      onCheckedChange={() => handleGroupToggle(group.permissions)}
                      className={cn(
                        state === "indeterminate" && "data-[state=indeterminate]:bg-blue-600 data-[state=indeterminate]:border-blue-600",
                      )}
                    />
                    <Label
                      htmlFor={`group-${group.group}`}
                      className="text-sm font-semibold text-bluegrey-900 cursor-pointer"
                    >
                      {group.group}
                    </Label>
                  </div>
                  {/* Individual permissions */}
                  <div className="ml-6 space-y-2">
                    {group.permissions.map((permission) => (
                      <div key={permission} className="flex items-center gap-2">
                        <Checkbox
                          id={`perm-${permission}`}
                          checked={selectedPermissions.includes(permission)}
                          onCheckedChange={() => handlePermissionToggle(permission)}
                        />
                        <Label
                          htmlFor={`perm-${permission}`}
                          className="text-sm text-bluegrey-700 font-normal cursor-pointer"
                        >
                          {permission}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <SheetFooter className="px-6 py-4 border-t border-bluegrey-100 flex flex-row justify-end gap-2 sm:space-x-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            {isEditing ? "Save changes" : "Create Role"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
