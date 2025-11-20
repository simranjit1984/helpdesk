import Layout from "@/components/Layout";
import PageHeader from "@/components/PageHeader";
import { AIAssistant } from "@/components/aiAssistant/AIAssistant";

export default function AllAdministrators() {
  return (
    <>
      <Layout>
        <PageHeader title="All administrators" />
        <div className="p-6">
          <p className="text-bluegrey-900">All administrators page content coming soon...</p>
        </div>
      </Layout>
      <AIAssistant userData={{}} />
    </>
  );
}
