import { useState } from "react";
import { CleanupJob, seedJobs } from "@/lib/jobsMockData";
import JobManagementList from "./JobManagementList";

export default function JobsPage() {
  const [jobs, setJobs] = useState<CleanupJob[]>(seedJobs);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      <JobManagementList jobs={jobs} onJobsChange={setJobs} />
    </div>
  );
}
