import { MOCK_ADMIN_ROLES } from "@/components/administrators/mockData";

interface Props {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export default function Step4AdminRoles({ selectedIds, onChange }: Props) {
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
        <h2 className="text-lg font-semibold text-bluegrey-900">Assign admin roles</h2>
        <p className="text-sm text-bluegrey-500 mt-1">
          Optionally assign admin roles to every invited user. This step is optional — you can
          skip it if no admin roles are required.
        </p>
      </div>

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
              <th className="text-left px-3 py-2 text-xs font-semibold text-bluegrey-500 uppercase tracking-wide">
                Permissions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-bluegrey-100">
            {MOCK_ADMIN_ROLES.map((role) => {
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
                  <td className="px-3 py-3 text-bluegrey-500">{role.description}</td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 3).map((p) => (
                        <span
                          key={p}
                          className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-bluegrey-100 text-bluegrey-600"
                        >
                          {p}
                        </span>
                      ))}
                      {role.permissions.length > 3 && (
                        <span className="text-[10px] text-bluegrey-400">
                          +{role.permissions.length - 3} more
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedIds.length > 0 ? (
        <p className="text-sm text-blue-700 font-medium">
          {selectedIds.length} admin role{selectedIds.length !== 1 ? "s" : ""} selected
        </p>
      ) : (
        <p className="text-xs text-bluegrey-400">
          No admin roles selected — this step is optional.
        </p>
      )}
    </div>
  );
}
