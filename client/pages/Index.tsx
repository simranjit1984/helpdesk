import Layout from "@/components/Layout";
import PageHeader from "@/components/PageHeader";
import SearchBar from "@/components/SearchBar";
import FilterTag from "@/components/FilterTag";
import UsersTable from "@/components/UsersTable";
import { Send } from "lucide-react";

export default function Index() {
  return (
    <Layout>
      <PageHeader title="Users" />

      <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="space-y-6 lg:space-y-8">
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-2 flex-wrap">
              <div className="w-full sm:w-auto">
                <SearchBar />
              </div>
              <FilterTag
                label="Status is"
                boldText="Active"
                onRemove={() => {}}
              />
              <FilterTag
                label="Username contains"
                boldText="@example.com"
                onRemove={() => {}}
              />
              <FilterTag label="Add filter" isAddButton />
              <button className="text-sm text-blue-500 underline hover:text-blue-600 transition-colors h-10 flex items-center">
                Clear all filters
              </button>
            </div>

            <div className="flex justify-end">
              <button className="flex items-center gap-2 h-10 px-3 bg-blue-500 hover:bg-blue-600 text-bluegrey-25 rounded-sm transition-colors">
                <Send className="w-5 h-5" />
                <span className="text-sm font-medium">Invite user</span>
              </button>
            </div>
          </div>

          <UsersTable />
        </div>
      </div>
    </Layout>
  );
}
