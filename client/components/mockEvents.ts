export type EventAction =
  | "user_created"
  | "user_deleted"
  | "user_updated"
  | "user_login"
  | "user_logout"
  | "password_changed"
  | "role_assigned"
  | "role_revoked"
  | "permission_granted"
  | "permission_revoked";

export interface Event {
  id: string;
  date: string;
  eventType: string;
  application: string;
  actor: string;
  clientIp: string;
  userAgent?: string;
  requestId?: string;
  identityApp?: string;
  identityAppInstanceId?: string;
  description?: string;
  subject?: string;
  authenticationDetails?: string;
  details?: Record<string, any>;
}

const MOCK_EVENT_TYPES = [
  "TokenRequestAccessTokenCreatedEvent",
  "AdminAuthenticationSuccessEvent",
  "EventExportFailed",
  "ATTRIBUTE_UPDATED",
  "DekRequestedEvent",
  "UserLoginEvent",
  "UserLogoutEvent",
  "UserCreatedEvent",
  "UserUpdatedEvent",
  "PasswordChangedEvent",
  "RoleAssignedEvent",
  "RoleRevokedEvent",
  "PermissionGrantedEvent",
  "PermissionRevokedEvent",
  "AccountLockedEvent",
  "SessionExpiredEvent",
  "AccessGrantedEvent",
  "AccessRevokedEvent",
];

const MOCK_APPLICATIONS = [
  "access",
  "event-exporting-service",
  "identity-store",
  "thales-key-management-service",
  "console-ui (API_CLIENT)",
  "ujo-core-s2s (API_CLIENT)",
  "mapping-management-service",
  "ujo-rule-engine",
  "admin-console",
  "helpdesk-portal",
  "customer-portal",
];

const MOCK_IDENTITY_APPS = [
  "access",
  "access-admin",
  "event-exporting-service",
  "identity-store",
  "thales-key-management-service",
  "ujo-management-service",
  "mapping-management-service",
  "self-service",
];

const MOCK_IPS = [
  "147.161.171.81",
  "174.89.36.229",
  "18.203.21.151",
  "10.86.80.19",
  "192.168.1.1",
  "192.168.1.50",
  "203.0.113.42",
  "198.51.100.5",
  "10.0.0.50",
  "172.16.0.100",
  "8.8.8.8",
];

const MOCK_USER_AGENTS = [
  "insomnia/12.0.0",
  "Java/21.0.2",
  "Java/21.0.7",
  "Java-SDK",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
  "curl/7.68.0",
  "PostmanRuntime/7.32.3",
];

const MOCK_ACTORS = [
  "050c7aba-0729-4b4e-bf3a-18dac9cb19e2",
  "4b8394a8-da48-4324-8d3d-11e0a21af401",
  "admin-user",
  "system",
  "api-client",
  "",
];

const MOCK_DESCRIPTIONS = [
  "User has successfully logged into the admin console.",
  "Access token created via provided authorization code.",
  "Failed to export an event.",
  "Updated identity schema attribute.",
  "DEK requested for workload.",
  "User password was changed.",
  "User account was created.",
  "User access was revoked.",
  "Permission was granted to user.",
  "User role was assigned.",
  "Failed SMS OTP authentication attempt",
  "Failed SMS OTP authentication attempt",
  "Failed SMS OTP authentication attempt",
  "Failed Email OTP authentication attempt",
  "Failed Email OTP authentication attempt",
  "SMS OTP lockout - too many failed attempts",
  "TOTP authentication failed - invalid code",
  "QR code Enrollment failed - invalid QR code",
];

