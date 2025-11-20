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
import { generateTraceSummary, generateEventSummary } from "./eventSummaryGenerator";

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
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(
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

  const toggleEventExpanded = (eventId: string) => {
    const newExpanded = new Set(expandedEvents);
    if (newExpanded.has(eventId)) {
      newExpanded.delete(eventId);
    } else {
      newExpanded.add(eventId);
    }
    setExpandedEvents(newExpanded);
  };

  return (
    <Table variant="expandable">
      <TableScroll>
        <TableContent>
          <TableHeader>
            <TableHeadRow>
              <TableHeadCell className="w-10"></TableHeadCell>
              <TableHeadCell>
                <span className="text-sm font-bold text-bluegrey-900">
                  Summary
                </span>
              </TableHeadCell>
              <TableHeadCell className="w-40">
                <span className="text-sm font-bold text-bluegrey-900">
                  First Event Time
                </span>
              </TableHeadCell>
            </TableHeadRow>
          </TableHeader>
          <TableBody>
            {traceGroups.length > 0 ? (
              traceGroups.map((group) => {
                const summary = generateTraceSummary(group.events);
                const statusIcon =
                  summary.status === "success" ? (
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                  ) : summary.status === "failure" ? (
                    <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                  ) : summary.status === "mixed" ? (
                    <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                  ) : null;

                return (
                  <React.Fragment key={group.traceId}>
                    <TableRow
                      expandable
                      isExpanded={expandedTraces.has(group.traceId)}
                      data-event-row={group.traceId}
                    >
                      <TableExpandCell className="sticky left-0 z-10 shadow-[1px_0_3px_rgba(0,0,0,0.05)] px-0 bg-white">
                        <div className="flex items-center gap-2 h-full w-full px-3">
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
                      <td className="px-4 py-3">
                        <div className="flex items-start gap-2 w-full">
                          {statusIcon}
                          <span className="text-sm text-bluegrey-900 leading-relaxed whitespace-normal break-words">
                            {summary.summary}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 w-40">
                        <span className="text-sm text-bluegrey-900 whitespace-nowrap overflow-hidden text-ellipsis">
                          {group.firstEvent.date}
                        </span>
                      </td>
                    </TableRow>

                    {expandedTraces.has(group.traceId) && (
                      <TableNestedRow colSpan={3} className="bg-bluegrey-50/30">
                        <TableExpandCell></TableExpandCell>
                        <TableNestedCell colSpan={2}>
                          <div className="py-6 px-4">
                            <h4 className="text-sm font-semibold text-bluegrey-900 mb-4">
                              Events in this trace ({group.eventCount})
                            </h4>
                            <div className="space-y-2">
                              {group.events.map((event, index) => {
                                const eventSummary = generateEventSummary(event);
                                const isEventExpanded = expandedEvents.has(event.id);

                                return (
                                  <div
                                    key={event.id}
                                    className="bg-white rounded-lg border border-bluegrey-200 hover:border-bluegrey-300 transition-colors overflow-hidden"
                                  >
                                    <button
                                      type="button"
                                      onClick={() => toggleEventExpanded(event.id)}
                                      className="w-full px-4 py-3 flex items-start gap-3 hover:bg-bluegrey-50 transition-colors"
                                    >
                                      <div className="flex-shrink-0 mt-0.5">
                                        {isEventExpanded ? (
                                          <ChevronDown className="h-4 w-4 text-bluegrey-700" />
                                        ) : (
                                          <ChevronRight className="h-4 w-4 text-bluegrey-700" />
                                        )}
                                      </div>
                                      <div className="flex-1 text-left">
                                        <p className="text-sm text-bluegrey-900 leading-relaxed">
                                          Event {index + 1}: {eventSummary}
                                        </p>
                                        <p className="text-xs text-bluegrey-600 mt-1">
                                          {event.date}
                                        </p>
                                      </div>
                                    </button>

                                    {isEventExpanded && (
                                      <div className="px-4 pb-4 pt-2 border-t border-bluegrey-200 bg-bluegrey-50/50">
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
                                            label: "Trace ID",
                                            value: event.requestId,
                                            column: "requestId",
                                            onFilterAdd,
                                          })}

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
                                                <pre className="text-xs text-bluegrey-900 bg-white p-3 rounded border border-bluegrey-200 overflow-x-auto font-mono">
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
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </TableNestedCell>
                      </TableNestedRow>
                    )}
                  </React.Fragment>
                );
              })
            ) : (
              <TableEmptyState
                colSpan={3}
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
