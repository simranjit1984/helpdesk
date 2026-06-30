import { useState, useRef } from "react";
import { Upload, Download, FileText, AlertCircle, CheckCircle2, X, Building2 } from "lucide-react";
import { baseOrganizations } from "@/components/OrganizationsTable";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ParsedUser {
  email: string;
  firstName: string;
  lastName: string;
  organizationId: string;
  organizationName: string;
  rowNumber: number;
}

export interface UserValidationError {
  row: Partial<ParsedUser> & { rowNumber: number };
  errors: string[];
}

// ─── Org helpers ──────────────────────────────────────────────────────────────

interface FlatOrg {
  id: string;
  name: string;
  referenceId: string;
  parentName?: string;
  path?: string;
}

function buildFlatOrgs(): FlatOrg[] {
  const result: FlatOrg[] = [];
  baseOrganizations.forEach((org) => {
    result.push({ id: org.id, name: org.name, referenceId: org.referenceId });
    org.children?.forEach((child) => {
      result.push({
        id: child.id,
        name: child.name,
        referenceId: child.referenceId,
        parentName: org.name,
        path: org.name,
      });
    });
  });
  return result;
}

const FLAT_ORGS = buildFlatOrgs();
const ORG_BY_ID = new Map(FLAT_ORGS.map((o) => [o.id, o]));

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_USERS = 10_000;
const MAX_FILE_SIZE_MB = 10;

// ─── CSV helpers ──────────────────────────────────────────────────────────────

function parseCSV(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length === 0) return { headers: [], rows: [] };
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  const rows = lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = values[i] ?? ""; });
    return row;
  });
  return { headers, rows };
}

