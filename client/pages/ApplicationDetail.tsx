import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, MoreHorizontal, Trash2 } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import PermissionsTab from "@/components/applications/PermissionsTab";
import { MOCK_APPLICATIONS, FEDERATED_APP_OPTIONS, type Permission } from "@/lib/applicationsMockData";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const TAB_CLASS =
  "h-auto py-3 px-0 rounded-none bg-transparent text-base font-medium " +
  "border-b-2 border-transparent shadow-none " +
  "text-bluegrey-900 " +
  "data-[state=active]:border-bluegrey-900 data-[state=active]:text-bluegrey-900 " +
  "data-[state=active]:bg-transparent data-[state=active]:shadow-none " +
  "hover:text-bluegrey-700 transition-colors";

function ReadOnlyField({ label, value, showInfo }: { label: string; value: string; showInfo?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-bluegrey-900">{label}</label>
      <input
        type="text"
        value={value}
        readOnly
        className="h-10 px-3 text-sm border border-bluegrey-300 rounded-sm bg-bluegrey-25 text-bluegrey-700 max-w-xs cursor-default focus:outline-none"
      />
    </div>
  );
}

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
      {helperText && <p className="text-xs text-bluegrey-500 mt-0.5">{helperText}</p>}
    </div>
  );
}

export default function ApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const app = MOCK_APPLICATIONS.find((a) => a.id === id);

  const [displayName, setDisplayName] = useState(app?.displayName ?? "");
  const [description, setDescription] = useState(app?.description ?? "");
  const [externalId, setExternalId] = useState(app?.externalId ?? "");
  const [permissions, setPermissions] = useState<Permission[]>(app?.permissions ?? []);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  if (!app) {
    return (
      <Layout>
        <div className="px-8 py-12 text-center">
          <p className="text-bluegrey-600 mb-4">Application not found.</p>
          <Button onClick={() => navigate("/applications")} variant="outline">
            Back to Applications
          </Button>
        </div>
      </Layout>
    );
  }

  const isFederated = app.type === "federated";
  const federatedLabel =
    FEDERATED_APP_OPTIONS.find((o) => o.value === app.federatedAppId)?.label ??
    app.federatedAppId ?? "";

  async function handleSave() {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    setSaving(false);
    toast({ title: "Success", description: "Application updated successfully" });
  }

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8 pt-6 pb-0 bg-white border-b border-bluegrey-100">
        {/* Back link */}
        <Link
          to="/applications"
          className="inline-flex items-center gap-1.5 text-sm text-bluegrey-600 hover:text-bluegrey-900 transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to applications
        </Link>

        {/* Header row */}
        <div className="flex items-start justify-between mb-6">
          <h1 className="text-3xl font-bold text-bluegrey-900">{app.displayName}</h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 rounded-md hover:bg-bluegrey-100 text-bluegrey-500 transition-colors mt-1">
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="gap-2 text-red-600 focus:text-red-600"
                onClick={() => navigate("/applications")}
              >
                <Trash2 className="h-4 w-4" />
                Delete application
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Tabs */}
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
              {isFederated && (
                <>
                  <ReadOnlyField label="Federated application" value={federatedLabel} showInfo />
                  <ReadOnlyField label="Entity ID" value={app.entityId ?? ""} />
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

              <div className="flex items-center gap-3 pt-2">
                <Button
                  onClick={handleSave}
                  disabled={!displayName.trim() || saving}
                  className="bg-bluegrey-900 hover:bg-bluegrey-800 text-white h-11 px-5 rounded-sm font-medium"
                >
                  {saving ? "Saving…" : "Save"}
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
