import { useState } from "react";
import Layout from "@/components/Layout";
import PageHeader from "@/components/PageHeader";
import { AIAssistant } from "@/components/aiAssistant/AIAssistant";
import ApplicationsTable from "@/components/applications/ApplicationsTable";
import { MOCK_APPLICATIONS, type Application } from "@/lib/applicationsMockData";

export default function Applications() {
  const [apps, setApps] = useState<Application[]>(MOCK_APPLICATIONS);

  function handleDelete(id: string) {
    setApps((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <>
      <Layout>
        <PageHeader title="Applications" />
        <ApplicationsTable apps={apps} onDelete={handleDelete} />
      </Layout>
      <AIAssistant userData={{}} isOpen={false} />
    </>
  );
}
