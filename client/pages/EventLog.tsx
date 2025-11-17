import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import PageHeader from "@/components/PageHeader";
import FilterBar from "@/components/FilterBar";
import EventTable from "@/components/EventTable";

export default function EventLog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Array<{ id: string; column: string; operator: string; value: string }>>([]);

  useEffect(() => {
    const now = new Date();
    const fourteenDaysAgo = new Date(now);
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const formatDate = (date: Date) => {
      return date.toISOString().slice(0, 16).replace("T", " ");
    };

    const startDate = formatDate(fourteenDaysAgo);
    const endDate = formatDate(now);

    setFilters([
      {
        id: "default-date-filter",
        column: "timestamp",
        operator: "between",
        value: `${startDate}|${endDate}`,
      },
    ]);
  }, []);

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
    <Layout>
      <PageHeader title="Event log" />

      <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="space-y-6 lg:space-y-8">
          <div className="flex items-center gap-2 flex-wrap">
            <FilterBar
              columns={[
                { value: "timestamp", label: "Timestamp" },
                { value: "username", label: "Username" },
                { value: "action", label: "Action" },
              ]}
              filters={filters}
              onFilterAdd={handleAddFilter}
              onFilterRemove={handleRemoveFilter}
              onClearFilters={handleClearFilters}
              searchValue={searchQuery}
              onSearchChange={setSearchQuery}
              searchPlaceholder="Search events"
            />
          </div>

          <EventTable searchQuery={searchQuery} filters={filters} onFilterAdd={handleAddFilter} />
        </div>
      </div>
    </Layout>
  );
}
