import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, Info } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import PermissionsTab from "@/components/applications/PermissionsTab";
import { FEDERATED_APP_OPTIONS, type Permission } from "@/lib/applicationsMockData";

const TAB_CLASS =
  "h-auto py-3 px-0 rounded-none bg-transparent text-base font-medium " +
  "border-b-2 border-transparent shadow-none " +
  "text-bluegrey-900 " +
  "data-[state=active]:border-bluegrey-900 data-[state=active]:text-bluegrey-900 " +
  "data-[state=active]:bg-transparent data-[state=active]:shadow-none " +
  "hover:text-bluegrey-700 transition-colors";

// ─── Read-only field ──────────────────────────────────────────────────────────

function ReadOnlyField({
  label,
  value,
  showInfo,
}: {
  label: string;
  value: string;
  showInfo?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        <label className="text-sm font-medium text-bluegrey-900">{label}</label>
        {showInfo && <Info className="w-4 h-4 text-bluegrey-400" />}
      </div>
      <input
        type="text"
        value={value}
        readOnly
        className="h-10 px-3 text-sm border border-bluegrey-300 rounded-sm bg-bluegrey-25 text-bluegrey-700 max-w-xs cursor-default focus:outline-none"
      />
    </div>
  );
}

// ─── Text input field ─────────────────────────────────────────────────────────

function TextField({
  label,
  id,
  value,
  onChange,
  required,
  helperText,
  multiline,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  helperText?: string;
  multiline?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-bluegrey-900">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {multiline ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={5}
          className="px-3 py-2 text-sm border border-bluegrey-300 rounded-sm bg-white text-bluegrey-900 max-w-lg resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      ) : (
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 px-3 text-sm border border-bluegrey-300 rounded-sm bg-white text-bluegrey-900 max-w-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      )}
      {helperText && (
        <p className="text-xs text-bluegrey-500 mt-0.5">{helperText}</p>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AddApplication() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const type = searchParams.get("type") ?? "non-federated";
  const federatedAppId = searchParams.get("appId") ?? "";
  const isFederated = type === "federated";

  const federatedLabel =
    FEDERATED_APP_OPTIONS.find((o) => o.value === federatedAppId)?.label ?? federatedAppId;

  const [displayName, setDisplayName] = useState(federatedLabel || "");
  const [description, setDescription] = useState("");
  const [externalId, setExternalId] = useState("");
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  const canSave = displayName.trim().length > 0;

  async function handleSave(continueToNext = false) {
    if (!canSave) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    setSaving(false);
    toast({
      title: "Success",
      description: "Application saved successfully",
    });
    if (!continueToNext) {
      navigate("/applications");
    } else {
      setActiveTab("permissions");
    }
  }

  return (
    <Layout>
      {/* Back link + page title */}
      <div className="px-4 sm:px-6 lg:px-8 pt-6 pb-0 bg-white border-b border-bluegrey-100">
        <Link
          to="/applications"
          className="inline-flex items-center gap-1.5 text-sm text-bluegrey-600 hover:text-bluegrey-900 transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to applications
        </Link>
        <h1 className="text-3xl font-bold text-bluegrey-900 mb-6">Add application</h1>

        {/* Tab bar */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="h-auto bg-transparent p-0 gap-6 border-0">
            <TabsTrigger value="basic" className={TAB_CLASS}>
              Basic information
            </TabsTrigger>
            <TabsTrigger value="permissions" className={TAB_CLASS}>
              Permissions
            </TabsTrigger>
          </TabsList>

          {/* Basic information */}
          <TabsContent value="basic" className="mt-0 pt-8 pb-10">
            <div className="flex flex-col gap-6 max-w-lg">
              {/* Federated-only fields */}
              {isFederated && (
                <>
                  <ReadOnlyField
                    label="Federated application"
                    value={federatedLabel}
                    showInfo
                  />
                  <ReadOnlyField label="Entity ID" value={federatedAppId} />
                </>
              )}

              <TextField
                label="Application display name"
                id="displayName"
                value={displayName}
                onChange={setDisplayName}
                required
              />

              <TextField
                label="Description"
                id="description"
                value={description}
                onChange={setDescription}
                multiline
              />

              <TextField
                label="External ID"
                id="externalId"
                value={externalId}
                onChange={setExternalId}
                helperText="Optional external reference to this application"
              />

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <Button
                  onClick={() => handleSave(true)}
                  disabled={!canSave || saving}
                  className="flex items-center gap-2 bg-bluegrey-900 hover:bg-bluegrey-800 text-white h-11 px-5 rounded-sm font-medium"
                >
                  {saving ? "Saving…" : "Save and continue →"}
                </Button>
                <Button
                  onClick={() => handleSave(false)}
                  disabled={!canSave || saving}
                  variant="outline"
                  className="h-11 px-5 rounded-sm border-2 border-bluegrey-900 text-bluegrey-900 hover:bg-bluegrey-50 font-medium"
                >
                  Save
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/applications")}
                  disabled={saving}
                  className="h-11 px-4 text-bluegrey-700"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Permissions */}
          <TabsContent value="permissions" className="mt-0 pt-8 pb-10">
            <PermissionsTab
              permissions={permissions}
              onChange={setPermissions}
              isFederated={isFederated}
            />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
