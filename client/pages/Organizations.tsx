import { useState } from "react";
import Layout from "@/components/Layout";
import PageHeader from "@/components/PageHeader";
import FilterBar from "@/components/FilterBar";
import OrganizationsTable from "@/components/OrganizationsTable";
import { AIAssistant } from "@/components/aiAssistant/AIAssistant";
import { Plus } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "suspended", label: "Suspended" },
  { value: "pending", label: "Pending" },
];

export default function Organizations() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Array<{ id: string; column: string; operator: string; value: string }>>([]);

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
        <PageHeader title="Organizations" />

        <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="space-y-6 lg:space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                <FilterBar
                  columns={[
                    { value: "name", label: "Organization name" },
                    { value: "referenceId", label: "Reference ID" },
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
                  searchPlaceholder="Search organizations"
                />
              </div>

              <button className="flex items-center gap-2 h-10 px-3 bg-blue-500 hover:bg-blue-600 text-bluegrey-25 rounded-sm transition-colors whitespace-nowrap">
                <Plus className="w-5 h-5" />
                <span className="text-sm font-medium">Add organization</span>
              </button>
            </div>

            <OrganizationsTable searchQuery={searchQuery} filters={filters} />
          </div>
        </div>
      </Layout>
      <AIAssistant userData={{}} isOpen={false} />
    </>
  );
}
