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
      name: "OneWelcome IDP",
      logoUrl: "https://cdn.builder.io/api/v1/image/assets%2F82e2f8ec35ab46749ef52edc2f137b7b%2Fea4ff95507ee4758a7eb2f5d5f5aca8c",
      protocol: "OpenID Connect",
      status: "active",
      authentication: "urn:onewelcome:broker:v1:authentication",
      domainAliases: ["onewelcome.com"],
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
                  className="flex flex-col gap-10"
                >
                  <div className="flex w-full max-w-3xl flex-col gap-6">
                    <h2 className="text-xl font-semibold text-blue-500">
                      Map {organization.name} to external IDP
                    </h2>

                    <RadioGroup
                      value={overrideDefault ? "custom" : "default"}
                      onValueChange={(value) => setOverrideDefault(value === "custom")}
                      disabled={isSaving}
                      className="flex flex-col gap-4"
                    >
                      <div className="flex flex-col gap-3">
                        <div className="flex items-start gap-3">
                          <RadioGroupItem value="default" id="default-idp" className="mt-0.5" />
                          <div className="flex-1">
                            <Label htmlFor="default-idp" className="cursor-pointer text-sm font-medium text-bluegrey-900 leading-5">
                              Use default IDP
                            </Label>

                            {!overrideDefault && defaultIdp && (
                              <div className="mt-3">
                                <div className="bg-bluegrey-50 rounded py-4 px-6 border border-bluegrey-100">
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
                                      <p className="text-sm text-bluegrey-600 mb-4">
                                        <span className="font-semibold">Protocol:</span> {defaultIdp.protocol}
                                      </p>

                                      <div className="mb-4">
                                        <p className="text-xs font-bold text-bluegrey-700 uppercase tracking-wider mb-2">
                                          Authentication URL
                                        </p>
                                        <input
                                          type="text"
                                          value={defaultIdp.authentication}
                                          readOnly
                                          className="w-full rounded border border-bluegrey-100 bg-white px-2 py-3 text-sm text-bluegrey-900 cursor-not-allowed"
                                        />
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
                                </div>

                                <div className="mt-6">
                                  <div className="bg-white rounded py-4 px-6 border border-bluegrey-100">
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
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3">
                        <div className="flex items-start gap-3">
                          <RadioGroupItem value="custom" id="custom-idp" className="mt-0.5" />
                          <div className="flex-1">
                            <Label htmlFor="custom-idp" className="cursor-pointer text-sm font-medium text-bluegrey-900 leading-5">
                              Use custom IDP
                            </Label>
                            <p className="text-xs text-[#6F6F76] leading-4 mt-1">
                              Override the default IDP for this organization
                            </p>
                            {overrideDefault && (
                              <div className="flex flex-col gap-3 mt-3">
                                <div className="flex flex-col gap-1">
                                  <Label htmlFor="customIdp" className="flex gap-1">
                                    Select IDP
                                    <span className="text-red-500">*</span>
                                  </Label>
                                  <div className="relative" style={{ width: '384px' }}>
                                    <select
                                      id="customIdp"
                                      value={customIdpId}
                                      onChange={(e) => setCustomIdpId(e.target.value)}
                                      disabled={isSaving}
                                      className="w-full rounded-[2px] border border-bluegrey-500 bg-white px-2 py-3 pr-8 text-sm text-bluegrey-900 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                                    >
                                      <option value="">Select an IDP...</option>
                                      {availableIdps.map((idp) => (
                                        <option key={idp.id} value={idp.id}>
                                          {idp.name}
                                        </option>
                                      ))}
                                    </select>
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                                      <svg
                                        width="12"
                                        height="8"
                                        viewBox="0 0 12 8"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <path
                                          d="M1 1.5L6 6.5L11 1.5"
                                          stroke="#131319"
                                          strokeWidth="1.5"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        />
                                      </svg>
                                    </div>
                                  </div>
                                </div>

                                {customIdpId && (() => {
                                  const customIdp = availableIdps.find((idp) => idp.id === customIdpId);
                                  if (!customIdp) return null;

                                  return (
                                    <>
                                      <div className="bg-bluegrey-50 rounded py-4 px-6 border border-bluegrey-100">
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
                                            <p className="text-sm text-bluegrey-600 mb-4">
                                              <span className="font-semibold">Protocol:</span> {customIdp.protocol}
                                            </p>

                                            <div className="mb-4">
                                              <p className="text-xs font-bold text-bluegrey-700 uppercase tracking-wider mb-2">
                                                Authentication URL
                                              </p>
                                              <input
                                                type="text"
                                                value={customIdp.authentication}
                                                readOnly
                                                className="w-full rounded border border-bluegrey-100 bg-white px-2 py-3 text-sm text-bluegrey-900 cursor-not-allowed"
                                              />
                                            </div>

                                            <div>
                                              <p className="text-xs font-bold text-bluegrey-700 uppercase tracking-wider mb-2">
                                                Domain Aliases
                                              </p>
                                              <div className="flex flex-wrap gap-2">
                                                {customIdp.domainAliases.map((domain, index) => (
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
                                      </div>

                                      <div className="mt-6">
                                        <div className="bg-white rounded py-4 px-6 border border-bluegrey-100">
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
                                      </div>
                                    </>
                                  );
                                })()}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </RadioGroup>
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
