import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Copy } from "lucide-react";
import Layout from "@/components/Layout";
import OrganizationDetailHeader from "@/components/OrganizationDetailHeader";
import StatusBadge from "@/components/StatusBadge";
import { AIAssistant } from "@/components/aiAssistant/AIAssistant";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  const [isActive, setIsActive] = useState(organization?.status === "active");

  // Mock list of available IDPs from admin panel
  const availableIdps = [
    {
      id: "1",
      name: "Access Opaque E2E",
      protocol: "OpenID Connect",
      status: "active",
      authentication: "urn:onewelcome:broker:v1:accessopaquee2e:authentication",
      domainAliases: ["google.ca", "google.com", "google.uk", "apple.com"],
    },
    {
      id: "2",
      name: "Okta Production",
      protocol: "SAML 2.0",
      status: "active",
      authentication: "urn:okta:prod:v1:authentication",
      domainAliases: ["okta.com", "oktapreview.com"],
    },
    {
      id: "3",
      name: "Azure AD Enterprise",
      protocol: "OpenID Connect",
      status: "active",
      authentication: "urn:azure:ad:enterprise:v1:authentication",
      domainAliases: ["microsoft.com", "azure.com", "office365.com"],
    },
    {
      id: "4",
      name: "Auth0 Development",
      protocol: "OAuth 2.0",
      status: "inactive",
      authentication: "urn:auth0:dev:v1:authentication",
      domainAliases: ["auth0.com"],
    },
  ];

  // Default IDP (simulating what comes from the system/admin panel)
  const defaultIdpId = availableIdps[0].id;
  const defaultIdp = availableIdps.find((idp) => idp.id === defaultIdpId);

  const [overrideDefault, setOverrideDefault] = useState(false);
  const [customIdpId, setCustomIdpId] = useState(availableIdps[0].id);
  const [applyToSubOrgs, setApplyToSubOrgs] = useState(false);

  // Use custom IDP if override is enabled, otherwise use default
  const selectedIdp = overrideDefault
    ? availableIdps.find((idp) => idp.id === customIdpId)
    : defaultIdp;

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

  const handleIdpSave = async () => {
    setIsSaving(true);

    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Success",
        description: "IDP mapping saved successfully",
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

                    <div className="flex items-start gap-2">
                      <Checkbox
                        id="active"
                        checked={isActive}
                        onCheckedChange={(checked) => setIsActive(checked === true)}
                        disabled={isSaving}
                      />
                      <div className="flex flex-col gap-1">
                        <Label htmlFor="active" className="cursor-pointer text-sm font-normal text-bluegrey-900 leading-5">
                          Active
                        </Label>
                        <p className="text-xs text-[#6F6F76] leading-4">
                          When inactive, this organization cannot access resources or perform any action.
                        </p>
                      </div>
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
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleIdpSave();
                  }}
                  className="flex flex-col gap-10"
                >
                  <div className="flex w-full max-w-3xl flex-col gap-6">
                    <h2 className="text-xl font-semibold text-bluegrey-900">
                      Map {organization.name} to external IDP
                    </h2>

                    <div className="flex flex-col gap-1">
                      <Label htmlFor="externalIdp" className="flex gap-1">
                        External IDP
                        <span className="text-red-500">*</span>
                      </Label>
                      <select
                        id="externalIdp"
                        value={selectedIdpId}
                        onChange={(e) => setSelectedIdpId(e.target.value)}
                        disabled={isSaving}
                        className="flex w-full rounded-[2px] border border-bluegrey-500 bg-white px-2 py-3 text-sm text-bluegrey-900 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {availableIdps.map((idp) => (
                          <option key={idp.id} value={idp.id}>
                            {idp.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedIdp && (
                      <div className="border border-bluegrey-100 bg-white rounded py-4 px-6">
                        <div className="flex items-start gap-3">
                          <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-full flex-shrink-0">
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M12 2L2 7L12 12L22 7L12 2Z"
                                stroke="#F97316"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M2 17L12 22L22 17"
                                stroke="#F97316"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M2 12L12 17L22 12"
                                stroke="#F97316"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-4">
                              <h3 className="text-base font-medium text-black leading-6">
                                {selectedIdp.protocol}
                              </h3>
                              {selectedIdp.status === "active" && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                                  Active
                                </span>
                              )}
                              {selectedIdp.status === "inactive" && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  <span className="w-1.5 h-1.5 rounded-full bg-gray-600"></span>
                                  Inactive
                                </span>
                              )}
                            </div>

                            <div className="mb-4">
                              <p className="text-sm font-semibold text-bluegrey-700 mb-2">
                                Authentication
                              </p>
                              <div className="flex items-center gap-2 bg-bluegrey-50 border border-bluegrey-200 rounded px-3 py-2">
                                <code className="flex-1 text-xs text-bluegrey-600 font-mono break-all leading-6">
                                  {selectedIdp.authentication}
                                </code>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(selectedIdp.authentication);
                                    toast({
                                      title: "Copied",
                                      description: "Authentication URN copied to clipboard",
                                    });
                                  }}
                                  className="flex-shrink-0 p-1.5 hover:bg-bluegrey-100 rounded transition-colors"
                                  title="Copy to clipboard"
                                >
                                  <Copy className="w-4 h-4 text-bluegrey-600" />
                                </button>
                              </div>
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-bluegrey-700 mb-2">
                                Domain alias
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {selectedIdp.domainAliases.map((domain, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center px-3 py-1 rounded text-sm bg-blue-100 text-bluegrey-900"
                                  >
                                    {domain}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="border-t border-bluegrey-200 pt-6">
                      <h3 className="text-lg font-semibold text-bluegrey-900 mb-4">
                        Preferences
                      </h3>
                      <div className="flex items-start gap-2">
                        <Checkbox
                          id="applyToSubOrgs"
                          checked={applyToSubOrgs}
                          onCheckedChange={(checked) => setApplyToSubOrgs(checked === true)}
                          disabled={isSaving}
                        />
                        <div className="flex flex-col gap-1">
                          <Label
                            htmlFor="applyToSubOrgs"
                            className="cursor-pointer text-sm font-normal text-bluegrey-900 leading-5"
                          >
                            Apply to all sub organizations by default
                          </Label>
                          <p className="text-xs text-[#6F6F76] leading-4">
                            This same mapping will be applied to all the sub organizations
                          </p>
                        </div>
                      </div>
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
            </Tabs>
          </div>
        </div>
      </Layout>
      <AIAssistant userData={{}} isOpen={false} />
    </>
  );
}
