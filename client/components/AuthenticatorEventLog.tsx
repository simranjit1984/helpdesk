import React, { useState, useMemo } from "react";
import { ChevronDown, ChevronRight, AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";
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
import { Event } from "./mockEvents";

interface AuthenticatorEventLogProps {
  events: Event[];
  authenticatorCategories: {
    authenticators: string[];
    externalProviders: string[];
    passkeys: string[];
  };
}

interface AuthenticatorEventGroup {
  authenticator: string;
  type: "authenticator" | "external" | "passkey";
  events: Event[];
  totalCount: number;
  successCount: number;
  failureCount: number;
  lastUsed?: string;
}

const getAuthenticatorFromEvent = (event: Event): string | null => {
  if (!event.description) return null;

  const description = event.description.toLowerCase();

  // Check for specific authenticators
  if (description.includes("sms otp")) return "SMS OTP";
  if (description.includes("email otp")) return "Email OTP";
  if (description.includes("totp")) return "TOTP";
  if (description.includes("qr code")) return "QR code Enrollment";
  if (description.includes("push") || description.includes("mfa")) return "Push MFA";
  if (description.includes("magic link")) return "Magic link authentication";
  if (description.includes("username") || description.includes("password")) return "Username & Password";

  // Check for external providers
  if (description.includes("google")) return "Google";
  if (description.includes("facebook")) return "Facebook";
  if (description.includes("apple")) return "Apple";
  if (description.includes("digid")) return "DigiD";
  if (description.includes("eherkenning")) return "eHerkenning";
  if (description.includes("microsoft entra") || description.includes("entra id")) return "Microsoft EntraID";
  if (description.includes("microsoft ad")) return "Microsoft AD";

  // Check for passkeys/FIDO keys
  if (description.includes("icloud") || description.includes("keychain")) return "iCloud Keychain";
  if (description.includes("safenet") || description.includes("fido")) return "Safenet FIDO Key";
  if (description.includes("chrome passkey") || description.includes("chrome")) return "Chrome Passkey";
  if (description.includes("yubikey") || description.includes("yubi")) return "Yubikey";

  return null;
};

const isAuthenticatorEvent = (event: Event): boolean => {
  return getAuthenticatorFromEvent(event) !== null;
};

const getEventStatus = (description: string): "success" | "failure" => {
  const lowerDesc = description?.toLowerCase() || "";
  if (lowerDesc.includes("failed") || lowerDesc.includes("failure") || lowerDesc.includes("lockout") || lowerDesc.includes("invalid")) {
    return "failure";
  }
  return "success";
};

export default function AuthenticatorEventLog({
  events,
  authenticatorCategories,
}: AuthenticatorEventLogProps) {
  const [expandedAuthenticators, setExpandedAuthenticators] = useState<Set<string>>(
    new Set()
  );

  const authenticatorGroups = useMemo(() => {
    const groupMap = new Map<string, Event[]>();

    // Filter and group events by authenticator
    events.forEach((event) => {
      if (isAuthenticatorEvent(event)) {
        const authName = getAuthenticatorFromEvent(event);
        if (authName) {
          if (!groupMap.has(authName)) {
            groupMap.set(authName, []);
          }
          groupMap.get(authName)!.push(event);
        }
      }
    });

    // Convert to AuthenticatorEventGroup format
    const groups: AuthenticatorEventGroup[] = Array.from(groupMap.entries()).map(
      ([authName, authEvents]) => {
        const sorted = authEvents.sort(
          (a, b) =>
            new Date(b.date.replace(" ", "T")).getTime() -
            new Date(a.date.replace(" ", "T")).getTime()
        );

        const successCount = sorted.filter(
          (e) => getEventStatus(e.description || "") === "success"
        ).length;
        const failureCount = sorted.filter(
          (e) => getEventStatus(e.description || "") === "failure"
        ).length;

        // Determine type
        let type: "authenticator" | "external" | "passkey" = "authenticator";
        if (authenticatorCategories.externalProviders.includes(authName)) {
          type = "external";
        } else if (authenticatorCategories.passkeys.includes(authName)) {
          type = "passkey";
        }

        return {
          authenticator: authName,
          type,
          events: sorted,
          totalCount: sorted.length,
          successCount,
          failureCount,
          lastUsed: sorted[0]?.date,
        };
      }
    );

    // Sort by last used date (most recent first)
    return groups.sort((a, b) => {
      const dateA = a.lastUsed ? new Date(a.lastUsed.replace(" ", "T")).getTime() : 0;
      const dateB = b.lastUsed ? new Date(b.lastUsed.replace(" ", "T")).getTime() : 0;
      return dateB - dateA;
    });
  }, [events, authenticatorCategories]);

  const toggleAuthenticatorExpanded = (authenticator: string) => {
    const newExpanded = new Set(expandedAuthenticators);
    if (newExpanded.has(authenticator)) {
      newExpanded.delete(authenticator);
    } else {
      newExpanded.add(authenticator);
    }
    setExpandedAuthenticators(newExpanded);
  };

  const getStatusIcon = (successCount: number, failureCount: number) => {
    if (failureCount === 0) {
      return <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />;
    } else if (successCount === 0) {
      return <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />;
    } else {
      return <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0" />;
    }
  };

  const getTypeLabel = (type: "authenticator" | "external" | "passkey"): string => {
    switch (type) {
      case "external":
        return "External Identity Provider";
      case "passkey":
        return "Passkey/FIDO Key";
      case "authenticator":
      default:
        return "Authenticator";
    }
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
                  Authenticator
                </span>
              </TableHeadCell>
              <TableHeadCell>
                <span className="text-sm font-bold text-bluegrey-900">
                  Type
                </span>
              </TableHeadCell>
              <TableHeadCell>
                <span className="text-sm font-bold text-bluegrey-900">
                  Activity
                </span>
              </TableHeadCell>
              <TableHeadCell>
                <span className="text-sm font-bold text-bluegrey-900">
                  Last Used
                </span>
              </TableHeadCell>
            </TableHeadRow>
          </TableHeader>
          <TableBody>
            {authenticatorGroups.length > 0 ? (
              authenticatorGroups.map((group) => (
                <React.Fragment key={group.authenticator}>
                  <TableRow
                    expandable
                    isExpanded={expandedAuthenticators.has(group.authenticator)}
                  >
                    <TableExpandCell>
                      <button
                        type="button"
                        onClick={() => toggleAuthenticatorExpanded(group.authenticator)}
                        className="flex h-10 w-10 items-center justify-center rounded transition-colors hover:bg-bluegrey-100"
                        aria-label={`Toggle ${group.authenticator} events`}
                      >
                        {expandedAuthenticators.has(group.authenticator) ? (
                          <ChevronDown className="h-5 w-5 text-bluegrey-700" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-bluegrey-700" />
                        )}
                      </button>
                    </TableExpandCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(group.successCount, group.failureCount)}
                        <span className="text-sm font-medium text-bluegrey-900">
                          {group.authenticator}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-bluegrey-700 bg-bluegrey-100 px-2 py-1 rounded whitespace-nowrap inline-block">
                        {getTypeLabel(group.type)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-bluegrey-900">
                          <span className="font-semibold text-green-600">{group.successCount}</span>
                          {" successful, "}
                          <span className="font-semibold text-red-600">{group.failureCount}</span>
                          {" failed"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-bluegrey-900">
                        {group.lastUsed || "Never"}
                      </span>
                    </TableCell>
                  </TableRow>

                  {expandedAuthenticators.has(group.authenticator) && (
                    <TableNestedRow colSpan={5} className="bg-bluegrey-50/30">
                      <TableExpandCell></TableExpandCell>
                      <TableNestedCell colSpan={4}>
                        <div className="py-6 px-4">
                          <h4 className="text-sm font-semibold text-bluegrey-900 mb-4">
                            Activity ({group.events.length} events)
                          </h4>
                          <div className="space-y-3 max-h-96 overflow-y-auto">
                            {group.events.map((event) => {
                              const status = getEventStatus(event.description || "");
                              const statusIcon = status === "success" ? (
                                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                              );

                              return (
                                <div
                                  key={event.id}
                                  className="bg-white rounded-lg border border-bluegrey-200 p-4 flex items-start gap-3"
                                >
                                  {statusIcon}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm text-bluegrey-900 break-words">
                                      {event.description}
                                    </p>
                                    <p className="text-xs text-bluegrey-600 mt-2">
                                      {event.date}
                                    </p>
                                    {event.clientIp && (
                                      <p className="text-xs text-bluegrey-600 mt-1">
                                        IP: {event.clientIp}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </TableNestedCell>
                    </TableNestedRow>
                  )}
                </React.Fragment>
              ))
            ) : (
              <TableEmptyState
                colSpan={5}
                message="No authenticator events found"
              />
            )}
          </TableBody>
        </TableContent>
      </TableScroll>
    </Table>
  );
}
