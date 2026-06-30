// ─── Types ────────────────────────────────────────────────────────────────────

export type BulkJobStatus =
  | "queued"
  | "running"
  | "completed"
  | "completed-with-errors"
  | "failed"
  | "cancelled";

export type ProcessingResult = "success" | "failed" | "pending";

export interface OrgInviteConfig {
  orgId: string;
  orgName: string;
  accessRoles: string[];  // role names
  adminRoles: { name: string; scopeName: string; cascadable: boolean }[];
}

export interface BulkInvitedUser {
  email: string;
  firstName: string;
  lastName: string;
  organizationId?: string;
  organizationName?: string;
  userStatus: "pending" | "active" | "failed";
  accessRoles: string[];
  adminRoles: string[];
  processingResult: ProcessingResult;
  errorMessage?: string;
}

export interface BulkInvitationJob {
  id: string;
  status: BulkJobStatus;
  organization: string;       // "Multiple organizations" or single org name
  organizations?: string[];   // list of org names involved (multi-org jobs)
  orgConfigs?: OrgInviteConfig[];
  createdBy: string;
  createdDate: string;
  startedDate?: string;
  completedDate?: string;
  totalUsers: number;
  processedUsers: number;
  successfulUsers: number;
  failedUsers: number;
  selectedAccessRoles: string[];
  selectedAdminRoles: string[];
  users: BulkInvitedUser[];
}

// ─── Seed data ────────────────────────────────────────────────────────────────

export const BULK_INVITE_JOBS: BulkInvitationJob[] = [
  {
    id: "BIJ-001",
    status: "completed",
    organization: "Acme Corp",
    createdBy: "admin@example.com",
    createdDate: "2025-06-20T09:15:00Z",
    startedDate: "2025-06-20T09:15:05Z",
    completedDate: "2025-06-20T09:17:32Z",
    totalUsers: 42,
    processedUsers: 42,
    successfulUsers: 42,
    failedUsers: 0,
    selectedAccessRoles: ["Claim Processor", "Viewer"],
    selectedAdminRoles: [],
    users: [
      { email: "alice.smith@acme.com", firstName: "Alice", lastName: "Smith", organizationId: "1", organizationName: "Acme Corp", userStatus: "active", accessRoles: ["Claim Processor", "Viewer"], adminRoles: [], processingResult: "success" },
      { email: "bob.jones@acme.com",   firstName: "Bob",   lastName: "Jones", organizationId: "1", organizationName: "Acme Corp", userStatus: "active", accessRoles: ["Claim Processor", "Viewer"], adminRoles: [], processingResult: "success" },
      { email: "carol.white@acme.com", firstName: "Carol", lastName: "White", organizationId: "1", organizationName: "Acme Corp", userStatus: "active", accessRoles: ["Claim Processor", "Viewer"], adminRoles: [], processingResult: "success" },
    ],
  },
  {
    id: "BIJ-002",
    status: "completed-with-errors",
    organization: "Multiple organizations",
    organizations: ["Acme Europe", "Tech Solutions"],
    orgConfigs: [
      { orgId: "1-1", orgName: "Acme Europe", accessRoles: ["General Partner User", "Finance group"], adminRoles: [{ name: "User Admin", scopeName: "Acme Corp Scope", cascadable: true }] },
      { orgId: "2",   orgName: "Tech Solutions", accessRoles: ["Support Agent"], adminRoles: [] },
    ],
    createdBy: "admin@example.com",
    createdDate: "2025-06-22T14:00:00Z",
    startedDate: "2025-06-22T14:00:08Z",
    completedDate: "2025-06-22T14:03:45Z",
    totalUsers: 20,
    processedUsers: 20,
    successfulUsers: 17,
    failedUsers: 3,
    selectedAccessRoles: [],
    selectedAdminRoles: [],
    users: [
      { email: "dave.green@acmeeu.com",  firstName: "Dave",  lastName: "Green",  organizationId: "1-1", organizationName: "Acme Europe",   userStatus: "active", accessRoles: ["General Partner User"], adminRoles: ["User Admin"], processingResult: "success" },
      { email: "eve.black@techsol.com",  firstName: "Eve",   lastName: "Black",  organizationId: "2",   organizationName: "Tech Solutions", userStatus: "failed", accessRoles: [], adminRoles: [], processingResult: "failed", errorMessage: "Email domain not allowed" },
      { email: "frank.gray@acmeeu.com",  firstName: "Frank", lastName: "Gray",   organizationId: "1-1", organizationName: "Acme Europe",   userStatus: "active", accessRoles: ["General Partner User"], adminRoles: ["User Admin"], processingResult: "success" },
      { email: "grace.blue@techsol.com", firstName: "Grace", lastName: "Blue",   organizationId: "2",   organizationName: "Tech Solutions", userStatus: "failed", accessRoles: [], adminRoles: [], processingResult: "failed", errorMessage: "User already exists" },
    ],
  },
  {
    id: "BIJ-003",
    status: "running",
    organization: "Global Services",
    createdBy: "admin@example.com",
    createdDate: "2025-06-24T08:30:00Z",
    startedDate: "2025-06-24T08:30:05Z",
    totalUsers: 150,
    processedUsers: 73,
    successfulUsers: 71,
    failedUsers: 2,
    selectedAccessRoles: ["Field Officer"],
    selectedAdminRoles: [],
    users: [],
  },
  {
    id: "BIJ-004",
    status: "queued",
    organization: "Acme Corp",
    createdBy: "admin@example.com",
    createdDate: "2025-06-24T11:00:00Z",
    totalUsers: 8,
    processedUsers: 0,
    successfulUsers: 0,
    failedUsers: 0,
    selectedAccessRoles: ["Manager"],
    selectedAdminRoles: [],
    users: [],
  },
  {
    id: "BIJ-005",
    status: "failed",
    organization: "Tech Solutions",
    createdBy: "admin@example.com",
    createdDate: "2025-06-18T16:45:00Z",
    startedDate: "2025-06-18T16:45:10Z",
    completedDate: "2025-06-18T16:45:22Z",
    totalUsers: 30,
    processedUsers: 3,
    successfulUsers: 0,
    failedUsers: 3,
    selectedAccessRoles: ["Project Lead"],
    selectedAdminRoles: [],
    users: [],
  },
];

