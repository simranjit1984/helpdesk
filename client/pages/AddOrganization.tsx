import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import OrganizationDetailHeader from "@/components/OrganizationDetailHeader";
import { AIAssistant } from "@/components/aiAssistant/AIAssistant";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function AddOrganization() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    organizationName: "",
    description: "",
  });
  const [errors, setErrors] = useState({
    organizationName: "",
  });

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
    if (id === "organizationName" && errors.organizationName) {
      setErrors((prev) => ({
        ...prev,
        organizationName: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      organizationName: "",
    };

    if (!formData.organizationName.trim()) {
      newErrors.organizationName = "Organization name is required";
    }

    setErrors(newErrors);
    return !newErrors.organizationName;
  };

  const handleSave = async (continueAfterSave: boolean = false) => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Success",
        description: "Organization saved successfully",
      });

      if (continueAfterSave) {
        toast({
          title: "Info",
          description: "You can now configure access roles, users, and IDP mapping",
        });
      } else {
        navigate("/organizations");
      }
    }, 1000);
  };

  const handleCancel = () => {
    navigate("/organizations");
  };

  return (
    <>
      <Layout>
        <OrganizationDetailHeader
          organizationName="Add organization"
          isNew={true}
          showActions={false}
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
                    disabled
                    className="relative rounded-none border-b-4 border-transparent px-4 py-2 text-base font-normal data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-blue-500 data-[state=active]:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Access roles
                  </TabsTrigger>
                  <TabsTrigger
                    value="users"
                    disabled
                    className="relative rounded-none border-b-4 border-transparent px-4 py-2 text-base font-normal data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-blue-500 data-[state=active]:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Users
                  </TabsTrigger>
                  <TabsTrigger
                    value="idp-mapping"
                    disabled
                    className="relative rounded-none border-b-4 border-transparent px-4 py-2 text-base font-normal data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-blue-500 data-[state=active]:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    IDP mapping
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="basic" className="pt-6">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSave(false);
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
                        className={`flex w-full rounded-[2px] border ${
                          errors.organizationName
                            ? "border-red-500"
                            : "border-bluegrey-500"
                        } bg-white px-2 py-3 text-sm text-bluegrey-900 disabled:cursor-not-allowed disabled:opacity-50`}
                      />
                      {errors.organizationName && (
                        <p className="text-sm text-red-500">
                          {errors.organizationName}
                        </p>
                      )}
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
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      onClick={() => handleSave(true)}
                      disabled={isSaving}
                      className="bg-blue-500 hover:bg-blue-600 text-white h-10 px-4 rounded-sm"
                    >
                      {isSaving ? "Saving..." : "Save and continue"}
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSaving}
                      variant="secondary"
                      className="h-10 px-4 rounded-sm"
                    >
                      Save
                    </Button>
                    <Button
                      type="button"
                      onClick={handleCancel}
                      disabled={isSaving}
                      variant="ghost"
                      className="h-10 px-4 rounded-sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="access-roles" className="pt-6">
                <div className="text-bluegrey-500">
                  Access roles configuration will be available after creating the organization.
                </div>
              </TabsContent>

              <TabsContent value="users" className="pt-6">
                <div className="text-bluegrey-500">
                  User management will be available after creating the organization.
                </div>
              </TabsContent>

              <TabsContent value="idp-mapping" className="pt-6">
                <div className="text-bluegrey-500">
                  IDP mapping will be available after creating the organization.
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
