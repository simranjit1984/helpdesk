import React, { useState } from "react";
import { ChevronUp, ChevronDown, ChevronRight, Filter } from "lucide-react";
import {
  Table,
  TableScroll,
  TableContent,
  TableHeader,
  TableHeadRow,
  TableHeadCell,
  TableBody,
  TableRow,
  TableCell,
  TableExpandCell,
  TableNestedRow,
  TableNestedCell,
  TableEmptyState,
} from "./ui/table";

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

interface Event {
  id: string;
  date: string;
  eventType: string;
  application: string;
  userId: string;
  clientIp: string;
  userAgent: string;
  requestId: string;
  agent: string;
  identityApp: string;
  description: string;
  details: Record<string, any>;
}

type SortColumn = "date" | "eventType" | "application";

interface EventTableProps {
  filters: Array<{ id: string; column: string; operator: string; value: string }>;
  searchQuery?: string;
  onFilterAdd?: (filter: { id: string; column: string; operator: string; value: string }) => void;
}

const MOCK_EVENT_TYPES = [
  "User Login",
  "User Logout",
  "Password Changed",
  "User Created",
  "User Updated",
  "User Deleted",
  "Role Assigned",
  "Role Revoked",
  "Permission Granted",
  "Permission Revoked",
  "MFA Enabled",
  "Account Locked",
  "Session Expired",
  "Access Granted",
  "Access Revoked",
];

const MOCK_APPLICATIONS = [
  "Facebook",
  "Instagram",
  "Salesforce",
  "Helpdesk",
  "Internal",
  "Gmail",
  "Slack",
  "Jira",
];

const MOCK_IDENTITY_APPS = [
  "Self-service",
  "Core",
  "Helpdesk",
  "Delegated user management",
];

const MOCK_IPS = [
  "192.168.1.1",
  "10.0.0.1",
  "172.16.0.1",
  "203.0.113.42",
  "198.51.100.5",
  "192.0.2.100",
];

const MOCK_USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 Version/16.0 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 Version/16.0 Mobile/15E148 Safari/604.1",
];

const generateUUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

interface FilterValueProps {
  value: string;
  column: string;
  onFilterAdd?: (filter: { id: string; column: string; operator: string; value: string }) => void;
}

interface FilterValueProps {
  value: string;
  column: string;
  onFilterAdd?: (filter: { id: string; column: string; operator: string; value: string }) => void;
  groupScope?: string;
}

const FilterValue = ({ value, column, onFilterAdd, groupScope = "hover" }: FilterValueProps) => {
  const handleAddFilter = () => {
    if (onFilterAdd) {
      onFilterAdd({
        id: generateUUID(),
        column,
        operator: "equals",
        value,
      });
    }
  };

  return (
    <div className="flex items-center gap-2 w-full">
      <span className="text-sm text-bluegrey-900 flex-1">{value}</span>
      <button
        type="button"
        onClick={handleAddFilter}
        className={`w-6 h-6 flex items-center justify-center rounded transition-opacity opacity-0 group-hover/${groupScope}:opacity-100 focus-visible:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 flex-shrink-0`}
        title={`Filter by ${column}`}
        aria-label={`Filter ${column} by ${value}`}
      >
        <Filter className="w-5 h-5 text-blue-500" />
      </button>
    </div>
  );
};

const EVENT_DESCRIPTIONS: Record<string, string> = {
  "User Login": "User successfully authenticated and logged in",
  "User Logout": "User logged out from the system",
  "Password Changed": "User password was changed",
  "User Created": "New user account was created",
  "User Updated": "User profile information was updated",
  "User Deleted": "User account was deleted",
  "Role Assigned": "Role was assigned to user",
  "Role Revoked": "Role was revoked from user",
  "Permission Granted": "Permission was granted to user",
  "Permission Revoked": "Permission was revoked from user",
  "MFA Enabled": "Multi-factor authentication was enabled",
  "Account Locked": "User account was locked due to security policy",
  "Session Expired": "User session expired",
  "Access Granted": "User was granted access to application",
  "Access Revoked": "User access was revoked from application",
};