// ─── Store helpers ────────────────────────────────────────────────────────────

export function getBulkJobs(): BulkInvitationJob[] {
  return BULK_INVITE_JOBS;
}

export function getBulkJobById(id: string): BulkInvitationJob | undefined {
  return BULK_INVITE_JOBS.find((j) => j.id === id);
}

export function createBulkJob(params: {
  orgConfigs: OrgInviteConfig[];
  users: { email: string; firstName: string; lastName: string; organizationId: string; organizationName: string }[];
}): BulkInvitationJob {
  const { orgConfigs, users } = params;
  const orgNames = orgConfigs.map((c) => c.orgName);
  const isMultiOrg = orgConfigs.length > 1;

  const newJob: BulkInvitationJob = {
    id: `BIJ-${String(BULK_INVITE_JOBS.length + 1).padStart(3, "0")}`,
    status: "queued",
    organization: isMultiOrg ? "Multiple organizations" : (orgNames[0] ?? "Unknown"),
    organizations: isMultiOrg ? orgNames : undefined,
    orgConfigs,
    createdBy: "admin@example.com",
    createdDate: new Date().toISOString(),
    totalUsers: users.length,
    processedUsers: 0,
    successfulUsers: 0,
    failedUsers: 0,
    selectedAccessRoles: [],
    selectedAdminRoles: [],
    users: users.map((u) => {
      const cfg = orgConfigs.find((c) => c.orgId === u.organizationId);
      return {
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        organizationId: u.organizationId,
        organizationName: u.organizationName,
        userStatus: "pending",
        accessRoles: cfg?.accessRoles ?? [],
        adminRoles: cfg?.adminRoles.map((r) => r.name) ?? [],
        processingResult: "pending",
      };
    }),
  };
  BULK_INVITE_JOBS.unshift(newJob);
  return newJob;
}

// ─── Display helpers ──────────────────────────────────────────────────────────

export const JOB_STATUS_LABELS: Record<BulkJobStatus, string> = {
  queued: "Queued",
  running: "Running",
  completed: "Completed",
  "completed-with-errors": "Completed with Errors",
  failed: "Failed",
  cancelled: "Cancelled",
};

export const JOB_STATUS_COLORS: Record<BulkJobStatus, string> = {
  queued: "bg-bluegrey-100 text-bluegrey-600",
  running: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  "completed-with-errors": "bg-amber-100 text-amber-700",
  failed: "bg-red-100 text-red-700",
  cancelled: "bg-bluegrey-100 text-bluegrey-500",
};
