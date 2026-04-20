import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AIAssistant } from "@/components/aiAssistant/AIAssistant";
import PermissionTreeTable from "@/components/administrators/PermissionTreeTable";
import { ROOT_PERMISSIONS, OTHER_PERMISSIONS } from "@/components/administrators/permissionTree";

export default function AddAdminRole() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type") === "other" ? "other" : "root";

  const isRoot = type === "root";
  const permissionTree = isRoot ? ROOT_PERMISSIONS : OTHER_PERMISSIONS;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const handleBack = () => {
    navigate("/administrators/all?tab=roles");
  };

  const handleSave = () => {
    if (!name.trim()) return;
    // In a real app this would call an API; for now just navigate back
    navigate("/administrators/all?tab=roles");
  };

  const handleCancel = () => {
    navigate("/administrators/all?tab=roles");
  };

  return (
    <>
      <Layout>
        <div className="min-h-screen bg-bluegrey-25">
          {/* Back link */}
          <div className="px-6 lg:px-8 pt-6">
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-1.5 text-sm text-bluegrey-600 hover:text-bluegrey-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to administrator roles
            </button>
          </div>

          {/* Page heading */}
          <div className="px-6 lg:px-8 pt-4 pb-6">
            <h1 className="text-2xl font-normal text-bluegrey-900 leading-8">
              {isRoot ? "Add root administrator role" : "Add other administrator role"}
            </h1>
            <p className="mt-2 text-sm text-bluegrey-600 max-w-3xl">
              {isRoot
                ? "Root administrator roles have permissions for managing the root organization. The permissions include user, organization, application, and access role management."
                : "Other administrator roles have permissions for managing specific organizations, excluding the root organization. These permissions include managing users and access roles."}
            </p>
          </div>

          {/* Form body */}
          <div className="px-6 lg:px-8 pb-10 space-y-8 max-w-4xl">
            {/* Basic information */}
            <section className="bg-white rounded border border-bluegrey-200 p-6 space-y-5">
              <h2 className="text-base font-semibold text-bluegrey-900">Basic information</h2>

              <div className="space-y-1.5">
                <Label htmlFor="role-name" className="text-sm font-normal text-bluegrey-900">
                  Administrator role name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="role-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="max-w-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="role-description" className="text-sm font-normal text-bluegrey-900">
                  Description
                </Label>
                <Textarea
                  id="role-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="max-w-sm"
                />
              </div>
            </section>

            {/* Permissions */}
            <section className="bg-white rounded border border-bluegrey-200 p-6 space-y-4">
              <h2 className="text-base font-semibold text-bluegrey-900">Permissions</h2>
              <PermissionTreeTable
                tree={permissionTree}
                selectedIds={selectedPermissions}
                onChange={setSelectedPermissions}
              />
            </section>

            {/* Footer actions */}
            <div className="flex items-center gap-3 pb-6">
              <Button onClick={handleSave} disabled={!name.trim()} className="gap-2">
                <Save className="h-4 w-4" />
                Save
              </Button>
              <Button variant="ghost" onClick={handleCancel} className="text-bluegrey-700">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </Layout>

      <AIAssistant userData={{}} isOpen={false} />
    </>
  );
}
