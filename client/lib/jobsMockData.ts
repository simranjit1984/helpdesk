// ─── Types ────────────────────────────────────────────────────────────────────

export type CleanupStatus =
  | "invitation-expired"
  | "invitation-withdrawn"
  | "auth-blocked"
  | "inactive";

export type Frequency = "daily" | "weekly" | "twice-weekly" | "monthly";
export type JobStatus = "active" | "disabled";
export type LogStatus = "success" | "partial-success" | "failed";

export type JobType =
  | "user-status-cleanup"
  | "org-membership-cleanup"
  | "access-role-cleanup";

export type UserStatusFilter = "active" | "all" | "custom";
export type LastOrgBehavior = "keep" | "mark-pending" | "delete-user";
export type LastRoleBehavior = "keep-in-org" | "mark-no-roles";

export interface OrgMembershipBehavior {
  revokeAccessRoles: boolean;
  sendNotification: boolean;
  logAuditTrail: boolean;
  lastOrgBehavior: LastOrgBehavior;
}

export interface AccessRoleBehavior {
  sendNotification: boolean;
  logAuditTrail: boolean;
  removeFromEntitlements: boolean;
  lastRoleBehavior: LastRoleBehavior;
}

export interface MockOrganization {
  id: string;
  name: string;
}

export interface MockAccessRoleOption {
  id: string;
  name: string;
}

export interface RetryConfig {
  maxAttempts: number;
  delaySeconds: number;
  retryOn: string[];
}

export interface CleanupJob {
  id: string;
  name: string;
  statuses: CleanupStatus[];
  frequency: Frequency;
  frequencyDays?: string[];
  frequencyDayOfMonth?: number;
  executionHour: number;
  dryRunEnabled: boolean;
  retry: RetryConfig;
  status: JobStatus;
  createdBy: string;
  createdAt: string;
  lastRun?: string;
  nextRun: string;
  // New optional fields
  jobType?: JobType;
  organizationIds?: string[];
  includeAllOrgs?: boolean;
  userStatusFilter?: UserStatusFilter;
  gracePeriodDays?: number;
  specificAccessRoles?: string[];
  excludeRoles?: string[];
  includeAllRoles?: boolean;
  orgMembershipBehavior?: OrgMembershipBehavior;
  accessRoleBehavior?: AccessRoleBehavior;
}

export interface RetryLogEntry {
  attempt: number;
  timestamp: string;
  error: string;
  success: boolean;
}

export interface DryRunReport {
  totalMatched: number;
  byStatus: Record<CleanupStatus, number>;
  userList: string[];
  warnings: string[];
}

export interface LogDetails {
  deletedUsers: string[];
  failedUsers: { id: string; reason: string }[];
  dryRunReport?: DryRunReport;
  retryLog: RetryLogEntry[];
  startTime: string;
  endTime: string;
  durationSeconds: number;
  // New optional fields
  removedFromOrg?: { userId: string; orgName: string }[];
  revokedRoles?: { userId: string; roleName: string; orgName: string }[];
  notificationsSent?: number;
}

export interface LogEntry {
  id: string;
  jobId: string;
  executionDate: string;
  executionTime: string;
  status: LogStatus;
  usersDeleted: number;
  failedRecords: number;
  retriesPerformed: number;
  deletedStatuses: CleanupStatus[];
  details: LogDetails;
  // New optional fields
  jobType?: JobType;
  itemsProcessed?: number;
  organizationsScanned?: string[];
}

// ─── Form state (shared by wizard and step components) ────────────────────────

export interface CleanupJobFormState {
  jobType: JobType | null;
  status: CleanupStatus | null;
  organizationIds: string[];
  includeAllOrgs: boolean;
  userStatusFilter: UserStatusFilter;
  gracePeriodDays: number;
  specificAccessRoles: string[];
  includeAllRoles: boolean;
  excludeRoles: string[];
  name: string;
  frequency: Frequency;
  frequencyDays: string[];
  frequencyDayOfMonth: number;
  executionHour: number;
  retry: RetryConfig;
  orgBehavior: OrgMembershipBehavior;
  roleBehavior: AccessRoleBehavior;
}

// ─── Seed jobs ────────────────────────────────────────────────────────────────

