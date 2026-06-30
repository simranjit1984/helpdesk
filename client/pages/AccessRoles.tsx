import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, MoreVertical, CheckCircle2, Layers } from "lucide-react";
import Layout from "@/components/Layout";
import PageHeader from "@/components/PageHeader";
import { AIAssistant } from "@/components/aiAssistant/AIAssistant";

// ─── Types & mock data ────────────────────────────────────────────────────────

export interface AccessRoleRecord {
  id: string;
  name: string;
  externalId: string;
  type: string;
  status: "active" | "inactive";
  description: string;
}

export const ACCESS_ROLE_RECORDS: AccessRoleRecord[] = [
  { id: "ar-1", name: "General Partner User",  externalId: "", type: "", status: "active",   description: "" },
  { id: "ar-2", name: "Limited Partner User",  externalId: "", type: "", status: "active",   description: "" },
  { id: "ar-3", name: "Sales general",         externalId: "", type: "", status: "active",   description: "" },
  { id: "ar-4", name: "Finance group",         externalId: "", type: "", status: "active",   description: "For finance group" },
  { id: "ar-5", name: "Normal_User_K",         externalId: "", type: "", status: "inactive", description: "" },
  { id: "ar-6", name: "Admin Access",          externalId: "", type: "", status: "active",   description: "" },
  { id: "ar-7", name: "Read Only",             externalId: "", type: "", status: "active",   description: "" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: "active" | "inactive" }) {
  if (status === "active") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
        <CheckCircle2 className="w-3 h-3" />
        Active
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-bluegrey-100 text-bluegrey-500 border border-bluegrey-200">
      Inactive
    </span>
  );
}

// ─── Row dropdown menu ────────────────────────────────────────────────────────

function RowMenu({
  role,
  onToggleStatus,
}: {
  role: AccessRoleRecord;
  onToggleStatus: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="p-1 rounded hover:bg-bluegrey-100 transition-colors"
      >
        <MoreVertical className="w-4 h-4 text-bluegrey-500" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-7 z-20 bg-white border border-bluegrey-200 rounded-md shadow-lg py-1 min-w-[160px]">
            <button
              type="button"
              onClick={() => { setOpen(false); navigate(`/access-roles/${role.id}`); }}
              className="w-full text-left px-4 py-2 text-sm text-bluegrey-700 hover:bg-bluegrey-50 transition-colors"
            >
              View role details
            </button>
            <button
              type="button"
              onClick={() => { setOpen(false); onToggleStatus(role.id); }}
              className="w-full text-left px-4 py-2 text-sm text-bluegrey-700 hover:bg-bluegrey-50 transition-colors"
            >
              {role.status === "active" ? "Set to inactive" : "Set to active"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AccessRoles() {
  const navigate = useNavigate();
  const [roles, setRoles] = useState<AccessRoleRecord[]>(ACCESS_ROLE_RECORDS);
  const [search, setSearch] = useState("");

  const filtered = roles.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.externalId.toLowerCase().includes(search.toLowerCase())
  );

  const toggleStatus = (id: string) => {
    setRoles((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: r.status === "active" ? "inactive" : "active" } : r
      )
    );
  };

  return (
    <>
      <Layout>
        <PageHeader title="Access roles" />

        <div className="px-6 py-6 space-y-4">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative w-40">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bluegrey-400" />
              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-3 py-2 border border-bluegrey-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 w-full"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => navigate("/bulk-access-role-jobs")}
                className="flex items-center gap-1.5 px-4 py-2 border border-bluegrey-300 text-bluegrey-700 text-sm font-medium rounded-md hover:bg-bluegrey-50 transition-colors"
              >
                <Layers className="w-4 h-4" />
                Bulk assignment jobs
              </button>
              <button
                type="button"
                onClick={() => navigate("/bulk-access-role-assignment")}
                className="flex items-center gap-1.5 px-4 py-2 border border-blue-500 text-blue-600 text-sm font-medium rounded-md hover:bg-blue-50 transition-colors"
              >
                <Layers className="w-4 h-4" />
                Bulk assign
              </button>
              <button
                type="button"
                onClick={() => navigate("/access-roles/new")}
                className="flex items-center gap-1.5 px-4 py-2 bg-bluegrey-900 text-white text-sm font-medium rounded-md hover:bg-bluegrey-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add access role
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="border border-bluegrey-200 rounded-md overflow-hidden bg-white">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-bluegrey-200">
                  <th className="text-left px-4 py-3 font-semibold text-bluegrey-700 w-1/3">
                    Access role
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-bluegrey-700">
                    External Id
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-bluegrey-700">
                    Type
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-bluegrey-700">
                    Status
                  </th>
                  <th className="w-10 px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-sm text-bluegrey-400 italic">
                      No access roles found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((role) => (
                    <tr
                      key={role.id}
                      className="border-b border-bluegrey-100 last:border-0 hover:bg-bluegrey-25 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-bluegrey-900">{role.name}</td>
                      <td className="px-4 py-3 text-bluegrey-500">{role.externalId || ""}</td>
                      <td className="px-4 py-3 text-bluegrey-500">{role.type || ""}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={role.status} />
                      </td>
                      <td className="px-4 py-3">
                        <RowMenu role={role} onToggleStatus={toggleStatus} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Layout>
      <AIAssistant userData={{}} isOpen={false} />
    </>
  );
}
