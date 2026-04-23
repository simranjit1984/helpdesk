import Layout from "@/components/Layout";
import PageHeader from "@/components/PageHeader";
import OrganizationsTable from "@/components/OrganizationsTable";
import { AIAssistant } from "@/components/aiAssistant/AIAssistant";

export default function Organizations() {
  return (
    <>
      <Layout>
        <PageHeader title="Organizations" />
        <OrganizationsTable />
      </Layout>
      <AIAssistant userData={{}} isOpen={false} />
    </>
  );
}