function validateUsers(rows: Record<string, string>[], mode: "single-org" | "multi-org"): {
  valid: ParsedUser[];
  invalid: UserValidationError[];
} {
  const seen = new Set<string>(); // email+orgId
  const valid: ParsedUser[] = [];
  const invalid: UserValidationError[] = [];

  rows.slice(0, MAX_USERS).forEach((row, i) => {
    const errors: string[] = [];
    const email = row["Email"]?.trim() ?? "";
    const firstName = row["First Name"]?.trim() ?? "";
    const lastName = row["Last Name"]?.trim() ?? "";
    const organizationId = mode === "multi-org" ? (row["Organization ID"]?.trim() ?? "") : "";

    if (!email) {
      errors.push("Email is required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push("Invalid email format");
    }

    if (mode === "multi-org") {
      if (!organizationId) {
        errors.push("Organization ID is required");
      } else if (!ORG_BY_ID.has(organizationId)) {
        errors.push(`Unknown Organization ID: "${organizationId}"`);
      }
    }

    const dedupeKey = mode === "multi-org"
      ? `${email.toLowerCase()}|${organizationId}`
      : email.toLowerCase();
    if (email && seen.has(dedupeKey)) {
      errors.push(mode === "multi-org" ? "Duplicate email + organization combination" : "Duplicate email address");
    }
    if (email) seen.add(dedupeKey);

    const orgInfo = ORG_BY_ID.get(organizationId);
    const rowNumber = i + 2;

    if (errors.length > 0) {
      invalid.push({ row: { email, firstName, lastName, organizationId, rowNumber }, errors });
    } else {
      valid.push({
        email,
        firstName,
        lastName,
        organizationId,
        organizationName: orgInfo?.name ?? "",
        rowNumber,
      });
    }
  });

  return { valid, invalid };
}

// ─── CSV downloads ────────────────────────────────────────────────────────────

function downloadUserTemplate(mode: "single-org" | "multi-org") {
  const csv = mode === "single-org"
    ? "Email,First Name,Last Name\njohn.doe@example.com,John,Doe\njane.smith@example.com,Jane,Smith\n"
    : "Email,First Name,Last Name,Organization ID\njohn.doe@example.com,John,Doe,1\njane.smith@example.com,Jane,Smith,1-1\n";
  triggerDownload(csv, "bulk-invite-template.csv");
}

function downloadOrgsCsv() {
  const header = "Organization ID,Organization Name,Organization Path,Parent Organization\n";
  const rows = FLAT_ORGS.map((o) =>
    `${o.id},"${o.name}","${o.path ?? ""}","${o.parentName ?? ""}"`
  ).join("\n");
  triggerDownload(header + rows, "organizations.csv");
}

function triggerDownload(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadErrorReport(invalidUsers: UserValidationError[]) {
  const header = "Row,Email,First Name,Last Name,Organization ID,Errors\n";
  const rows = invalidUsers
    .map(({ row, errors }) =>
      `${row.rowNumber},"${row.email ?? ""}","${row.firstName ?? ""}","${row.lastName ?? ""}","${row.organizationId ?? ""}","${errors.join("; ")}"`
    )
    .join("\n");
  triggerDownload(header + rows, "bulk-invite-errors.csv");
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  mode: "single-org" | "multi-org";
  onValidated: (valid: ParsedUser[], invalid: UserValidationError[], fileName: string) => void;
  initialValid?: ParsedUser[];
  initialInvalid?: UserValidationError[];
  initialFileName?: string;
}

export default function Step1Upload({ mode, onValidated, initialValid, initialInvalid, initialFileName }: Props) {
  const [fileName, setFileName] = useState(initialFileName ?? "");
  const [valid, setValid] = useState<ParsedUser[]>(initialValid ?? []);
  const [invalid, setInvalid] = useState<UserValidationError[]>(initialInvalid ?? []);
  const [parseError, setParseError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const hasResult = valid.length > 0 || invalid.length > 0;

  const processFile = (file: File) => {
    setParseError("");
    if (!file.name.endsWith(".csv")) {
      setParseError("Only .csv files are supported.");
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setParseError(`File exceeds the ${MAX_FILE_SIZE_MB} MB size limit.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const { headers, rows } = parseCSV(text);
      if (!headers.includes("Email")) {
        setParseError('Missing required column: "Email". Please use the provided template.');
        return;
      }
      if (mode === "multi-org" && !headers.includes("Organization ID")) {
        setParseError('Missing required column: "Organization ID". Please use the latest template.');
        return;
      }
      const { valid: v, invalid: iv } = validateUsers(rows, mode);
      setFileName(file.name);
      setValid(v);
      setInvalid(iv);
      onValidated(v, iv, file.name);
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const reset = () => {
    setFileName("");
    setValid([]);
    setInvalid([]);
    setParseError("");
    onValidated([], [], "");
  };

  // Derive unique orgs from valid users
  const orgsSeen = new Map<string, { name: string; count: number }>();
  valid.forEach((u) => {
    const existing = orgsSeen.get(u.organizationId);
    if (existing) existing.count++;
    else orgsSeen.set(u.organizationId, { name: u.organizationName, count: 1 });
  });
  const orgsFound = Array.from(orgsSeen.entries()).map(([id, v]) => ({ id, ...v }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-bluegrey-900">Upload users</h2>
        <p className="text-sm text-bluegrey-500 mt-1">
          {mode === "single-org"
            ? "Upload a CSV file with the users you want to invite. Download the template below to get started."
            : "Upload a CSV file containing users and their target organizations. Each user row must include an Organization ID from the organizations list."}
        </p>
      </div>

      {/* Download links */}
      <div className="rounded-md border border-bluegrey-200 bg-bluegrey-50 px-4 py-3 space-y-2">
        <p className="text-xs font-semibold text-bluegrey-600 uppercase tracking-wide mb-1">Download templates</p>
        <button
          type="button"
          onClick={() => downloadUserTemplate(mode)}
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          <Download className="w-4 h-4" />
          Download User CSV Template
        </button>
        {mode === "multi-org" && (
          <>
            <button
              type="button"
              onClick={downloadOrgsCsv}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              Download Organizations CSV
            </button>
            <p className="text-xs text-bluegrey-500 mt-1">
              Use the <strong>Organization ID</strong> from the Organizations CSV in the{" "}
              <strong>Organization ID</strong> column of the user import file.
            </p>
          </>
        )}
      </div>

      {/* Drop zone */}
      {!hasResult && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
            isDragging
              ? "border-blue-400 bg-blue-50"
              : "border-bluegrey-300 hover:border-blue-400 hover:bg-bluegrey-25"
          }`}
        >
          <Upload className="w-10 h-10 text-bluegrey-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-bluegrey-700 mb-1">
            Drag and drop a CSV file, or{" "}
            <span className="text-blue-600 underline">browse</span>
          </p>
          <p className="text-xs text-bluegrey-400">
            Maximum {MAX_FILE_SIZE_MB} MB · Up to {MAX_USERS.toLocaleString()} users
          </p>
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}

      {/* Parse error */}
      {parseError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 flex items-start gap-2 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          {parseError}
        </div>
      )}

      {/* Validation results */}
      {hasResult && (
        <div className="space-y-4">
          {/* File chip */}
          <div className="flex items-center gap-3 bg-bluegrey-50 border border-bluegrey-200 rounded-md px-3 py-2 w-fit">
            <FileText className="w-4 h-4 text-bluegrey-500" />
            <span className="text-sm text-bluegrey-800">{fileName}</span>
            <button type="button" onClick={reset} className="text-bluegrey-400 hover:text-red-500 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Total users",  value: valid.length + invalid.length, color: "text-bluegrey-900" },
              { label: "Valid",        value: valid.length,                  color: "text-green-700"    },
              { label: "Invalid",      value: invalid.length,                color: invalid.length > 0 ? "text-red-600" : "text-bluegrey-400" },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-lg border border-bluegrey-200 bg-white px-4 py-3 text-center">
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-bluegrey-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Organizations found */}
          {orgsFound.length > 0 && (
            <div className="rounded-md border border-bluegrey-200 bg-white overflow-hidden">
              <div className="px-4 py-2.5 bg-bluegrey-50 border-b border-bluegrey-200 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-bluegrey-500" />
                <span className="text-xs font-semibold text-bluegrey-600 uppercase tracking-wide">
                  {orgsFound.length} Organization{orgsFound.length !== 1 ? "s" : ""} found
                </span>
              </div>
              <div className="divide-y divide-bluegrey-100">
                {orgsFound.map((org) => (
                  <div key={org.id} className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-sm text-bluegrey-800 font-medium">{org.name}</span>
                    <span className="text-xs text-bluegrey-500">{org.count} user{org.count !== 1 ? "s" : ""}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All valid banner */}
          {invalid.length === 0 && (
            <div className="flex items-center gap-2 rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
              <CheckCircle2 className="w-4 h-4" />
              All users are valid and ready to invite.
            </div>
          )}

          {/* Errors table */}
          {invalid.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-red-700 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  {invalid.length} row{invalid.length !== 1 ? "s" : ""} with errors
                  {valid.length > 0 && ` — ${valid.length} valid rows will continue`}
                </p>
                <button
                  type="button"
                  onClick={() => downloadErrorReport(invalid)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download error report
                </button>
              </div>
              <div className="rounded-md border border-red-200 overflow-hidden max-h-52 overflow-y-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-red-50 border-b border-red-200">
                      <th className="text-left px-3 py-2 font-semibold text-red-700">Row</th>
                      <th className="text-left px-3 py-2 font-semibold text-red-700">Email</th>
                      <th className="text-left px-3 py-2 font-semibold text-red-700">Org ID</th>
                      <th className="text-left px-3 py-2 font-semibold text-red-700">Errors</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-red-100">
                    {invalid.map(({ row, errors }) => (
                      <tr key={row.rowNumber} className="bg-white">
                        <td className="px-3 py-2 text-bluegrey-500">{row.rowNumber}</td>
                        <td className="px-3 py-2 font-mono text-bluegrey-800">{row.email || "—"}</td>
                        <td className="px-3 py-2 font-mono text-bluegrey-800">{row.organizationId || "—"}</td>
                        <td className="px-3 py-2 text-red-600">{errors.join("; ")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
