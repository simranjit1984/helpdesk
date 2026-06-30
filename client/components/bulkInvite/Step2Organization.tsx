import { useState } from "react";
import { Search, Building2 } from "lucide-react";
import { baseOrganizations } from "@/components/OrganizationsTable";

interface OrgOption { id: string; name: string; referenceId: string; }

// Flatten the org tree into a flat list for selection
function flattenOrgs(): OrgOption[] {
  const result: OrgOption[] = [];
  baseOrganizations.forEach((org) => {
    result.push({ id: org.id, name: org.name, referenceId: org.referenceId });
    org.children?.forEach((child) => {
      result.push({ id: child.id, name: `${org.name} › ${child.name}`, referenceId: child.referenceId });
    });
  });
  return result;
}

interface Props {
  selectedOrgId: string;
  onChange: (id: string, name: string) => void;
}

export default function Step2Organization({ selectedOrgId, onChange }: Props) {
  const [search, setSearch] = useState("");
  const orgs = flattenOrgs();

  const filtered = orgs.filter(
    (o) =>
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.referenceId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-bluegrey-900">Select organization</h2>
        <p className="text-sm text-bluegrey-500 mt-1">
          Every user in this bulk invitation will be assigned to the selected organization.
          Only organizations within your delegated scope are shown.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bluegrey-400" />
        <input
          type="text"
          placeholder="Search organizations…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 border border-bluegrey-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
      </div>

      {/* Org list */}
      <div className="rounded-md border border-bluegrey-200 overflow-hidden max-h-72 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-bluegrey-400 italic">
            No organizations match your search.
          </div>
        ) : (
          <div className="divide-y divide-bluegrey-100">
            {filtered.map((org) => (
              <label
                key={org.id}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                  selectedOrgId === org.id
                    ? "bg-blue-50 border-l-2 border-l-blue-500"
                    : "hover:bg-bluegrey-25"
                }`}
              >
                <input
                  type="radio"
                  name="org-select"
                  value={org.id}
                  checked={selectedOrgId === org.id}
                  onChange={() => onChange(org.id, org.name)}
                  className="w-4 h-4 accent-blue-600 flex-shrink-0"
                />
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-4 h-4 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-bluegrey-900 truncate">{org.name}</p>
                  <p className="text-xs text-bluegrey-400">{org.referenceId}</p>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {selectedOrgId && (
        <p className="text-sm text-green-700 font-medium">
          ✓ Selected:{" "}
          {orgs.find((o) => o.id === selectedOrgId)?.name}
        </p>
      )}
    </div>
  );
}
