import { useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import PageHeader from "@/components/PageHeader";
import UsersTable from "@/components/UsersTable";
import { AIAssistant } from "@/components/aiAssistant/AIAssistant";
import { Tabs, Tab } from "@onewelcome/react-lib-components";
import BulkInvitationJobsTab from "@/components/bulkInvite/BulkInvitationJobsTab";

export default function Index() {
  const [searchParams, setSearchParams] = useSearchParams();
  const TAB_NAMES = ["users", "invitations", "bulk-invitation"] as const;
  const activeTabName = searchParams.get("tab") ?? "users";
  const activeTabIndex = TAB_NAMES.indexOf(activeTabName as (typeof TAB_NAMES)[number]);
  const selectedIndex = activeTabIndex >= 0 ? activeTabIndex : 0;

  const handleTabChange = (index: number) => {
    setSearchParams({ tab: TAB_NAMES[index] ?? "users" });
  };

  return (
    <>
      <Layout>
        {/* Grey header */}
        <PageHeader title="Users" />

        {/* UCL Tabs */}
        <Tabs
          selected={selectedIndex}
          onTabChange={handleTabChange}
          className="w-full"
          tabListClassName="w-full"
        >
          <Tab title="Users">
            <UsersTable allowedStatuses={["active", "blocked", "grace", "inactive"]} />
          </Tab>

          <Tab title="Invitations">
            <UsersTable
              allowedStatuses={["invited", "invitation-expired", "invitation-withdrawn"]}
            />
          </Tab>

          <Tab title="Bulk Invitation">
            <BulkInvitationJobsTab />
          </Tab>
        </Tabs>
      </Layout>
      <AIAssistant userData={{}} isOpen={false} />
    </>
  );
}
