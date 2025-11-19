import React, { useState } from "react";
import { ChevronUp, ChevronDown, ChevronRight, Filter, Link as LinkIcon } from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./ui/tooltip";

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

type SortColumn = "date" | "eventType" | "application";

interface EventTableProps {
  filters: Array<{
    id: string;
    column: string;
    operator: string;
    value: string;
  }>;
  searchQuery?: string;
  onFilterAdd?: (filter: {
    id: string;
    column: string;
    operator: string;
    value: string;
  }) => void;
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
  onFilterAdd?: (filter: {
    id: string;
    column: string;
    operator: string;
    value: string;
  }) => void;
}

const FilterValue = ({ value, column, onFilterAdd }: FilterValueProps) => {
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
        className="w-6 h-6 flex items-center justify-center rounded transition-opacity opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 flex-shrink-0"
        title={`Filter by ${column}`}
        aria-label={`Filter ${column} by ${value}`}
      >
        <Filter className="w-5 h-5 text-blue-500" />
      </button>
    </div>
  );
};

const generateMockEvents = (): Event[] => {
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

const baseEvents = generateMockEvents();

export default function EventTable({
  filters,
  searchQuery = "",
  onFilterAdd,
}: EventTableProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn>("timestamp");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  const [selectedTraceId, setSelectedTraceId] = useState<string | null>(null);
  const [openTooltipEventId, setOpenTooltipEventId] = useState<string | null>(null);


  const getFilteredEvents = () => {
    let filtered = [...baseEvents];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.date.toLowerCase().includes(query) ||
          event.eventType.toLowerCase().includes(query) ||
          event.application.toLowerCase().includes(query) ||
          event.actor.toLowerCase().includes(query) ||
          event.clientIp.toLowerCase().includes(query) ||
          (event.description?.toLowerCase().includes(query) ?? false),
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
            return fieldValue
              .toLowerCase()
              .includes(filter.value.toLowerCase());
          case "equals":
            return fieldValue.toLowerCase() === filter.value.toLowerCase();
          case "startsWith":
            return fieldValue
              .toLowerCase()
              .startsWith(filter.value.toLowerCase());
          case "endsWith":
            return fieldValue
              .toLowerCase()
              .endsWith(filter.value.toLowerCase());
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

  const getTraceIdEventCount = (traceId: string | undefined): number => {
    if (!traceId) return 0;
    return baseEvents.filter(e => e.requestId === traceId).length;
  };

  const hasLinkedEvents = (traceId: string | undefined): boolean => {
    return traceId ? getTraceIdEventCount(traceId) > 1 : false;
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
        <span className="text-sm font-bold text-bluegrey-900">{label}</span>
        <div className="w-4 h-4">
          {isActive &&
            (sortDirection === "asc" ? (
              <ChevronUp className="w-4 h-4 text-blue-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-blue-500" />
            ))}
        </div>
      </button>
    );
  };

  interface DetailFieldProps {
    label: string;
    value?: string;
    column?: string;
    groupClass?: string;
  }

  const renderDetailField = ({
    label,
    value,
    column,
    groupClass,
  }: DetailFieldProps) => {
    if (!value) return null;
    const isFilterable =
      column &&
      onFilterAdd &&
      [
        "requestId",
        "userAgent",
        "identityApp",
        "identityAppInstanceId",
        "subject",
      ].includes(column);
    const isTraceIdField = column === "requestId";
    const linkedCount = isTraceIdField ? getTraceIdEventCount(value) : 0;
    const hasMultipleEvents = linkedCount > 1;
    const displayLabel = isTraceIdField ? "Trace ID" : label;

    return (
      <div className="flex flex-col gap-1.5" key={label}>
        <span className="text-xs font-semibold text-bluegrey-700">
          {displayLabel}
        </span>
        <div className="flex items-center gap-1 group">
          <span className="text-sm text-bluegrey-900 break-words">{value}</span>
          {hasMultipleEvents && (
            <button
              type="button"
              onClick={() => setSelectedTraceId(selectedTraceId === value ? null : value)}
              className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full transition-all ${
                selectedTraceId === value
                  ? "bg-blue-500 text-white"
                  : "bg-blue-100 text-blue-700 hover:bg-blue-200"
              } cursor-pointer flex-shrink-0`}
              title={`Click to highlight ${linkedCount} linked event(s)`}
              aria-label={`${linkedCount} linked event(s) - click to highlight`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>{linkedCount}</span>
            </button>
          )}
          {isFilterable && (
            <button
              type="button"
              onClick={() =>
                onFilterAdd({
                  id: generateUUID(),
                  column: column!,
                  operator: "equals",
                  value,
                })
              }
              className="w-5 h-5 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 flex-shrink-0"
              title={`Filter by ${label}`}
              aria-label={`Filter by ${label} ${value}`}
            >
              <Filter className="w-4 h-4 text-blue-500" />
            </button>
          )}
        </div>
      </div>
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
                <span className="text-sm font-bold text-bluegrey-900">
                  Actor
                </span>
              </TableHeadCell>
              <TableHeadCell>
                <span className="text-sm font-bold text-bluegrey-900">
                  Client IP
                </span>
              </TableHeadCell>
            </TableHeadRow>
          </TableHeader>
          <TableBody>
            {getSortedEvents().length > 0 ? (
              getSortedEvents().map((event) => (
                <React.Fragment key={event.id}>
                  <TableRow
                    expandable
                    isExpanded={expandedEvents.has(event.id)}
                    className={selectedTraceId && event.requestId === selectedTraceId ? "bg-blue-50 hover:bg-blue-50" : ""}
                    data-event-row={event.id}
                  >
                    <TableExpandCell className={`sticky left-0 z-10 shadow-[1px_0_3px_rgba(0,0,0,0.05)] px-0 ${selectedTraceId && event.requestId === selectedTraceId ? "bg-blue-50" : "bg-white"}`}>
                      <div className="flex items-center gap-2 h-10 w-full px-3">
                        <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                          {selectedTraceId && event.requestId === selectedTraceId ? (
                            <Tooltip
                              open={openTooltipEventId === event.id}
                              onOpenChange={(open) =>
                                setOpenTooltipEventId(open ? event.id : null)
                              }
                            >
                              <TooltipTrigger asChild>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setOpenTooltipEventId(
                                      openTooltipEventId === event.id ? null : event.id,
                                    )
                                  }
                                  className="p-0 h-4 w-4 flex items-center justify-center cursor-pointer hover:text-blue-700 transition-colors"
                                  aria-label="Linked events - click to show details"
                                  aria-expanded={openTooltipEventId === event.id}
                                >
                                  <LinkIcon className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent
                                variant="dark"
                                size="md"
                                side="right"
                                className="whitespace-nowrap"
                              >
                                <div className="flex flex-col gap-2">
                                  <span>
                                    This event is linked to {getTraceIdEventCount(event.requestId) - 1} other event{getTraceIdEventCount(event.requestId) - 1 !== 1 ? 's' : ''}.
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedTraceId(null);
                                      setOpenTooltipEventId(null);
                                    }}
                                    className="text-left text-bluegrey-25 underline hover:opacity-80 transition-opacity text-xs"
                                  >
                                    Clear selection
                                  </button>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleEventExpanded(event.id)}
                          className="flex h-10 w-10 items-center justify-center rounded transition-colors"
                          style={{
                            backgroundColor: selectedTraceId && event.requestId === selectedTraceId ? 'transparent' : undefined,
                          }}
                          onMouseEnter={(e) => {
                            if (!(selectedTraceId && event.requestId === selectedTraceId)) {
                              e.currentTarget.style.backgroundColor = '#e8ebed';
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '';
                          }}
                          aria-label="Toggle event details"
                        >
                          {expandedEvents.has(event.id) ? (
                            <ChevronDown className="h-5 w-5 text-bluegrey-700" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-bluegrey-700" />
                          )}
                        </button>
                      </div>
                    </TableExpandCell>
                    <TableCell sticky className={`w-48 group/date ${selectedTraceId && event.requestId === selectedTraceId ? "bg-blue-50" : "bg-white"}`}>
                      <div className="flex items-center gap-1 w-full">
                        <span className="text-sm text-bluegrey-900 truncate">
                          {event.date}
                        </span>
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
                          className="w-6 h-6 flex items-center justify-center rounded transition-opacity opacity-0 group-hover/date:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 flex-shrink-0"
                          title="Filter by Date"
                          aria-label={`Filter by date ${event.date}`}
                        >
                          <Filter className="w-5 h-5 text-blue-500" />
                        </button>
                      </div>
                    </TableCell>
                    <TableCell className="group/eventType">
                      <div className="flex items-center gap-1 w-full">
                        <span className="text-sm text-bluegrey-900 truncate">
                          {event.eventType}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            onFilterAdd?.({
                              id: generateUUID(),
                              column: "eventType",
                              operator: "equals",
                              value: event.eventType,
                            })
                          }
                          className="w-6 h-6 flex items-center justify-center rounded transition-opacity opacity-0 group-hover/eventType:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 flex-shrink-0"
                          title="Filter by Event type"
                          aria-label={`Filter by Event type ${event.eventType}`}
                        >
                          <Filter className="w-5 h-5 text-blue-500" />
                        </button>
                      </div>
                    </TableCell>
                    <TableCell className="group/application">
                      <div className="flex items-center gap-1 w-full">
                        <span className="text-sm text-bluegrey-900 truncate">
                          {event.application || "-"}
                        </span>
                        {event.application && (
                          <button
                            type="button"
                            onClick={() =>
                              onFilterAdd?.({
                                id: generateUUID(),
                                column: "application",
                                operator: "equals",
                                value: event.application,
                              })
                            }
                            className="w-6 h-6 flex items-center justify-center rounded transition-opacity opacity-0 group-hover/application:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 flex-shrink-0"
                            title="Filter by Application"
                            aria-label={`Filter by Application ${event.application}`}
                          >
                            <Filter className="w-5 h-5 text-blue-500" />
                          </button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="group/actor">
                      <div className="flex items-center gap-1 w-full">
                        <span className="text-sm text-bluegrey-900 font-mono truncate">
                          {event.actor || "-"}
                        </span>
                        {event.actor && (
                          <button
                            type="button"
                            onClick={() =>
                              onFilterAdd?.({
                                id: generateUUID(),
                                column: "actor",
                                operator: "equals",
                                value: event.actor,
                              })
                            }
                            className="w-6 h-6 flex items-center justify-center rounded transition-opacity opacity-0 group-hover/actor:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 flex-shrink-0"
                            title="Filter by Actor"
                            aria-label={`Filter by Actor ${event.actor}`}
                          >
                            <Filter className="w-5 h-5 text-blue-500" />
                          </button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="group/clientIp">
                      <div className="flex items-center gap-1 w-full">
                        <span className="text-sm text-bluegrey-900 font-mono truncate">
                          {event.clientIp || "-"}
                        </span>
                        {event.clientIp && (
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
                            className="w-6 h-6 flex items-center justify-center rounded transition-opacity opacity-0 group-hover/clientIp:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 flex-shrink-0"
                            title="Filter by Client IP"
                            aria-label={`Filter by Client IP ${event.clientIp}`}
                          >
                            <Filter className="w-5 h-5 text-blue-500" />
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                  {expandedEvents.has(event.id) && (
                    <TableNestedRow
                      colSpan={6}
                      className={selectedTraceId && event.requestId === selectedTraceId ? "bg-blue-100/50" : ""}
                    >
                      <TableExpandCell></TableExpandCell>
                      <TableNestedCell colSpan={5}>
                        <div className="py-6 px-4 bg-bluegrey-50/50">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {renderDetailField({
                              label: "Trace ID",
                              value: event.requestId,
                              column: "requestId",
                            })}
                            {renderDetailField({
                              label: "User Agent",
                              value: event.userAgent,
                              column: "userAgent",
                            })}
                            {renderDetailField({
                              label: "Identity App",
                              value: event.identityApp,
                              column: "identityApp",
                            })}
                            {renderDetailField({
                              label: "Identity App Instance ID",
                              value: event.identityAppInstanceId,
                              column: "identityAppInstanceId",
                            })}
                            {renderDetailField({
                              label: "Authentication Details",
                              value: event.authenticationDetails,
                              column: "authenticationDetails",
                            })}
                            {renderDetailField({
                              label: "Subject",
                              value: event.subject,
                              column: "subject",
                            })}
                            {event.description && (
                              <div className="flex flex-col gap-1.5 lg:col-span-2">
                                <span className="text-xs font-semibold text-bluegrey-700">
                                  Description
                                </span>
                                <span className="text-sm text-bluegrey-900 leading-relaxed">
                                  {event.description}
                                </span>
                              </div>
                            )}
                            {event.details &&
                              Object.keys(event.details).length > 0 && (
                                <div className="flex flex-col gap-1.5 lg:col-span-2">
                                  <span className="text-xs font-semibold text-bluegrey-700">
                                    Details
                                  </span>
                                  <pre className="text-xs text-bluegrey-900 bg-white p-3 rounded border border-bluegrey-200 overflow-x-auto font-mono">
                                    {JSON.stringify(event.details, null, 2)}
                                  </pre>
                                </div>
                              )}
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
