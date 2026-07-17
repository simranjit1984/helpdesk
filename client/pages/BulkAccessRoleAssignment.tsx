import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, CheckCircle2, ExternalLink, ChevronRight, ChevronDown,
  Plus, Search, Building2, Shield, AlertCircle, Upload, Download,
  FileText, X, Layers, Info
} from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { baseOrganizations } from "@/components/OrganizationsTable";
import { getAvailableRolesForOrg } from "@/components/organizations/accessRolesMockData";
import {
  createBulkAccessJob,
  getUsersForOrg,
  OPERATION_LABELS,
  type BulkAccessOperation,
  type BulkAccessScope,
  type OrgJobConfig,
  type MockOrgUser,
} from "@/lib/bulkAccessRoleMockData";

// ─── Org helpers ──────────────────────────────────────────────────────────────

interface FlatOrg { id: string; name: string; parentId?: string; }

function flattenOrgs(): FlatOrg[] {
  const result: FlatOrg[] = [];
  baseOrganizations.forEach((org) => {
    result.push({ id: org.id, name: org.name });
    org.children?.forEach((child) => {
      result.push({ id: child.id, name: `${org.name} › ${child.name}`, parentId: org.id });
    });
  });
  return result;
}

const FLAT_ORGS = flattenOrgs();

function getParentId(orgId: string): string | undefined {
  return FLAT_ORGS.find((o) => o.id === orgId)?.parentId;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrgRoleConfig {
  orgId: string;
  orgName: string;
  userCount: number;
  accessRoleIds: string[];
  configured: boolean;
}

interface ParsedBulkUser {
  email: string;
  displayName: string;
  organizationId: string;
  organizationName: string;
  rowNumber?: number;
}

interface WizardState {
  operation: BulkAccessOperation | null;
  scope: BulkAccessScope | null;
  userSource: "select" | "csv";
  orgId: string;
  orgName: string;
  selectedUserIds: string[];
  fileName: string;
  validUsers: ParsedBulkUser[];
  invalidUsers: { row: Partial<ParsedBulkUser> & { rowNumber: number }; errors: string[] }[];
  accessRoleIds: string[];        // single-org
  orgConfigs: Record<string, OrgRoleConfig>; // multi-org
}

const INITIAL: WizardState = {
  operation: null, scope: "single-org", userSource: "select",
  orgId: "1", orgName: "Acme Corp", selectedUserIds: [],
  fileName: "", validUsers: [], invalidUsers: [],
  accessRoleIds: [], orgConfigs: {},
};

// ─── Step indicator ───────────────────────────────────────────────────────────

const STEP_LABELS = ["Select operation", "User selection method", "Select users", "Configure roles", "Review"];

function StepIndicator({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: total }).map((_, i) => {
        const num = i + 1;
        const isActive = num === step;
        const isDone = num < step;
        return (
          <div key={num} className="flex items-center gap-1 flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${isActive ? "bg-blue-600 text-white" : isDone ? "bg-green-500 text-white" : "bg-bluegrey-200 text-bluegrey-500"}`}>
              {isDone ? "✓" : num}
            </div>
            <span className={`text-xs hidden sm:block truncate ${isActive ? "text-blue-600 font-medium" : isDone ? "text-green-600" : "text-bluegrey-400"}`}>
              {STEP_LABELS[i]}
            </span>
            {i < total - 1 && <div className={`h-0.5 flex-1 mx-1 ${isDone ? "bg-green-400" : "bg-bluegrey-200"}`} />}
          </div>
        );
      })}
    </div>
  );
}

// ─── Step 1: Select Operation ─────────────────────────────────────────────────

const OPERATIONS: { value: BulkAccessOperation; label: string; desc: string }[] = [
  { value: "add",     label: "Add Access Roles",     desc: "Assign one or more Access Roles to users while preserving their existing Access Roles." },
  { value: "remove",  label: "Remove Access Roles",  desc: "Remove one or more Access Roles from users while leaving all remaining Access Roles unchanged." },
  { value: "replace", label: "Replace Access Roles", desc: "Replace all existing Access Roles with the Access Roles selected during this wizard." },
];

