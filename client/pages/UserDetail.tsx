import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Save, MoreVertical, Pencil, Calendar, ChevronDown, ChevronRight, PlusCircle } from "lucide-react";
import Layout from "@/components/Layout";
import UserDetailHeader from "@/components/UserDetailHeader";
import SuccessAlert from "@/components/SuccessAlert";
import SearchBar from "@/components/SearchBar";
import FilterTag from "@/components/FilterTag";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
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
import { getUserByUsername } from "@/components/UsersTable";

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [endDateOption, setEndDateOption] = useState<"no-end" | "custom">("custom");
  const [isValidityModalOpen, setIsValidityModalOpen] = useState(false);
  const [modalStartDate, setModalStartDate] = useState("2025/04/18");
  const [modalEndDateOption, setModalEndDateOption] = useState<"no-end" | "custom">("custom");
  const [modalEndDate, setModalEndDate] = useState("2025/04/18");
  const [expandedRoles, setExpandedRoles] = useState<Set<string>>(new Set());
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [eventSearchQuery, setEventSearchQuery] = useState("");
  const [eventFilters, setEventFilters] = useState<Array<{ id: string; column: string; operator: string; value: string }>>([]);

  const applicationsList: Record<string, Array<{ name: string; permissions: string[] }>> = {
    "1": [
      { name: "Claims Management System", permissions: ["View claims", "Create claims", "Approve claims"] },
      { name: "Policy Database", permissions: ["View policies", "Export data"] },
      { name: "Customer Portal", permissions: ["View customer info", "Update contact"] },
      { name: "Analytics Dashboard", permissions: ["View reports", "Access metrics"] },
      { name: "Audit Logger", permissions: ["View logs", "Export audit trail"] },
    ],
    "2": [
      { name: "Customer Helpdesk", permissions: ["View tickets", "Resolve tickets", "Escalate issues"] },
      { name: "Appointment Scheduler", permissions: ["View appointments", "Book appointments"] },
      { name: "CRM System", permissions: ["View customers", "Update customer info"] },
    ],
    "3": [
      { name: "Document Management", permissions: ["View documents", "Upload documents", "Archive docs"] },
      { name: "Policy Database", permissions: ["View policies"] },
      { name: "Email Service", permissions: ["Send emails", "Track opens"] },
      { name: "Template Builder", permissions: ["View templates", "Create templates"] },
      { name: "Compliance Checker", permissions: ["Run compliance checks"] },
    ],
  };

  const toggleRoleExpanded = (roleId: string) => {
    const newExpanded = new Set(expandedRoles);
    if (newExpanded.has(roleId)) {
      newExpanded.delete(roleId);
    } else {
      newExpanded.add(roleId);
    }
    setExpandedRoles(newExpanded);
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

  const getFilteredEventLogs = () => {
    let filtered = eventLogs;

    // Apply search query
    if (eventSearchQuery.trim()) {
      const query = eventSearchQuery.toLowerCase();
      filtered = filtered.filter((event) =>
        event.date.toLowerCase().includes(query) ||
        event.eventType.toLowerCase().includes(query) ||
        event.application.toLowerCase().includes(query) ||
        event.userId.toLowerCase().includes(query) ||
        event.clientIp.toLowerCase().includes(query) ||
        event.identityApp.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query)
      );
    }

    // Apply filters
    eventFilters.forEach((filter) => {
      filtered = filtered.filter((event) => {
        const fieldValue = (event[filter.column as keyof typeof event] || "")
          .toString()
          .toLowerCase();
        const filterValue = filter.value.toLowerCase();

        switch (filter.operator) {
          case "contains":
            return fieldValue.includes(filterValue);
          case "equals":
            return fieldValue === filterValue;
          case "startsWith":
            return fieldValue.startsWith(filterValue);
          case "endsWith":
            return fieldValue.endsWith(filterValue);
          default:
            return true;
        }
      });
    });

    return filtered;
  };

  const addEventFilter = () => {
    const newFilter = {
      id: Math.random().toString(36).substr(2, 9),
      column: "date",
      operator: "contains",
      value: "",
    };
    setEventFilters([...eventFilters, newFilter]);
  };

  const updateEventFilter = (
    id: string,
    column?: string,
    operator?: string,
    value?: string
  ) => {
    setEventFilters(
      eventFilters.map((f) =>
        f.id === id
          ? {
              ...f,
              column: column ?? f.column,
              operator: operator ?? f.operator,
              value: value ?? f.value,
            }
          : f
      )
    );
  };

  const removeEventFilter = (id: string) => {
    setEventFilters(eventFilters.filter((f) => f.id !== id));
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
    // January 14
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
    // January 13
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
    // January 12
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
    // January 11
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
    // January 10
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
    // January 9
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
    // January 8
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

  // Fetch user data based on username (email)
  const decodedId = id ? decodeURIComponent(id) : null;
  const foundUser = decodedId ? getUserByUsername(decodedId) : null;

  const user = foundUser ? {
    firstName: foundUser.firstName,
    lastName: foundUser.lastName,
    email: foundUser.username,
    phone: foundUser.phoneNumber,
    displayPhone: foundUser.phoneNumber,
    address1: "1223, Fancy Street",
    address2: "",
    city: "Amsterdam",
    postalCode: "125744",
    country: "Netherlands",
    startDate: "2025/04/18",
    endDate: "2025/04/18",
    organization: "InsurCar",
    status: "active" as const,
    accessRoles: foundUser.accessRoles || [],
  } : null;

  if (!user) {
    return (
      <Layout>
        <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <p className="text-bluegrey-600">User not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <UserDetailHeader
        firstName={user.firstName}
        lastName={user.lastName}
        organization={user.organization}
        phone={user.displayPhone}
        email={user.email}
        status={user.status}
      />

      <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="bg-white">
        <Tabs defaultValue="basic" className="w-full">
          <div className="border-b border-bluegrey-100">
            <TabsList className="h-auto bg-transparent p-0">
              <TabsTrigger
                value="basic"
                className="relative rounded-none border-b-4 border-transparent px-4 py-2 text-base font-normal data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-blue-500 data-[state=active]:shadow-none"
              >
                Basic information
              </TabsTrigger>
              <TabsTrigger
                value="access"
                className="relative rounded-none border-b-4 border-transparent px-4 py-2 text-base font-normal data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-blue-500 data-[state=active]:shadow-none"
              >
                Access roles
              </TabsTrigger>
              <TabsTrigger
                value="events"
                className="relative rounded-none border-b-4 border-transparent px-4 py-2 text-base font-normal data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-blue-500 data-[state=active]:shadow-none"
              >
                Event log
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="basic" className="pt-6">
            <form className="flex flex-col gap-10">
              <div className="flex w-full max-w-sm flex-col gap-6">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="firstName">First name</Label>
                  <Input
                    id="firstName"
                    defaultValue={user.firstName}
                    className="rounded-[2px] border-bluegrey-500"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input
                    id="lastName"
                    defaultValue={user.lastName}
                    className="rounded-[2px] border-bluegrey-500"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <Label htmlFor="email">Email ID</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue={user.email}
                    readOnly
                    className="rounded-[2px] border-bluegrey-100 cursor-text"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <Label htmlFor="phone">Phone number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    defaultValue={user.phone}
                    className="rounded-[2px] border-bluegrey-500"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <Label htmlFor="address1">Address 1</Label>
                  <Input
                    id="address1"
                    defaultValue={user.address1}
                    className="rounded-[2px] border-bluegrey-500"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <Label htmlFor="address2">Address 2</Label>
                  <Input
                    id="address2"
                    defaultValue={user.address2}
                    className="rounded-[2px] border-bluegrey-500"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    defaultValue={user.city}
                    className="rounded-[2px] border-bluegrey-500"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <Label htmlFor="postalCode">Postal code</Label>
                  <Input
                    id="postalCode"
                    defaultValue={user.postalCode}
                    className="rounded-[2px] border-bluegrey-500"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <Label htmlFor="country">Country</Label>
                  <Select defaultValue={user.country}>
                    <SelectTrigger className="rounded-[2px] border-bluegrey-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Netherlands">Netherlands</SelectItem>
                      <SelectItem value="Belgium">Belgium</SelectItem>
                      <SelectItem value="Germany">Germany</SelectItem>
                      <SelectItem value="France">France</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-4 pt-6">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-xl font-bold text-blue-500">Validity period</h3>
                    <p className="text-xs text-bluegrey-700">
                      Period during which user is authorize to access content in context of this organization.
                    </p>
                  </div>

                  <div className="rounded bg-bluegrey-50 p-6">
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-1">
                        <Label htmlFor="startDate" className="flex gap-1">
                          Start date
                          <span className="font-medium text-red-500">*</span>
                        </Label>
                        <Input
                          id="startDate"
                          type="date"
                          defaultValue={user.startDate}
                          className="rounded-[2px] border-bluegrey-500"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <Label>End date</Label>
                        <RadioGroup
                          value={endDateOption}
                          onValueChange={(value) => setEndDateOption(value as "no-end" | "custom")}
                          className="gap-3"
                        >
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="no-end" id="no-end" />
                            <Label htmlFor="no-end" className="cursor-pointer font-normal">
                              No end date
                            </Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="custom" id="custom" />
                            <Label htmlFor="custom" className="cursor-pointer font-normal">
                              Custom date
                            </Label>
                          </div>
                        </RadioGroup>

                        {endDateOption === "custom" && (
                          <div className="ml-7 mt-2">
                            <Input
                              type="date"
                              defaultValue={user.endDate}
                              className="rounded-[2px] border-bluegrey-500"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Button
                  type="submit"
                  className="gap-2 rounded-[2px] bg-blue-500 hover:bg-opacity-90"
                >
                  <Save className="h-5 w-5" />
                  Save
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate("/")}
                  className="rounded-[2px] text-bluegrey-700"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="access" className="pt-6">
            <div className="flex flex-col gap-6">
              {/* Toolbar */}
              <div className="flex items-center justify-between gap-3">
                <div className="w-full max-w-md">
                  <div className="relative">
                    <div className="flex items-center gap-2 px-2 py-3 border border-bluegrey-500 rounded-sm bg-white">
                      <Search className="w-5 h-5 text-bluegrey-500 flex-shrink-0" />
                      <input
                        type="text"
                        placeholder="Search access roles"
                        className="flex-1 text-sm text-bluegrey-500 placeholder:text-bluegrey-500 outline-none bg-transparent"
                      />
                    </div>
                  </div>
                </div>
                <Button className="rounded-[2px] bg-blue-500 hover:bg-opacity-90">
                  Assign access role
                </Button>
              </div>

              {/* Table */}
              <Table variant="expandable">
                <TableScroll>
                  <TableContent>
                    <TableHeader>
                      <TableHeadRow>
                        <TableHeadCell className="w-10"></TableHeadCell>
                        <TableHeadCell>Access role</TableHeadCell>
                        <TableHeadCell>Validity period</TableHeadCell>
                        <TableHeadCell className="w-10"></TableHeadCell>
                      </TableHeadRow>
                    </TableHeader>
                    <TableBody>
                      {user.accessRoles && user.accessRoles.length > 0 ? (
                        user.accessRoles.map((role) => (
                          <React.Fragment key={role.id}>
                            <TableRow expandable isExpanded={expandedRoles.has(role.id)}>
                              <TableExpandCell>
                                <button
                                  type="button"
                                  onClick={() => toggleRoleExpanded(role.id)}
                                  className="flex h-10 w-10 items-center justify-center rounded hover:bg-bluegrey-100 transition-colors"
                                  aria-label="Toggle applications"
                                >
                                  {expandedRoles.has(role.id) ? (
                                    <ChevronDown className="h-5 w-5 text-bluegrey-700" />
                                  ) : (
                                    <ChevronRight className="h-5 w-5 text-bluegrey-700" />
                                  )}
                                </button>
                              </TableExpandCell>
                              <TableCell>
                                <span className="text-sm text-bluegrey-900">
                                  {role.name} ({role.applications} application{role.applications !== 1 ? 's' : ''})
                                </span>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-bluegrey-900">
                                    {role.startDate} {role.endDate ? `- ${role.endDate}` : '- No end date'}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setIsValidityModalOpen(true)}
                                    className="flex h-10 w-10 items-center justify-center rounded hover:bg-bluegrey-100 transition-colors flex-shrink-0"
                                    aria-label="Edit validity period"
                                  >
                                    <Pencil className="h-6 w-6 text-bluegrey-700" />
                                  </button>
                                </div>
                              </TableCell>
                              <TableActionCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <button className="flex h-10 w-10 items-center justify-center rounded hover:bg-bluegrey-100 transition-colors">
                                      <MoreVertical className="h-6 w-6 text-bluegrey-700" />
                                    </button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setIsValidityModalOpen(true)}>
                                      Edit validity period
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>Remove access role</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableActionCell>
                            </TableRow>
                            {expandedRoles.has(role.id) && (
                              <TableNestedRow colSpan={4}>
                                <TableExpandCell></TableExpandCell>
                                <TableNestedCell colSpan={3}>
                                  <NestedTable>
                                    <NestedTableHeader>
                                      <NestedTableHeadRow>
                                        <NestedTableHeadCell>Application</NestedTableHeadCell>
                                        <NestedTableHeadCell>Permissions</NestedTableHeadCell>
                                      </NestedTableHeadRow>
                                    </NestedTableHeader>
                                    <NestedTableBody>
                                      {(applicationsList[role.id] || []).map((app, appIndex) => (
                                        <NestedTableRow key={appIndex}>
                                          <NestedTableCell>
                                            <span className="text-xs text-bluegrey-900">{app.name}</span>
                                          </NestedTableCell>
                                          <NestedTableCell>
                                            <div className="flex flex-wrap gap-1">
                                              {app.permissions.map((permission, permIndex) => (
                                                <span
                                                  key={permIndex}
                                                  className="inline-block bg-bluegrey-100 text-bluegrey-900 px-1.5 py-0.5 rounded text-xs"
                                                >
                                                  {permission}
                                                </span>
                                              ))}
                                            </div>
                                          </NestedTableCell>
                                        </NestedTableRow>
                                      ))}
                                    </NestedTableBody>
                                  </NestedTable>
                                </TableNestedCell>
                              </TableNestedRow>
                            )}
                          </React.Fragment>
                        ))
                      ) : (
                        <TableEmptyState colSpan={4} message="Ready to assign access roles" />
                      )}
                    </TableBody>
                  </TableContent>
                </TableScroll>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="events" className="pt-6">
            <div className="flex flex-col gap-4">
              {/* Search and Filter Bar */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="w-full sm:w-[280px]">
                  <div className="relative">
                    <div className="flex items-center gap-2 px-2 py-3 border border-bluegrey-500 rounded-sm bg-white">
                      <input
                        type="text"
                        placeholder="Search"
                        value={eventSearchQuery}
                        onChange={(e) => setEventSearchQuery(e.target.value)}
                        className="flex-1 text-sm text-bluegrey-500 placeholder:text-bluegrey-500 outline-none bg-transparent"
                      />
                    </div>
                  </div>
                </div>
                <button
                  onClick={addEventFilter}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-bluegrey-100 rounded-full hover:bg-bluegrey-200 transition-colors cursor-pointer"
                >
                  <PlusCircle className="w-5 h-5 text-bluegrey-900" />
                  <span className="text-base text-bluegrey-900">Add filter</span>
                </button>
              </div>

              {/* Active Filters */}
              {eventFilters.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  {eventFilters.map((filter) => (
                    <div
                      key={filter.id}
                      className="flex items-center gap-2 p-2 bg-bluegrey-50 border border-bluegrey-200 rounded-sm"
                    >
                      <select
                        value={filter.column}
                        onChange={(e) =>
                          updateEventFilter(
                            filter.id,
                            e.target.value,
                            undefined,
                            undefined
                          )
                        }
                        className="text-xs bg-transparent text-bluegrey-900 outline-none border-r border-bluegrey-300 pr-2"
                      >
                        <option value="date">Date</option>
                        <option value="eventType">Event Type</option>
                        <option value="application">Application</option>
                        <option value="userId">User ID</option>
                        <option value="clientIp">Client IP</option>
                        <option value="identityApp">Identity App</option>
                        <option value="description">Description</option>
                      </select>
                      <select
                        value={filter.operator}
                        onChange={(e) =>
                          updateEventFilter(
                            filter.id,
                            undefined,
                            e.target.value,
                            undefined
                          )
                        }
                        className="text-xs bg-transparent text-bluegrey-900 outline-none border-r border-bluegrey-300 pr-2"
                      >
                        <option value="contains">Contains</option>
                        <option value="equals">Equals</option>
                        <option value="startsWith">Starts with</option>
                        <option value="endsWith">Ends with</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Value"
                        value={filter.value}
                        onChange={(e) =>
                          updateEventFilter(
                            filter.id,
                            undefined,
                            undefined,
                            e.target.value
                          )
                        }
                        className="text-xs bg-transparent text-bluegrey-900 outline-none flex-1 px-2"
                      />
                      <button
                        onClick={() => removeEventFilter(filter.id)}
                        className="text-bluegrey-500 hover:text-bluegrey-900 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

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
          </TabsContent>
        </Tabs>
      </div>
      </div>

      <Dialog open={isValidityModalOpen} onOpenChange={setIsValidityModalOpen}>
        <DialogContent className="max-w-[480px] border-0 bg-white p-0 rounded-sm shadow-[0_24px_38px_0_rgba(1,5,50,0.04),4px_9px_46px_0_rgba(1,5,50,0.04),0_11px_15px_0_rgba(1,5,50,0.08)]">
          <div className="flex items-start justify-between px-6 py-4">
            <DialogHeader className="text-left">
              <DialogTitle className="text-xl font-medium leading-8 text-bluegrey-900">
                Edit validity period
              </DialogTitle>
            </DialogHeader>
            <DialogClose className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[2px] hover:bg-bluegrey-50 transition-colors">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="#383A4B"/>
              </svg>
            </DialogClose>
          </div>

          <div className="px-6 py-4">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-1">
                <Label htmlFor="modal-start-date" className="text-sm font-normal text-bluegrey-900">
                  Start date
                </Label>
                <div className="relative">
                  <Input
                    id="modal-start-date"
                    type="text"
                    value={modalStartDate}
                    onChange={(e) => setModalStartDate(e.target.value)}
                    className="rounded-[2px] border-bluegrey-500 pr-10 text-sm"
                    placeholder="2025/04/18"
                  />
                  <Calendar className="absolute right-2 top-1/2 h-5 w-5 -translate-y-1/2 text-bluegrey-900 pointer-events-none" />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <Label className="text-sm font-normal text-bluegrey-900">End date</Label>
                <RadioGroup
                  value={modalEndDateOption}
                  onValueChange={(value) => setModalEndDateOption(value as "no-end" | "custom")}
                  className="gap-3"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="no-end" id="modal-no-end" className="border-bluegrey-500" />
                    <Label htmlFor="modal-no-end" className="cursor-pointer text-sm font-normal text-bluegrey-900">
                      No end date
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="custom" id="modal-custom" className="border-bluegrey-500" />
                    <Label htmlFor="modal-custom" className="cursor-pointer text-sm font-normal text-bluegrey-900">
                      Custom date
                    </Label>
                  </div>
                </RadioGroup>

                {modalEndDateOption === "custom" && (
                  <div className="ml-7 mt-2">
                    <div className="relative">
                      <Input
                        type="text"
                        value={modalEndDate}
                        onChange={(e) => setModalEndDate(e.target.value)}
                        className="rounded-[2px] border-bluegrey-500 pr-10 text-sm"
                        placeholder="2025/04/18"
                      />
                      <Calendar className="absolute right-2 top-1/2 h-5 w-5 -translate-y-1/2 text-bluegrey-900 pointer-events-none" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-[#DEDEE6] px-6 py-4">
            <div className="flex items-center justify-between gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsValidityModalOpen(false)}
                className="rounded-[2px] text-bluegrey-700"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setIsValidityModalOpen(false);
                  setShowSuccessAlert(true);
                }}
                className="gap-2 rounded-[2px] bg-blue-500 hover:bg-opacity-90"
              >
                <Save className="h-5 w-5" />
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {showSuccessAlert && (
        <SuccessAlert
          message="Validity period updated successfully"
          onClose={() => setShowSuccessAlert(false)}
        />
      )}
    </Layout>
  );
}
