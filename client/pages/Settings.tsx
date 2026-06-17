import Layout from "@/components/Layout";
import { AIAssistant } from "@/components/aiAssistant/AIAssistant";
import UserAttributeVisibilityTab from "@/components/settings/UserAttributeVisibilityTab";

export default function Settings() {
  return (
    <>
      <Layout>
        {/* Page header */}
        <div className="sticky top-16 bg-bluegrey-25 px-4 sm:px-6 lg:px-8 py-6 lg:py-8 z-30">
          <h1 className="text-3xl sm:text-4xl lg:text-[42px] lg:leading-[50px] font-medium text-bluegrey-750">
            Settings
          </h1>
          <p className="mt-1 text-sm text-bluegrey-600">
            Configure user attribute visibility and ordering.
          </p>
        </div>

        <UserAttributeVisibilityTab />
      </Layout>

      <AIAssistant userData={{}} isOpen={false} />
    </>
  );
}