export const seedJobs: CleanupJob[] = [
  {
    id: "job-001",
    name: "Nightly Expired Invitation Cleanup",
    statuses: ["invitation-expired", "invitation-withdrawn"],
    frequency: "daily",
    executionHour: 23,
    dryRunEnabled: false,
    retry: {
      maxAttempts: 3,
      delaySeconds: 300,
      retryOn: ["network", "db-timeout", "transient"],
    },
    status: "active",
    createdBy: "admin@example.com",
    createdAt: "2024-11-01T09:00:00Z",
    lastRun: "2025-06-16T23:00:00Z",
    nextRun: "2025-06-17T23:00:00Z",
  },
  {
    id: "job-002",
    name: "Weekly Inactive & Blocked User Purge",
    statuses: ["auth-blocked", "inactive"],
    frequency: "weekly",
    frequencyDays: ["Monday"],
    executionHour: 2,
    dryRunEnabled: true,
    retry: {
      maxAttempts: 5,
      delaySeconds: 60,
      retryOn: ["network", "db-timeout"],
    },
    status: "active",
    createdBy: "admin@example.com",
    createdAt: "2024-12-15T14:30:00Z",
    lastRun: "2025-06-16T02:00:00Z",
    nextRun: "2025-06-23T02:00:00Z",
  },
  {
    id: "job-003",
    name: "Daily Org Membership Expiry Cleanup",
    statuses: [],
    jobType: "org-membership-cleanup",
    organizationIds: ["org-1", "org-2", "org-3"],
    includeAllOrgs: false,
    userStatusFilter: "active",
    gracePeriodDays: 7,
    frequency: "daily",
    executionHour: 1,
    dryRunEnabled: false,
    retry: {
      maxAttempts: 3,
      delaySeconds: 300,
      retryOn: ["network", "db-timeout"],
    },
    status: "active",
    createdBy: "admin@example.com",
    createdAt: "2025-01-15T10:00:00Z",
    lastRun: "2025-06-16T01:00:00Z",
    nextRun: "2025-06-17T01:00:00Z",
    orgMembershipBehavior: {
      revokeAccessRoles: true,
      sendNotification: true,
      logAuditTrail: true,
      lastOrgBehavior: "mark-pending",
    },
  },
  {
    id: "job-004",
    name: "Weekly Access Role Expiry Revocation",
    statuses: [],
    jobType: "access-role-cleanup",
    organizationIds: [],
    includeAllOrgs: true,
    userStatusFilter: "all",
    gracePeriodDays: 0,
    specificAccessRoles: [],
    includeAllRoles: true,
    excludeRoles: [],
    frequency: "weekly",
    frequencyDays: ["Wednesday"],
    executionHour: 3,
    dryRunEnabled: false,
    retry: {
      maxAttempts: 2,
      delaySeconds: 60,
      retryOn: ["network", "transient"],
    },
    status: "active",
    createdBy: "admin@example.com",
    createdAt: "2025-02-20T09:00:00Z",
    lastRun: "2025-06-11T03:00:00Z",
    nextRun: "2025-06-18T03:00:00Z",
    accessRoleBehavior: {
      sendNotification: true,
      logAuditTrail: true,
      removeFromEntitlements: true,
      lastRoleBehavior: "keep-in-org",
    },
  },
];

// ─── Seed log entries ─────────────────────────────────────────────────────────

