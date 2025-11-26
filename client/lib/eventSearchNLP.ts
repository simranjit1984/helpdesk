import { Event } from "@/components/mockEvents";

export interface ParsedQuery {
  intent: "search" | "summary" | "explain" | "why";
  entities: {
    userIds?: string[];
    eventTypes?: string[];
    status?: "success" | "failed" | "all";
    timeRange?: {
      start?: Date;
      end?: Date;
      label?: string;
    };
    limit?: number;
    keywords?: string[];
    actions?: string[];
    applications?: string[];
    clientIps?: string[];
  };
  rawQuery: string;
  fallbackToKeyword: boolean;
}

export interface AnalysisResult {
  summary: string;
  patterns: string[];
  rootCause?: string;
  recommendations?: string[];
}

const EVENT_TYPE_PATTERNS = [
  { pattern: /\b(login|logged in|sign in|signin)\b/i, type: "login" },
  { pattern: /\b(logout|logged out|sign out|signout)\b/i, type: "logout" },
  { pattern: /\b(authentication|auth|authenticate)\b/i, type: "authentication" },
  { pattern: /\b(otp|one-time password|one time password)\b/i, type: "otp" },
  { pattern: /\b(sms)\b/i, type: "sms" },
  { pattern: /\b(email)\b/i, type: "email" },
  { pattern: /\b(token|access token)\b/i, type: "token" },
  { pattern: /\b(password|passwd|pwd)\b/i, type: "password" },
  { pattern: /\b(role|permission|access)\b/i, type: "access" },
  { pattern: /\b(session)\b/i, type: "session" },
  { pattern: /\b(mfa|multi-factor|2fa|two-factor)\b/i, type: "mfa" },
  { pattern: /\b(device)\b/i, type: "device" },
  { pattern: /\b(enrollment|enrol|register)\b/i, type: "enrollment" },
];

const STATUS_PATTERNS = [
  { pattern: /\b(failed|failure|error|unsuccessful|denied)\b/i, status: "failed" },
  { pattern: /\b(success|successful|completed|approved|passed)\b/i, status: "success" },
];

