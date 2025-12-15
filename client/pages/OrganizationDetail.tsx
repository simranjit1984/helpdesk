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

  const [idpConfig, setIdpConfig] = useState({
    applyByDefault: false,
    idpProvider: "",
    protocol: "saml",
    metadataUrl: "",
    entityId: "",
    ssoUrl: "",
    certificate: "",
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

  const handleIdpConfigChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    setIdpConfig((prev) => ({
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
        description: "IDP configuration saved successfully",
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
                  <div className="flex w-full max-w-2xl flex-col gap-6">
                    <div className="flex items-start gap-2 p-4 bg-blue-50 border border-blue-100 rounded-[2px]">
                      <Checkbox
                        id="applyByDefault"
                        checked={idpConfig.applyByDefault}
                        onCheckedChange={(checked) =>
                          setIdpConfig((prev) => ({ ...prev, applyByDefault: checked === true }))
                        }
                        disabled={isSaving}
                      />
                      <div className="flex flex-col gap-1">
                        <Label
                          htmlFor="applyByDefault"
                          className="cursor-pointer text-sm font-medium text-bluegrey-900 leading-5"
                        >
                          Apply IDP by default to all organizations
                        </Label>
                        <p className="text-xs text-[#6F6F76] leading-4">
                          When enabled, this IDP configuration will be automatically applied to all organizations,
                          allowing quick system usage without mandatory initial federation configuration.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <Label htmlFor="idpProvider" className="flex gap-1">
                        IDP Provider Name
                        <span className="text-red-500">*</span>
                      </Label>
                      <input
                        id="idpProvider"
                        type="text"
                        value={idpConfig.idpProvider}
                        onChange={handleIdpConfigChange}
                        disabled={isSaving}
                        placeholder="e.g., Okta, Azure AD, Auth0"
                        className="flex w-full rounded-[2px] border border-bluegrey-500 bg-white px-2 py-3 text-sm text-bluegrey-900 placeholder:text-bluegrey-400 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <Label htmlFor="protocol">Authentication Protocol</Label>
                      <select
                        id="protocol"
                        value={idpConfig.protocol}
                        onChange={handleIdpConfigChange}
                        disabled={isSaving}
                        className="flex w-full rounded-[2px] border border-bluegrey-500 bg-white px-2 py-3 text-sm text-bluegrey-900 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="saml">SAML 2.0</option>
                        <option value="oauth">OAuth 2.0 / OIDC</option>
                      </select>
                    </div>

                    {idpConfig.protocol === "saml" && (
                      <>
                        <div className="flex flex-col gap-1">
                          <Label htmlFor="metadataUrl">Metadata URL</Label>
                          <input
                            id="metadataUrl"
                            type="url"
                            value={idpConfig.metadataUrl}
                            onChange={handleIdpConfigChange}
                            disabled={isSaving}
                            placeholder="https://idp.example.com/metadata"
                            className="flex w-full rounded-[2px] border border-bluegrey-500 bg-white px-2 py-3 text-sm text-bluegrey-900 placeholder:text-bluegrey-400 disabled:cursor-not-allowed disabled:opacity-50"
                          />
                          <p className="text-xs text-[#6F6F76] mt-1">
                            URL to the SAML metadata XML file provided by your IDP
                          </p>
                        </div>

                        <div className="flex flex-col gap-1">
                          <Label htmlFor="entityId">Entity ID</Label>
                          <input
                            id="entityId"
                            type="text"
                            value={idpConfig.entityId}
                            onChange={handleIdpConfigChange}
                            disabled={isSaving}
                            placeholder="https://idp.example.com/entityid"
                            className="flex w-full rounded-[2px] border border-bluegrey-500 bg-white px-2 py-3 text-sm text-bluegrey-900 placeholder:text-bluegrey-400 disabled:cursor-not-allowed disabled:opacity-50"
                          />
                          <p className="text-xs text-[#6F6F76] mt-1">
                            Unique identifier for the IDP
                          </p>
                        </div>

                        <div className="flex flex-col gap-1">
                          <Label htmlFor="ssoUrl">Single Sign-On URL</Label>
                          <input
                            id="ssoUrl"
                            type="url"
                            value={idpConfig.ssoUrl}
                            onChange={handleIdpConfigChange}
                            disabled={isSaving}
                            placeholder="https://idp.example.com/sso"
                            className="flex w-full rounded-[2px] border border-bluegrey-500 bg-white px-2 py-3 text-sm text-bluegrey-900 placeholder:text-bluegrey-400 disabled:cursor-not-allowed disabled:opacity-50"
                          />
                          <p className="text-xs text-[#6F6F76] mt-1">
                            URL where authentication requests will be sent
                          </p>
                        </div>

                        <div className="flex flex-col gap-1">
                          <Label htmlFor="certificate">X.509 Certificate</Label>
                          <textarea
                            id="certificate"
                            value={idpConfig.certificate}
                            onChange={handleIdpConfigChange}
                            disabled={isSaving}
                            rows={6}
                            placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
                            className="flex w-full rounded-[2px] border border-bluegrey-500 bg-white px-2 py-3 text-sm text-bluegrey-900 placeholder:text-bluegrey-400 disabled:cursor-not-allowed disabled:opacity-50 resize-none font-mono"
                          />
                          <p className="text-xs text-[#6F6F76] mt-1">
                            Public certificate used to verify SAML assertions
                          </p>
                        </div>
                      </>
                    )}

                    {idpConfig.protocol === "oauth" && (
                      <>
                        <div className="flex flex-col gap-1">
                          <Label htmlFor="metadataUrl">Discovery URL</Label>
                          <input
                            id="metadataUrl"
                            type="url"
                            value={idpConfig.metadataUrl}
                            onChange={handleIdpConfigChange}
                            disabled={isSaving}
                            placeholder="https://idp.example.com/.well-known/openid-configuration"
                            className="flex w-full rounded-[2px] border border-bluegrey-500 bg-white px-2 py-3 text-sm text-bluegrey-900 placeholder:text-bluegrey-400 disabled:cursor-not-allowed disabled:opacity-50"
                          />
                          <p className="text-xs text-[#6F6F76] mt-1">
                            OpenID Connect discovery endpoint URL
                          </p>
                        </div>

                        <div className="flex flex-col gap-1">
                          <Label htmlFor="entityId">Client ID</Label>
                          <input
                            id="entityId"
                            type="text"
                            value={idpConfig.entityId}
                            onChange={handleIdpConfigChange}
                            disabled={isSaving}
                            placeholder="client_id_from_idp"
                            className="flex w-full rounded-[2px] border border-bluegrey-500 bg-white px-2 py-3 text-sm text-bluegrey-900 placeholder:text-bluegrey-400 disabled:cursor-not-allowed disabled:opacity-50"
                          />
                          <p className="text-xs text-[#6F6F76] mt-1">
                            OAuth 2.0 client identifier
                          </p>
                        </div>

                        <div className="flex flex-col gap-1">
                          <Label htmlFor="certificate">Client Secret</Label>
                          <input
                            id="certificate"
                            type="password"
                            value={idpConfig.certificate}
                            onChange={handleIdpConfigChange}
                            disabled={isSaving}
                            placeholder="••••••••••••••••"
                            className="flex w-full rounded-[2px] border border-bluegrey-500 bg-white px-2 py-3 text-sm text-bluegrey-900 placeholder:text-bluegrey-400 disabled:cursor-not-allowed disabled:opacity-50"
                          />
                          <p className="text-xs text-[#6F6F76] mt-1">
                            OAuth 2.0 client secret (keep this secure)
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      type="submit"
                      disabled={isSaving}
                      className="bg-blue-500 hover:bg-blue-600 text-white h-10 px-4 rounded-[2px]"
                    >
                      {isSaving ? "Saving..." : "Save IDP Configuration"}
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