const generateMockEvents = (): Event[] => {
  const events: Event[] = [];
  const now = new Date();
  now.setHours(23, 59, 59, 999);

  for (let dayOffset = 0; dayOffset <= 13; dayOffset++) {
    const date = new Date(now);
    date.setDate(date.getDate() - dayOffset);
    date.setHours(0, 0, 0, 0);

    const eventsPerDay = Math.floor(Math.random() * 10) + 6;

    for (let i = 0; i < eventsPerDay; i++) {
      const randomHour = Math.floor(Math.random() * 24);
      const randomMinute = Math.floor(Math.random() * 60);
      const randomSecond = Math.floor(Math.random() * 60);

      const eventDate = new Date(date);
      eventDate.setHours(randomHour, randomMinute, randomSecond);

      const eventType = MOCK_EVENT_TYPES[Math.floor(Math.random() * MOCK_EVENT_TYPES.length)];
      const application = MOCK_APPLICATIONS[Math.floor(Math.random() * MOCK_APPLICATIONS.length)];
      const identityApp = MOCK_IDENTITY_APPS[Math.floor(Math.random() * MOCK_IDENTITY_APPS.length)];
      const ip = MOCK_IPS[Math.floor(Math.random() * MOCK_IPS.length)];
      const userAgent = MOCK_USER_AGENTS[Math.floor(Math.random() * MOCK_USER_AGENTS.length)];
      const userId = generateUUID();
      const requestId = generateUUID();
      const agent = generateUUID();

      const year = eventDate.getFullYear();
      const month = String(eventDate.getMonth() + 1).padStart(2, "0");
      const day = String(eventDate.getDate()).padStart(2, "0");
      const hours = String(eventDate.getHours()).padStart(2, "0");
      const minutes = String(eventDate.getMinutes()).padStart(2, "0");
      const seconds = String(eventDate.getSeconds()).padStart(2, "0");
      const dateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

      const details: Record<string, any> = {
        authMethod: ["OAuth2", "SAML", "Username/Password", "MFA"][Math.floor(Math.random() * 4)],
        sessionDuration: `${Math.floor(Math.random() * 7200) + 1800}s`,
        mfaEnabled: Math.random() > 0.5,
        timestamp: eventDate.toISOString(),
      };

      events.push({
        id: `event-${dayOffset}-${i}`,
        date: dateTime,
        eventType,
        application,
        userId,
        clientIp: ip,
        userAgent,
        requestId,
        agent,
        identityApp,
        description: EVENT_DESCRIPTIONS[eventType] || eventType,
        details,
      });
    }
  }

  return events.sort((a, b) => new Date(b.date.replace(" ", "T")).getTime() - new Date(a.date.replace(" ", "T")).getTime());
};

const baseEvents = generateMockEvents();