export const seedLogEntries: LogEntry[] = [
  {
    id: "log-001",
    jobId: "job-001",
    executionDate: "2025-06-16",
    executionTime: "23:00",
    status: "success",
    usersDeleted: 47,
    failedRecords: 0,
    retriesPerformed: 0,
    deletedStatuses: ["invitation-expired", "invitation-withdrawn"],
    details: {
      deletedUsers: [
        "user-aa1@example.com",
        "user-bb2@example.com",
        "user-cc3@example.com",
        "user-dd4@example.com",
        "user-ee5@example.com",
      ],
      failedUsers: [],
      retryLog: [],
      startTime: "2025-06-16T23:00:05Z",
      endTime: "2025-06-16T23:02:44Z",
      durationSeconds: 159,
    },
  },
  {
    id: "log-002",
    jobId: "job-001",
    executionDate: "2025-06-15",
    executionTime: "23:00",
    status: "partial-success",
    usersDeleted: 31,
    failedRecords: 4,
    retriesPerformed: 2,
    deletedStatuses: ["invitation-expired"],
    details: {
      deletedUsers: ["user-ff6@example.com", "user-gg7@example.com", "user-hh8@example.com"],
      failedUsers: [
        { id: "user-ii9@example.com", reason: "DB timeout on delete" },
        { id: "user-jj0@example.com", reason: "DB timeout on delete" },
        { id: "user-kk1@example.com", reason: "Record locked" },
        { id: "user-ll2@example.com", reason: "Record locked" },
      ],
      retryLog: [
        {
          attempt: 1,
          timestamp: "2025-06-15T23:01:30Z",
          error: "DB timeout",
          success: false,
        },
        {
          attempt: 2,
          timestamp: "2025-06-15T23:06:30Z",
          error: "DB timeout",
          success: false,
        },
      ],
      startTime: "2025-06-15T23:00:04Z",
      endTime: "2025-06-15T23:08:17Z",
      durationSeconds: 493,
    },
  },
  {
    id: "log-003",
    jobId: "job-002",
    executionDate: "2025-06-16",
    executionTime: "02:00",
    status: "success",
    usersDeleted: 12,
    failedRecords: 0,
    retriesPerformed: 0,
    deletedStatuses: ["auth-blocked", "inactive"],
    details: {
      deletedUsers: ["user-mm3@example.com", "user-nn4@example.com", "user-oo5@example.com"],
      failedUsers: [],
      dryRunReport: {
        totalMatched: 12,
        byStatus: {
          "invitation-expired": 0,
          "invitation-withdrawn": 0,
          "auth-blocked": 5,
          inactive: 7,
        },
        userList: ["user-mm3@example.com", "user-nn4@example.com", "user-oo5@example.com"],
        warnings: [],
      },
      retryLog: [],
      startTime: "2025-06-16T02:00:03Z",
      endTime: "2025-06-16T02:01:22Z",
      durationSeconds: 79,
    },
  },
  {
    id: "log-004",
    jobId: "job-001",
    executionDate: "2025-06-14",
    executionTime: "23:00",
    status: "failed",
    usersDeleted: 0,
    failedRecords: 58,
    retriesPerformed: 3,
    deletedStatuses: ["invitation-expired", "invitation-withdrawn"],
    details: {
      deletedUsers: [],
      failedUsers: [
        { id: "user-pp6@example.com", reason: "Network unreachable" },
        { id: "user-qq7@example.com", reason: "Network unreachable" },
      ],
      retryLog: [
        { attempt: 1, timestamp: "2025-06-14T23:05:00Z", error: "Network unreachable", success: false },
        { attempt: 2, timestamp: "2025-06-14T23:10:00Z", error: "Network unreachable", success: false },
        { attempt: 3, timestamp: "2025-06-14T23:15:00Z", error: "Network unreachable", success: false },
      ],
      startTime: "2025-06-14T23:00:02Z",
      endTime: "2025-06-14T23:17:45Z",
      durationSeconds: 1063,
    },
  },
  {
    id: "log-005",
    jobId: "job-002",
    executionDate: "2025-06-09",
    executionTime: "02:00",
    status: "success",
    usersDeleted: 8,
    failedRecords: 0,
    retriesPerformed: 0,
    deletedStatuses: ["inactive"],
    details: {
      deletedUsers: ["user-rr8@example.com", "user-ss9@example.com"],
      failedUsers: [],
      dryRunReport: {
        totalMatched: 8,
        byStatus: {
          "invitation-expired": 0,
          "invitation-withdrawn": 0,
          "auth-blocked": 0,
          inactive: 8,
        },
        userList: ["user-rr8@example.com", "user-ss9@example.com"],
        warnings: ["2 users have pending sessions that will be terminated"],
      },
      retryLog: [],
      startTime: "2025-06-09T02:00:01Z",
      endTime: "2025-06-09T02:00:58Z",
      durationSeconds: 57,
    },
  },
  {
    id: "log-006",
    jobId: "job-001",
    executionDate: "2025-06-13",
    executionTime: "23:00",
    status: "partial-success",
    usersDeleted: 22,
    failedRecords: 3,
    retriesPerformed: 1,
    deletedStatuses: ["invitation-expired"],
    details: {
      deletedUsers: ["user-tt0@example.com", "user-uu1@example.com"],
      failedUsers: [
        { id: "user-vv2@example.com", reason: "Transient service failure" },
        { id: "user-ww3@example.com", reason: "Transient service failure" },
        { id: "user-xx4@example.com", reason: "Data validation error" },
      ],
      retryLog: [
        { attempt: 1, timestamp: "2025-06-13T23:05:30Z", error: "Transient failure", success: false },
      ],
      startTime: "2025-06-13T23:00:06Z",
      endTime: "2025-06-13T23:07:12Z",
      durationSeconds: 426,
    },
  },
  {
    id: "log-007",
    jobId: "job-001",
    executionDate: "2025-06-12",
    executionTime: "23:00",
    status: "success",
    usersDeleted: 19,
    failedRecords: 0,
    retriesPerformed: 0,
    deletedStatuses: ["invitation-expired", "invitation-withdrawn"],
    details: {
      deletedUsers: ["user-yy5@example.com", "user-zz6@example.com"],
      failedUsers: [],
      retryLog: [],
      startTime: "2025-06-12T23:00:04Z",
      endTime: "2025-06-12T23:01:58Z",
      durationSeconds: 114,
    },
  },
  {
    id: "log-008",
    jobId: "job-002",
    executionDate: "2025-06-02",
    executionTime: "02:00",
    status: "failed",
    usersDeleted: 0,
    failedRecords: 15,
    retriesPerformed: 5,
    deletedStatuses: ["auth-blocked", "inactive"],
    details: {
      deletedUsers: [],
      failedUsers: [
        { id: "user-aaa@example.com", reason: "Database timeout" },
        { id: "user-bbb@example.com", reason: "Database timeout" },
      ],
      dryRunReport: {
        totalMatched: 15,
        byStatus: {
          "invitation-expired": 0,
          "invitation-withdrawn": 0,
          "auth-blocked": 6,
          inactive: 9,
        },
        userList: ["user-aaa@example.com", "user-bbb@example.com"],
        warnings: ["High database load detected"],
      },
      retryLog: [
        { attempt: 1, timestamp: "2025-06-02T02:01:00Z", error: "DB timeout", success: false },
        { attempt: 2, timestamp: "2025-06-02T02:02:00Z", error: "DB timeout", success: false },
        { attempt: 3, timestamp: "2025-06-02T02:03:00Z", error: "DB timeout", success: false },
        { attempt: 4, timestamp: "2025-06-02T02:04:00Z", error: "DB timeout", success: false },
        { attempt: 5, timestamp: "2025-06-02T02:05:00Z", error: "DB timeout", success: false },
      ],
      startTime: "2025-06-02T02:00:03Z",
      endTime: "2025-06-02T02:06:45Z",
      durationSeconds: 402,
    },
  },
  // ── New job-003 logs (org-membership-cleanup) ─────────────────────────────
  {
    id: "log-009",
    jobId: "job-003",
    jobType: "org-membership-cleanup",
    executionDate: "2025-06-16",
    executionTime: "01:00",
    status: "success",
    usersDeleted: 0,
    itemsProcessed: 14,
    failedRecords: 0,
    retriesPerformed: 0,
    deletedStatuses: [],
    details: {
      deletedUsers: [],
      failedUsers: [],
      retryLog: [],
      removedFromOrg: [
        { userId: "user-aba@example.com", orgName: "Acme Corp" },
        { userId: "user-abb@example.com", orgName: "Tech Solutions" },
        { userId: "user-abc@example.com", orgName: "Acme Corp" },
      ],
      notificationsSent: 14,
      startTime: "2025-06-16T01:00:02Z",
      endTime: "2025-06-16T01:02:18Z",
      durationSeconds: 136,
    },
  },
  {
    id: "log-010",
    jobId: "job-003",
    jobType: "org-membership-cleanup",
    executionDate: "2025-06-15",
    executionTime: "01:00",
    status: "partial-success",
    usersDeleted: 0,
    itemsProcessed: 9,
    failedRecords: 2,
    retriesPerformed: 1,
    deletedStatuses: [],
    details: {
      deletedUsers: [],
      failedUsers: [
        { id: "user-abd@example.com", reason: "DB timeout" },
        { id: "user-abe@example.com", reason: "Record locked" },
      ],
      retryLog: [
        { attempt: 1, timestamp: "2025-06-15T01:05:00Z", error: "DB timeout", success: false },
      ],
      removedFromOrg: [
        { userId: "user-abf@example.com", orgName: "Global Services" },
        { userId: "user-abg@example.com", orgName: "Acme Corp" },
      ],
      notificationsSent: 9,
      startTime: "2025-06-15T01:00:03Z",
      endTime: "2025-06-15T01:07:44Z",
      durationSeconds: 461,
    },
  },
  // ── New job-004 logs (access-role-cleanup) ────────────────────────────────
  {
    id: "log-011",
    jobId: "job-004",
    jobType: "access-role-cleanup",
    executionDate: "2025-06-11",
    executionTime: "03:00",
    status: "success",
    usersDeleted: 0,
    itemsProcessed: 23,
    failedRecords: 0,
    retriesPerformed: 0,
    deletedStatuses: [],
    details: {
      deletedUsers: [],
      failedUsers: [],
      retryLog: [],
      revokedRoles: [
        { userId: "user-abh@example.com", roleName: "Claim Processor", orgName: "Acme Corp" },
        { userId: "user-abi@example.com", roleName: "Sales General", orgName: "Tech Solutions" },
        { userId: "user-abj@example.com", roleName: "Front Desk Person", orgName: "Global Services" },
      ],
      notificationsSent: 23,
      startTime: "2025-06-11T03:00:01Z",
      endTime: "2025-06-11T03:03:55Z",
      durationSeconds: 234,
    },
  },
  {
    id: "log-012",
    jobId: "job-004",
    jobType: "access-role-cleanup",
    executionDate: "2025-06-04",
    executionTime: "03:00",
    status: "failed",
    usersDeleted: 0,
    itemsProcessed: 0,
    failedRecords: 31,
    retriesPerformed: 2,
    deletedStatuses: [],
    details: {
      deletedUsers: [],
      failedUsers: [
        { id: "user-abk@example.com", reason: "Network unreachable" },
        { id: "user-abl@example.com", reason: "Network unreachable" },
      ],
      retryLog: [
        { attempt: 1, timestamp: "2025-06-04T03:05:00Z", error: "Network unreachable", success: false },
        { attempt: 2, timestamp: "2025-06-04T03:10:00Z", error: "Network unreachable", success: false },
      ],
      revokedRoles: [],
      notificationsSent: 0,
      startTime: "2025-06-04T03:00:02Z",
      endTime: "2025-06-04T03:12:30Z",
      durationSeconds: 748,
    },
  },
];

