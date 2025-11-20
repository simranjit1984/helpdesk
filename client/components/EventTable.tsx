import React, { useState } from "react";
import { ChevronDown, ChevronRight, Filter, Link as LinkIcon } from "lucide-react";
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
import { generateMockEvents, generateUUID, Event, EventAction } from "./mockEvents";

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

const baseEvents = generateMockEvents();

export default function EventTable({
  filters,
  searchQuery = "",
  onFilterAdd,
}: EventTableProps) {
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

  const toggleEventExpanded = (eventId: string) => {
    const newExpanded = new Set(expandedEvents);
    if (newExpanded.has(eventId)) {
      newExpanded.delete(eventId);
    } else {
      newExpanded.add(eventId);
    }
    setExpandedEvents(newExpanded);
  };

  const getTraceIdEventCount = (traceId: string | undefined): number => {
    if (!traceId) return 0;
    return baseEvents.filter(e => e.requestId === traceId).length;
  };

  const hasLinkedEvents = (traceId: string | undefined): boolean => {
    return traceId ? getTraceIdEventCount(traceId) > 1 : false;
  };


  interface DetailFieldProps {
    label: string;
    value?: string;
    column?: string;
  }

  const renderDetailField = ({
    label,
    value,
    column,
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
        <div className="flex items-center gap-2 group">
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
              className="w-5 h-5 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity  flex-shrink-0"
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
                <span className="text-sm font-bold text-bluegrey-900">Date</span>
              </TableHeadCell>
              <TableHeadCell>
                <span className="text-sm font-bold text-bluegrey-900">
                  Event type
                </span>
              </TableHeadCell>
              <TableHeadCell>
                <span className="text-sm font-bold text-bluegrey-900">
                  Application
                </span>
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
            {getFilteredEvents().length > 0 ? (
              getFilteredEvents().map((event) => (
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
                          className="w-6 h-6 flex items-center justify-center rounded transition-opacity opacity-0 group-hover/date:opacity-100 focus-visible:opacity-100  flex-shrink-0"
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
                          className="w-6 h-6 flex items-center justify-center rounded transition-opacity opacity-0 group-hover/eventType:opacity-100 focus-visible:opacity-100  flex-shrink-0"
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
                            className="w-6 h-6 flex items-center justify-center rounded transition-opacity opacity-0 group-hover/application:opacity-100 focus-visible:opacity-100  flex-shrink-0"
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
                            className="w-6 h-6 flex items-center justify-center rounded transition-opacity opacity-0 group-hover/actor:opacity-100 focus-visible:opacity-100  flex-shrink-0"
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
                            className="w-6 h-6 flex items-center justify-center rounded transition-opacity opacity-0 group-hover/clientIp:opacity-100 focus-visible:opacity-100  flex-shrink-0"
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
