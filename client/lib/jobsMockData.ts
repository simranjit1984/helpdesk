// ─── Types ────────────────────────────────────────────────────────────────────

export type CleanupStatus =
  | "invitation-expired"
  | "invitation-withdrawn"
  | "auth-blocked"
  | "inactive";

export type Frequency = "daily" | "weekly" | "twice-weekly" | "monthly";
export type JobStatus = "active" | "disabled";
export type LogStatus = "success" | "partial-success" | "failed";

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
