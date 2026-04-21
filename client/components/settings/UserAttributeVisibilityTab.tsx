import { useState } from "react";
import { GripVertical, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

interface AttributeItem {
  id: string;
  label: string;
  visible: boolean;
}

const DEFAULT_ATTRIBUTES: AttributeItem[] = [
  { id: "firstName", label: "First name", visible: true },
  { id: "lastName", label: "Last name", visible: true },
  { id: "email", label: "Email", visible: true },
  { id: "phoneNumber", label: "Phone number", visible: true },
  { id: "status", label: "Status", visible: true },
  { id: "organization", label: "Organization", visible: true },
  { id: "createdAt", label: "Created at", visible: false },
  { id: "lastLogin", label: "Last login", visible: false },
  { id: "externalId", label: "External ID", visible: false },
];

export default function UserAttributeVisibilityTab() {
  const [attributes, setAttributes] = useState<AttributeItem[]>(DEFAULT_ATTRIBUTES);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const toggleVisibility = (id: string) => {
    setAttributes((prev) =>
      prev.map((attr) => (attr.id === id ? { ...attr, visible: !attr.visible } : attr))
    );
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggingId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverId(id);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggingId || draggingId === targetId) {
      setDragOverId(null);
      setDraggingId(null);
      return;
    }

    setAttributes((prev) => {
      const fromIndex = prev.findIndex((a) => a.id === draggingId);
      const toIndex = prev.findIndex((a) => a.id === targetId);
      const reordered = [...prev];
      const [moved] = reordered.splice(fromIndex, 1);
      reordered.splice(toIndex, 0, moved);
      return reordered;
    });

    setDragOverId(null);
    setDraggingId(null);
  };

  const handleDragEnd = () => {
    setDragOverId(null);
    setDraggingId(null);
  };

  const handleSave = () => {
    // In a real app this would call an API
  };

  const handleCancel = () => {
    setAttributes(DEFAULT_ATTRIBUTES);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6">
      <div>
        <h2 className="text-xl font-medium text-bluegrey-900 mb-2">
          User attribute visibility and order
        </h2>
        <p className="text-sm text-bluegrey-600 mb-6">
          Configure which user attributes are visible and the order in which they appear on user
          detail and invite pages.
        </p>

        {/* Table */}
        <div className="border border-bluegrey-200 rounded-md overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[40px_1fr_120px] bg-bluegrey-50 border-b border-bluegrey-200">
            <div className="px-3 py-3" />
            <div className="px-4 py-3 text-xs font-medium text-bluegrey-600 uppercase tracking-wide">
              Attribute
            </div>
            <div className="px-4 py-3 text-xs font-medium text-bluegrey-600 uppercase tracking-wide text-center">
              Visible
            </div>
          </div>

          {/* Rows */}
          {attributes.map((attr) => (
            <div
              key={attr.id}
              draggable
              onDragStart={(e) => handleDragStart(e, attr.id)}
              onDragOver={(e) => handleDragOver(e, attr.id)}
              onDrop={(e) => handleDrop(e, attr.id)}
              onDragEnd={handleDragEnd}
              className={`grid grid-cols-[40px_1fr_120px] border-b border-bluegrey-100 last:border-b-0 transition-colors ${
                dragOverId === attr.id && draggingId !== attr.id
                  ? "bg-blue-50"
                  : draggingId === attr.id
                  ? "bg-bluegrey-50 opacity-60"
                  : "bg-white hover:bg-bluegrey-25"
              }`}
            >
              {/* Drag handle */}
              <div className="flex items-center justify-center cursor-grab active:cursor-grabbing text-bluegrey-400">
                <GripVertical className="w-4 h-4" />
              </div>

              {/* Label */}
              <div className="px-4 py-3 flex items-center">
                <span className="text-sm text-bluegrey-900">{attr.label}</span>
              </div>

              {/* Visibility toggle */}
              <div className="px-4 py-3 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => toggleVisibility(attr.id)}
                  className={`p-1 rounded transition-colors ${
                    attr.visible
                      ? "text-blue-600 hover:text-blue-800"
                      : "text-bluegrey-400 hover:text-bluegrey-600"
                  }`}
                  aria-label={attr.visible ? `Hide ${attr.label}` : `Show ${attr.label}`}
                >
                  {attr.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        <Button onClick={handleSave} className="gap-2">
          <Save className="w-4 h-4" />
          Save
        </Button>
        <Button variant="ghost" onClick={handleCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