// ─── Display helpers ──────────────────────────────────────────────────────────

export const CLEANUP_STATUS_LABELS: Record<CleanupStatus, string> = {
  "invitation-expired": "Invitation Expired",
  "invitation-withdrawn": "Invitation Withdrawn",
  "auth-blocked": "Authentication Blocked",
  inactive: "Inactive",
};

export const FREQUENCY_LABELS: Record<Frequency, string> = {
  daily: "Daily",
  weekly: "Weekly",
  "twice-weekly": "Twice Weekly",
  monthly: "Monthly",
};

export const JOB_TYPE_LABELS: Record<JobType, string> = {
  "user-status-cleanup": "User Status Cleanup",
  "org-membership-cleanup": "Org Membership Cleanup",
  "access-role-cleanup": "Access Role Cleanup",
};

export const USER_STATUS_FILTER_LABELS: Record<UserStatusFilter, string> = {
  active: "Active users only",
  all: "All statuses",
  custom: "Custom filter",
};

export const LAST_ORG_BEHAVIOR_LABELS: Record<LastOrgBehavior, string> = {
  keep: "Keep user in system (no organization)",
  "mark-pending": "Mark user as \"Pending Removal\"",
  "delete-user": "Delete user immediately",
};

export const LAST_ROLE_BEHAVIOR_LABELS: Record<LastRoleBehavior, string> = {
  "keep-in-org": "Keep user in organization (no application access)",
  "mark-no-roles": "Mark user as \"No Active Roles\"",
};

