import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Layout from "@/components/Layout";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import { AIAssistant } from "@/components/aiAssistant/AIAssistant";
import { baseOrganizations } from "@/components/OrganizationsTable";

export default function OrganizationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

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

  if (!organization) {
    return (
      <>
        <Layout>
          <PageHeader title="Organization Not Found" />
          <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
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
        <div className="border-b border-bluegrey-100">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <button
              onClick={() => navigate("/organizations")}
              className="inline-flex items-center gap-2 text-sm text-blue-500 hover:text-blue-600 mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Organizations
            </button>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-bluegrey-900">
                  {organization.name}
                </h1>
                <p className="text-sm text-bluegrey-500 mt-1">
                  {organization.referenceId}
                </p>
              </div>
              <StatusBadge status={organization.status} />
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="bg-white rounded-lg border border-bluegrey-100 p-6">
            <h2 className="text-xl font-semibold text-bluegrey-900 mb-4">
              Organization Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-bluegrey-500">
                  Organization Name
                </label>
                <p className="text-base text-bluegrey-900 mt-1">
                  {organization.name}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-bluegrey-500">
                  Reference ID
                </label>
                <p className="text-base text-bluegrey-900 mt-1">
                  {organization.referenceId}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-bluegrey-500">
                  Status
                </label>
                <div className="mt-1">
                  <StatusBadge status={organization.status} />
                </div>
              </div>
              {organization.parentId && (
                <div>
                  <label className="text-sm font-medium text-bluegrey-500">
                    Type
                  </label>
                  <p className="text-base text-bluegrey-900 mt-1">
                    Sub-organization
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Layout>
      <AIAssistant userData={{}} isOpen={false} />
    </>
  );
}
