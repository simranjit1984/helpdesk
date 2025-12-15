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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
      logoUrl: "https://cdn.builder.io/api/v1/image/assets%2F82e2f8ec35ab46749ef52edc2f137b7b%2F3abed568f5664b59afd4da03e6ce6521",
      protocol: "OpenID Connect",
      status: "active",
      authentication: "urn:onewelcome:broker:v1:accessopaquee2e:authentication",
      domainAliases: ["google.ca", "google.com", "google.uk", "apple.com"],
    },
    {
      id: "2",
      name: "Okta Production",
      logoUrl: "https://cdn.builder.io/api/v1/image/assets%2F82e2f8ec35ab46749ef52edc2f137b7b%2F9e6c6b52eef84b868cf3c1e0f6aa1bd5",
      protocol: "SAML 2.0",
      status: "active",
      authentication: "urn:okta:prod:v1:authentication",
      domainAliases: ["okta.com", "oktapreview.com"],
    },
    {
      id: "3",
      name: "Azure AD Enterprise",
      logoUrl: "https://cdn.builder.io/api/v1/image/assets%2F82e2f8ec35ab46749ef52edc2f137b7b%2F6b176d18888a4a0ca09e9d2439b2b9c8",
      protocol: "OpenID Connect",
      status: "active",
      authentication: "urn:azure:ad:enterprise:v1:authentication",
      domainAliases: ["microsoft.com", "azure.com", "office365.com"],
    },
    {
      id: "4",
      name: "Auth0 Development",
      logoUrl: "https://cdn.builder.io/api/v1/image/assets%2F82e2f8ec35ab46749ef52edc2f137b7b%2F56dd16156c1a4a3b9afc85d093466733",
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
  const [customIdpId, setCustomIdpId] = useState("");
  const [applyToSubOrgs, setApplyToSubOrgs] = useState(false);

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
                  className="flex flex-col gap-8"
                >
                  <div className="flex w-full max-w-5xl flex-col gap-8">
                    <div>
                      <h2 className="text-2xl font-bold text-bluegrey-900 mb-2">
                        Identity Provider Configuration
                      </h2>
                      <p className="text-sm text-bluegrey-600">
                        Configure how {organization.name} authenticates with external identity providers
                      </p>
                    </div>

                    {/* Default IDP Display */}
                    {defaultIdp && (
                      <div className="space-y-6">
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100 shadow-sm">
                          <div className="flex items-start gap-6">
                            <div className="flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-md flex-shrink-0 p-3">
                              <img
                                src={defaultIdp.logoUrl}
                                alt={defaultIdp.name}
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-3">
                                <h3 className="text-2xl font-bold text-bluegrey-900">
                                  {defaultIdp.name}
                                </h3>
                                {defaultIdp.status === "active" && (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-500 text-white shadow-sm">
                                    <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                                    Active
                                  </span>
                                )}
                                {defaultIdp.status === "inactive" && (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-400 text-white shadow-sm">
                                    <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                                    Inactive
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-bluegrey-600 mb-1">
                                <span className="font-semibold">Protocol:</span> {defaultIdp.protocol}
                              </p>
                              <p className="text-xs text-blue-600 font-medium">
                                System Default Configuration
                              </p>
                            </div>
                          </div>

                          <div className="mt-6 space-y-4">
                            <div>
                              <p className="text-xs font-bold text-bluegrey-700 uppercase tracking-wider mb-2">
                                Authentication URN
                              </p>
                              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-blue-200 rounded-lg px-4 py-3 shadow-sm">
                                <code className="flex-1 text-xs text-bluegrey-800 font-mono break-all">
                                  {defaultIdp.authentication}
                                </code>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(defaultIdp.authentication);
                                    toast({
                                      title: "Copied",
                                      description: "Authentication URN copied to clipboard",
                                    });
                                  }}
                                  className="flex-shrink-0 p-2 hover:bg-blue-100 rounded-lg transition-colors"
                                  title="Copy to clipboard"
                                >
                                  <Copy className="w-4 h-4 text-blue-600" />
                                </button>
                              </div>
                            </div>

                            <div>
                              <p className="text-xs font-bold text-bluegrey-700 uppercase tracking-wider mb-2">
                                Domain Aliases
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {defaultIdp.domainAliases.map((domain, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-white/80 backdrop-blur-sm text-bluegrey-800 border border-blue-200 shadow-sm"
                                  >
                                    {domain}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 border border-bluegrey-200 shadow-sm">
                          <h3 className="text-lg font-bold text-bluegrey-900 mb-4">
                            Preferences
                          </h3>
                          <div className="flex items-start gap-3">
                            <Checkbox
                              id="applyToSubOrgs"
                              checked={applyToSubOrgs}
                              onCheckedChange={(checked) => setApplyToSubOrgs(checked === true)}
                              disabled={isSaving}
                              className="mt-0.5"
                            />
                            <div className="flex flex-col gap-1">
                              <Label
                                htmlFor="applyToSubOrgs"
                                className="cursor-pointer text-sm font-medium text-bluegrey-900"
                              >
                                Apply to all sub-organizations
                              </Label>
                              <p className="text-xs text-bluegrey-600">
                                This mapping will be inherited by all child organizations
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Custom IDP View */}
                    {overrideDefault && (
                      <div className="space-y-6">
                        <div>
                          <Label className="text-sm font-semibold text-bluegrey-900 mb-3 block">
                            Select Identity Provider
                          </Label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {availableIdps.map((idp) => (
                              <button
                                key={idp.id}
                                type="button"
                                onClick={() => setCustomIdpId(idp.id)}
                                disabled={isSaving}
                                className={`relative flex items-center gap-4 p-5 rounded-xl border-2 transition-all ${
                                  customIdpId === idp.id
                                    ? "border-blue-500 bg-blue-50 shadow-md"
                                    : "border-bluegrey-200 bg-white hover:border-blue-300 hover:shadow-sm"
                                }`}
                              >
                                <div className="flex items-center justify-center w-14 h-14 bg-white rounded-xl shadow-sm flex-shrink-0 p-2 border border-bluegrey-100">
                                  <img
                                    src={idp.logoUrl}
                                    alt={idp.name}
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                                <div className="flex-1 text-left">
                                  <h4 className="text-base font-semibold text-bluegrey-900 mb-0.5">
                                    {idp.name}
                                  </h4>
                                  <p className="text-xs text-bluegrey-600">
                                    {idp.protocol}
                                  </p>
                                </div>
                                {customIdpId === idp.id && (
                                  <div className="absolute top-3 right-3 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                  </div>
                                )}
                                {idp.status === "active" && (
                                  <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                    Active
                                  </span>
                                )}
                                {idp.status === "inactive" && (
                                  <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
                                    Inactive
                                  </span>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>

                        {customIdpId && (() => {
                          const customIdp = availableIdps.find((idp) => idp.id === customIdpId);
                          if (!customIdp) return null;

                          return (
                            <>
                              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-8 border border-purple-100 shadow-sm">
                                <div className="flex items-start gap-6">
                                  <div className="flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-md flex-shrink-0 p-3">
                                    <img
                                      src={customIdp.logoUrl}
                                      alt={customIdp.name}
                                      className="w-full h-full object-contain"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-3">
                                      <h3 className="text-2xl font-bold text-bluegrey-900">
                                        {customIdp.name}
                                      </h3>
                                      {customIdp.status === "active" && (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-500 text-white shadow-sm">
                                          <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                                          Active
                                        </span>
                                      )}
                                      {customIdp.status === "inactive" && (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-400 text-white shadow-sm">
                                          <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                                          Inactive
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-sm text-bluegrey-600 mb-1">
                                      <span className="font-semibold">Protocol:</span> {customIdp.protocol}
                                    </p>
                                    <p className="text-xs text-purple-600 font-medium">
                                      Custom Override Configuration
                                    </p>
                                  </div>
                                </div>

                                <div className="mt-6 space-y-4">
                                  <div>
                                    <p className="text-xs font-bold text-bluegrey-700 uppercase tracking-wider mb-2">
                                      Authentication URN
                                    </p>
                                    <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-purple-200 rounded-lg px-4 py-3 shadow-sm">
                                      <code className="flex-1 text-xs text-bluegrey-800 font-mono break-all">
                                        {customIdp.authentication}
                                      </code>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          navigator.clipboard.writeText(customIdp.authentication);
                                          toast({
                                            title: "Copied",
                                            description: "Authentication URN copied to clipboard",
                                          });
                                        }}
                                        className="flex-shrink-0 p-2 hover:bg-purple-100 rounded-lg transition-colors"
                                        title="Copy to clipboard"
                                      >
                                        <Copy className="w-4 h-4 text-purple-600" />
                                      </button>
                                    </div>
                                  </div>

                                  <div>
                                    <p className="text-xs font-bold text-bluegrey-700 uppercase tracking-wider mb-2">
                                      Domain Aliases
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                      {customIdp.domainAliases.map((domain, index) => (
                                        <span
                                          key={index}
                                          className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-white/80 backdrop-blur-sm text-bluegrey-800 border border-purple-200 shadow-sm"
                                        >
                                          {domain}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-white rounded-xl p-6 border border-bluegrey-200 shadow-sm">
                                <h3 className="text-lg font-bold text-bluegrey-900 mb-4">
                                  Preferences
                                </h3>
                                <div className="flex items-start gap-3">
                                  <Checkbox
                                    id="applyToSubOrgsCustom"
                                    checked={applyToSubOrgs}
                                    onCheckedChange={(checked) => setApplyToSubOrgs(checked === true)}
                                    disabled={isSaving}
                                    className="mt-0.5"
                                  />
                                  <div className="flex flex-col gap-1">
                                    <Label
                                      htmlFor="applyToSubOrgsCustom"
                                      className="cursor-pointer text-sm font-medium text-bluegrey-900"
                                    >
                                      Apply to all sub-organizations
                                    </Label>
                                    <p className="text-xs text-bluegrey-600">
                                      This mapping will be inherited by all child organizations
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      type="submit"
                      disabled={isSaving}
                      className="bg-blue-500 hover:bg-blue-600 text-white h-11 px-6 rounded-lg shadow-sm font-medium"
                    >
                      {isSaving ? "Saving..." : "Save Configuration"}
                    </Button>
                    <Button
                      type="button"
                      onClick={handleCancel}
                      disabled={isSaving}
                      variant="ghost"
                      className="h-11 px-6 rounded-lg text-bluegrey-700 hover:bg-bluegrey-50 font-medium"
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