export const MOCK_ORGANIZATIONS: MockOrganization[] = [
  { id: "org-1", name: "Acme Corp" },
  { id: "org-2", name: "Tech Solutions" },
  { id: "org-3", name: "Global Services" },
  { id: "org-4", name: "Acme Europe" },
  { id: "org-5", name: "Acme Americas" },
];

export const MOCK_ACCESS_ROLE_OPTIONS: MockAccessRoleOption[] = [
  { id: "ar-1", name: "Claim Processor" },
  { id: "ar-2", name: "Front Desk Person" },
  { id: "ar-3", name: "Sales General" },
  { id: "ar-4", name: "Manager" },
  { id: "ar-5", name: "Viewer" },
];

export const ALLOWED_HOURS = [22, 23, 0, 1, 2, 3, 4, 5];

export const RETRY_DELAY_OPTIONS = [
  { value: 30, label: "30 seconds" },
  { value: 60, label: "1 minute" },
  { value: 300, label: "5 minutes" },
  { value: 900, label: "15 minutes" },
];

export const RETRY_ERROR_OPTIONS = [
  { key: "network", label: "Network / Connection Errors", defaultChecked: true },
  { key: "db-timeout", label: "Database Timeout Errors", defaultChecked: true },
  { key: "transient", label: "Transient Service Failures", defaultChecked: true },
  { key: "auth", label: "Permission / Authorization Errors", defaultChecked: false },
  { key: "validation", label: "Data Validation Errors", defaultChecked: false },
];

export const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export function formatHour(hour: number): string {
  const h = hour.toString().padStart(2, "0");
  return `${h}:00`;
}
