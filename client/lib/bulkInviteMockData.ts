// ─── Types ────────────────────────────────────────────────────────────────────

export type BulkJobStatus =
  | "queued"
  | "running"
  | "completed"
  | "completed-with-errors"
  | "failed"
  | "cancelled";

export type InvitationStatus =
  | "pending"
  | "sent"
  | "accepted"
  | "expired"
  | "cancelled"
  | "failed";

export type ProcessingResult = "success" | "failed" | "pending";

export interface BulkInvitedUser {
  email: string;
  firstName: string;
  lastName: string;
  userStatus: "pending" | "active" | "failed";
  invitationStatus: InvitationStatus;
  accessRoles: string[];
  adminRoles: string[];
  processingResult: ProcessingResult;
  errorMessage?: string;
}

export interface BulkInvitationJob {
  id: string;
  status: BulkJobStatus;
  organization: string;
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
      { email: "alice.smith@acme.com", firstName: "Alice", lastName: "Smith", userStatus: "active", invitationStatus: "accepted", accessRoles: ["Claim Processor", "Viewer"], adminRoles: [], processingResult: "success" },
      { email: "bob.jones@acme.com",  firstName: "Bob",   lastName: "Jones", userStatus: "active", invitationStatus: "sent",     accessRoles: ["Claim Processor", "Viewer"], adminRoles: [], processingResult: "success" },
      { email: "carol.white@acme.com",firstName: "Carol", lastName: "White", userStatus: "active", invitationStatus: "accepted", accessRoles: ["Claim Processor", "Viewer"], adminRoles: [], processingResult: "success" },
    ],
  },
  {
    id: "BIJ-002",
    status: "completed-with-errors",
    organization: "Tech Solutions",
    createdBy: "admin@example.com",
    createdDate: "2025-06-22T14:00:00Z",
    startedDate: "2025-06-22T14:00:08Z",
    completedDate: "2025-06-22T14:03:45Z",
    totalUsers: 20,
    processedUsers: 20,
    successfulUsers: 17,
    failedUsers: 3,
    selectedAccessRoles: ["Support Agent"],
    selectedAdminRoles: ["Helpdesk Admin"],
    users: [
      { email: "dave.green@techsol.com",  firstName: "Dave",  lastName: "Green",  userStatus: "active", invitationStatus: "sent", accessRoles: ["Support Agent"], adminRoles: ["Helpdesk Admin"], processingResult: "success" },
      { email: "eve.black@techsol.com",   firstName: "Eve",   lastName: "Black",  userStatus: "failed", invitationStatus: "failed", accessRoles: [], adminRoles: [], processingResult: "failed", errorMessage: "Email domain not allowed" },
      { email: "frank.gray@techsol.com",  firstName: "Frank", lastName: "Gray",   userStatus: "active", invitationStatus: "sent", accessRoles: ["Support Agent"], adminRoles: ["Helpdesk Admin"], processingResult: "success" },
      { email: "grace.blue@techsol.com",  firstName: "Grace", lastName: "Blue",   userStatus: "failed", invitationStatus: "failed", accessRoles: [], adminRoles: [], processingResult: "failed", errorMessage: "User already exists" },
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

export function createBulkJob(
  org: string,
  accessRoles: string[],
  adminRoles: string[],
  users: { email: string; firstName: string; lastName: string }[]
): BulkInvitationJob {
  const newJob: BulkInvitationJob = {
    id: `BIJ-${String(BULK_INVITE_JOBS.length + 1).padStart(3, "0")}`,
    status: "queued",
    organization: org,
    createdBy: "admin@example.com",
    createdDate: new Date().toISOString(),
    totalUsers: users.length,
    processedUsers: 0,
    successfulUsers: 0,
    failedUsers: 0,
    selectedAccessRoles: accessRoles,
    selectedAdminRoles: adminRoles,
    users: users.map((u) => ({
      ...u,
      userStatus: "pending",
      invitationStatus: "pending",
      accessRoles,
      adminRoles,
      processingResult: "pending",
    })),
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

export const INVITATION_STATUS_LABELS: Record<InvitationStatus, string> = {
  pending: "Pending",
  sent: "Invitation Sent",
  accepted: "Accepted",
  expired: "Expired",
  cancelled: "Cancelled",
  failed: "Failed",
};
