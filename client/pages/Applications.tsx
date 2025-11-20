import Layout from "@/components/Layout";
import PageHeader from "@/components/PageHeader";
import { AIAssistant } from "@/components/aiAssistant/AIAssistant";

export default function Applications() {
  return (
    <>
      <Layout>
        <PageHeader title="Applications" />
        <div className="p-6">
          <p className="text-bluegrey-900">Applications page content coming soon...</p>
        </div>
      </Layout>
      <AIAssistant userData={{}} isOpen={false} />
    </>
  );
}
