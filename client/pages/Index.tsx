import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import PageHeader from "@/components/PageHeader";
import FilterBar from "@/components/FilterBar";
import UsersTable from "@/components/UsersTable";
import { AIAssistant } from "@/components/aiAssistant/AIAssistant";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const tabTriggerClass =
  "relative h-auto pb-3 pt-0 px-0 rounded-none bg-transparent text-sm font-medium " +
  "text-bluegrey-500 shadow-none border-0 " +
  "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-transparent " +
  "data-[state=active]:text-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none " +
  "data-[state=active]:after:bg-blue-600 " +
  "hover:text-bluegrey-900 transition-colors";

export default function Index() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "users";

  // Users tab state
  const [usersSearchQuery, setUsersSearchQuery] = useState("");
  const [usersFilters, setUsersFilters] = useState<Filter[]>([]);
  const [usersSearchField, setUsersSearchField] = useState("all");

  // Invitations tab state
  const [invSearchQuery, setInvSearchQuery] = useState("");
  const [invFilters, setInvFilters] = useState<Filter[]>([]);
  const [invSearchField, setInvSearchField] = useState("all");

  const handleTabChange = (val: string) => {
    setSearchParams({ tab: val });
  };

  return (
    <>
      <Layout>
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          {/* Grey header area: title + tab bar — matches design */}
          <div className="bg-bluegrey-25 sticky top-16 z-30">
            <PageHeader title="Users" />
            <div className="border-b border-bluegrey-200 px-4 sm:px-6 lg:px-8">
              <TabsList className="h-auto bg-transparent p-0 gap-6">
                <TabsTrigger value="users" className={tabTriggerClass}>
                  Users
                </TabsTrigger>
                <TabsTrigger value="invitations" className={tabTriggerClass}>
                  Invitations
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* White content area */}
          <TabsContent value="users" className="mt-0 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            <div className="space-y-6 lg:space-y-8">
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
                <button className="flex items-center gap-2 h-10 px-3 bg-blue-500 hover:bg-blue-600 text-bluegrey-25 rounded-sm transition-colors whitespace-nowrap">
                  <Send className="w-5 h-5" />
                  <span className="text-sm font-medium">Invite user</span>
                </button>
              </div>

              <UsersTable
                searchQuery={usersSearchQuery}
                filters={usersFilters}
                searchField={usersSearchField}
                allowedStatuses={["active", "blocked", "grace", "inactive"]}
              />
            </div>
          </TabsContent>

          <TabsContent value="invitations" className="mt-0 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            <div className="space-y-6 lg:space-y-8">
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
                <button className="flex items-center gap-2 h-10 px-3 bg-blue-500 hover:bg-blue-600 text-bluegrey-25 rounded-sm transition-colors whitespace-nowrap">
                  <Send className="w-5 h-5" />
                  <span className="text-sm font-medium">Invite user</span>
                </button>
              </div>

              <UsersTable
                searchQuery={invSearchQuery}
                filters={invFilters}
                searchField={invSearchField}
                allowedStatuses={["invited", "invitation-expired", "invitation-withdrawn"]}
              />
            </div>
          </TabsContent>
        </Tabs>
      </Layout>
      <AIAssistant userData={{}} isOpen={false} />
    </>
  );
}
