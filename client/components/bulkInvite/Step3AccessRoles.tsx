import { useState } from "react";
import { Search } from "lucide-react";
import { ALL_ACCESS_ROLES } from "@/components/organizations/accessRolesMockData";

interface Props {
  selectedOrgId: string;
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export default function Step3AccessRoles({ selectedIds, onChange }: Props) {
  const [search, setSearch] = useState("");

  const roles = ALL_ACCESS_ROLES.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (id: string) => {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((x) => x !== id)
        : [...selectedIds, id]
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-bluegrey-900">Assign access roles</h2>
        <p className="text-sm text-bluegrey-500 mt-1">
          Select one or more access roles. Every invited user will receive the selected roles.
          You may also skip this step and assign roles later.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bluegrey-400" />
        <input
          type="text"
          placeholder="Search access roles…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 border border-bluegrey-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
      </div>

      {/* Roles table */}
      <div className="rounded-md border border-bluegrey-200 overflow-hidden">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-bluegrey-50 border-b border-bluegrey-200">
              <th className="w-10 px-3 py-2" />
              <th className="text-left px-3 py-2 text-xs font-semibold text-bluegrey-500 uppercase tracking-wide">
                Role name
              </th>
              <th className="text-left px-3 py-2 text-xs font-semibold text-bluegrey-500 uppercase tracking-wide">
                Description
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-bluegrey-100">
            {roles.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-3 py-6 text-center text-sm text-bluegrey-400 italic">
                  No roles found.
                </td>
              </tr>
            ) : (
              roles.map((role) => {
                const checked = selectedIds.includes(role.id);
                return (
                  <tr
                    key={role.id}
                    onClick={() => toggle(role.id)}
                    className={`cursor-pointer transition-colors ${checked ? "bg-blue-50" : "hover:bg-bluegrey-25"}`}
                  >
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(role.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 accent-blue-600"
                      />
                    </td>
                    <td className="px-3 py-3 font-medium text-bluegrey-900">{role.name}</td>
                    <td className="px-3 py-3 text-bluegrey-500">{role.description || "—"}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {selectedIds.length > 0 && (
        <p className="text-sm text-blue-700 font-medium">
          {selectedIds.length} role{selectedIds.length !== 1 ? "s" : ""} selected
        </p>
      )}
      {selectedIds.length === 0 && (
        <p className="text-xs text-bluegrey-400">
          No roles selected — you can skip this step and assign roles later.
        </p>
      )}
    </div>
  );
}
