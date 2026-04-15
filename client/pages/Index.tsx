import { useState } from "react";
import Layout from "@/components/Layout";
import PageHeader from "@/components/PageHeader";
import FilterBar from "@/components/FilterBar";
import UsersTable from "@/components/UsersTable";
import { AIAssistant } from "@/components/aiAssistant/AIAssistant";
import { Send } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "blocked", label: "Authentication blocked" },
  { value: "grace", label: "Grace" },
  { value: "inactive", label: "Inactive" },
  { value: "invitation-expired", label: "Invitation expired" },
  { value: "invitation-withdrawn", label: "Invitation withdrawn" },
  { value: "invited", label: "Invited" },
];

const SEARCH_FIELDS = [
  { value: "all", label: "All fields" },
  { value: "email", label: "Email" },
  { value: "firstName", label: "First name" },
  { value: "lastName", label: "Last name" },
  { value: "phoneNumber", label: "Phone number" },
];

export default function Index() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Array<{ id: string; column: string; operator: string; value: string }>>([]);
  const [searchField, setSearchField] = useState("all");

  const handleAddFilter = (filter: { id: string; column: string; operator: string; value: string }) => {
    setFilters([...filters, filter]);
  };

  const handleRemoveFilter = (filterId: string) => {
    setFilters(filters.filter((f) => f.id !== filterId));
  };

  const handleClearFilters = () => {
    setFilters([]);
  };

  return (
    <>
      <Layout>
        <PageHeader title="Users" />

        <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="space-y-6 lg:space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                <FilterBar
                  columns={[
                    { value: "email", label: "Email" },
                    { value: "firstName", label: "First name" },
                    { value: "lastName", label: "Last name" },
                    { value: "phoneNumber", label: "Phone number" },
                    { value: "organizations", label: "Organization" },
                    { value: "status", label: "Status" },
                  ]}
                  columnOptions={{
                    status: STATUS_OPTIONS,
                  }}
                  filters={filters}
                  onFilterAdd={handleAddFilter}
                  onFilterRemove={handleRemoveFilter}
                  onClearFilters={handleClearFilters}
                  searchValue={searchQuery}
                  onSearchChange={setSearchQuery}
                  searchPlaceholder="Search users"
                  searchFields={SEARCH_FIELDS}
                  searchField={searchField}
                  onSearchFieldChange={setSearchField}
                />
              </div>

              <button className="flex items-center gap-2 h-10 px-3 bg-blue-500 hover:bg-blue-600 text-bluegrey-25 rounded-sm transition-colors whitespace-nowrap">
                <Send className="w-5 h-5" />
                <span className="text-sm font-medium">Invite user</span>
              </button>
            </div>

            <UsersTable searchQuery={searchQuery} filters={filters} searchField={searchField} />
          </div>
        </div>
      </Layout>
      <AIAssistant userData={{}} isOpen={false} />
    </>
  );
}
