import Layout from "@/components/Layout";
import PageHeader from "@/components/PageHeader";
import { AIAssistant } from "@/components/aiAssistant/AIAssistant";

export default function Scopes() {
  return (
    <>
      <Layout>
        <PageHeader title="Scopes" />
        <div className="p-6">
          <p className="text-bluegrey-900">Scopes page content coming soon...</p>
        </div>
      </Layout>
      <AIAssistant userData={{}} isOpen={false} />
    </>
  );
}