function Step1({ operation, onChange }: { operation: BulkAccessOperation | null; onChange: (op: BulkAccessOperation) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-bluegrey-900">Select operation</h2>
        <p className="text-sm text-bluegrey-500 mt-1">Choose what action to perform on the selected users' Access Roles.</p>
      </div>
      <div className="space-y-3">
        {OPERATIONS.map((op) => (
          <label key={op.value} className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${operation === op.value ? "border-blue-500 bg-blue-50" : "border-bluegrey-200 hover:border-bluegrey-300"}`}>
            <input type="radio" name="operation" value={op.value} checked={operation === op.value} onChange={() => onChange(op.value)} className="mt-1 w-4 h-4 accent-blue-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-bluegrey-900">{op.label}</p>
              <p className="text-sm text-bluegrey-500 mt-0.5">{op.desc}</p>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}

// ─── Step 2: Select user source ──────────────────────────────────────────────

function Step2({ userSource, onChange }: {
  userSource: "select" | "csv";
  onChange: (src: "select" | "csv") => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-bluegrey-900">How should users be selected?</h2>
        <p className="text-sm text-bluegrey-500 mt-1">Choose how to provide the list of users for this bulk operation.</p>
      </div>
      <div className="space-y-3">
        {([
          { value: "select" as const, label: "Select users from the UI", desc: "Manually search and select users from the chosen organization." },
          { value: "csv" as const, label: "Upload CSV", desc: "Upload a CSV file containing user identifiers." },
        ]).map((src) => (
          <label key={src.value} className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${userSource === src.value ? "border-blue-500 bg-blue-50" : "border-bluegrey-200 hover:border-bluegrey-300"}`}>
            <input type="radio" name="usersource" checked={userSource === src.value} onChange={() => onChange(src.value)} className="mt-1 w-4 h-4 accent-blue-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-bluegrey-900">{src.label}</p>
              <p className="text-sm text-bluegrey-500 mt-0.5">{src.desc}</p>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}

// ─── Step 3: Select Users ─────────────────────────────────────────────────────

const FIXED_ORG = { id: "1", name: "Acme Corp" };

function OrgDisplay() {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-bluegrey-700">Organization</label>
      <div className="flex items-center gap-2 px-3 py-2 bg-bluegrey-50 border border-bluegrey-200 rounded-md w-fit">
        <Building2 className="w-4 h-4 text-bluegrey-500" />
        <span className="text-sm font-medium text-bluegrey-800">{FIXED_ORG.name}</span>
        <span className="text-xs text-bluegrey-400">— your organization</span>
      </div>
      <button type="button" className="text-xs text-blue-600 hover:text-blue-800 transition-colors">
        Change organization
      </button>
    </div>
  );
}

function UserSelectList({ orgId, selectedIds, onChange }: { orgId: string; selectedIds: string[]; onChange: (ids: string[]) => void }) {
  const [search, setSearch] = useState("");
  const users = getUsersForOrg(orgId);
  const filtered = users.filter((u) => u.displayName.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));
  const allSelected = filtered.length > 0 && filtered.every((u) => selectedIds.includes(u.id));

  const toggle = (id: string) => onChange(selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id]);
  const toggleAll = () => {
    if (allSelected) onChange(selectedIds.filter((id) => !filtered.some((u) => u.id === id)));
    else onChange([...new Set([...selectedIds, ...filtered.map((u) => u.id)])]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bluegrey-400" />
          <input type="text" placeholder="Search users…" value={search} onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-3 py-2 border border-bluegrey-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 w-56" />
        </div>
        {selectedIds.length > 0 && (
          <span className="text-xs text-blue-700 font-medium">{selectedIds.length} selected</span>
        )}
      </div>
      {users.length === 0 ? (
        <div className="rounded-md border border-dashed border-bluegrey-300 py-8 text-center text-sm text-bluegrey-400">No users in this organization.</div>
      ) : (
        <div className="rounded-md border border-bluegrey-200 overflow-hidden">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-bluegrey-50 border-b border-bluegrey-200">
                <th className="w-10 px-3 py-2"><input type="checkbox" checked={allSelected} onChange={toggleAll} className="w-4 h-4 accent-blue-600" /></th>
                <th className="text-left px-3 py-2 text-xs font-semibold text-bluegrey-500 uppercase">Display name</th>
                <th className="text-left px-3 py-2 text-xs font-semibold text-bluegrey-500 uppercase">Email</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bluegrey-100">
              {filtered.map((u) => {
                const checked = selectedIds.includes(u.id);
                return (
                  <tr key={u.id} onClick={() => toggle(u.id)} className={`cursor-pointer transition-colors ${checked ? "bg-blue-50" : "hover:bg-bluegrey-25"}`}>
                    <td className="px-3 py-2.5"><input type="checkbox" checked={checked} onChange={() => toggle(u.id)} onClick={(e) => e.stopPropagation()} className="w-4 h-4 accent-blue-600" /></td>
                    <td className="px-3 py-2.5 font-medium text-bluegrey-900">{u.displayName}</td>
                    <td className="px-3 py-2.5 text-bluegrey-500 text-xs font-mono">{u.email}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CsvUploadSingle({ orgId, orgName, fileName, validUsers, onChange }: {
  orgId: string; orgName: string; fileName: string;
  validUsers: ParsedBulkUser[];
  onChange: (v: ParsedBulkUser[], fileName: string) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const users = getUsersForOrg(orgId);

  const downloadTemplate = () => {
    const csv = "User ID\n" + users.slice(0, 3).map((u) => u.id).join("\n") + "\n";
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "bulk-access-template.csv"; a.click();
  };
  const downloadOrgUsers = () => {
    const csv = "User ID,Username,Email,Display Name\n" + users.map((u) => `${u.id},${u.username},${u.email},"${u.displayName}"`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `${orgName.replace(/ /g, "-")}-users.csv`; a.click();
  };

  const processFile = (file: File) => {
    if (!file.name.endsWith(".csv")) { setError("Only .csv files supported."); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      const lines = (e.target?.result as string).trim().split(/\r?\n/).slice(1);
      const valid: ParsedBulkUser[] = [];
      lines.forEach((line) => {
        const userId = line.trim().replace(/^"|"$/g, "");
        const u = users.find((x) => x.id === userId);
        if (u) valid.push({ email: u.email, displayName: u.displayName, organizationId: orgId, organizationName: orgName });
      });
      onChange(valid, file.name);
      setError("");
    };
    reader.readAsText(file);
  };

  const hasResult = !!fileName;

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-bluegrey-200 bg-bluegrey-50 px-4 py-3 space-y-2">
        <p className="text-xs font-semibold text-bluegrey-600 uppercase tracking-wide">Download references</p>
        <button type="button" onClick={downloadTemplate} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"><Download className="w-4 h-4" />Download CSV Template</button>
        <button type="button" onClick={downloadOrgUsers} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"><Download className="w-4 h-4" />Download Organization Users Reference</button>
      </div>
      {!hasResult && (
        <div onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) processFile(f); }}
          onClick={() => document.getElementById("bar-csv-input")?.click()}
          className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${isDragging ? "border-blue-400 bg-blue-50" : "border-bluegrey-300 hover:border-blue-400"}`}>
          <Upload className="w-8 h-8 text-bluegrey-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-bluegrey-700">Drag and drop a CSV, or <span className="text-blue-600 underline">browse</span></p>
          <input id="bar-csv-input" type="file" accept=".csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); e.target.value = ""; }} />
        </div>
      )}
      {error && <p className="text-sm text-red-600 flex items-center gap-1.5"><AlertCircle className="w-4 h-4" />{error}</p>}
      {hasResult && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 bg-bluegrey-50 border border-bluegrey-200 rounded-md px-3 py-2 w-fit">
            <FileText className="w-4 h-4 text-bluegrey-500" /><span className="text-sm">{fileName}</span>
            <button type="button" onClick={() => onChange([], "")} className="text-bluegrey-400 hover:text-red-500"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-bluegrey-200 bg-white px-4 py-3 text-center"><p className="text-2xl font-bold text-bluegrey-900">{validUsers.length}</p><p className="text-xs text-bluegrey-500">Valid users</p></div>
          </div>
          {validUsers.length > 0 && <p className="text-sm text-green-700 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" />{validUsers.length} user{validUsers.length !== 1 ? "s" : ""} ready for processing.</p>}
        </div>
      )}
    </div>
  );
}

function CsvUploadMulti({ fileName, validUsers, onChange }: {
  fileName: string; validUsers: ParsedBulkUser[];
  onChange: (v: ParsedBulkUser[], inv: { row: Partial<ParsedBulkUser> & { rowNumber: number }; errors: string[] }[], fileName: string) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");

  const ORG_BY_ID = new Map(FLAT_ORGS.map((o) => [o.id, o.name]));
  const allOrgUsers = FLAT_ORGS.flatMap((o) => getUsersForOrg(o.id));

  const downloadTemplate = () => {
    const csv = "Organization ID,Email\n1,alice.smith@acme.com\n1-1,frank.miller@acmeeu.com\n";
    const blob = new Blob([csv], { type: "text/csv" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "bulk-access-multi-template.csv"; a.click();
  };
  const downloadOrgRef = () => {
    const csv = "Organization ID,Organization Name,Organization Path\n" + FLAT_ORGS.map((o) => `${o.id},"${o.name}",""`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "organizations.csv"; a.click();
  };
  const downloadOrgUsersRef = () => {
    const csv = "Organization ID,Organization Name,User ID,Username,Email,Display Name\n" + allOrgUsers.map((u) => {
      const orgName = ORG_BY_ID.get(u.orgId) ?? u.orgId;
      return `${u.orgId},"${orgName}",${u.id},${u.username},${u.email},"${u.displayName}"`;
    }).join("\n");
    const blob = new Blob([csv], { type: "text/csv" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "organization-users.csv"; a.click();
  };

  const processFile = (file: File) => {
    if (!file.name.endsWith(".csv")) { setError("Only .csv files supported."); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      const lines = (e.target?.result as string).trim().split(/\r?\n/).slice(1);
      const valid: ParsedBulkUser[] = [];
      const inv: { row: Partial<ParsedBulkUser> & { rowNumber: number }; errors: string[] }[] = [];
      lines.forEach((line, i) => {
        const [orgId, email] = line.split(",").map((s) => s.trim().replace(/^"|"$/g, ""));
        const errors: string[] = [];
        const orgName = ORG_BY_ID.get(orgId);
        if (!orgId) errors.push("Organization ID required");
        else if (!orgName) errors.push(`Unknown org: ${orgId}`);
        if (!email) errors.push("Email required");
        const u = allOrgUsers.find((x) => x.email.toLowerCase() === email?.toLowerCase() && x.orgId === orgId);
        if (orgId && email && !u && orgName) errors.push("User not found in organization");
        if (errors.length) inv.push({ row: { email, organizationId: orgId, rowNumber: i + 2 }, errors });
        else if (u && orgName) valid.push({ email: u.email, displayName: u.displayName, organizationId: orgId, organizationName: orgName });
      });
      onChange(valid, inv, file.name); setError("");
    };
    reader.readAsText(file);
  };

  const hasResult = !!fileName;
  const orgsSeen = new Map<string, { name: string; count: number }>();
  validUsers.forEach((u) => {
    const e = orgsSeen.get(u.organizationId);
    if (e) e.count++; else orgsSeen.set(u.organizationId, { name: u.organizationName, count: 1 });
  });

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-bluegrey-200 bg-bluegrey-50 px-4 py-3 space-y-2">
        <p className="text-xs font-semibold text-bluegrey-600 uppercase tracking-wide">Download references</p>
        <button type="button" onClick={downloadTemplate} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"><Download className="w-4 h-4" />Download CSV Template</button>
        <button type="button" onClick={downloadOrgRef} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"><Download className="w-4 h-4" />Download Organization Reference</button>
        <button type="button" onClick={downloadOrgUsersRef} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"><Download className="w-4 h-4" />Download Organization Users Reference</button>
      </div>
      {!hasResult && (
        <div onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) processFile(f); }}
          onClick={() => document.getElementById("bar-multi-csv")?.click()}
          className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${isDragging ? "border-blue-400 bg-blue-50" : "border-bluegrey-300 hover:border-blue-400"}`}>
          <Upload className="w-8 h-8 text-bluegrey-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-bluegrey-700">Drag and drop a CSV, or <span className="text-blue-600 underline">browse</span></p>
          <p className="text-xs text-bluegrey-400 mt-1">Format: Organization ID, Email</p>
          <input id="bar-multi-csv" type="file" accept=".csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); e.target.value = ""; }} />
        </div>
      )}
      {error && <p className="text-sm text-red-600 flex items-center gap-1.5"><AlertCircle className="w-4 h-4" />{error}</p>}
      {hasResult && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 bg-bluegrey-50 border border-bluegrey-200 rounded-md px-3 py-2 w-fit">
            <FileText className="w-4 h-4 text-bluegrey-500" /><span className="text-sm">{fileName}</span>
            <button type="button" onClick={() => onChange([], [], "")} className="text-bluegrey-400 hover:text-red-500"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-bluegrey-200 bg-white px-4 py-3 text-center"><p className="text-2xl font-bold text-bluegrey-900">{validUsers.length}</p><p className="text-xs text-bluegrey-500">Valid users</p></div>
            <div className="rounded-lg border border-bluegrey-200 bg-white px-4 py-3 text-center"><p className="text-2xl font-bold text-bluegrey-900">{orgsSeen.size}</p><p className="text-xs text-bluegrey-500">Organizations</p></div>
          </div>
          {orgsSeen.size > 0 && (
            <div className="rounded-md border border-bluegrey-200 bg-white overflow-hidden">
              <div className="px-4 py-2 bg-bluegrey-50 border-b border-bluegrey-200 text-xs font-semibold text-bluegrey-600 uppercase">Organizations found</div>
              {Array.from(orgsSeen.entries()).map(([id, v]) => (
                <div key={id} className="flex items-center justify-between px-4 py-2 border-b border-bluegrey-100 last:border-0">
                  <span className="text-sm font-medium text-bluegrey-800">{v.name}</span>
                  <span className="text-xs text-bluegrey-500">{v.count} user{v.count !== 1 ? "s" : ""}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Step3({ form, onChange }: { form: WizardState; onChange: (p: Partial<WizardState>) => void }) {
  const { scope, userSource, orgId, orgName, selectedUserIds, fileName, validUsers } = form;
  const isSingle = scope === "single-org";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-bluegrey-900">Select users</h2>
        <p className="text-sm text-bluegrey-500 mt-1">{isSingle ? (userSource === "select" ? "Search and select users from the chosen organization." : "Upload a CSV file with user identifiers.") : "Upload a CSV file with Organization ID and user identifier columns."}</p>
      </div>
      {isSingle && (
        <OrgDisplay />
      )}
      {isSingle && userSource === "select" && (
        <UserSelectList orgId={orgId} selectedIds={selectedUserIds} onChange={(ids) => onChange({ selectedUserIds: ids })} />
      )}
      {isSingle && userSource === "csv" && (
        <CsvUploadSingle orgId={orgId} orgName={orgName} fileName={fileName} validUsers={validUsers} onChange={(v, fn) => onChange({ validUsers: v, fileName: fn })} />
      )}
      {!isSingle && (
        <CsvUploadMulti fileName={fileName} validUsers={validUsers} onChange={(v, inv, fn) => onChange({ validUsers: v, invalidUsers: inv, fileName: fn })} />
      )}
    </div>
  );
}

// ─── Step 4: Configure Roles ──────────────────────────────────────────────────

function RoleChecklist({ orgId, selectedIds, onChange }: { orgId: string; selectedIds: string[]; onChange: (ids: string[]) => void }) {
  const parentId = getParentId(orgId);
  const roles = getAvailableRolesForOrg(orgId, parentId);
  const toggle = (id: string) => onChange(selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id]);
  if (roles.length === 0) return <p className="text-sm text-bluegrey-400 italic">No access roles available for this organization.</p>;
  return (
    <div className="rounded-md border border-bluegrey-200 overflow-hidden">
      <table className="w-full text-sm border-collapse">
        <thead><tr className="bg-bluegrey-50 border-b border-bluegrey-200"><th className="w-10 px-3 py-2" /><th className="text-left px-3 py-2 text-xs font-semibold text-bluegrey-500 uppercase">Role</th><th className="text-left px-3 py-2 text-xs font-semibold text-bluegrey-500 uppercase">Description</th></tr></thead>
        <tbody className="divide-y divide-bluegrey-100">
          {roles.map((r) => {
            const checked = selectedIds.includes(r.id);
            return (
              <tr key={r.id} onClick={() => toggle(r.id)} className={`cursor-pointer transition-colors ${checked ? "bg-blue-50" : "hover:bg-bluegrey-25"}`}>
                <td className="px-3 py-3"><input type="checkbox" checked={checked} onChange={() => toggle(r.id)} onClick={(e) => e.stopPropagation()} className="w-4 h-4 accent-blue-600" /></td>
                <td className="px-3 py-3 font-medium text-bluegrey-900">{r.name}</td>
                <td className="px-3 py-3 text-bluegrey-500">{r.description || "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function MultiOrgRoleConfig({ validUsers, orgConfigs, operation, onChange }: {
  validUsers: ParsedBulkUser[]; orgConfigs: Record<string, OrgRoleConfig>;
  operation: BulkAccessOperation; onChange: (c: Record<string, OrgRoleConfig>) => void;
}) {
  const [editing, setEditing] = useState<string | null>(null);

  const orgsMap = new Map<string, { name: string; count: number }>();
  validUsers.forEach((u) => {
    const e = orgsMap.get(u.organizationId);
    if (e) e.count++; else orgsMap.set(u.organizationId, { name: u.organizationName, count: 1 });
  });
  const orgList = Array.from(orgsMap.entries()).map(([id, v]) => ({
    orgId: id, orgName: v.name, userCount: v.count,
    ...(orgConfigs[id] ?? { accessRoleIds: [], configured: false }),
  }));

  const allConfigured = orgList.every((o) => (orgConfigs[o.orgId]?.configured ?? false));
  const configuredCount = orgList.filter((o) => orgConfigs[o.orgId]?.configured ?? false).length;

  if (editing) {
    const org = orgList.find((o) => o.orgId === editing)!;
    const roleIds = orgConfigs[editing]?.accessRoleIds ?? [];
    return (
      <div className="space-y-5">
        <button type="button" onClick={() => setEditing(null)} className="flex items-center gap-1.5 text-sm text-bluegrey-500 hover:text-bluegrey-900">
          <ArrowLeft className="w-4 h-4" />Back to organizations
        </button>
        <div>
          <h3 className="text-base font-semibold text-bluegrey-900">{org.orgName}</h3>
          <p className="text-xs text-bluegrey-400">{org.userCount} user{org.userCount !== 1 ? "s" : ""} · Operation: <strong>{OPERATION_LABELS[operation]}</strong></p>
        </div>
        <RoleChecklist orgId={editing} selectedIds={roleIds} onChange={(ids) => onChange({ ...orgConfigs, [editing]: { orgId: editing, orgName: org.orgName, userCount: org.userCount, accessRoleIds: ids, configured: false } })} />
        <div className="flex gap-3">
          <Button onClick={() => { onChange({ ...orgConfigs, [editing]: { orgId: editing, orgName: org.orgName, userCount: org.userCount, accessRoleIds: roleIds, configured: true } }); setEditing(null); }} className="gap-1.5"><CheckCircle2 className="w-4 h-4" />Save configuration</Button>
          <Button variant="outline" onClick={() => setEditing(null)}>Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-sm">
        <span className={allConfigured ? "text-green-700 font-medium" : "text-bluegrey-600"}>{configuredCount} / {orgList.length} configured</span>
      </div>
      {orgList.map((org) => {
        const cfg = orgConfigs[org.orgId];
        return (
          <div key={org.orgId} className="rounded-lg border border-bluegrey-200 bg-white overflow-hidden">
            <div className="px-4 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {cfg?.configured ? <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />}
                <div>
                  <p className="font-semibold text-bluegrey-900">{org.orgName}</p>
                  <p className="text-xs text-bluegrey-400">{org.userCount} user{org.userCount !== 1 ? "s" : ""}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {cfg?.configured ? <span className="text-xs text-green-600 font-medium hidden sm:block">{cfg.accessRoleIds.length} role{cfg.accessRoleIds.length !== 1 ? "s" : ""} selected</span> : <span className="text-xs text-amber-600 font-medium hidden sm:block">⚠ Required</span>}
                <Button variant="outline" size="sm" onClick={() => setEditing(org.orgId)} className="gap-1">
                  {cfg?.configured ? "Edit" : "Configure"}<ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Step4({ form, onChange }: { form: WizardState; onChange: (p: Partial<WizardState>) => void }) {
  const { scope, operation, orgId, accessRoleIds, orgConfigs, validUsers } = form;
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-bluegrey-900">Configure access roles</h2>
        <p className="text-sm text-bluegrey-500 mt-1">Select which access roles to {operation} for the selected users.</p>
      </div>
      {scope === "single-org" ? (
        <div className="space-y-4">
          <div className="rounded-md border border-bluegrey-100 bg-bluegrey-50 px-4 py-2 text-sm text-bluegrey-600">
            Operation: <strong>{OPERATION_LABELS[operation!]}</strong>
          </div>
          <RoleChecklist orgId={orgId} selectedIds={accessRoleIds} onChange={(ids) => onChange({ accessRoleIds: ids })} />
        </div>
      ) : (
        <MultiOrgRoleConfig validUsers={validUsers} orgConfigs={orgConfigs} operation={operation!}
          onChange={(c) => onChange({ orgConfigs: c })} />
      )}
    </div>
  );
}

// ─── Step 5: Review ───────────────────────────────────────────────────────────

function PreflightCard({ totalUsers, userSource, selectedUserIds, validUsers }: { totalUsers: number; userSource: string; selectedUserIds: string[]; validUsers: ParsedBulkUser[] }) {
  const total = userSource === "select" ? selectedUserIds.length : validUsers.length;
  const willUpdate = Math.round(total * 0.85);
  const noChange = Math.round(total * 0.1);
  const errors = total - willUpdate - noChange;
  return (
    <div className="rounded-lg border border-bluegrey-200 bg-white overflow-hidden">
      <div className="px-4 py-3 bg-bluegrey-50 border-b border-bluegrey-200">
        <p className="text-xs font-semibold text-bluegrey-600 uppercase tracking-wide">Pre-flight analysis</p>
      </div>
      <div className="px-4 py-4 space-y-2 text-sm">
        <p className="text-bluegrey-700"><span className="font-semibold text-bluegrey-900">{total}</span> users analysed</p>
        <p className="text-green-700"><span className="font-semibold">{willUpdate}</span> users will be updated</p>
        <p className="text-bluegrey-400"><span className="font-semibold">{noChange}</span> users already match the requested role assignment</p>
        {errors > 0 && <p className="text-red-600"><span className="font-semibold">{errors}</span> users contain validation errors</p>}
      </div>
    </div>
  );
}

function Step5({ form }: { form: WizardState }) {
  const { operation, scope, orgId, orgName, userSource, selectedUserIds, validUsers, accessRoleIds, orgConfigs } = form;
  const parentId = getParentId(orgId);
  const roleNames = getAvailableRolesForOrg(orgId, parentId).filter((r) => accessRoleIds.includes(r.id)).map((r) => r.name);
  const orgUsers = getUsersForOrg(orgId);
  const selUsers = orgUsers.filter((u) => selectedUserIds.includes(u.id));

  const orgList = Object.values(orgConfigs);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-bluegrey-900">Review &amp; submit</h2>
        <p className="text-sm text-bluegrey-500 mt-1">Review your configuration before starting the bulk assignment job.</p>
      </div>

      {/* Summary */}
      <div className="rounded-lg border border-bluegrey-200 bg-white divide-y divide-bluegrey-100">
        <div className="px-4 py-3 bg-bluegrey-50 rounded-t-lg"><p className="text-xs font-semibold text-bluegrey-500 uppercase tracking-wide">Job summary</p></div>
        <div className="px-4 py-3 flex items-center gap-4">
          <p className="text-xs font-semibold text-bluegrey-500 uppercase w-24">Operation</p>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{OPERATION_LABELS[operation!]}</span>
        </div>
        <div className="px-4 py-3 flex items-center gap-4">
          <p className="text-xs font-semibold text-bluegrey-500 uppercase w-24">Scope</p>
          <span className="text-sm text-bluegrey-800">{scope === "single-org" ? "Single Organization" : "Multiple Organizations"}</span>
        </div>
      </div>

      {scope === "single-org" ? (
        <div className="rounded-lg border border-bluegrey-200 bg-white divide-y divide-bluegrey-100">
          <div className="px-4 py-3 flex items-start gap-4">
            <p className="text-xs font-semibold text-bluegrey-500 uppercase w-28 flex-shrink-0 mt-0.5">Organization</p>
            <span className="text-sm text-bluegrey-800">{orgName}</span>
          </div>
          <div className="px-4 py-3 flex items-start gap-4">
            <p className="text-xs font-semibold text-bluegrey-500 uppercase w-28 flex-shrink-0 mt-0.5">Users</p>
            <div className="text-sm text-bluegrey-800">
              {userSource === "select" ? (
                <div>
                  <span className="font-semibold">{selUsers.length}</span> selected
                  {selUsers.slice(0, 3).length > 0 && <p className="text-xs text-bluegrey-400 mt-0.5">{selUsers.slice(0, 3).map((u) => u.displayName).join(", ")}{selUsers.length > 3 ? ` +${selUsers.length - 3} more` : ""}</p>}
                </div>
              ) : (
                <span><span className="font-semibold">{validUsers.length}</span> from CSV</span>
              )}
            </div>
          </div>
          <div className="px-4 py-3 flex items-start gap-4">
            <p className="text-xs font-semibold text-bluegrey-500 uppercase w-28 flex-shrink-0 mt-0.5">Access Roles</p>
            {roleNames.length > 0 ? (
              <div className="flex flex-wrap gap-1">{roleNames.map((n) => <span key={n} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">{n}</span>)}</div>
            ) : <span className="text-xs text-bluegrey-400 italic">None selected</span>}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {orgList.map((cfg) => {
            const parentId = getParentId(cfg.orgId);
            const roles = getAvailableRolesForOrg(cfg.orgId, parentId).filter((r) => cfg.accessRoleIds.includes(r.id));
            const count = validUsers.filter((u) => u.organizationId === cfg.orgId).length;
            return (
              <div key={cfg.orgId} className="rounded-lg border border-bluegrey-200 bg-white overflow-hidden">
                <div className="px-4 py-3 bg-bluegrey-50 border-b border-bluegrey-200 flex items-center justify-between">
                  <span className="font-semibold text-bluegrey-900">{cfg.orgName}</span>
                  <span className="text-xs text-bluegrey-500">{count} user{count !== 1 ? "s" : ""}</span>
                </div>
                <div className="px-4 py-3">
                  <p className="text-xs text-bluegrey-500 mb-1">Access Roles</p>
                  {roles.length > 0 ? <div className="flex flex-wrap gap-1">{roles.map((r) => <span key={r.id} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">{r.name}</span>)}</div> : <span className="text-xs text-bluegrey-400 italic">None</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <PreflightCard totalUsers={0} userSource={userSource} selectedUserIds={selectedUserIds} validUsers={validUsers} />

      <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3 flex items-start gap-2 text-sm text-blue-700">
        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
        Role assignments will be processed asynchronously. Each user is processed independently — failures will not stop remaining users.
      </div>
    </div>
  );
}

// ─── Success ──────────────────────────────────────────────────────────────────

function SuccessScreen({ jobId }: { jobId: string }) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center space-y-5">
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center"><CheckCircle2 className="w-9 h-9 text-green-600" /></div>
      <div>
        <h2 className="text-xl font-semibold text-bluegrey-900 mb-1">Bulk assignment queued</h2>
        <p className="text-sm text-bluegrey-500">Your bulk access role assignment job has been queued.</p>
      </div>
      <div className="rounded-md bg-bluegrey-50 border border-bluegrey-200 px-6 py-3">
        <p className="text-xs text-bluegrey-500 mb-1">Job ID</p>
        <p className="text-lg font-bold text-bluegrey-900 font-mono">{jobId}</p>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => navigate("/access-roles")}>Back to Access Roles</Button>
        <Button onClick={() => navigate(`/bulk-access-role-jobs/${jobId}`)} className="gap-2"><ExternalLink className="w-4 h-4" />View job progress</Button>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function BulkAccessRoleAssignment() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [showErrors, setShowErrors] = useState(false);
  const [submittedJobId, setSubmittedJobId] = useState<string | null>(null);
  const [form, setForm] = useState<WizardState>(INITIAL);

  const patch = (updates: Partial<WizardState>) => setForm((prev) => ({ ...prev, ...updates }));

  const canAdvance = (): boolean => {
    if (step === 1) return !!form.operation;
    if (step === 2) return true; // user source always has a default selection
    if (step === 3) {
      if (form.scope === "single-org") {
        if (!form.orgId) return false;
        if (form.userSource === "select") return form.selectedUserIds.length > 0;
        return form.validUsers.length > 0;
      }
      return form.validUsers.length > 0;
    }
    if (step === 4) {
      if (form.scope === "single-org") return form.accessRoleIds.length > 0;
      const orgIds = [...new Set(form.validUsers.map((u) => u.organizationId))];
      return orgIds.every((id) => form.orgConfigs[id]?.configured);
    }
    return true;
  };

  const stepError = (): string | null => {
    if (step === 1 && !form.operation) return "Please select an operation.";
    // step 2 always valid — user source defaults to "select"
    if (step === 3) {
      if (form.scope === "single-org") {
        if (!form.orgId) return "Please select an organization.";
        if (form.userSource === "select" && form.selectedUserIds.length === 0) return "Please select at least one user.";
        if (form.userSource === "csv" && form.validUsers.length === 0) return "Please upload a CSV with valid users.";
      } else if (form.validUsers.length === 0) return "Please upload a valid CSV.";
    }
    if (step === 4) {
      if (form.scope === "single-org" && form.accessRoleIds.length === 0) return "Please select at least one access role.";
      const orgIds = [...new Set(form.validUsers.map((u) => u.organizationId))];
      const unconfigured = orgIds.filter((id) => !form.orgConfigs[id]?.configured);
      if (unconfigured.length > 0) return `${unconfigured.length} organization${unconfigured.length !== 1 ? "s" : ""} still require configuration.`;
    }
    return null;
  };

  const handleNext = () => {
    if (!canAdvance()) { setShowErrors(true); return; }
    setShowErrors(false); setStep((s) => s + 1);
  };

  const handleSubmit = () => {
    const orgUsers = getUsersForOrg(form.orgId);
    const users = form.scope === "single-org"
      ? (form.userSource === "select"
          ? orgUsers.filter((u) => form.selectedUserIds.includes(u.id)).map((u) => ({ email: u.email, displayName: u.displayName, organizationId: form.orgId, organizationName: form.orgName }))
          : form.validUsers)
      : form.validUsers;

    const orgConfigs: OrgJobConfig[] = form.scope === "single-org"
      ? [{ orgId: form.orgId, orgName: form.orgName, accessRoles: getAvailableRolesForOrg(form.orgId, getParentId(form.orgId)).filter((r) => form.accessRoleIds.includes(r.id)).map((r) => r.name) }]
      : Object.values(form.orgConfigs).map((c) => ({ orgId: c.orgId, orgName: c.orgName, accessRoles: getAvailableRolesForOrg(c.orgId, getParentId(c.orgId)).filter((r) => c.accessRoleIds.includes(r.id)).map((r) => r.name) }));

    const job = createBulkAccessJob({ operation: form.operation!, scope: form.scope!, orgConfigs, users });
    toast({ title: "Job queued", description: `Bulk access role job ${job.id} created.` });
    setSubmittedJobId(job.id);
  };

  const error = showErrors ? stepError() : null;

  return (
    <Layout>
      <div className="min-h-screen bg-bluegrey-25">
        <div className="sticky top-16 bg-white border-b border-bluegrey-100 z-20 px-6 lg:px-8 py-4">
          <button type="button" onClick={() => navigate("/access-roles")} className="flex items-center gap-1.5 text-sm text-bluegrey-500 hover:text-bluegrey-900 transition-colors mb-3">
            <ArrowLeft className="w-4 h-4" />Back to Access Roles
          </button>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-bluegrey-900">Bulk Access Role Assignment</h1>
              {!submittedJobId && <p className="text-sm text-bluegrey-500 mt-0.5">Step {step} of 5 — {STEP_LABELS[step - 1]}</p>}
            </div>
            {!submittedJobId && (
              <button type="button" onClick={() => navigate("/bulk-access-role-jobs")} className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800">
                <ExternalLink className="w-3.5 h-3.5" />View all jobs
              </button>
            )}
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-6 lg:px-8 py-8 space-y-8">
          {submittedJobId ? (
            <SuccessScreen jobId={submittedJobId} />
          ) : (
            <>
              <StepIndicator step={step} total={5} />
              <div className="bg-white rounded-lg border border-bluegrey-200 p-6 min-h-[320px]">
                {step === 1 && <Step1 operation={form.operation} onChange={(op) => patch({ operation: op })} />}
                {step === 2 && <Step2 userSource={form.userSource} onChange={(src) => patch({ userSource: src })} />}
                {step === 3 && <Step3 form={form} onChange={patch} />}
                {step === 4 && <Step4 form={form} onChange={patch} />}
                {step === 5 && <Step5 form={form} />}
              </div>
              {error && <p className="text-sm text-red-600 flex items-center gap-1.5"><span className="font-medium">⚠</span>{error}</p>}
              <div className="flex items-center justify-between pt-2 border-t border-bluegrey-200">
                <Button variant="ghost" onClick={() => navigate("/access-roles")}>Cancel</Button>
                <div className="flex gap-2">
                  {step > 1 && <Button variant="outline" onClick={() => { setShowErrors(false); setStep((s) => s - 1); }}>Back</Button>}
                  {step < 5 ? (
                    <Button onClick={handleNext} className="gap-1.5">Next<ChevronRight className="w-4 h-4" /></Button>
                  ) : (
                    <Button onClick={handleSubmit} className="gap-2 bg-green-600 hover:bg-green-700"><CheckCircle2 className="w-4 h-4" />Start bulk assignment</Button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
