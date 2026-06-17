import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CleanupJob, LogEntry, seedJobs, seedLogEntries } from "@/lib/jobsMockData";
import JobManagementList from "./JobManagementList";
import CleanupLogsTable from "./CleanupLogsTable";

const TAB_TRIGGER_CLASS =
  "h-auto py-3 px-0 rounded-none bg-transparent text-sm font-medium " +
  "border-b-2 border-transparent shadow-none " +
  "text-bluegrey-500 " +
  "data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 " +
  "data-[state=active]:bg-transparent data-[state=active]:shadow-none " +
  "hover:text-bluegrey-900 transition-colors";

export default function JobsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "config";

  const [jobs, setJobs] = useState<CleanupJob[]>(seedJobs);
  const [logs] = useState<LogEntry[]>(seedLogEntries);
  const [logsJobFilter, setLogsJobFilter] = useState<string | undefined>(undefined);

  const handleTabChange = (val: string) => {
    setSearchParams({ tab: val });
  };

  const handleViewLogs = (jobId: string) => {
    setLogsJobFilter(jobId);
    setSearchParams({ tab: "logs" });
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange}>
      <div className="bg-white border-b border-bluegrey-200 px-4 sm:px-6 lg:px-8">
        <TabsList className="h-auto bg-transparent p-0 gap-6 -mb-px">
          <TabsTrigger value="config" className={TAB_TRIGGER_CLASS}>
            Job configuration
          </TabsTrigger>
          <TabsTrigger value="logs" className={TAB_TRIGGER_CLASS}>
            Cleanup logs
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="config" className="mt-0 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <JobManagementList
          jobs={jobs}
          onJobsChange={setJobs}
          onViewLogs={handleViewLogs}
        />
      </TabsContent>

      <TabsContent value="logs" className="mt-0 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <CleanupLogsTable
          logs={logs}
          jobs={jobs}
          filterJobId={logsJobFilter}
        />
      </TabsContent>
    </Tabs>
  );
}
