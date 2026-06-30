import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Search, MoreVertical, Save } from "lucide-react";
import Layout from "@/components/Layout";
import { AIAssistant } from "@/components/aiAssistant/AIAssistant";
import { MOCK_APPLICATIONS } from "@/lib/applicationsMockData";
import type { Permission } from "@/lib/applicationsMockData";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AppAssignment {
  appId: string;
  appName: string;
  selectedPermissionIds: string[];
  permissions: Permission[];
}

// ─── Add Application sub-view ─────────────────────────────────────────────────

interface AddApplicationViewProps {
  existing: AppAssignment[];
  onSave: (assignment: AppAssignment) => void;
  onCancel: () => void;
}

function AddApplicationView({ existing, onSave, onCancel }: AddApplicationViewProps) {
  const [selectedAppId, setSelectedAppId] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownSearch, setDropdownSearch] = useState("");
  const [permSearch, setPermSearch] = useState("");
  const [selectedPermIds, setSelectedPermIds] = useState<string[]>([]);

  const availableApps = MOCK_APPLICATIONS.filter(
    (a) => !existing.some((e) => e.appId === a.id)
  );
  const filteredApps = availableApps.filter((a) =>
    a.displayName.toLowerCase().includes(dropdownSearch.toLowerCase())
  );

  const selectedApp = MOCK_APPLICATIONS.find((a) => a.id === selectedAppId);
  const filteredPerms = (selectedApp?.permissions ?? []).filter((p) =>
    p.displayName.toLowerCase().includes(permSearch.toLowerCase())
  );

  const togglePerm = (id: string) => {
    setSelectedPermIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectApp = (id: string) => {
    setSelectedAppId(id);
    setDropdownOpen(false);
    setDropdownSearch("");
    setSelectedPermIds([]);
  };

  const handleSave = () => {
    if (!selectedApp) return;
    onSave({
      appId: selectedApp.id,
      appName: selectedApp.displayName,
      selectedPermissionIds: selectedPermIds,
      permissions: selectedApp.permissions.filter((p) => selectedPermIds.includes(p.id)),
    });
  };

  return (
    <div className="space-y-8">
      {/* Section: Select application */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-bluegrey-900">Select application</h2>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-bluegrey-700">
            Select application <span className="text-red-500">*</span>
          </label>
          <div className="relative w-52">
            <button
              type="button"
              onClick={() => setDropdownOpen((p) => !p)}
              className="w-full flex items-center justify-between border border-blue-500 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <span className={selectedApp ? "text-bluegrey-900" : "text-bluegrey-400"}>
                {selectedApp ? selectedApp.displayName : "Search applications"}
              </span>
              <svg className="w-4 h-4 text-bluegrey-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                <div className="absolute z-20 left-0 top-full mt-1 w-64 bg-white border border-bluegrey-200 rounded-md shadow-lg overflow-hidden">
                  <div className="p-2 border-b border-bluegrey-100">
                    <input
                      type="text"
                      placeholder="Search item"
                      value={dropdownSearch}
                      onChange={(e) => setDropdownSearch(e.target.value)}
                      autoFocus
                      className="w-full px-2 py-1 text-sm border border-bluegrey-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-300"
                    />
                  </div>
                  <div className="max-h-52 overflow-y-auto">
                    {filteredApps.length === 0 ? (
                      <div className="px-3 py-4 text-sm text-bluegrey-400 italic text-center">No applications</div>
                    ) : (
                      filteredApps.map((app) => (
                        <button
                          key={app.id}
                          type="button"
                          onClick={() => handleSelectApp(app.id)}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 text-bluegrey-800 transition-colors"
                        >
                          {app.displayName}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Section: Permissions */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-bluegrey-900">Permissions</h2>
        <div className="relative w-40">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bluegrey-400" />
          <input
            type="text"
            placeholder="Search"
            value={permSearch}
            onChange={(e) => setPermSearch(e.target.value)}
            className="pl-9 pr-3 py-2 border border-bluegrey-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 w-full"
          />
        </div>

        <div className="border border-bluegrey-200 rounded-md overflow-hidden">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-bluegrey-200 bg-white">
                <th className="text-left px-4 py-3 font-semibold text-bluegrey-700 w-1/2">Permission</th>
                <th className="text-left px-4 py-3 font-semibold text-bluegrey-700">Description</th>
              </tr>
            </thead>
            <tbody>
              {!selectedApp ? (
                <tr>
                  <td colSpan={2} className="px-4 py-10 text-center text-sm text-bluegrey-400 italic">
                    No application selected
                  </td>
                </tr>
              ) : filteredPerms.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-4 py-10 text-center text-sm text-bluegrey-400 italic">
                    No permissions found.
                  </td>
                </tr>
              ) : (
                filteredPerms.map((perm) => {
                  const checked = selectedPermIds.includes(perm.id);
                  return (
                    <tr
                      key={perm.id}
                      onClick={() => togglePerm(perm.id)}
                      className={`border-b border-bluegrey-100 last:border-0 cursor-pointer transition-colors ${checked ? "bg-blue-50" : "hover:bg-bluegrey-25"}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => togglePerm(perm.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-4 h-4 accent-blue-600 rounded"
                          />
                          <span className="font-medium text-bluegrey-900">{perm.displayName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-bluegrey-500">{perm.description || ""}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={!selectedApp}
          className="flex items-center gap-1.5 px-4 py-2 bg-bluegrey-900 text-white text-sm font-medium rounded-md hover:bg-bluegrey-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-bluegrey-700 hover:text-bluegrey-900 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── App row menu ─────────────────────────────────────────────────────────────

function AppRowMenu({ onRemove }: { onRemove: () => void }) {
  const [open, setOpen] = useState(false);
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
          <div className="absolute right-0 top-7 z-20 bg-white border border-bluegrey-200 rounded-md shadow-lg py-1 min-w-[140px]">
            <button
              type="button"
              onClick={() => { setOpen(false); onRemove(); }}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              Remove
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AddAccessRole() {
  const navigate = useNavigate();

  const [view, setView] = useState<"main" | "add-application">("main");

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [customField, setCustomField] = useState("");
  const [appSearch, setAppSearch] = useState("");
  const [apps, setApps] = useState<AppAssignment[]>([]);

  const [nameError, setNameError] = useState(false);

  const filteredApps = apps.filter((a) =>
    a.appName.toLowerCase().includes(appSearch.toLowerCase())
  );

  const handleAddApp = (assignment: AppAssignment) => {
    setApps((prev) => [...prev, assignment]);
    setView("main");
  };

  const handleRemoveApp = (appId: string) => {
    setApps((prev) => prev.filter((a) => a.appId !== appId));
  };

  const handleSave = () => {
    if (!name.trim()) { setNameError(true); return; }
    // In a real app, save to backend. For prototype, navigate back.
    navigate("/access-roles");
  };

  if (view === "add-application") {
    return (
      <>
        <Layout>
          <div className="min-h-screen">
            {/* Header */}
            <div className="px-6 pt-6 pb-2 border-b border-bluegrey-200 bg-white">
              <button
                type="button"
                onClick={() => setView("main")}
                className="flex items-center gap-1 text-xs text-bluegrey-500 hover:text-bluegrey-900 transition-colors mb-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to add access role
              </button>
              <h1 className="text-2xl font-bold text-bluegrey-900">Add application to access role</h1>
            </div>
            <div className="px-6 py-6">
              <AddApplicationView
                existing={apps}
                onSave={handleAddApp}
                onCancel={() => setView("main")}
              />
            </div>
          </div>
        </Layout>
        <AIAssistant userData={{}} isOpen={false} />
      </>
    );
  }

  return (
    <>
      <Layout>
        <div className="min-h-screen">
          {/* Header */}
          <div className="px-6 pt-6 pb-2 border-b border-bluegrey-200 bg-white">
            <button
              type="button"
              onClick={() => navigate("/access-roles")}
              className="flex items-center gap-1 text-xs text-bluegrey-500 hover:text-bluegrey-900 transition-colors mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to access roles
            </button>
            <h1 className="text-2xl font-bold text-bluegrey-900">Add access role</h1>
          </div>

          <div className="px-6 py-8 space-y-10 max-w-3xl">
            {/* Basic information */}
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-bluegrey-900">Basic information</h2>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-bluegrey-700">
                  Access role name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setNameError(false); }}
                  className={`block w-56 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${nameError ? "border-red-400" : "border-bluegrey-300"}`}
                />
                {nameError && (
                  <p className="text-xs text-red-600">Access role name is required</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-bluegrey-700">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description here"
                  rows={4}
                  className="block w-full max-w-md px-3 py-2 border border-bluegrey-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-y"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-bluegrey-700">customField</label>
                <input
                  type="text"
                  value={customField}
                  onChange={(e) => setCustomField(e.target.value)}
                  className="block w-56 px-3 py-2 border border-bluegrey-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
            </div>

            {/* Applications */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-bluegrey-900">Applications</h2>

              <div className="flex items-center justify-between gap-4">
                <div className="relative w-40">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bluegrey-400" />
                  <input
                    type="text"
                    placeholder="Search"
                    value={appSearch}
                    onChange={(e) => setAppSearch(e.target.value)}
                    className="pl-9 pr-3 py-2 border border-bluegrey-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 w-full"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setView("add-application")}
                  className="flex items-center gap-1.5 px-3 py-2 border border-bluegrey-300 rounded-md text-sm font-medium text-bluegrey-700 hover:bg-bluegrey-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add applications
                </button>
              </div>

              <div className="border border-bluegrey-200 rounded-md overflow-hidden">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-bluegrey-200">
                      <th className="text-left px-4 py-3 font-semibold text-bluegrey-700 w-1/3">Application</th>
                      <th className="text-left px-4 py-3 font-semibold text-bluegrey-700">Permissions</th>
                      <th className="w-10 px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApps.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-4 py-10 text-center text-sm text-bluegrey-400 italic">
                          Ready to add applications
                        </td>
                      </tr>
                    ) : (
                      filteredApps.map((app) => (
                        <tr key={app.appId} className="border-b border-bluegrey-100 last:border-0">
                          <td className="px-4 py-3 font-medium text-bluegrey-900">{app.appName}</td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {app.permissions.length === 0 ? (
                                <span className="text-xs text-bluegrey-400 italic">None</span>
                              ) : (
                                app.permissions.map((p) => (
                                  <span
                                    key={p.id}
                                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-bluegrey-100 text-bluegrey-700 border border-bluegrey-200"
                                  >
                                    {p.displayName}
                                  </span>
                                ))
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <AppRowMenu onRemove={() => handleRemoveApp(app.appId)} />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Save / Cancel */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleSave}
                className="flex items-center gap-1.5 px-4 py-2 bg-bluegrey-900 text-white text-sm font-medium rounded-md hover:bg-bluegrey-800 transition-colors"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
              <button
                type="button"
                onClick={() => navigate("/access-roles")}
                className="px-4 py-2 text-sm font-medium text-bluegrey-700 hover:text-bluegrey-900 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </Layout>
      <AIAssistant userData={{}} isOpen={false} />
    </>
  );
}
