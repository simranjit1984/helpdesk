// ─── Types ────────────────────────────────────────────────────────────────────

export type BulkAccessOperation = "add" | "remove" | "replace";
export type BulkAccessScope = "single-org" | "multi-org";
export type BulkJobStatus = "queued" | "running" | "completed" | "completed-with-errors" | "failed" | "cancelled";
export type UserAction = "added" | "removed" | "replaced" | "no-change" | "failed" | "pending";
export type UserResult = "success" | "failed" | "no-change" | "pending";

export interface BulkAccessUser {
  email: string;
  displayName: string;
  organizationId: string;
  organizationName: string;
  action: UserAction;
  assignedRoles: string[];
  result: UserResult;
  errorMessage?: string;
}

export interface OrgJobConfig {
  orgId: string;
  orgName: string;
  accessRoles: string[];
}

export interface BulkAccessJob {
  id: string;
  operation: BulkAccessOperation;
  scope: BulkAccessScope;
  status: BulkJobStatus;
  organizations: string[];
  orgConfigs?: OrgJobConfig[];
  createdBy: string;
  createdDate: string;
  startedDate?: string;
  completedDate?: string;
  totalUsers: number;
  processedUsers: number;
  successfulUsers: number;
  failedUsers: number;
  noChangeUsers: number;
  users: BulkAccessUser[];
}

// ─── Mock org users ───────────────────────────────────────────────────────────

export interface MockOrgUser {
  id: string;
  email: string;
  displayName: string;
  username: string;
  orgId: string;
}

export const ORG_USERS: MockOrgUser[] = [
  { id: "u1",  email: "alice.smith@acme.com",    displayName: "Alice Smith",     username: "alice.smith",     orgId: "1"   },
  { id: "u2",  email: "bob.jones@acme.com",       displayName: "Bob Jones",       username: "bob.jones",       orgId: "1"   },
  { id: "u3",  email: "carol.white@acme.com",     displayName: "Carol White",     username: "carol.white",     orgId: "1"   },
  { id: "u4",  email: "dave.brown@acme.com",      displayName: "Dave Brown",      username: "dave.brown",      orgId: "1"   },
  { id: "u5",  email: "eve.davis@acme.com",       displayName: "Eve Davis",       username: "eve.davis",       orgId: "1"   },
  { id: "u6",  email: "frank.miller@acmeeu.com",  displayName: "Frank Miller",    username: "frank.miller",    orgId: "1-1" },
  { id: "u7",  email: "grace.wilson@acmeeu.com",  displayName: "Grace Wilson",    username: "grace.wilson",    orgId: "1-1" },
  { id: "u8",  email: "henry.moore@acmeeu.com",   displayName: "Henry Moore",     username: "henry.moore",     orgId: "1-1" },
  { id: "u9",  email: "ivan.taylor@techsol.com",  displayName: "Ivan Taylor",     username: "ivan.taylor",     orgId: "2"   },
  { id: "u10", email: "julia.and@techsol.com",    displayName: "Julia Anderson",  username: "julia.anderson",  orgId: "2"   },
  { id: "u11", email: "kevin.tho@techsol.com",    displayName: "Kevin Thomas",    username: "kevin.thomas",    orgId: "2"   },
  { id: "u12", email: "lisa.jack@techsol.com",    displayName: "Lisa Jackson",    username: "lisa.jackson",    orgId: "2"   },
  { id: "u13", email: "mike.white@global.com",    displayName: "Mike White",      username: "mike.white",      orgId: "3"   },
  { id: "u14", email: "nancy.harris@global.com",  displayName: "Nancy Harris",    username: "nancy.harris",    orgId: "3"   },
  { id: "u15", email: "oscar.martin@global.com",  displayName: "Oscar Martin",    username: "oscar.martin",    orgId: "3"   },
];

export function getUsersForOrg(orgId: string): MockOrgUser[] {
  return ORG_USERS.filter((u) => u.orgId === orgId);
}

// ─── Seed jobs ────────────────────────────────────────────────────────────────

