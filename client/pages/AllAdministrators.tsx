import { useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import PageHeader from "@/components/PageHeader";
import { AIAssistant } from "@/components/aiAssistant/AIAssistant";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminRolesTab from "@/components/administrators/AdminRolesTab";
import ScopesTab from "@/components/administrators/ScopesTab";
import ScopesTabV2 from "@/components/administrators/ScopesTabV2";

const TAB_TRIGGER_CLASS =
  "h-auto py-3 px-0 rounded-none bg-transparent text-sm font-medium " +
  "border-b-2 border-transparent shadow-none " +
  "text-bluegrey-500 " +
  "data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 " +
  "data-[state=active]:bg-transparent data-[state=active]:shadow-none " +
  "hover:text-bluegrey-900 transition-colors";

export default function AllAdministrators() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "roles";

  const handleTabChange = (val: string) => {
    setSearchParams({ tab: val });
  };

  return (
    <>
      <Layout>
        {/* Grey page header */}
        <PageHeader title="Administrators" />

        {/* White area with tab bar + content */}
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          {/* Tab bar */}
          <div className="bg-white border-b border-bluegrey-200 px-4 sm:px-6 lg:px-8">
            <TabsList className="h-auto bg-transparent p-0 gap-6 -mb-px">
              <TabsTrigger value="roles" className={TAB_TRIGGER_CLASS}>
                Administrator Roles
              </TabsTrigger>
              <TabsTrigger value="scopes" className={TAB_TRIGGER_CLASS}>
                Scopes
              </TabsTrigger>
              <TabsTrigger value="scopes-v2" className={TAB_TRIGGER_CLASS}>
                Scopes V2
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab content */}
          <TabsContent value="roles" className="mt-0">
            <AdminRolesTab />
          </TabsContent>
          <TabsContent value="scopes" className="mt-0">
            <ScopesTab />
          </TabsContent>
          <TabsContent value="scopes-v2" className="mt-0">
            <ScopesTabV2 />
          </TabsContent>
        </Tabs>
      </Layout>

      <AIAssistant userData={{}} isOpen={false} />
    </>
  );
}
