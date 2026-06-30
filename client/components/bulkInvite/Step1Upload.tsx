import { useState, useRef } from "react";
import { Upload, Download, FileText, AlertCircle, CheckCircle2, X } from "lucide-react";

export interface ParsedUser {
  email: string;
  firstName: string;
  lastName: string;
  rowNumber: number;
}

export interface UserValidationError {
  user: ParsedUser;
  errors: string[];
}

interface Props {
  onValidated: (valid: ParsedUser[], invalid: UserValidationError[], fileName: string) => void;
  initialValid?: ParsedUser[];
  initialInvalid?: UserValidationError[];
  initialFileName?: string;
}

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

function validateUsers(rows: Record<string, string>[]): {
  valid: ParsedUser[];
  invalid: UserValidationError[];
} {
  const emailSeen = new Set<string>();
  const valid: ParsedUser[] = [];
  const invalid: UserValidationError[] = [];

  rows.slice(0, MAX_USERS).forEach((row, i) => {
    const errors: string[] = [];
    const email = row["Email"]?.trim() ?? "";
    const firstName = row["First Name"]?.trim() ?? "";
    const lastName = row["Last Name"]?.trim() ?? "";

    if (!email) {
      errors.push("Email is required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push("Invalid email format");
    } else if (emailSeen.has(email.toLowerCase())) {
      errors.push("Duplicate email address");
    }

    if (email) emailSeen.add(email.toLowerCase());

    const user: ParsedUser = { email, firstName, lastName, rowNumber: i + 2 };
    if (errors.length > 0) invalid.push({ user, errors });
    else valid.push(user);
  });

  return { valid, invalid };
}

function downloadTemplate() {
  const csv = "Email,First Name,Last Name\njohn.doe@example.com,John,Doe\njane.smith@example.com,Jane,Smith\n";
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "bulk-invite-template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function downloadErrorReport(invalidUsers: UserValidationError[]) {
  const header = "Row,Email,First Name,Last Name,Errors\n";
  const rows = invalidUsers
    .map(({ user, errors }) =>
      `${user.rowNumber},"${user.email}","${user.firstName}","${user.lastName}","${errors.join("; ")}"`
    )
    .join("\n");
  const blob = new Blob([header + rows], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "bulk-invite-errors.csv";
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Step1Upload({ onValidated, initialValid, initialInvalid, initialFileName }: Props) {
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
      const { valid: v, invalid: iv } = validateUsers(rows);
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-bluegrey-900">Upload users</h2>
        <p className="text-sm text-bluegrey-500 mt-1">
          Upload a CSV file with the users you want to invite. Download the template below to get
          started.
        </p>
      </div>

      {/* Download template */}
      <button
        type="button"
        onClick={downloadTemplate}
        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
      >
        <Download className="w-4 h-4" />
        Download CSV template
      </button>

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
              { label: "Total users",   value: valid.length + invalid.length, color: "text-bluegrey-900" },
              { label: "Valid",         value: valid.length,                  color: "text-green-700"    },
              { label: "Invalid",       value: invalid.length,                color: invalid.length > 0 ? "text-red-600" : "text-bluegrey-400" },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-lg border border-bluegrey-200 bg-white px-4 py-3 text-center">
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-bluegrey-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

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
                      <th className="text-left px-3 py-2 font-semibold text-red-700">Errors</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-red-100">
                    {invalid.map(({ user, errors }) => (
                      <tr key={user.rowNumber} className="bg-white">
                        <td className="px-3 py-2 text-bluegrey-500">{user.rowNumber}</td>
                        <td className="px-3 py-2 font-mono text-bluegrey-800">{user.email || "—"}</td>
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
