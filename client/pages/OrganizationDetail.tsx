import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Layout from "@/components/Layout";
import OrganizationDetailHeader from "@/components/OrganizationDetailHeader";
import StatusBadge from "@/components/StatusBadge";
import { AIAssistant } from "@/components/aiAssistant/AIAssistant";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { baseOrganizations } from "@/components/OrganizationsTable";

export default function OrganizationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const findOrganization = (orgId: string) => {
    for (const org of baseOrganizations) {
      if (org.id === orgId) {
        return org;
      }
      if (org.children) {
        const child = org.children.find((c) => c.id === orgId);
        if (child) {
          return child;
        }
      }
    }
    return null;
  };

  const organization = findOrganization(id || "");

  const [formData, setFormData] = useState({
    organizationName: organization?.name || "",
    description: "",
  });

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);

    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Success",
        description: "Organization updated successfully",
      });
    }, 1000);
  };

  const handleCancel = () => {
    navigate("/organizations");
  };

  if (!organization) {
    return (
      <>
        <Layout>
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="bg-white rounded-lg p-8 text-center">
              <p className="text-bluegrey-900 mb-4">
                The organization you're looking for doesn't exist.
              </p>
              <button
                onClick={() => navigate("/organizations")}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-sm transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Organizations
              </button>
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
        <OrganizationDetailHeader
          organizationName={organization.name}
          status={organization.status}
          showActions={true}
        />

        <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="bg-white">
            <Tabs defaultValue="basic" className="w-full">
              <div className="border-b border-bluegrey-100">
                <TabsList className="h-auto bg-transparent p-0">
                  <TabsTrigger
                    value="basic"
                    className="relative rounded-none border-b-4 border-transparent px-4 py-2 text-base font-normal data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-blue-500 data-[state=active]:shadow-none"
                  >
                    Basic information
                  </TabsTrigger>
                  <TabsTrigger
                    value="access-roles"
                    className="relative rounded-none border-b-4 border-transparent px-4 py-2 text-base font-normal data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-blue-500 data-[state=active]:shadow-none"
                  >
                    Access roles
                  </TabsTrigger>
                  <TabsTrigger
                    value="users"
                    className="relative rounded-none border-b-4 border-transparent px-4 py-2 text-base font-normal data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-blue-500 data-[state=active]:shadow-none"
                  >
                    Users
                  </TabsTrigger>
                  <TabsTrigger
                    value="idp-mapping"
                    className="relative rounded-none border-b-4 border-transparent px-4 py-2 text-base font-normal data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-blue-500 data-[state=active]:shadow-none"
                  >
                    IDP mapping
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="basic" className="pt-6">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSave();
                  }}
                  className="flex flex-col gap-10"
                >
                  <div className="flex w-full max-w-sm flex-col gap-6">
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="organizationName" className="flex gap-1">
                        Organization name
                        <span className="text-red-500">*</span>
                      </Label>
                      <input
                        id="organizationName"
                        type="text"
                        value={formData.organizationName}
                        onChange={handleFormChange}
                        disabled={isSaving}
                        className="flex w-full rounded-[2px] border border-bluegrey-500 bg-white px-2 py-3 text-sm text-bluegrey-900 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <Label htmlFor="description">Description</Label>
                      <textarea
                        id="description"
                        value={formData.description}
                        onChange={handleFormChange}
                        disabled={isSaving}
                        rows={4}
                        className="flex w-full rounded-[2px] border border-bluegrey-500 bg-white px-2 py-3 text-sm text-bluegrey-900 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <Label>Reference ID</Label>
                      <p className="text-sm text-bluegrey-900">
                        {organization.referenceId}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      type="submit"
                      disabled={isSaving}
                      className="bg-blue-500 hover:bg-blue-600 text-white h-10 px-4 rounded-[2px]"
                    >
                      {isSaving ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      type="button"
                      onClick={handleCancel}
                      disabled={isSaving}
                      variant="ghost"
                      className="h-10 px-4 rounded-[2px] text-bluegrey-900"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="access-roles" className="pt-6">
                <div className="text-bluegrey-500">
                  Access roles configuration for this organization.
                </div>
              </TabsContent>

              <TabsContent value="users" className="pt-6">
                <div className="text-bluegrey-500">
                  Users belonging to this organization.
                </div>
              </TabsContent>

              <TabsContent value="idp-mapping" className="pt-6">
                <div className="text-bluegrey-500">
                  IDP mapping configuration for this organization.
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </Layout>
      <AIAssistant userData={{}} isOpen={false} />
    </>
  );
}
