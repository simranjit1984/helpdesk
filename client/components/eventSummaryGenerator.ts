import { Event } from "./mockEvents";

interface EventSummaryData {
  summary: string;
  status: "success" | "failure" | "mixed" | "neutral";
  keyActions: string[];
}

export const generateTraceSummary = (events: Event[]): EventSummaryData => {
  if (events.length === 0) {
    return {
      summary: "No events found",
      status: "neutral",
      keyActions: [],
    };
  }

  // Sort events by date (oldest first)
  const sortedEvents = [...events].sort(
    (a, b) =>
      new Date(a.date.replace(" ", "T")).getTime() -
      new Date(b.date.replace(" ", "T")).getTime()
  );

  // Extract key information from events
  const eventTypes = extractEventTypes(sortedEvents);
  const actors = Array.from(new Set(sortedEvents.map((e) => e.actor).filter(Boolean)));
  const applications = Array.from(
    new Set(sortedEvents.map((e) => e.application).filter(Boolean))
  );
  const hasErrors = sortedEvents.some(
    (e) =>
      e.eventType.toLowerCase().includes("failed") ||
      e.eventType.toLowerCase().includes("error") ||
      e.eventType.toLowerCase().includes("denied") ||
      e.eventType.toLowerCase().includes("rejected") ||
      e.description?.toLowerCase().includes("failed") ||
      e.description?.toLowerCase().includes("error")
  );

  const hasSuccess = sortedEvents.some(
    (e) =>
      e.eventType.toLowerCase().includes("success") ||
      e.eventType.toLowerCase().includes("created") ||
      e.eventType.toLowerCase().includes("granted") ||
      e.eventType.toLowerCase().includes("assigned") ||
      e.description?.toLowerCase().includes("successfully")
  );

  // Build the summary text
  let summaryText = buildSummaryText(
    sortedEvents,
    eventTypes,
    actors,
    applications
  );

  // Add error/success information
  if (hasErrors && hasSuccess) {
    summaryText += " Some operations succeeded while others encountered issues.";
  } else if (hasErrors) {
    summaryText += " One or more operations encountered errors.";
  } else if (hasSuccess) {
    summaryText += " All operations completed successfully.";
  }

  // Determine status
  let status: "success" | "failure" | "mixed" | "neutral" = "neutral";
  if (hasErrors && hasSuccess) {
    status = "mixed";
  } else if (hasErrors) {
    status = "failure";
  } else if (hasSuccess) {
    status = "success";
  }

  // Extract key actions
  const keyActions = extractKeyActions(eventTypes, actors);

  return {
    summary: summaryText,
    status,
    keyActions,
  };
};

const extractEventTypes = (events: Event[]): Map<string, number> => {
  const typeMap = new Map<string, number>();

  events.forEach((event) => {
    const type = simplifyEventType(event.eventType);
    typeMap.set(type, (typeMap.get(type) || 0) + 1);
  });

  return typeMap;
};

const simplifyEventType = (eventType: string): string => {
  const lower = eventType.toLowerCase();

  if (lower.includes("login") || lower.includes("authentication")) return "Login";
  if (lower.includes("logout")) return "Logout";
  if (lower.includes("password")) return "Password Change";
  if (lower.includes("token")) return "Token Operation";
  if (lower.includes("created") || lower.includes("create")) return "Create";
  if (lower.includes("updated") || lower.includes("update")) return "Update";
  if (lower.includes("deleted") || lower.includes("delete")) return "Delete";
  if (lower.includes("assigned") || lower.includes("assign")) return "Assignment";
  if (lower.includes("revoked") || lower.includes("revoke")) return "Revocation";
  if (lower.includes("granted") || lower.includes("grant")) return "Grant";
  if (lower.includes("access")) return "Access";
  if (lower.includes("permission")) return "Permission";
  if (lower.includes("role")) return "Role Management";
  if (lower.includes("failed") || lower.includes("failure")) return "Failure";
  if (lower.includes("error")) return "Error";
  if (lower.includes("success")) return "Success";
  if (lower.includes("export")) return "Export";
  if (lower.includes("import")) return "Import";
  if (lower.includes("locked") || lower.includes("lock")) return "Account Lock";
  if (lower.includes("session") || lower.includes("expired")) return "Session";

  return eventType;
};

const buildSummaryText = (
  events: Event[],
  eventTypes: Map<string, number>,
  actors: string[],
  applications: string[]
): string => {
  const firstEvent = events[0];
  const lastEvent = events[events.length - 1];
  const firstTime = firstEvent.date.split(" ")[1]; // Extract time from "YYYY-MM-DD HH:MM:SS"
  const lastTime = lastEvent.date.split(" ")[1];

  // Get main action from most common event type
  const mainAction = Array.from(eventTypes.entries()).sort(
    (a, b) => b[1] - a[1]
  )[0][0];

  // Build actor description
  let actorDesc = "";
  if (actors.length === 1 && actors[0]) {
    const actor = actors[0];
    if (actor === "system") {
      actorDesc = "System";
    } else if (actor === "api-client") {
      actorDesc = "API client";
    } else if (actor === "admin-user") {
      actorDesc = "Admin user";
    } else {
      // Truncate UUID for readability
      actorDesc = `User (${actor.substring(0, 8)}...)`;
    }
  } else if (actors.length > 1) {
    actorDesc = "Multiple users";
  } else {
    actorDesc = "Unknown actor";
  }

  // Build application description
  let appDesc = "";
  if (applications.length === 1 && applications[0]) {
    appDesc = ` in ${applications[0]}`;
  } else if (applications.length > 1) {
    appDesc = ` across ${applications.length} applications`;
  }

  // Calculate duration
  const duration = calculateDuration(firstEvent.date, lastEvent.date);

  // Build the base summary
  let summary = `${actorDesc} performed ${mainAction.toLowerCase()} operations${appDesc}`;

  // Add event count context
  if (events.length > 1) {
    summary += ` (${events.length} total events)`;
  }

  // Add timing info if spread over time
  if (duration.minutes > 0 && events.length > 1) {
    summary += ` over ${duration.minutes} minute${duration.minutes > 1 ? "s" : ""}`;
  }

  // Add additional context from event descriptions
  const descriptions = events
    .filter((e) => e.description)
    .map((e) => e.description!.toLowerCase());

  if (descriptions.some((d) => d.includes("login"))) {
    summary = `${actorDesc} logged in and performed authentication operations`;
  }

  if (descriptions.some((d) => d.includes("permission"))) {
    summary += " with permission changes";
  }

  if (descriptions.some((d) => d.includes("access"))) {
    summary += " affecting access control";
  }

  return summary.trim();
};

const calculateDuration = (
  startDate: string,
  endDate: string
): { minutes: number; seconds: number } => {
  const start = new Date(startDate.replace(" ", "T"));
  const end = new Date(endDate.replace(" ", "T"));
  const diffMs = end.getTime() - start.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(diffSeconds / 60);
  const seconds = diffSeconds % 60;

  return { minutes, seconds };
};

const extractKeyActions = (
  eventTypes: Map<string, number>,
  actors: string[]
): string[] => {
  const actions: string[] = [];

  // Get top 2 most common event types
  const sortedTypes = Array.from(eventTypes.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([type]) => type);

  actions.push(...sortedTypes);

  // Add actor info if it's a specific user
  if (actors.length === 1 && actors[0] && !["system", "api-client"].includes(actors[0])) {
    actions.push(actors[0].substring(0, 8));
  }

  return actions.slice(0, 3); // Return max 3 key actions
};
