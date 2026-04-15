import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import PageHeader from "@/components/PageHeader";
import FilterBar from "@/components/FilterBar";
import OrganizationsTable from "@/components/OrganizationsTable";
import { AIAssistant } from "@/components/aiAssistant/AIAssistant";
import { Plus } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export default function Organizations() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("all");
  const [filters, setFilters] = useState<Array<{ id: string; column: string; operator: string; value: string }>>([]);

  const SEARCH_FIELDS = [
    { value: "all", label: "All fields" },
    { value: "name", label: "Organization name" },
    { value: "referenceId", label: "Reference ID" },
  ];

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
                  searchFields={SEARCH_FIELDS}
                  searchField={searchField}
                  onSearchFieldChange={setSearchField}
                />
              </div>

              <button
                onClick={() => navigate("/organizations/new")}
                className="flex items-center gap-2 h-10 px-3 bg-blue-500 hover:bg-blue-600 text-bluegrey-25 rounded-sm transition-colors whitespace-nowrap"
              >
                <Plus className="w-5 h-5" />
                <span className="text-sm font-medium">Add organization</span>
              </button>
            </div>

            <OrganizationsTable searchQuery={searchQuery} searchField={searchField} filters={filters} />
          </div>
        </div>
      </Layout>
      <AIAssistant userData={{}} isOpen={false} />
    </>
  );
}
