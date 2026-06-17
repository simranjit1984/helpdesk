import Layout from "@/components/Layout";
import { AIAssistant } from "@/components/aiAssistant/AIAssistant";
import JobsPage from "@/components/jobs/JobsPage";

export default function Jobs() {
  return (
    <>
      <Layout>
        {/* Page header */}
        <div className="sticky top-16 bg-bluegrey-25 px-4 sm:px-6 lg:px-8 py-6 lg:py-8 z-30">
          <h1 className="text-3xl sm:text-4xl lg:text-[42px] lg:leading-[50px] font-medium text-bluegrey-750">
            Jobs and Reports
          </h1>
          <p className="mt-1 text-sm text-bluegrey-600">
            Configure and monitor automated user cleanup jobs.
          </p>
        </div>

        <JobsPage />
      </Layout>

      <AIAssistant userData={{}} isOpen={false} />
    </>
  );
}