export default function EventTable({ filters, searchQuery = "", onFilterAdd }: EventTableProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn>("timestamp");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());

  const toggleEventExpanded = (eventId: string) => {
    const newExpanded = new Set(expandedEvents);
    if (newExpanded.has(eventId)) {
      newExpanded.delete(eventId);
    } else {
      newExpanded.add(eventId);
    }
    setExpandedEvents(newExpanded);
  };

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
  };

  const getFilteredEvents = () => {
    let filtered = [...baseEvents];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.date.toLowerCase().includes(query) ||
          event.eventType.toLowerCase().includes(query) ||
          event.application.toLowerCase().includes(query) ||
          event.userId.toLowerCase().includes(query) ||
          event.clientIp.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query)
      );
    }

    filtered = filters.reduce((acc, filter) => {
      return acc.filter((event) => {
        const fieldValue = String((event as any)[filter.column] || "");

        switch (filter.operator) {
          case "between": {
            const [startStr, endStr] = filter.value.split("|");
            const normalizeDate = (dateStr: string) => {
              const str = dateStr.trim();
              if (str.includes("T")) {
                return new Date(str).getTime();
              }
              return new Date(str.replace(" ", "T")).getTime();
            };
            const startDate = normalizeDate(startStr);
            const endDate = normalizeDate(endStr);
            const fieldDate = normalizeDate(fieldValue);
            return fieldDate >= startDate && fieldDate <= endDate;
          }
          case "contains":
            return fieldValue.toLowerCase().includes(filter.value.toLowerCase());
          case "equals":
            return fieldValue.toLowerCase() === filter.value.toLowerCase();
          case "startsWith":
            return fieldValue.toLowerCase().startsWith(filter.value.toLowerCase());
          case "endsWith":
            return fieldValue.toLowerCase().endsWith(filter.value.toLowerCase());
          default:
            return true;
        }
      });
    }, filtered);

    return filtered;
  };

  const getSortedEvents = () => {
    const filteredEvents = getFilteredEvents();
    const sorted = [...filteredEvents].sort((a, b) => {
      let aVal: any = a[sortColumn];
      let bVal: any = b[sortColumn];

      if (sortColumn === "date") {
        aVal = new Date(aVal.replace(" ", "T")).getTime();
        bVal = new Date(bVal.replace(" ", "T")).getTime();
      } else if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = (bVal as string).toLowerCase();
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  };

  const SortHeader = ({
    column,
    label,
  }: {
    column: SortColumn;
    label: string;
  }) => {
    const isActive = sortColumn === column;
    return (
      <button
        onClick={() => handleSort(column)}
        className="flex items-center gap-2 hover:text-blue-500 transition-colors cursor-pointer"
      >
        <span className="text-sm font-bold text-bluegrey-900">
          {label}
        </span>
        <div className="w-4 h-4">
          {isActive && (
            sortDirection === "asc" ? (
              <ChevronUp className="w-4 h-4 text-blue-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-blue-500" />
            )
          )}
        </div>
      </button>
    );
  };

  return (
    <Table variant="expandable">
      <TableScroll>
        <TableContent>
          <TableHeader>
            <TableHeadRow>
              <TableHeadCell className="w-10"></TableHeadCell>
              <TableHeadCell sticky className="w-48">
                <SortHeader column="date" label="Date" />
              </TableHeadCell>
              <TableHeadCell>
                <SortHeader column="eventType" label="Event type" />
              </TableHeadCell>
              <TableHeadCell>
                <SortHeader column="application" label="Application" />
              </TableHeadCell>
              <TableHeadCell>
                <span className="text-sm font-bold text-bluegrey-900">User ID</span>
              </TableHeadCell>
              <TableHeadCell>
                <span className="text-sm font-bold text-bluegrey-900">Client IP</span>
              </TableHeadCell>
            </TableHeadRow>
          </TableHeader>
          <TableBody>
            {getSortedEvents().length > 0 ? (
              getSortedEvents().map((event) => (
                <React.Fragment key={event.id}>
                  <TableRow expandable isExpanded={expandedEvents.has(event.id)}>
                    <TableExpandCell>
                      <button
                        type="button"
                        onClick={() => toggleEventExpanded(event.id)}
                        className="flex h-10 w-10 items-center justify-center rounded hover:bg-bluegrey-100 transition-colors"
                        aria-label="Toggle event details"
                      >
                        {expandedEvents.has(event.id) ? (
                          <ChevronDown className="h-5 w-5 text-bluegrey-700" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-bluegrey-700" />
                        )}
                      </button>
                    </TableExpandCell>
                    <TableCell sticky className="w-48 group/date">
                      <div className="flex items-center gap-2 w-full">
                        <span className="text-sm text-bluegrey-900 flex-1">{event.date}</span>
                        <button
                          type="button"
                          onClick={() =>
                            onFilterAdd?.({
                              id: generateUUID(),
                              column: "date",
                              operator: "equals",
                              value: event.date,
                            })
                          }
                          className="w-6 h-6 flex items-center justify-center rounded transition-opacity opacity-0 group-hover/date:opacity-100 focus-visible:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 flex-shrink-0"
                          title="Filter by Date"
                          aria-label={`Filter by date ${event.date}`}
                        >
                          <Filter className="w-5 h-5 text-blue-500" />
                        </button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <FilterValue value={event.eventType} column="eventType" onFilterAdd={onFilterAdd} />
                    </TableCell>
                    <TableCell>
                      <FilterValue value={event.application} column="application" onFilterAdd={onFilterAdd} />
                    </TableCell>
                    <TableCell className="group/userId">
                      <div className="flex items-center gap-2 w-full">
                        <span className="text-sm text-bluegrey-900 font-mono flex-1">{event.userId}</span>
                        <button
                          type="button"
                          onClick={() =>
                            onFilterAdd?.({
                              id: generateUUID(),
                              column: "userId",
                              operator: "equals",
                              value: event.userId,
                            })
                          }
                          className="w-6 h-6 flex items-center justify-center rounded transition-opacity opacity-0 group-hover/userId:opacity-100 focus-visible:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 flex-shrink-0"
                          title="Filter by User ID"
                          aria-label={`Filter by User ID ${event.userId}`}
                        >
                          <Filter className="w-5 h-5 text-blue-500" />
                        </button>
                      </div>
                    </TableCell>
                    <TableCell className="group/clientIp">
                      <div className="flex items-center gap-2 w-full">
                        <span className="text-sm text-bluegrey-900 font-mono flex-1">{event.clientIp}</span>
                        <button
                          type="button"
                          onClick={() =>
                            onFilterAdd?.({
                              id: generateUUID(),
                              column: "clientIp",
                              operator: "equals",
                              value: event.clientIp,
                            })
                          }
                          className="w-6 h-6 flex items-center justify-center rounded transition-opacity opacity-0 group-hover/clientIp:opacity-100 focus-visible:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 flex-shrink-0"
                          title="Filter by Client IP"
                          aria-label={`Filter by Client IP ${event.clientIp}`}
                        >
                          <Filter className="w-5 h-5 text-blue-500" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                  {expandedEvents.has(event.id) && (
                    <TableNestedRow colSpan={6}>
                      <TableExpandCell></TableExpandCell>
                      <TableNestedCell colSpan={5}>
                        <div className="py-6 px-4 bg-bluegrey-50/50">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-1.5">
                              <span className="text-xs font-semibold text-bluegrey-700">User Agent</span>
                              <FilterValue value={event.userAgent} column="userAgent" onFilterAdd={onFilterAdd} />
                            </div>
                            <div className="flex flex-col gap-1.5 group/requestId">
                              <span className="text-xs font-semibold text-bluegrey-700">Request ID</span>
                              <div className="flex items-center gap-2 w-full">
                                <span className="text-sm text-bluegrey-900 font-mono break-all flex-1">{event.requestId}</span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    onFilterAdd?.({
                                      id: generateUUID(),
                                      column: "requestId",
                                      operator: "equals",
                                      value: event.requestId,
                                    })
                                  }
                                  className="w-6 h-6 flex items-center justify-center rounded transition-opacity opacity-0 group-hover/requestId:opacity-100 focus-visible:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 flex-shrink-0"
                                  title="Filter by Request ID"
                                  aria-label={`Filter by Request ID ${event.requestId}`}
                                >
                                  <Filter className="w-5 h-5 text-blue-500" />
                                </button>
                              </div>
                            </div>
                            <div className="flex flex-col gap-1.5 group/agent">
                              <span className="text-xs font-semibold text-bluegrey-700">Agent</span>
                              <div className="flex items-center gap-2 w-full">
                                <span className="text-sm text-bluegrey-900 font-mono break-all flex-1">{event.agent}</span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    onFilterAdd?.({
                                      id: generateUUID(),
                                      column: "agent",
                                      operator: "equals",
                                      value: event.agent,
                                    })
                                  }
                                  className="w-6 h-6 flex items-center justify-center rounded transition-opacity opacity-0 group-hover/agent:opacity-100 focus-visible:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 flex-shrink-0"
                                  title="Filter by Agent"
                                  aria-label={`Filter by Agent ${event.agent}`}
                                >
                                  <Filter className="w-5 h-5 text-blue-500" />
                                </button>
                              </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <span className="text-xs font-semibold text-bluegrey-700">Identity App</span>
                              <FilterValue value={event.identityApp} column="identityApp" onFilterAdd={onFilterAdd} />
                            </div>
                            <div className="flex flex-col gap-1.5 lg:col-span-2">
                              <span className="text-xs font-semibold text-bluegrey-700">Description</span>
                              <span className="text-sm text-bluegrey-900 leading-relaxed">{event.description}</span>
                            </div>
                            <div className="flex flex-col gap-1.5 lg:col-span-2">
                              <span className="text-xs font-semibold text-bluegrey-700">Details</span>
                              <pre className="text-xs text-bluegrey-900 bg-white p-3 rounded border border-bluegrey-200 overflow-x-auto font-mono">
{JSON.stringify(event.details, null, 2)}
                              </pre>
                            </div>
                          </div>
                        </div>
                      </TableNestedCell>
                    </TableNestedRow>
                  )}
                </React.Fragment>
              ))
            ) : (
              <TableEmptyState
                colSpan={6}
                message={
                  searchQuery || filters.length > 0
                    ? "No events found matching your search or filters"
                    : "No events available"
                }
              />
            )}
          </TableBody>
        </TableContent>
      </TableScroll>
    </Table>
  );
}