const TIME_PATTERNS = [
  { 
    pattern: /\b(last|past|previous)\s+(\d+)\s+(hour|hours|hr|hrs)\b/i, 
    extract: (match: RegExpMatchArray) => {
      const hours = parseInt(match[2]);
      return {
        start: new Date(Date.now() - hours * 60 * 60 * 1000),
        end: new Date(),
        label: `last ${hours} hour${hours > 1 ? 's' : ''}`,
      };
    }
  },
  { 
    pattern: /\b(last|past|previous)\s+(\d+)\s+(day|days)\b/i, 
    extract: (match: RegExpMatchArray) => {
      const days = parseInt(match[2]);
      return {
        start: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
        end: new Date(),
        label: `last ${days} day${days > 1 ? 's' : ''}`,
      };
    }
  },
  { 
    pattern: /\b(last|past|previous)\s+week\b/i, 
    extract: () => ({
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      end: new Date(),
      label: 'last week',
    })
  },
  { 
    pattern: /\b(last|past|previous)\s+month\b/i, 
    extract: () => ({
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date(),
      label: 'last month',
    })
  },
  { 
    pattern: /\b(today)\b/i, 
    extract: () => {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      return {
        start,
        end: new Date(),
        label: 'today',
      };
    }
  },
  { 
    pattern: /\b(yesterday)\b/i, 
    extract: () => {
      const start = new Date();
      start.setDate(start.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setHours(23, 59, 59, 999);
      return {
        start,
        end,
        label: 'yesterday',
      };
    }
  },
  { 
    pattern: /\bin\s+the\s+last\s+hour\b/i, 
    extract: () => ({
      start: new Date(Date.now() - 60 * 60 * 1000),
      end: new Date(),
      label: 'in the last hour',
    })
  },
];

const LIMIT_PATTERNS = [
  { pattern: /\b(last|latest|most recent)\s+(\d+)\b/i, extract: (match: RegExpMatchArray) => parseInt(match[2]) },
  { pattern: /\b(top|first)\s+(\d+)\b/i, extract: (match: RegExpMatchArray) => parseInt(match[2]) },
  { pattern: /\blimit\s+(\d+)\b/i, extract: (match: RegExpMatchArray) => parseInt(match[1]) },
];

const INTENT_PATTERNS = [
  { pattern: /\b(why|explain|reason|cause)\b/i, intent: "why" as const },
  { pattern: /\b(summarize|summary|overview)\b/i, intent: "summary" as const },
  { pattern: /\b(analyze|analysis)\b/i, intent: "explain" as const },
];

const USER_PATTERNS = [
  { pattern: /\buser\s+([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+)\b/i, extract: (match: RegExpMatchArray) => match[1] },
  { pattern: /\bfor\s+([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+)\b/i, extract: (match: RegExpMatchArray) => match[1] },
  { pattern: /\bfor\s+user\s+([a-zA-Z0-9._-]+)\b/i, extract: (match: RegExpMatchArray) => match[1] },
  { pattern: /\buser\s+([a-zA-Z0-9._-]+)\b/i, extract: (match: RegExpMatchArray) => match[1] },
  { pattern: /\bactor\s+([a-zA-Z0-9-]+)\b/i, extract: (match: RegExpMatchArray) => match[1] },
];

const ACTION_PATTERNS = [
  { pattern: /\bdevice\s+changed\b/i, action: "device_changed" },
  { pattern: /\blocation\s+changed\b/i, action: "location_changed" },
  { pattern: /\bdelivery\s+failed\b/i, action: "delivery_failed" },
  { pattern: /\btimeout\b/i, action: "timeout" },
  { pattern: /\blockout|locked\b/i, action: "lockout" },
];

export function parseNaturalLanguageQuery(query: string): ParsedQuery {
  const lowerQuery = query.toLowerCase();
  const result: ParsedQuery = {
    intent: "search",
    entities: {},
    rawQuery: query,
    fallbackToKeyword: false,
  };

  if (!query.trim() || query.length < 3) {
    result.fallbackToKeyword = true;
    return result;
  }

  let hasRecognizedPattern = false;

  for (const { pattern, intent } of INTENT_PATTERNS) {
    if (pattern.test(query)) {
      result.intent = intent;
      hasRecognizedPattern = true;
      break;
    }
  }

  for (const { pattern, type } of EVENT_TYPE_PATTERNS) {
    if (pattern.test(query)) {
      if (!result.entities.eventTypes) {
        result.entities.eventTypes = [];
      }
      if (!result.entities.eventTypes.includes(type)) {
        result.entities.eventTypes.push(type);
      }
      hasRecognizedPattern = true;
    }
  }

  for (const { pattern, status } of STATUS_PATTERNS) {
    if (pattern.test(query)) {
      result.entities.status = status as "success" | "failed";
      hasRecognizedPattern = true;
      break;
    }
  }

  for (const { pattern, extract } of TIME_PATTERNS) {
    const match = query.match(pattern);
    if (match) {
      result.entities.timeRange = extract(match);
      hasRecognizedPattern = true;
      break;
    }
  }

  for (const { pattern, extract } of LIMIT_PATTERNS) {
    const match = query.match(pattern);
    if (match) {
      result.entities.limit = extract(match);
      hasRecognizedPattern = true;
      break;
    }
  }

  for (const { pattern, extract } of USER_PATTERNS) {
    const match = query.match(pattern);
    if (match) {
      const userId = extract(match);
      if (!result.entities.userIds) {
        result.entities.userIds = [];
      }
      result.entities.userIds.push(userId);
      hasRecognizedPattern = true;
    }
  }

  for (const { pattern, action } of ACTION_PATTERNS) {
    if (pattern.test(query)) {
      if (!result.entities.actions) {
        result.entities.actions = [];
      }
      result.entities.actions.push(action);
      hasRecognizedPattern = true;
    }
  }

  const ipMatch = query.match(/\b(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\b/);
  if (ipMatch) {
    result.entities.clientIps = [ipMatch[1]];
    hasRecognizedPattern = true;
  }

  const words = query.split(/\s+/).filter(word => 
    word.length > 2 && 
    !['the', 'and', 'for', 'with', 'from', 'show', 'list', 'get', 'find'].includes(word.toLowerCase())
  );
  if (words.length > 0) {
    result.entities.keywords = words;
  }

  if (!hasRecognizedPattern && words.length > 0) {
    result.fallbackToKeyword = true;
  }

  return result;
}

export function applyParsedQueryToEvents(events: Event[], parsedQuery: ParsedQuery): Event[] {
  let filtered = [...events];

  if (parsedQuery.fallbackToKeyword && parsedQuery.entities.keywords) {
    const keywords = parsedQuery.entities.keywords.map(k => k.toLowerCase());
    filtered = filtered.filter(event => 
      keywords.some(keyword =>
        event.date.toLowerCase().includes(keyword) ||
        event.eventType.toLowerCase().includes(keyword) ||
        event.application.toLowerCase().includes(keyword) ||
        event.actor.toLowerCase().includes(keyword) ||
        event.clientIp.toLowerCase().includes(keyword) ||
        (event.requestId?.toLowerCase().includes(keyword) ?? false) ||
        (event.description?.toLowerCase().includes(keyword) ?? false)
      )
    );
    return filtered;
  }

  if (parsedQuery.entities.userIds && parsedQuery.entities.userIds.length > 0) {
    filtered = filtered.filter(event =>
      parsedQuery.entities.userIds!.some(userId =>
        event.actor.toLowerCase().includes(userId.toLowerCase()) ||
        event.subject?.toLowerCase().includes(userId.toLowerCase())
      )
    );
  }

  if (parsedQuery.entities.eventTypes && parsedQuery.entities.eventTypes.length > 0) {
    filtered = filtered.filter(event => {
      const eventTypeLower = event.eventType.toLowerCase();
      const descriptionLower = (event.description || "").toLowerCase();
      
      return parsedQuery.entities.eventTypes!.some(type =>
        eventTypeLower.includes(type) ||
        descriptionLower.includes(type)
      );
    });
  }

  if (parsedQuery.entities.status) {
    const status = parsedQuery.entities.status;
    filtered = filtered.filter(event => {
      const description = (event.description || "").toLowerCase();
      const eventType = event.eventType.toLowerCase();
      
      if (status === "failed") {
        return description.includes("failed") ||
               description.includes("failure") ||
               description.includes("error") ||
               description.includes("denied") ||
               eventType.includes("failed") ||
               eventType.includes("error");
      } else if (status === "success") {
        return description.includes("success") ||
               description.includes("completed") ||
               description.includes("approved") ||
               eventType.includes("success");
      }
      return true;
    });
  }

  if (parsedQuery.entities.timeRange) {
    const { start, end } = parsedQuery.entities.timeRange;
    filtered = filtered.filter(event => {
      const eventDate = new Date(event.date.replace(" ", "T"));
      if (start && eventDate < start) return false;
      if (end && eventDate > end) return false;
      return true;
    });
  }

  if (parsedQuery.entities.clientIps && parsedQuery.entities.clientIps.length > 0) {
    filtered = filtered.filter(event =>
      parsedQuery.entities.clientIps!.some(ip => event.clientIp.includes(ip))
    );
  }

  if (parsedQuery.entities.actions && parsedQuery.entities.actions.length > 0) {
    filtered = filtered.filter(event => {
      const description = (event.description || "").toLowerCase();
      return parsedQuery.entities.actions!.some(action => {
        if (action === "device_changed") {
          return description.includes("device") && 
                 (description.includes("changed") || description.includes("new") || description.includes("different"));
        }
        if (action === "location_changed") {
          return description.includes("location") && description.includes("changed");
        }
        if (action === "delivery_failed") {
          return description.includes("delivery") && description.includes("failed");
        }
        if (action === "timeout") {
          return description.includes("timeout") || description.includes("timed out");
        }
        if (action === "lockout") {
          return description.includes("lockout") || description.includes("locked");
        }
        return false;
      });
    });
  }

  if (parsedQuery.entities.keywords && parsedQuery.entities.keywords.length > 0 && !parsedQuery.fallbackToKeyword) {
    const keywords = parsedQuery.entities.keywords.map(k => k.toLowerCase());
    filtered = filtered.filter(event =>
      keywords.some(keyword =>
        event.eventType.toLowerCase().includes(keyword) ||
        event.application.toLowerCase().includes(keyword) ||
        (event.description?.toLowerCase().includes(keyword) ?? false)
      )
    );
  }

  filtered.sort((a, b) => 
    new Date(b.date.replace(" ", "T")).getTime() - 
    new Date(a.date.replace(" ", "T")).getTime()
  );

  if (parsedQuery.entities.limit && parsedQuery.entities.limit > 0) {
    filtered = filtered.slice(0, parsedQuery.entities.limit);
  }

  return filtered;
}

export function analyzeEventsForSummary(events: Event[], parsedQuery: ParsedQuery): AnalysisResult {
  if (events.length === 0) {
    return {
      summary: "No events found matching the query.",
      patterns: [],
    };
  }

  const failedEvents = events.filter(e => {
    const desc = (e.description || "").toLowerCase();
    return desc.includes("failed") || desc.includes("error") || desc.includes("denied");
  });

  const patterns: string[] = [];
  let rootCause: string | undefined;
  const recommendations: string[] = [];

  const errorTypes = new Map<string, number>();
  failedEvents.forEach(event => {
    const desc = event.description || "";
    
    if (desc.toLowerCase().includes("timeout")) {
      errorTypes.set("timeout", (errorTypes.get("timeout") || 0) + 1);
    }
    if (desc.toLowerCase().includes("invalid") || desc.toLowerCase().includes("unauthorized")) {
      errorTypes.set("authentication", (errorTypes.get("authentication") || 0) + 1);
    }
    if (desc.toLowerCase().includes("connection") || desc.toLowerCase().includes("network")) {
      errorTypes.set("network", (errorTypes.get("network") || 0) + 1);
    }
    if (desc.toLowerCase().includes("sms") || desc.toLowerCase().includes("otp") || desc.toLowerCase().includes("delivery")) {
      errorTypes.set("delivery", (errorTypes.get("delivery") || 0) + 1);
    }
    if (desc.toLowerCase().includes("lockout") || desc.toLowerCase().includes("locked")) {
      errorTypes.set("lockout", (errorTypes.get("lockout") || 0) + 1);
    }
  });

  if (failedEvents.length > 0) {
    patterns.push(`${failedEvents.length} failed event${failedEvents.length > 1 ? 's' : ''} detected (${((failedEvents.length / events.length) * 100).toFixed(1)}% failure rate)`);
  }

  const ipCounts = new Map<string, number>();
  events.forEach(event => {
    if (event.clientIp) {
      ipCounts.set(event.clientIp, (ipCounts.get(event.clientIp) || 0) + 1);
    }
  });
  const multipleIps = ipCounts.size > 1;
  if (multipleIps) {
    patterns.push(`Activity from ${ipCounts.size} different IP addresses`);
  }

  const userAgents = new Set(events.map(e => e.userAgent).filter(Boolean));
  if (userAgents.size > 1) {
    patterns.push(`Multiple user agents detected (${userAgents.size} different clients)`);
  }

  const mostCommonError = Array.from(errorTypes.entries())
    .sort((a, b) => b[1] - a[1])[0];

  if (mostCommonError) {
    const [errorType, count] = mostCommonError;
    
    switch (errorType) {
      case "timeout":
        rootCause = `Network timeouts (${count} occurrence${count > 1 ? 's' : ''}) - likely network latency or service unavailability`;
        recommendations.push("Check network connectivity and service health");
        recommendations.push("Review API response times and timeout configurations");
        break;
      case "authentication":
        rootCause = `Authentication failures (${count} occurrence${count > 1 ? 's' : ''}) - invalid credentials or expired tokens`;
        recommendations.push("Verify user credentials are correct and up-to-date");
        recommendations.push("Check if authentication tokens have expired");
        break;
      case "network":
        rootCause = `Network connectivity issues (${count} occurrence${count > 1 ? 's' : ''})`;
        recommendations.push("Verify network connectivity between services");
        recommendations.push("Check firewall and security group configurations");
        break;
      case "delivery":
        rootCause = `Message delivery failures (${count} occurrence${count > 1 ? 's' : ''}) - SMS/OTP delivery problems`;
        recommendations.push("Verify phone number format and validity");
        recommendations.push("Check SMS gateway service status");
        recommendations.push("Review message delivery logs for provider errors");
        break;
      case "lockout":
        rootCause = `Account lockout (${count} occurrence${count > 1 ? 's' : ''}) - too many failed authentication attempts`;
        recommendations.push("User account may be locked due to repeated failed login attempts");
        recommendations.push("Consider resetting user password or unlocking account");
        break;
    }
  }

  const timeSpan = events.length > 1 
    ? new Date(events[0].date.replace(" ", "T")).getTime() - 
      new Date(events[events.length - 1].date.replace(" ", "T")).getTime()
    : 0;
  const timeSpanMinutes = Math.floor(timeSpan / (1000 * 60));
  
  if (timeSpanMinutes > 0) {
    patterns.push(`Events occurred over ${timeSpanMinutes} minute${timeSpanMinutes > 1 ? 's' : ''}`);
  }

  const eventTypes = new Set(events.map(e => e.eventType));
  if (eventTypes.size > 1) {
    patterns.push(`${eventTypes.size} different event types involved`);
  }

  let summary = `Analyzed ${events.length} event${events.length > 1 ? 's' : ''}`;
  if (parsedQuery.entities.timeRange?.label) {
    summary += ` from ${parsedQuery.entities.timeRange.label}`;
  }
  if (parsedQuery.entities.userIds && parsedQuery.entities.userIds.length > 0) {
    summary += ` for user ${parsedQuery.entities.userIds[0]}`;
  }
  summary += ".";

  return {
    summary,
    patterns,
    rootCause,
    recommendations: recommendations.length > 0 ? recommendations : undefined,
  };
}
