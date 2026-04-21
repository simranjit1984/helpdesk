import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import PageHeader from "@/components/PageHeader";
import FilterBar from "@/components/FilterBar";
import UsersTable from "@/components/UsersTable";
import { AIAssistant } from "@/components/aiAssistant/AIAssistant";
import { Tabs, Tab } from "@onewelcome/react-lib-components";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

const USERS_STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "blocked", label: "Authentication blocked" },
  { value: "grace", label: "Grace" },
  { value: "inactive", label: "Inactive" },
];

const INV_STATUS_OPTIONS = [
  { value: "invited", label: "Invited" },
  { value: "invitation-expired", label: "Invitation expired" },
  { value: "invitation-withdrawn", label: "Invitation withdrawn" },
];

const SEARCH_FIELDS = [
  { value: "all", label: "All fields" },
  { value: "email", label: "Email" },
  { value: "firstName", label: "First name" },
  { value: "lastName", label: "Last name" },
  { value: "phoneNumber", label: "Phone number" },
];

type Filter = { id: string; column: string; operator: string; value: string };

export default function Index() {
  const [searchParams, setSearchParams] = useSearchParams();
  const TAB_NAMES = ["users", "invitations"] as const;
  const activeTabName = searchParams.get("tab") ?? "users";
  const activeTabIndex = TAB_NAMES.indexOf(activeTabName as typeof TAB_NAMES[number]);
  const selectedIndex = activeTabIndex >= 0 ? activeTabIndex : 0;

  // Users tab state
  const [usersSearchQuery, setUsersSearchQuery] = useState("");
  const [usersFilters, setUsersFilters] = useState<Filter[]>([]);
  const [usersSearchField, setUsersSearchField] = useState("all");

  // Invitations tab state
  const [invSearchQuery, setInvSearchQuery] = useState("");
  const [invFilters, setInvFilters] = useState<Filter[]>([]);
  const [invSearchField, setInvSearchField] = useState("all");

  const handleTabChange = (index: number) => {
    setSearchParams({ tab: TAB_NAMES[index] ?? "users" });
  };

  return (
    <>
      <Layout>
        {/* Grey header — title only */}
        <PageHeader title="Users" />

        {/* UCL Tabs */}
        <Tabs selected={selectedIndex} onTabChange={handleTabChange} className="w-full" tabListClassName="w-full">
          <Tab title="Users">
            <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6 lg:space-y-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                  <FilterBar
                    columns={[
                      { value: "organizations", label: "Organization" },
                      { value: "status", label: "Status" },
                    ]}
                    columnOptions={{ status: USERS_STATUS_OPTIONS }}
                    filters={usersFilters}
                    onFilterAdd={(f) => setUsersFilters([...usersFilters, f])}
                    onFilterRemove={(id) => setUsersFilters(usersFilters.filter((f) => f.id !== id))}
                    onClearFilters={() => setUsersFilters([])}
                    searchValue={usersSearchQuery}
                    onSearchChange={setUsersSearchQuery}
                    searchPlaceholder="Search users"
                    searchFields={SEARCH_FIELDS}
                    searchField={usersSearchField}
                    onSearchFieldChange={setUsersSearchField}
                  />
                </div>
                <Button className="gap-2">
                  <Send className="w-4 h-4" />
                  Invite user
                </Button>
              </div>

              <UsersTable
                searchQuery={usersSearchQuery}
                filters={usersFilters}
                searchField={usersSearchField}
                allowedStatuses={["active", "blocked", "grace", "inactive"]}
              />
            </div>
          </Tab>

          <Tab title="Invitations">
            <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6 lg:space-y-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                  <FilterBar
                    columns={[
                      { value: "organizations", label: "Organization" },
                      { value: "status", label: "Status" },
                    ]}
                    columnOptions={{ status: INV_STATUS_OPTIONS }}
                    filters={invFilters}
                    onFilterAdd={(f) => setInvFilters([...invFilters, f])}
                    onFilterRemove={(id) => setInvFilters(invFilters.filter((f) => f.id !== id))}
                    onClearFilters={() => setInvFilters([])}
                    searchValue={invSearchQuery}
                    onSearchChange={setInvSearchQuery}
                    searchPlaceholder="Search invitations"
                    searchFields={SEARCH_FIELDS}
                    searchField={invSearchField}
                    onSearchFieldChange={setInvSearchField}
                  />
                </div>
                <Button className="gap-2">
                  <Send className="w-4 h-4" />
                  Invite user
                </Button>
              </div>

              <UsersTable
                searchQuery={invSearchQuery}
                filters={invFilters}
                searchField={invSearchField}
                allowedStatuses={["invited", "invitation-expired", "invitation-withdrawn"]}
              />
            </div>
          </Tab>
        </Tabs>
      </Layout>
      <AIAssistant userData={{}} isOpen={false} />
    </>
  );
}
