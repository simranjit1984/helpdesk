import Layout from "@/components/Layout";
import PageHeader from "@/components/PageHeader";
import { AIAssistant } from "@/components/aiAssistant/AIAssistant";

export default function AdministratorsRoles() {
  return (
    <>
      <Layout>
        <PageHeader title="Administrators roles" />
        <div className="p-6">
          <p className="text-bluegrey-900">Administrators roles page content coming soon...</p>
        </div>
      </Layout>
      <AIAssistant userData={{}} />
    </>
  );
}
