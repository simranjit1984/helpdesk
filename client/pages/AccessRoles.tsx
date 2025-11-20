import Layout from "@/components/Layout";
import PageHeader from "@/components/PageHeader";
import { AIAssistant } from "@/components/aiAssistant/AIAssistant";

export default function AccessRoles() {
  return (
    <>
      <Layout>
        <PageHeader title="Access roles" />
        <div className="p-6">
          <p className="text-bluegrey-900">Access roles page content coming soon...</p>
        </div>
      </Layout>
      <AIAssistant userData={{}} />
    </>
  );
}