export const generateUUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const generateMockEvents = (): Event[] => {
  const events: Event[] = [];
  const now = new Date();
  now.setHours(23, 59, 59, 999);

  let eventCounter = 0;

  for (let dayOffset = 0; dayOffset <= 13; dayOffset++) {
    const date = new Date(now);
    date.setDate(date.getDate() - dayOffset);
    date.setHours(0, 0, 0, 0);

    const eventsPerDay = Math.floor(Math.random() * 20) + 20;
    let i = 0;

    while (i < eventsPerDay) {
      const randomHour = Math.floor(Math.random() * 24);
      const randomMinute = Math.floor(Math.random() * 60);
      const baseSecond = Math.floor(Math.random() * 60);

      const clusterTraceId = generateUUID();
      const clusterSize = Math.floor(Math.random() * 3) + 6;
      const eventsInCluster = Math.min(clusterSize, eventsPerDay - i);

      for (let clusterIdx = 0; clusterIdx < eventsInCluster; clusterIdx++) {
        const eventDate = new Date(date);
        const secondOffset = Math.floor(Math.random() * 8);
        eventDate.setHours(randomHour, randomMinute, Math.min(baseSecond + secondOffset, 59));

        const eventType =
          MOCK_EVENT_TYPES[Math.floor(Math.random() * MOCK_EVENT_TYPES.length)];
        const shouldHaveApplication = Math.random() > 0.2;
        const application = shouldHaveApplication
          ? MOCK_APPLICATIONS[
              Math.floor(Math.random() * MOCK_APPLICATIONS.length)
            ]
          : "";
        const actor = MOCK_ACTORS[Math.floor(Math.random() * MOCK_ACTORS.length)];
        const clientIp =
          Math.random() > 0.1
            ? MOCK_IPS[Math.floor(Math.random() * MOCK_IPS.length)]
            : "";

        const shouldHaveUserAgent = Math.random() > 0.15;
        const userAgent = shouldHaveUserAgent
          ? MOCK_USER_AGENTS[Math.floor(Math.random() * MOCK_USER_AGENTS.length)]
          : undefined;

        const requestId = clusterTraceId;

        const shouldHaveIdentityApp = Math.random() > 0.2;
        const identityApp = shouldHaveIdentityApp
          ? MOCK_IDENTITY_APPS[
              Math.floor(Math.random() * MOCK_IDENTITY_APPS.length)
            ]
          : undefined;

        const identityAppInstanceId = identityApp ? generateUUID() : undefined;

        const description =
          MOCK_DESCRIPTIONS[Math.floor(Math.random() * MOCK_DESCRIPTIONS.length)];

        const subject = Math.random() > 0.3 ? generateUUID() : undefined;

        const shouldHaveAuthDetails = Math.random() > 0.7;
        const authenticationDetails = shouldHaveAuthDetails
          ? "https://ciam.test.onewelcome.com/oauth"
          : undefined;

        const year = eventDate.getFullYear();
        const month = String(eventDate.getMonth() + 1).padStart(2, "0");
        const day = String(eventDate.getDate()).padStart(2, "0");
        const hours = String(eventDate.getHours()).padStart(2, "0");
        const minutes = String(eventDate.getMinutes()).padStart(2, "0");
        const seconds = String(eventDate.getSeconds()).padStart(2, "0");
        const dateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

        const details: Record<string, any> = {};

        if (clientIp) {
          details.clientIp = clientIp;
        }
        if (requestId) {
          details.requestId = requestId;
        }
        details.eventDate = eventDate.getTime();
        details.eventType = eventType;
        if (actor && !actor.includes("system")) {
          details.userId = actor;
        }
        details.type = Math.random() > 0.5 ? "HTTP" : "DIRECT";

        events.push({
          id: `event-${eventCounter}`,
          date: dateTime,
          eventType,
          application,
          actor,
          clientIp,
          userAgent,
          requestId,
          identityApp,
          identityAppInstanceId,
          description,
          subject,
          authenticationDetails,
          details: Object.keys(details).length > 0 ? details : undefined,
        });

        eventCounter++;
      }

      i += eventsInCluster;
    }
  }

  return events.sort(
    (a, b) =>
      new Date(b.date.replace(" ", "T")).getTime() -
      new Date(a.date.replace(" ", "T")).getTime(),
  );
};
