import React, { useState, useMemo } from "react";
import { ChevronDown, ChevronRight, Filter, AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";
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
import { generateMockEvents, generateUUID, Event, EventAction } from "./mockEvents";
import { generateTraceSummary } from "./eventSummaryGenerator";

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
  events: Event[];
}

interface TraceGroup {
  traceId: string;
  events: Event[];
  firstEvent: Event;
  lastEvent: Event;
  eventCount: number;
  eventTypes: Set<string>;
  applications: Set<string>;
  actors: Set<string>;
}

interface DetailFieldProps {
  label: string;
  value?: string;
  column?: string;
  onFilterAdd?: (filter: {
    id: string;
    column: string;
    operator: string;
    value: string;
  }) => void;
}

const renderDetailField = ({
  label,
  value,
  column,
  onFilterAdd,
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
  const displayLabel = isTraceIdField ? "Trace ID" : label;

  return (
    <div className="flex flex-col gap-1.5" key={label}>
      <span className="text-xs font-semibold text-bluegrey-700">
        {displayLabel}
      </span>
      <div className="flex items-center gap-2 group">
        <span className="text-sm text-bluegrey-900 break-words">{value}</span>
        {isFilterable && (
          <button
            type="button"
            onClick={() =>
              onFilterAdd?.({
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

export default function EventLogSummary({
  filters,
  searchQuery = "",
  onFilterAdd,
  events: providedEvents,
}: EventTableProps) {
  const [expandedTraces, setExpandedTraces] = useState<Set<string>>(
    new Set()
  );

  const baseEvents = providedEvents || generateMockEvents();

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
          (event.requestId?.toLowerCase().includes(query) ?? false) ||
          (event.description?.toLowerCase().includes(query) ?? false)
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

  const traceGroups = useMemo(() => {
    const filtered = getFilteredEvents();
    const groupMap = new Map<string, Event[]>();

    filtered.forEach((event) => {
      const traceId = event.requestId || "no-trace";
      if (!groupMap.has(traceId)) {
        groupMap.set(traceId, []);
      }
      groupMap.get(traceId)!.push(event);
    });

    const groups: TraceGroup[] = Array.from(groupMap.entries()).map(
      ([traceId, events]) => {
        const sorted = events.sort(
          (a, b) =>
            new Date(b.date.replace(" ", "T")).getTime() -
            new Date(a.date.replace(" ", "T")).getTime()
        );

        return {
          traceId,
          events: sorted,
          firstEvent: sorted[0],
          lastEvent: sorted[sorted.length - 1],
          eventCount: sorted.length,
          eventTypes: new Set(sorted.map((e) => e.eventType)),
          applications: new Set(sorted.map((e) => e.application).filter(Boolean)),
          actors: new Set(sorted.map((e) => e.actor).filter(Boolean)),
        };
      }
    );

    return groups.sort(
      (a, b) =>
        new Date(b.firstEvent.date.replace(" ", "T")).getTime() -
        new Date(a.firstEvent.date.replace(" ", "T")).getTime()
    );
  }, [baseEvents, filters, searchQuery]);

  const toggleTraceExpanded = (traceId: string) => {
    const newExpanded = new Set(expandedTraces);
    if (newExpanded.has(traceId)) {
      newExpanded.delete(traceId);
    } else {
      newExpanded.add(traceId);
    }
    setExpandedTraces(newExpanded);
  };

  return (
    <Table variant="expandable">
      <TableScroll>
        <TableContent>
          <TableHeader>
            <TableHeadRow>
              <TableHeadCell className="w-10"></TableHeadCell>
              <TableHeadCell sticky className="w-48">
                <span className="text-sm font-bold text-bluegrey-900">
                  Trace ID
                </span>
              </TableHeadCell>
              <TableHeadCell>
                <span className="text-sm font-bold text-bluegrey-900">
                  Event Count
                </span>
              </TableHeadCell>
              <TableHeadCell>
                <span className="text-sm font-bold text-bluegrey-900">
                  First Event Time
                </span>
              </TableHeadCell>
              <TableHeadCell>
                <span className="text-sm font-bold text-bluegrey-900">
                  Event Types
                </span>
              </TableHeadCell>
              <TableHeadCell>
                <span className="text-sm font-bold text-bluegrey-900">
                  Applications
                </span>
              </TableHeadCell>
            </TableHeadRow>
          </TableHeader>
          <TableBody>
            {traceGroups.length > 0 ? (
              traceGroups.map((group) => (
                <React.Fragment key={group.traceId}>
                  <TableRow
                    expandable
                    isExpanded={expandedTraces.has(group.traceId)}
                    data-event-row={group.traceId}
                  >
                    <TableExpandCell className="sticky left-0 z-10 shadow-[1px_0_3px_rgba(0,0,0,0.05)] px-0 bg-white">
                      <div className="flex items-center gap-2 h-10 w-full px-3">
                        <button
                          type="button"
                          onClick={() => toggleTraceExpanded(group.traceId)}
                          className="flex h-10 w-10 items-center justify-center rounded transition-colors hover:bg-bluegrey-100"
                          aria-label="Toggle trace details"
                        >
                          {expandedTraces.has(group.traceId) ? (
                            <ChevronDown className="h-5 w-5 text-bluegrey-700" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-bluegrey-700" />
                          )}
                        </button>
                      </div>
                    </TableExpandCell>
                    <TableCell sticky className="w-48 bg-white group/traceId">
                      <div className="flex items-center gap-1 w-full">
                        <span className="text-sm text-bluegrey-900 truncate font-mono">
                          {group.traceId === "no-trace"
                            ? "No Trace ID"
                            : group.traceId}
                        </span>
                        {group.traceId !== "no-trace" && (
                          <button
                            type="button"
                            onClick={() =>
                              onFilterAdd?.({
                                id: generateUUID(),
                                column: "requestId",
                                operator: "equals",
                                value: group.traceId,
                              })
                            }
                            className="w-6 h-6 flex items-center justify-center rounded transition-opacity opacity-0 group-hover/traceId:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 flex-shrink-0"
                            title="Filter by Trace ID"
                            aria-label={`Filter by Trace ID ${group.traceId}`}
                          >
                            <Filter className="w-5 h-5 text-blue-500" />
                          </button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-bluegrey-900 font-semibold">
                        {group.eventCount}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-bluegrey-900">
                        {group.firstEvent.date}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {Array.from(group.eventTypes)
                          .slice(0, 2)
                          .map((type) => (
                            <span
                              key={type}
                              className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                            >
                              {type}
                            </span>
                          ))}
                        {group.eventTypes.size > 2 && (
                          <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                            +{group.eventTypes.size - 2}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {Array.from(group.applications)
                          .slice(0, 2)
                          .map((app) => (
                            <span
                              key={app}
                              className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded"
                            >
                              {app}
                            </span>
                          ))}
                        {group.applications.size > 2 && (
                          <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                            +{group.applications.size - 2}
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>

                  {expandedTraces.has(group.traceId) && (
                    <TableNestedRow colSpan={6} className="bg-bluegrey-50/30">
                      <TableExpandCell></TableExpandCell>
                      <TableNestedCell colSpan={5}>
                        <div className="py-6 px-4">
                          <div className="mb-6">
                            <h4 className="text-sm font-semibold text-bluegrey-900 mb-4">
                              Events in this trace ({group.eventCount})
                            </h4>
                            <div className="space-y-4">
                              {group.events.map((event, index) => (
                                <div
                                  key={event.id}
                                  className="p-4 bg-white rounded-lg border border-bluegrey-200 hover:border-bluegrey-300 transition-colors"
                                >
                                  <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                      <h5 className="text-sm font-semibold text-bluegrey-900 mb-1">
                                        Event {index + 1}: {event.eventType}
                                      </h5>
                                      <p className="text-xs text-bluegrey-600">
                                        {event.date}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1.5">
                                      <span className="text-xs font-semibold text-bluegrey-700">
                                        Event Type
                                      </span>
                                      <span className="text-sm text-bluegrey-900">
                                        {event.eventType}
                                      </span>
                                    </div>

                                    {event.application && (
                                      <div className="flex flex-col gap-1.5">
                                        <span className="text-xs font-semibold text-bluegrey-700">
                                          Application
                                        </span>
                                        <span className="text-sm text-bluegrey-900">
                                          {event.application}
                                        </span>
                                      </div>
                                    )}

                                    {event.actor && (
                                      <div className="flex flex-col gap-1.5">
                                        <span className="text-xs font-semibold text-bluegrey-700">
                                          Actor
                                        </span>
                                        <span className="text-sm text-bluegrey-900 font-mono">
                                          {event.actor}
                                        </span>
                                      </div>
                                    )}

                                    {event.clientIp && (
                                      <div className="flex flex-col gap-1.5">
                                        <span className="text-xs font-semibold text-bluegrey-700">
                                          Client IP
                                        </span>
                                        <span className="text-sm text-bluegrey-900 font-mono">
                                          {event.clientIp}
                                        </span>
                                      </div>
                                    )}

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

                                    {renderDetailField({
                                      label: "User Agent",
                                      value: event.userAgent,
                                      column: "userAgent",
                                      onFilterAdd,
                                    })}

                                    {renderDetailField({
                                      label: "Identity App",
                                      value: event.identityApp,
                                      column: "identityApp",
                                      onFilterAdd,
                                    })}

                                    {renderDetailField({
                                      label: "Identity App Instance ID",
                                      value: event.identityAppInstanceId,
                                      column: "identityAppInstanceId",
                                      onFilterAdd,
                                    })}

                                    {renderDetailField({
                                      label: "Authentication Details",
                                      value: event.authenticationDetails,
                                      column: "authenticationDetails",
                                      onFilterAdd,
                                    })}

                                    {renderDetailField({
                                      label: "Subject",
                                      value: event.subject,
                                      column: "subject",
                                      onFilterAdd,
                                    })}

                                    {event.details &&
                                      Object.keys(event.details).length > 0 && (
                                        <div className="flex flex-col gap-1.5 lg:col-span-2">
                                          <span className="text-xs font-semibold text-bluegrey-700">
                                            Details
                                          </span>
                                          <pre className="text-xs text-bluegrey-900 bg-bluegrey-50 p-3 rounded border border-bluegrey-200 overflow-x-auto font-mono">
                                            {JSON.stringify(
                                              event.details,
                                              null,
                                              2
                                            )}
                                          </pre>
                                        </div>
                                      )}
                                  </div>
                                </div>
                              ))}
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
