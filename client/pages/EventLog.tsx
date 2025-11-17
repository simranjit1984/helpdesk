import React, { useState } from "react";
import { Search, ChevronDown, ChevronRight } from "lucide-react";
import Layout from "@/components/Layout";
import PageHeader from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
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
  TableActionCell,
  TableExpandCell,
  TableNestedRow,
  TableNestedCell,
  NestedTable,
  NestedTableHeader,
  NestedTableHeadRow,
  NestedTableHeadCell,
  NestedTableBody,
  NestedTableRow,
  NestedTableCell,
  TableEmptyState,
} from "@/components/ui/table";

export default function EventLog() {
  const [eventSearchQuery, setEventSearchQuery] = useState("");
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

  const eventLogs = [
    // January 15
    {
      id: "evt-1",
      date: "2025-01-15 14:32:45",
      eventType: "User Login",
      application: "Facebook",
      userId: "f7d82457-aac9-4826-9986-a8392b215300",
      clientIp: "192.168.1.105",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0",
      requestId: "90ca1c13-5727-40c4-b881-1b0eb4c173cf",
      agent: "90ca1c13-5727-40c4-b881-1b0eb4c173cf",
      identityApp: "Self-service",
      description: "User successfully logged in via Facebook SSO",
      details: {
        authMethod: "OAuth2",
        sessionDuration: "3600s",
        mfaEnabled: true,
        loginAttempts: 1
      }
    },
    {
      id: "evt-2",
      date: "2025-01-15 12:18:23",
      eventType: "Password Reset",
      application: "Salesforce",
      userId: "f7d82457-aac9-4826-9986-a8392b215300",
      clientIp: "10.0.2.45",
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15",
      requestId: "a1b2c3d4-5e6f-7890-abcd-ef1234567890",
      agent: "a1b2c3d4-5e6f-7890-abcd-ef1234567890",
      identityApp: "Core",
      description: "User initiated password reset request from Salesforce",
      details: {
        resetMethod: "Email",
        emailSent: "user@example.com",
        tokenExpiry: "1800s",
        verified: true
      }
    },
    {
      id: "evt-3",
      date: "2025-01-15 09:45:12",
      eventType: "Access Granted",
      application: "Helpdesk",
      userId: "f7d82457-aac9-4826-9986-a8392b215300",
      clientIp: "172.16.0.88",
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) Mobile Safari",
      requestId: "xyz-789-abc-456-def-123",
      agent: "xyz-789-abc-456-def-123",
      identityApp: "Helpdesk",
      description: "User granted access to Helpdesk application with admin privileges",
      details: {
        accessLevel: "Admin",
        grantedBy: "system-admin",
        validUntil: "2025-12-31T23:59:59Z",
        resources: ["tickets", "users", "settings"]
      }
    },
    {
      id: "evt-4",
      date: "2025-01-14 16:22:01",
      eventType: "Profile Updated",
      application: "Internal",
      userId: "f7d82457-aac9-4826-9986-a8392b215300",
      clientIp: "192.168.100.50",
      userAgent: "Mozilla/5.0 (X11; Linux x86_64) Firefox/121.0",
      requestId: "profile-update-8877665544",
      agent: "profile-update-8877665544",
      identityApp: "Delegated user management",
      description: "User profile information updated by delegated administrator",
      details: {
        fieldsChanged: ["phoneNumber", "address", "department"],
        changedBy: "admin@insurcar.com",
        previousValues: {
          phoneNumber: "+1 234567890",
          department: "Sales"
        },
        newValues: {
          phoneNumber: "+1 888999000",
          department: "Marketing"
        }
      }
    },
    {
      id: "evt-5",
      date: "2025-01-14 11:05:33",
      eventType: "Permission Revoked",
      application: "Salesforce",
      userId: "f7d82457-aac9-4826-9986-a8392b215300",
      clientIp: "203.0.113.42",
      userAgent: "Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) Safari/605.1.15",
      requestId: "revoke-perm-9988776655",
      agent: "revoke-perm-9988776655",
      identityApp: "Core",
      description: "User's export data permission revoked from Salesforce application",
      details: {
        permission: "Export Data",
        revokedBy: "security-team@insurcar.com",
        reason: "Security policy update",
        timestamp: "2025-01-14T11:05:33Z"
      }
    },
    {
      id: "evt-6",
      date: "2025-01-14 08:15:44",
      eventType: "MFA Enabled",
      application: "Internal",
      userId: "f7d82457-aac9-4826-9986-a8392b215300",
      clientIp: "192.168.1.200",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/120.0.0.0",
      requestId: "mfa-enable-1122334455",
      agent: "mfa-enable-1122334455",
      identityApp: "Self-service",
      description: "Multi-factor authentication enabled for user account",
      details: {
        mfaMethod: "Authenticator App",
        backupCodes: "generated",
        registeredDevice: "iPhone 13",
        timestamp: "2025-01-14T08:15:44Z"
      }
    },
    {
      id: "evt-7",
      date: "2025-01-13 18:47:22",
      eventType: "User Login",
      application: "Salesforce",
      userId: "f7d82457-aac9-4826-9986-a8392b215300",
      clientIp: "10.5.12.78",
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120.0.0.0",
      requestId: "login-sf-7788991122",
      agent: "login-sf-7788991122",
      identityApp: "Core",
      description: "User successfully logged in to Salesforce",
      details: {
        authMethod: "SAML",
        sessionDuration: "7200s",
        mfaEnabled: true,
        loginAttempts: 1,
        location: "San Francisco, CA"
      }
    },
    {
      id: "evt-8",
      date: "2025-01-13 15:33:10",
      eventType: "API Access Granted",
      application: "Internal",
      userId: "f7d82457-aac9-4826-9986-a8392b215300",
      clientIp: "172.16.5.44",
      userAgent: "python-requests/2.31.0",
      requestId: "api-access-2233445566",
      agent: "api-access-2233445566",
      identityApp: "Helpdesk",
      description: "API access token generated for application integration",
      details: {
        apiVersion: "v2",
        scope: ["read:users", "read:roles", "write:logs"],
        tokenExpiry: "90 days",
        rateLimit: "1000 requests/hour"
      }
    },
    {
      id: "evt-9",
      date: "2025-01-13 10:22:05",
      eventType: "Session Expired",
      application: "Facebook",
      userId: "f7d82457-aac9-4826-9986-a8392b215300",
      clientIp: "192.168.1.105",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0",
      requestId: "session-exp-3344556677",
      agent: "session-exp-3344556677",
      identityApp: "Self-service",
      description: "User session expired due to inactivity",
      details: {
        sessionDuration: "3600s",
        inactivityTime: "3600s",
        autoLogout: true,
        redirectUrl: "/login"
      }
    },
    {
      id: "evt-10",
      date: "2025-01-12 13:55:33",
      eventType: "Role Assigned",
      application: "Internal",
      userId: "f7d82457-aac9-4826-9986-a8392b215300",
      clientIp: "10.0.1.50",
      userAgent: "Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) Safari/605.1.15",
      requestId: "role-assign-4455667788",
      agent: "role-assign-4455667788",
      identityApp: "Delegated user management",
      description: "Administrator role assigned to user account",
      details: {
        role: "Administrator",
        assignedBy: "super-admin@insurcar.com",
        effectiveFrom: "2025-01-12T13:55:33Z",
        permissions: ["admin:all"]
      }
    },
    {
      id: "evt-11",
      date: "2025-01-12 09:12:15",
      eventType: "Email Verified",
      application: "Internal",
      userId: "f7d82457-aac9-4826-9986-a8392b215300",
      clientIp: "192.168.50.100",
      userAgent: "Mozilla/5.0 (X11; Linux x86_64) Firefox/121.0",
      requestId: "email-verify-5566778899",
      agent: "email-verify-5566778899",
      identityApp: "Self-service",
      description: "User email address verified via confirmation link",
      details: {
        emailAddress: "user@example.com",
        verificationMethod: "Email confirmation token",
        timestamp: "2025-01-12T09:12:15Z"
      }
    },
    {
      id: "evt-12",
      date: "2025-01-12 07:45:22",
      eventType: "Account Created",
      application: "Internal",
      userId: "f7d82457-aac9-4826-9986-a8392b215300",
      clientIp: "203.0.113.100",
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15",
      requestId: "account-create-6677889900",
      agent: "account-create-6677889900",
      identityApp: "Self-service",
      description: "New user account created successfully",
      details: {
        createdBy: "alice.anderson@example.com",
        initialRole: "User",
        accountStatus: "Active",
        invitationSent: true
      }
    },
    {
      id: "evt-13",
      date: "2025-01-11 17:28:44",
      eventType: "User Login",
      application: "Internal",
      userId: "f7d82457-aac9-4826-9986-a8392b215300",
      clientIp: "192.168.2.50",
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) Mobile Safari",
      requestId: "login-internal-7788990011",
      agent: "login-internal-7788990011",
      identityApp: "Core",
      description: "User successfully logged in",
      details: {
        authMethod: "Username/Password",
        sessionDuration: "3600s",
        mfaEnabled: true,
        loginAttempts: 1,
        ipVerified: true
      }
    },
    {
      id: "evt-14",
      date: "2025-01-11 14:12:08",
      eventType: "Data Export",
      application: "Salesforce",
      userId: "f7d82457-aac9-4826-9986-a8392b215300",
      clientIp: "10.10.10.20",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0",
      requestId: "data-export-8899001122",
      agent: "data-export-8899001122",
      identityApp: "Core",
      description: "User exported data from Salesforce application",
      details: {
        dataType: "CSV",
        recordCount: 5000,
        fileSize: "2.5 MB",
        exportScope: "Last 90 days",
        timestamp: "2025-01-11T14:12:08Z"
      }
    },
    {
      id: "evt-15",
      date: "2025-01-11 11:36:51",
      eventType: "Permission Updated",
      application: "Helpdesk",
      userId: "f7d82457-aac9-4826-9986-a8392b215300",
      clientIp: "172.16.20.33",
      userAgent: "Mozilla/5.0 (X11; Linux x86_64) Firefox/121.0",
      requestId: "perm-update-9900112233",
      agent: "perm-update-9900112233",
      identityApp: "Helpdesk",
      description: "User permissions updated in Helpdesk application",
      details: {
        previousPermissions: ["read:tickets", "write:comments"],
        newPermissions: ["read:tickets", "write:comments", "read:users"],
        updatedBy: "manager@insurcar.com",
        timestamp: "2025-01-11T11:36:51Z"
      }
    },
    {
      id: "evt-16",
      date: "2025-01-10 16:04:19",
      eventType: "User Login",
      application: "Facebook",
      userId: "f7d82457-aac9-4826-9986-a8392b215300",
      clientIp: "192.168.1.105",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0",
      requestId: "login-fb-0011223344",
      agent: "login-fb-0011223344",
      identityApp: "Self-service",
      description: "User login via Facebook OAuth provider",
      details: {
        authMethod: "OAuth2",
        sessionDuration: "3600s",
        mfaEnabled: false,
        loginAttempts: 1,
        provider: "facebook"
      }
    },
    {
      id: "evt-17",
      date: "2025-01-10 12:45:33",
      eventType: "Two-Factor Authentication",
      application: "Internal",
      userId: "f7d82457-aac9-4826-9986-a8392b215300",
      clientIp: "10.0.3.75",
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15",
      requestId: "2fa-verify-1122334455",
      agent: "2fa-verify-1122334455",
      identityApp: "Core",
      description: "Two-factor authentication code verified successfully",
      details: {
        mfaMethod: "TOTP",
        verificationStatus: "success",
        timestamp: "2025-01-10T12:45:33Z",
        nextVerificationRequired: "2025-01-11T12:45:33Z"
      }
    },
    {
      id: "evt-18",
      date: "2025-01-10 09:20:12",
      eventType: "Account Locked",
      application: "Internal",
      userId: "f7d82457-aac9-4826-9986-a8392b215300",
      clientIp: "203.0.113.50",
      userAgent: "Mozilla/5.0 (X11; Linux x86_64) Firefox/121.0",
      requestId: "account-lock-2233445566",
      agent: "account-lock-2233445566",
      identityApp: "Core",
      description: "Account locked due to multiple failed login attempts",
      details: {
        failedAttempts: 5,
        lockoutDuration: "900s",
        reason: "Brute force protection",
        unlockTime: "2025-01-10T09:35:12Z"
      }
    },
    {
      id: "evt-19",
      date: "2025-01-09 15:33:27",
      eventType: "User Login",
      application: "Salesforce",
      userId: "f7d82457-aac9-4826-9986-a8392b215300",
      clientIp: "10.5.12.78",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/120.0.0.0",
      requestId: "login-sf-3344556677",
      agent: "login-sf-3344556677",
      identityApp: "Core",
      description: "User logged in to Salesforce",
      details: {
        authMethod: "SAML",
        sessionDuration: "7200s",
        mfaEnabled: true,
        loginAttempts: 1,
        ssoProvider: "Corporate"
      }
    },
    {
      id: "evt-20",
      date: "2025-01-09 11:07:44",
      eventType: "Security Settings Changed",
      application: "Internal",
      userId: "f7d82457-aac9-4826-9986-a8392b215300",
      clientIp: "192.168.100.200",
      userAgent: "Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) Safari/605.1.15",
      requestId: "security-change-4455667788",
      agent: "security-change-4455667788",
      identityApp: "Self-service",
      description: "User security settings updated",
      details: {
        changedSettings: ["mfa", "passwordExpiry"],
        mfaStatus: "enabled",
        passwordExpiry: "90 days",
        timestamp: "2025-01-09T11:07:44Z"
      }
    },
    {
      id: "evt-21",
      date: "2025-01-09 08:52:15",
      eventType: "Activity Log Accessed",
      application: "Internal",
      userId: "f7d82457-aac9-4826-9986-a8392b215300",
      clientIp: "172.16.15.22",
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120.0.0.0",
      requestId: "activity-access-5566778899",
      agent: "activity-access-5566778899",
      identityApp: "Self-service",
      description: "User accessed their activity log",
      details: {
        pageViewed: "Activity History",
        filterApplied: "Last 30 days",
        recordsRetrieved: 25,
        timestamp: "2025-01-09T08:52:15Z"
      }
    },
    {
      id: "evt-22",
      date: "2025-01-08 19:16:03",
      eventType: "User Logout",
      application: "Internal",
      userId: "f7d82457-aac9-4826-9986-a8392b215300",
      clientIp: "192.168.1.105",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0",
      requestId: "logout-user-6677889900",
      agent: "logout-user-6677889900",
      identityApp: "Core",
      description: "User logged out from application",
      details: {
        logoutType: "Manual",
        sessionDuration: "28800s",
        timestamp: "2025-01-08T19:16:03Z",
        allSessionsTerminated: false
      }
    },
    {
      id: "evt-23",
      date: "2025-01-08 14:42:50",
      eventType: "Notification Sent",
      application: "Internal",
      userId: "f7d82457-aac9-4826-9986-a8392b215300",
      clientIp: "10.0.1.100",
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) Mobile Safari",
      requestId: "notification-7788990011",
      agent: "notification-7788990011",
      identityApp: "Helpdesk",
      description: "Security notification sent to user",
      details: {
        notificationType: "Security Alert",
        message: "New login detected from different location",
        deliveryMethod: "Email",
        sent: true
      }
    },
    {
      id: "evt-24",
      date: "2025-01-08 10:28:35",
      eventType: "User Login",
      application: "Internal",
      userId: "f7d82457-aac9-4826-9986-a8392b215300",
      clientIp: "203.0.113.77",
      userAgent: "Mozilla/5.0 (X11; Linux x86_64) Firefox/121.0",
      requestId: "login-morning-8899001122",
      agent: "login-morning-8899001122",
      identityApp: "Core",
      description: "User successfully logged in",
      details: {
        authMethod: "Username/Password",
        sessionDuration: "3600s",
        mfaEnabled: true,
        loginAttempts: 1,
        location: "New York, NY"
      }
    }
  ];

  const getFilteredEventLogs = () => {
    if (!eventSearchQuery.trim()) {
      return eventLogs;
    }

    const query = eventSearchQuery.toLowerCase();
    return eventLogs.filter((event) =>
      event.date.toLowerCase().includes(query) ||
      event.eventType.toLowerCase().includes(query) ||
      event.application.toLowerCase().includes(query) ||
      event.userId.toLowerCase().includes(query) ||
      event.clientIp.toLowerCase().includes(query) ||
      event.identityApp.toLowerCase().includes(query) ||
      event.description.toLowerCase().includes(query)
    );
  };

  return (
    <Layout>
      <PageHeader title="Event log" />
      <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 flex flex-col gap-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-bluegrey-500 pointer-events-none" />
          <Input
            type="text"
            placeholder="Search events by date, type, application, user ID..."
            value={eventSearchQuery}
            onChange={(e) => setEventSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border-2 border-bluegrey-100 rounded-[2px] focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Event Log Table */}
        <Table variant="expandable">
          <TableScroll>
            <TableContent>
              <TableHeader>
                <TableHeadRow>
                  <TableHeadCell className="w-10"></TableHeadCell>
                  <TableHeadCell>Date</TableHeadCell>
                  <TableHeadCell>Event type</TableHeadCell>
                  <TableHeadCell>Application</TableHeadCell>
                  <TableHeadCell>User ID</TableHeadCell>
                  <TableHeadCell>Client IP</TableHeadCell>
                </TableHeadRow>
              </TableHeader>
              <TableBody>
                {getFilteredEventLogs().length > 0 ? (
                  getFilteredEventLogs().map((event) => (
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
                        <TableCell>
                          <span className="text-sm text-bluegrey-900">{event.date}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-bluegrey-900">{event.eventType}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-bluegrey-900">{event.application}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-bluegrey-900 font-mono">{event.userId}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-bluegrey-900 font-mono">{event.clientIp}</span>
                        </TableCell>
                      </TableRow>
                      {expandedEvents.has(event.id) && (
                        <TableNestedRow colSpan={6}>
                          <TableExpandCell></TableExpandCell>
                          <TableNestedCell colSpan={5}>
                            <div className="py-4 px-3 grid grid-cols-1 lg:grid-cols-2 gap-4">
                              <div className="flex flex-col gap-2">
                                <span className="text-sm font-bold text-bluegrey-900 uppercase tracking-widest">User Agent</span>
                                <span className="text-sm text-bluegrey-900">{event.userAgent}</span>
                              </div>
                              <div className="flex flex-col gap-2">
                                <span className="text-sm font-bold text-bluegrey-900 uppercase tracking-widest">Request ID</span>
                                <span className="text-sm text-bluegrey-900 font-mono">{event.requestId}</span>
                              </div>
                              <div className="flex flex-col gap-2">
                                <span className="text-sm font-bold text-bluegrey-900 uppercase tracking-widest">Agent</span>
                                <span className="text-sm text-bluegrey-900 font-mono">{event.agent}</span>
                              </div>
                              <div className="flex flex-col gap-2">
                                <span className="text-sm font-bold text-bluegrey-900 uppercase tracking-widest">Identity App</span>
                                <span className="text-sm text-bluegrey-900">{event.identityApp}</span>
                              </div>
                              <div className="flex flex-col gap-2 lg:col-span-2">
                                <span className="text-sm font-bold text-bluegrey-900 uppercase tracking-widest">Description</span>
                                <span className="text-sm text-bluegrey-900">{event.description}</span>
                              </div>
                              <div className="flex flex-col gap-2 lg:col-span-2">
                                <span className="text-sm font-bold text-bluegrey-900 uppercase tracking-widest">Details</span>
                                <pre className="text-xs text-bluegrey-900 bg-bluegrey-50 p-3 rounded border border-bluegrey-100 overflow-x-auto">
{JSON.stringify(event.details, null, 2)}
                                </pre>
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
                      eventSearchQuery.trim()
                        ? "No events found matching your search"
                        : "No event logs available"
                    }
                  />
                )}
              </TableBody>
            </TableContent>
          </TableScroll>
        </Table>
      </div>
    </Layout>
  );
}
