import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { AIAssistant } from "@/components/aiAssistant/AIAssistant";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import UserAttributeVisibilityTab from "@/components/settings/UserAttributeVisibilityTab";

const TAB_TRIGGER_CLASS =
  "h-auto py-3 px-0 rounded-none bg-transparent text-sm font-medium " +
  "border-b-2 border-transparent shadow-none " +
  "text-bluegrey-500 " +
  "data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 " +
  "data-[state=active]:bg-transparent data-[state=active]:shadow-none " +
  "hover:text-bluegrey-900 transition-colors";

function GeneralSettingsTab() {
  const [showUserAccountValidity, setShowUserAccountValidity] = useState(false);
  const [showAccessRoleValidity, setShowAccessRoleValidity] = useState(false);

  const handleSave = () => {
    // In a real app this would call an API
  };

  const handleCancel = () => {
    setShowUserAccountValidity(false);
    setShowAccessRoleValidity(false);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-8">
      {/* User and invitation settings section */}
      <section>
        <h2 className="text-xl font-medium text-bluegrey-900 mb-6">
          User and invitation settings
        </h2>

        {/* Validity period for user accounts */}
        <div className="mb-8">
          <h3 className="text-base font-medium text-blue-700 mb-1">
            Validity period for user accounts
          </h3>
          <p className="text-sm text-bluegrey-600 mb-4">
            These settings control whether to include a validity period for the user account on the
            invite user and user details pages.
          </p>
          <div className="flex items-center gap-2">
            <Checkbox
              id="user-account-validity"
              checked={showUserAccountValidity}
              onCheckedChange={(checked) => setShowUserAccountValidity(checked === true)}
            />
            <Label
              htmlFor="user-account-validity"
              className="text-sm text-bluegrey-900 cursor-pointer"
            >
              Show the validity period settings
            </Label>
          </div>
        </div>

        {/* Validity period for access roles */}
        <div className="mb-8">
          <h3 className="text-base font-medium text-blue-700 mb-1">
            Validity period for access roles
          </h3>
          <p className="text-sm text-bluegrey-600 mb-4">
            These settings control whether to include a validity period for access roles on the
            invite user and user details pages.
          </p>
          <div className="flex items-center gap-2">
            <Checkbox
              id="access-role-validity"
              checked={showAccessRoleValidity}
              onCheckedChange={(checked) => setShowAccessRoleValidity(checked === true)}
            />
            <Label
              htmlFor="access-role-validity"
              className="text-sm text-bluegrey-900 cursor-pointer"
            >
              Show the validity period settings
            </Label>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <Button onClick={handleSave} className="gap-2">
            <Save className="w-4 h-4" />
            Save
          </Button>
          <Button variant="ghost" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      </section>
    </div>
  );
}

export default function Settings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "general";

  const handleTabChange = (val: string) => {
    setSearchParams({ tab: val });
  };

  return (
    <>
      <Layout>
        {/* Page header */}
        <div className="sticky top-16 bg-bluegrey-25 px-4 sm:px-6 lg:px-8 py-6 lg:py-8 z-30">
          <h1 className="text-3xl sm:text-4xl lg:text-[42px] lg:leading-[50px] font-medium text-bluegrey-750">
            Settings
          </h1>
          <p className="mt-1 text-sm text-bluegrey-600">
            Configure settings and feature availability for the Delegated User Management
            application.
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <div className="bg-white border-b border-bluegrey-200 px-4 sm:px-6 lg:px-8">
            <TabsList className="h-auto bg-transparent p-0 gap-6 -mb-px">
              <TabsTrigger value="general" className={TAB_TRIGGER_CLASS}>
                General settings
              </TabsTrigger>
              <TabsTrigger value="attributes" className={TAB_TRIGGER_CLASS}>
                User attribute visibility and order
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="general" className="mt-0">
            <GeneralSettingsTab />
          </TabsContent>
          <TabsContent value="attributes" className="mt-0">
            <UserAttributeVisibilityTab />
          </TabsContent>
        </Tabs>
      </Layout>

      <AIAssistant userData={{}} isOpen={false} />
    </>
  );
}