export const BULK_ACCESS_JOBS: BulkAccessJob[] = [
  {
    id: "BAJ-001",
    operation: "add",
    scope: "single-org",
    status: "completed",
    organizations: ["Acme Corp"],
    orgConfigs: [{ orgId: "1", orgName: "Acme Corp", accessRoles: ["General Partner User", "Finance group"] }],
    createdBy: "admin@example.com",
    createdDate: "2025-06-20T09:00:00Z",
    startedDate: "2025-06-20T09:00:05Z",
    completedDate: "2025-06-20T09:02:30Z",
    totalUsers: 5,
    processedUsers: 5,
    successfulUsers: 4,
    failedUsers: 0,
    noChangeUsers: 1,
    users: [
      { email: "alice.smith@acme.com", displayName: "Alice Smith", organizationId: "1", organizationName: "Acme Corp", action: "added", assignedRoles: ["General Partner User", "Finance group"], result: "success" },
      { email: "bob.jones@acme.com",   displayName: "Bob Jones",   organizationId: "1", organizationName: "Acme Corp", action: "added", assignedRoles: ["General Partner User", "Finance group"], result: "success" },
      { email: "carol.white@acme.com", displayName: "Carol White", organizationId: "1", organizationName: "Acme Corp", action: "no-change", assignedRoles: [], result: "no-change" },
      { email: "dave.brown@acme.com",  displayName: "Dave Brown",  organizationId: "1", organizationName: "Acme Corp", action: "added", assignedRoles: ["General Partner User"], result: "success" },
      { email: "eve.davis@acme.com",   displayName: "Eve Davis",   organizationId: "1", organizationName: "Acme Corp", action: "added", assignedRoles: ["Finance group"], result: "success" },
    ],
  },
  {
    id: "BAJ-002",
    operation: "replace",
    scope: "multi-org",
    status: "completed-with-errors",
    organizations: ["Acme Europe", "Tech Solutions"],
    orgConfigs: [
      { orgId: "1-1", orgName: "Acme Europe",   accessRoles: ["Limited Partner User"] },
      { orgId: "2",   orgName: "Tech Solutions", accessRoles: ["Sales general"] },
    ],
    createdBy: "admin@example.com",
    createdDate: "2025-06-22T14:00:00Z",
    startedDate: "2025-06-22T14:00:10Z",
    completedDate: "2025-06-22T14:04:00Z",
    totalUsers: 7,
    processedUsers: 7,
    successfulUsers: 5,
    failedUsers: 2,
    noChangeUsers: 0,
    users: [
      { email: "frank.miller@acmeeu.com", displayName: "Frank Miller", organizationId: "1-1", organizationName: "Acme Europe",   action: "replaced", assignedRoles: ["Limited Partner User"], result: "success" },
      { email: "grace.wilson@acmeeu.com", displayName: "Grace Wilson", organizationId: "1-1", organizationName: "Acme Europe",   action: "replaced", assignedRoles: ["Limited Partner User"], result: "success" },
      { email: "henry.moore@acmeeu.com",  displayName: "Henry Moore",  organizationId: "1-1", organizationName: "Acme Europe",   action: "failed",   assignedRoles: [], result: "failed", errorMessage: "User not found in organization" },
      { email: "ivan.taylor@techsol.com", displayName: "Ivan Taylor",  organizationId: "2",   organizationName: "Tech Solutions", action: "replaced", assignedRoles: ["Sales general"], result: "success" },
      { email: "julia.and@techsol.com",   displayName: "Julia Anderson",organizationId: "2",   organizationName: "Tech Solutions", action: "replaced", assignedRoles: ["Sales general"], result: "success" },
      { email: "kevin.tho@techsol.com",   displayName: "Kevin Thomas", organizationId: "2",   organizationName: "Tech Solutions", action: "replaced", assignedRoles: ["Sales general"], result: "success" },
      { email: "lisa.jack@techsol.com",   displayName: "Lisa Jackson", organizationId: "2",   organizationName: "Tech Solutions", action: "failed",   assignedRoles: [], result: "failed", errorMessage: "Access role not available for this organization" },
    ],
  },
  {
    id: "BAJ-003",
    operation: "remove",
    scope: "single-org",
    status: "running",
    organizations: ["Global Services"],
    createdBy: "admin@example.com",
    createdDate: "2025-06-24T10:00:00Z",
    startedDate: "2025-06-24T10:00:05Z",
    totalUsers: 15,
    processedUsers: 8,
    successfulUsers: 7,
    failedUsers: 1,
    noChangeUsers: 0,
    users: [],
  },
  {
    id: "BAJ-004",
    operation: "add",
    scope: "single-org",
    status: "queued",
    organizations: ["Acme Corp"],
    createdBy: "admin@example.com",
    createdDate: "2025-06-24T11:30:00Z",
    totalUsers: 3,
    processedUsers: 0,
    successfulUsers: 0,
    failedUsers: 0,
    noChangeUsers: 0,
    users: [],
  },
];

// ─── Store helpers ────────────────────────────────────────────────────────────

export function getBulkAccessJobs(): BulkAccessJob[] {
  return BULK_ACCESS_JOBS;
}

export function getBulkAccessJobById(id: string): BulkAccessJob | undefined {
  return BULK_ACCESS_JOBS.find((j) => j.id === id);
}

export function createBulkAccessJob(params: {
  operation: BulkAccessOperation;
  scope: BulkAccessScope;
  orgConfigs: OrgJobConfig[];
  users: { email: string; displayName: string; organizationId: string; organizationName: string }[];
}): BulkAccessJob {
  const { operation, scope, orgConfigs, users } = params;
  const orgNames = orgConfigs.map((c) => c.orgName);
  const newJob: BulkAccessJob = {
    id: `BAJ-${String(BULK_ACCESS_JOBS.length + 1).padStart(3, "0")}`,
    operation,
    scope,
    status: "queued",
    organizations: orgNames,
    orgConfigs,
    createdBy: "admin@example.com",
    createdDate: new Date().toISOString(),
    totalUsers: users.length,
    processedUsers: 0,
    successfulUsers: 0,
    failedUsers: 0,
    noChangeUsers: 0,
    users: users.map((u) => ({
      ...u,
      action: "pending",
      assignedRoles: orgConfigs.find((c) => c.orgId === u.organizationId)?.accessRoles ?? [],
      result: "pending",
    })),
  };
  BULK_ACCESS_JOBS.unshift(newJob);
  return newJob;
}

// ─── Display helpers ──────────────────────────────────────────────────────────

export const OPERATION_LABELS: Record<BulkAccessOperation, string> = {
  add: "Add Access Roles",
  remove: "Remove Access Roles",
  replace: "Replace Access Roles",
};

export const OPERATION_COLORS: Record<BulkAccessOperation, string> = {
  add: "bg-green-100 text-green-700",
  remove: "bg-red-100 text-red-700",
  replace: "bg-blue-100 text-blue-700",
};

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

export const ACTION_LABELS: Record<UserAction, string> = {
  added: "Added",
  removed: "Removed",
  replaced: "Replaced",
  "no-change": "No Changes",
  failed: "Failed",
  pending: "Pending",
};

export const ACTION_COLORS: Record<UserAction, string> = {
  added: "text-green-700",
  removed: "text-red-600",
  replaced: "text-blue-700",
  "no-change": "text-bluegrey-400",
  failed: "text-red-600",
  pending: "text-bluegrey-400",
};
