import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  Save,
  MoreVertical,
  Pencil,
  Calendar,
  ChevronDown,
  ChevronRight,
  PlusCircle,
  Search,
  Trash2,
  ArrowLeft,
  Lock,
  MessageSquare,
  Mail,
  Clock,
  QrCode,
  Link2,
  Bell,
  Chrome,
  Key,
  Smartphone,
  Globe,
  X,
  AlertTriangle,
  Loader2,
  CheckCircle,
} from "lucide-react";
import Layout from "@/components/Layout";
import UserDetailHeader from "@/components/UserDetailHeader";
import SuccessAlert from "@/components/SuccessAlert";
import InfoAlert from "@/components/InfoAlert";
import SearchBar from "@/components/SearchBar";
import FilterBar from "@/components/FilterBar";
import FilterTag from "@/components/FilterTag";
import EventLogSummary from "@/components/EventLogSummary";
import AuthenticatorActivityDashboard from "@/components/AuthenticatorActivityDashboard";
import { generateMockEvents } from "@/components/mockEvents";
import { AIAssistant } from "@/components/aiAssistant/AIAssistant";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
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
  const [searchParams] = useSearchParams();
  const organizationFromUrl = searchParams.get("organization");
  const [userAuthenticators, setUserAuthenticators] = useState<string[]>(
    []
  );
  const [endDateOption, setEndDateOption] = useState<"no-end" | "custom">(
    "custom",
  );
  const [isValidityModalOpen, setIsValidityModalOpen] = useState(false);
  const [modalStartDate, setModalStartDate] = useState("2025/04/18");
  const [modalEndDateOption, setModalEndDateOption] = useState<
    "no-end" | "custom"
  >("custom");
  const [modalEndDate, setModalEndDate] = useState("2025/04/18");
  const [expandedRoles, setExpandedRoles] = useState<Set<string>>(new Set());
  interface Alert {
    id: string;
    message: string;
    type: "success" | "info";
  }
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [accessRoleSearchQuery, setAccessRoleSearchQuery] = useState("");
  const [eventSearchQuery, setEventSearchQuery] = useState("");
  const [eventFilters, setEventFilters] = useState<
    Array<{ id: string; column: string; operator: string; value: string }>
  >([]);
  const [events] = useState(() => generateMockEvents());
  const [selectedCardForReview, setSelectedCardForReview] = useState<{ cardType: string; data: any } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address1: "",
    address2: "",
    city: "",
    postalCode: "",
    country: "",
    startDate: "2025-04-18",
    endDate: "2025-04-18",
  });
  const [openSideSheet, setOpenSideSheet] = useState<string | null>(null);
  const [usernameEmail, setUsernameEmail] = useState("");
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const [isSavingUsername, setIsSavingUsername] = useState(false);
  const [isSavingTempPassword, setIsSavingTempPassword] = useState(false);
  const [usernameSuccess, setUsernameSuccess] = useState(false);
  const [tempPasswordSuccess, setTempPasswordSuccess] = useState(false);
  const [resetPasswordSuccess, setResetPasswordSuccess] = useState(false);
  const [removePasswordSuccess, setRemovePasswordSuccess] = useState(false);
  const [tempPasswordError, setTempPasswordError] = useState("");
  const [newPhoneNumber, setNewPhoneNumber] = useState("");
  const [isPhoneOtpDialogOpen, setIsPhoneOtpDialogOpen] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState("");
  const [isVerifyingPhoneOtp, setIsVerifyingPhoneOtp] = useState(false);
  const [phoneOtpError, setPhoneOtpError] = useState("");
  const [phoneUpdateSuccess, setPhoneUpdateSuccess] = useState(false);
  const [removePhoneSuccess, setRemovePhoneSuccess] = useState(false);

  // Generate random past timestamp for "Last used"
  // Static timestamps for authenticators
  const allAuthenticators = {
    authenticators: [
      "Username & Password",
      "SMS OTP",
      "Email OTP",
      "TOTP",
      "QR code Enrollment",
      "Magic link authentication",
      "Push MFA",
    ],
    externalProviders: [
      "Google",
      "Facebook",
      "Apple",
      "DigiD",
      "eHerkenning",
      "Microsoft EntraID",
      "Microsoft AD",
    ],
    passkeys: [
      "iCloud Keychain",
      "Safenet FIDO Key",
      "Chrome Passkey",
      "Yubikey",
    ],
  };

  const authenticatorTimestamps: Record<string, string> = {
    "Username & Password": "Jan 19, 2025 02:45 PM",
    "SMS OTP": "Jan 18, 2025 10:15 AM",
    "Email OTP": "Jan 17, 2025 05:30 PM",
    "TOTP": "Jan 16, 2025 03:20 PM",
    "QR code Enrollment": "Jan 15, 2025 11:10 AM",
    "Magic link authentication": "Jan 14, 2025 08:45 AM",
    "Push MFA": "Jan 13, 2025 04:15 PM",
    "Google": "Jan 15, 2025 09:30 AM",
    "Facebook": "Jan 12, 2025 02:15 PM",
    "Apple": "Jan 10, 2025 11:45 AM",
    "DigiD": "Jan 08, 2025 04:20 PM",
    "eHerkenning": "Jan 05, 2025 10:10 AM",
    "Microsoft EntraID": "Jan 02, 2025 03:50 PM",
    "Microsoft AD": "Dec 28, 2024 08:25 AM",
    "iCloud Keychain": "Jan 18, 2025 05:40 PM",
    "Safenet FIDO Key": "Jan 16, 2025 01:15 PM",
    "Chrome Passkey": "Jan 14, 2025 07:30 AM",
    "Yubikey": "Jan 11, 2025 09:45 AM",
  };

  // Generate deterministic authenticators for each user based on email
  const generateUserAuthenticators = (email: string): string[] => {
    // For Alison Adams, return all available authenticators
    if (email === "alison.adams@example.com") {
      return [
        ...allAuthenticators.authenticators,
        ...allAuthenticators.externalProviders,
        ...allAuthenticators.passkeys,
      ];
    }

    // Simple hash function to generate consistent "random" number from email
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      const char = email.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    // Use hash to seed random selection
    const seededRandom = (index: number) => {
      const seed = hash + index;
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    const selected: string[] = ["Username & Password"];
    const allOptions = [
      ...allAuthenticators.authenticators.slice(1),
      ...allAuthenticators.externalProviders,
      ...allAuthenticators.passkeys,
    ];

    // Randomly select 3-6 additional authenticators (total 4-7)
    const additionalCount = Math.floor(seededRandom(1) * 4) + 3; // 3 to 6

    const shuffled = [...allOptions].sort(
      (a, b) => seededRandom(allOptions.indexOf(a)) - seededRandom(allOptions.indexOf(b))
    );

    selected.push(...shuffled.slice(0, additionalCount));
    return selected;
  };

  const getAuthenticatorTimestamp = (name: string): string => {
    return authenticatorTimestamps[name] || "Never used";
  };

  const iconMap: Record<string, React.ReactNode> = {
    "Username & Password": <Lock className="h-5 w-5 text-bluegrey-600" />,
    "SMS OTP": <MessageSquare className="h-5 w-5 text-bluegrey-600" />,
    "Email OTP": <Mail className="h-5 w-5 text-bluegrey-600" />,
    "TOTP": <Clock className="h-5 w-5 text-bluegrey-600" />,
    "QR code Enrollment": <QrCode className="h-5 w-5 text-bluegrey-600" />,
    "Magic link authentication": <Link2 className="h-5 w-5 text-bluegrey-600" />,
    "Push MFA": <Bell className="h-5 w-5 text-bluegrey-600" />,
    "Google": <Globe className="h-5 w-5 text-bluegrey-600" />,
    "Facebook": <Globe className="h-5 w-5 text-bluegrey-600" />,
    "Apple": <Globe className="h-5 w-5 text-bluegrey-600" />,
    "DigiD": <Globe className="h-5 w-5 text-bluegrey-600" />,
    "eHerkenning": <Globe className="h-5 w-5 text-bluegrey-600" />,
    "Microsoft EntraID": <Globe className="h-5 w-5 text-bluegrey-600" />,
    "Microsoft AD": <Globe className="h-5 w-5 text-bluegrey-600" />,
    "iCloud Keychain": <Key className="h-5 w-5 text-bluegrey-600" />,
    "Safenet FIDO Key": <Key className="h-5 w-5 text-bluegrey-600" />,
    "Chrome Passkey": <Chrome className="h-5 w-5 text-bluegrey-600" />,
    "Yubikey": <Smartphone className="h-5 w-5 text-bluegrey-600" />,
  };

  const getAuthenticatorIcon = (name: string | null) => {
    return iconMap[name || ""] || null;
  };

  const getAuthenticatorStatus = (authName: string): "healthy" | "alert" => {
    // Count failed authentication attempts for this authenticator
    const failedAttempts = events.filter(
      event =>
        event.description.toLowerCase().includes("failed") &&
        event.description.toLowerCase().includes(authName.toLowerCase())
    ).length;

    // Determine status based on failed attempts (both error and warning use alert state)
    if (failedAttempts >= 1) {
      return "alert"; // Any failures = alert state
    }
    return "healthy";
  };

  const getSecurityTabStatus = (): "healthy" | "alert" => {
    // Check all user authenticators for any issues
    const hasAlert = userAuthenticators.some(
      auth => getAuthenticatorStatus(auth) === "alert"
    );

    return hasAlert ? "alert" : "healthy";
  };

  const handleAuthenticatorCardClick = (authName: string) => {
    setOpenSideSheet(authName);
    if (authName === "Username & Password") {
      setUsernameEmail(user?.email || "");
    }
  };

  const renderAuthenticatorCard = (authName: string) => {
    const status = getAuthenticatorStatus(authName);
    const borderColor = {
      healthy: "border-bluegrey-100",
      alert: "border-orange-400",
    }[status];

    const bgColor = {
      healthy: "bg-white",
      alert: "bg-white",
    }[status];

    const hoverBg = {
      healthy: "hover:bg-bluegrey-50",
      alert: "hover:bg-orange-50",
    }[status];

    const selectedBg = {
      healthy: "bg-bluegrey-50",
      alert: "bg-orange-50",
    }[status];

    return (
      <button
        key={authName}
        onClick={() => handleAuthenticatorCardClick(authName)}
        className={`border rounded py-4 px-6 flex items-center gap-3 transition-all cursor-pointer text-left ${borderColor} ${
          openSideSheet === authName ? selectedBg : `${bgColor} ${hoverBg}`
        }`}
      >
        {getAuthenticatorIcon(authName)}
        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-medium text-black leading-6">
              {authName}
            </h3>
            {status === "alert" && (
              <div className="flex items-center gap-1">
                <AlertTriangle className="h-4 w-4 text-orange-600 flex-shrink-0" />
                <span className="text-xs font-semibold text-orange-600">Alert</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-bluegrey-600 leading-6">
            <span>Location: Ottawa, ON, Canada</span>
            <span>Last used: {getAuthenticatorTimestamp(authName)}</span>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-bluegrey-600 flex-shrink-0" />
      </button>
    );
  };

  const authenticatorLocation = "Ottawa, ON, Canada";


  const handleCloseSideSheet = () => {
    setOpenSideSheet(null);
    setUsernameEmail("");
    setTemporaryPassword("");
  };


  // Fetch user data based on username (email)
  const decodedId = id ? decodeURIComponent(id) : null;
  const foundUser = decodedId ? getUserByUsername(decodedId) : null;

  const user = useMemo(
    () =>
      foundUser
        ? {
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
            startDate: "2025-04-18",
            endDate: "2025-04-18",
            organization: organizationFromUrl || "InsurCar",
            status: foundUser.status,
            accessRoles: foundUser.accessRoles || [],
          }
        : null,
    [foundUser, organizationFromUrl],
  );

  // Generate authenticators for the user based on their email
  useEffect(() => {
    if (user) {
      const auths = generateUserAuthenticators(user.email);
      setUserAuthenticators(auths);
    }
  }, [user]);

  // Initialize form data when user is loaded
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        address1: user.address1,
        address2: user.address2,
        city: user.city,
        postalCode: user.postalCode,
        country: user.country,
        startDate: user.startDate,
        endDate: user.endDate,
      });
    }
  }, [user]);

  // Focus on first form field on page load
  useEffect(() => {
    const firstInput = document.querySelector("#firstName") as HTMLInputElement;
    if (firstInput) {
      firstInput.focus();
    }
  }, []);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleCountryChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      country: value,
    }));
  };

  const handleSaveBasicInfo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);

    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      showAlert("Changes saved successfully.", "success");
    }, 1500);
  };

  const applicationsList: Record<
    string,
    Array<{ name: string; permissions: string[] }>
  > = {
    "1": [
      {
        name: "Claims Management System",
        permissions: ["View claims", "Create claims", "Approve claims"],
      },
      {
        name: "Policy Database",
        permissions: ["View policies", "Export data"],
      },
      {
        name: "Customer Portal",
        permissions: ["View customer info", "Update contact"],
      },
      {
        name: "Analytics Dashboard",
        permissions: ["View reports", "Access metrics"],
      },
      {
        name: "Audit Logger",
        permissions: ["View logs", "Export audit trail"],
      },
    ],
    "2": [
      {
        name: "Customer Helpdesk",
        permissions: ["View tickets", "Resolve tickets", "Escalate issues"],
      },
      {
        name: "Appointment Scheduler",
        permissions: ["View appointments", "Book appointments"],
      },
      {
        name: "CRM System",
        permissions: ["View customers", "Update customer info"],
      },
    ],
    "3": [
      {
        name: "Document Management",
        permissions: ["View documents", "Upload documents", "Archive docs"],
      },
      { name: "Policy Database", permissions: ["View policies"] },
      { name: "Email Service", permissions: ["Send emails", "Track opens"] },
      {
        name: "Template Builder",
        permissions: ["View templates", "Create templates"],
      },
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

  const showAlert = useCallback((message: string, type: "success" | "info") => {
    const alertId = `alert-${Date.now()}-${Math.random()}`;
    const newAlert: Alert = { id: alertId, message, type };
    setAlerts((prev) => [...prev, newAlert]);
  }, []);

  const removeAlert = useCallback((alertId: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
  }, []);

  const addEventFilter = (filter: {
    id: string;
    column: string;
    operator: string;
    value: string;
  }) => {
    // Check if the same filter already exists
    const isDuplicate = eventFilters.some(
      (existingFilter) =>
        existingFilter.column === filter.column &&
        existingFilter.operator === filter.operator &&
        existingFilter.value === filter.value,
    );

    if (isDuplicate) {
      showAlert("This filter already applied.", "info");
      return;
    }

    setEventFilters([...eventFilters, filter]);
  };

  const removeEventFilter = (id: string) => {
    setEventFilters(eventFilters.filter((f) => f.id !== id));
  };

  const clearAllEventFilters = () => {
    setEventFilters([]);
  };

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
                  value="security"
                  className="relative rounded-none border-b-4 border-transparent px-4 py-2 text-base font-normal data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-blue-500 data-[state=active]:shadow-none flex items-center gap-2"
                >
                  Security
                  {getSecurityTabStatus() === "alert" && (
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                  )}
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
              <form
                onSubmit={handleSaveBasicInfo}
                className="flex flex-col gap-10"
              >
                <div className="flex w-full max-w-sm flex-col gap-6">
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="firstName">First name</Label>
                    <input
                      id="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleFormChange}
                      disabled={isSaving}
                      className="flex w-full rounded-[2px] border border-bluegrey-500 bg-white px-2 py-3 text-sm text-bluegrey-900 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <Label htmlFor="lastName">Last name</Label>
                    <input
                      id="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={handleFormChange}
                      disabled={isSaving}
                      className="flex w-full rounded-[2px] border border-bluegrey-500 bg-white px-2 py-3 text-sm text-bluegrey-900 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <Label htmlFor="email">Email ID</Label>
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      readOnly
                      className="flex w-full rounded-[2px] border border-bluegrey-100 bg-white px-2 py-3 text-sm text-bluegrey-900 cursor-text"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <Label htmlFor="phone">Phone number</Label>
                    <input
                      id="phone"
                      type="text"
                      value={formData.phone}
                      onChange={handleFormChange}
                      disabled={isSaving}
                      className="flex w-full rounded-[2px] border border-bluegrey-500 bg-white px-2 py-3 text-sm text-bluegrey-900 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <Label htmlFor="address1">Address 1</Label>
                    <input
                      id="address1"
                      type="text"
                      value={formData.address1}
                      onChange={handleFormChange}
                      disabled={isSaving}
                      className="flex w-full rounded-[2px] border border-bluegrey-500 bg-white px-2 py-3 text-sm text-bluegrey-900 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <Label htmlFor="address2">Address 2</Label>
                    <input
                      id="address2"
                      type="text"
                      value={formData.address2}
                      onChange={handleFormChange}
                      disabled={isSaving}
                      className="flex w-full rounded-[2px] border border-bluegrey-500 bg-white px-2 py-3 text-sm text-bluegrey-900 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <Label htmlFor="city">City</Label>
                    <input
                      id="city"
                      type="text"
                      value={formData.city}
                      onChange={handleFormChange}
                      disabled={isSaving}
                      className="flex w-full rounded-[2px] border border-bluegrey-500 bg-white px-2 py-3 text-sm text-bluegrey-900 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <Label htmlFor="postalCode">Postal code</Label>
                    <input
                      id="postalCode"
                      type="text"
                      value={formData.postalCode}
                      onChange={handleFormChange}
                      disabled={isSaving}
                      className="flex w-full rounded-[2px] border border-bluegrey-500 bg-white px-2 py-3 text-sm text-bluegrey-900 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <Label htmlFor="country">Country</Label>
                    <Select
                      value={formData.country}
                      onValueChange={handleCountryChange}
                      disabled={isSaving}
                    >
                      <SelectTrigger className="rounded-[2px] border-bluegrey-500 px-2 py-3 text-sm text-bluegrey-900 h-auto">
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
                      <h3 className="text-xl font-bold text-blue-500">
                        Validity period
                      </h3>
                      <p className="text-xs text-bluegrey-700">
                        Period during which user is authorize to access content
                        in context of this organization.
                      </p>
                    </div>

                    <div className="rounded bg-bluegrey-50 p-6">
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                          <Label htmlFor="startDate" className="flex gap-1">
                            Start date
                            <span className="font-medium text-red-500">*</span>
                          </Label>
                          <input
                            id="startDate"
                            type="date"
                            value={formData.startDate}
                            onChange={handleFormChange}
                            disabled={isSaving}
                            className="flex w-full rounded-[2px] border border-bluegrey-500 bg-white px-2 pr-10 py-3 text-sm text-bluegrey-900 disabled:cursor-not-allowed disabled:opacity-50"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <Label>End date</Label>
                          <RadioGroup
                            value={endDateOption}
                            onValueChange={(value) =>
                              setEndDateOption(value as "no-end" | "custom")
                            }
                            className="gap-3"
                            disabled={isSaving}
                          >
                            <div className="flex items-center gap-2">
                              <RadioGroupItem
                                value="no-end"
                                id="no-end"
                                disabled={isSaving}
                              />
                              <Label
                                htmlFor="no-end"
                                className="cursor-pointer font-normal"
                              >
                                No end date
                              </Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <RadioGroupItem
                                value="custom"
                                id="custom"
                                disabled={isSaving}
                              />
                              <Label
                                htmlFor="custom"
                                className="cursor-pointer font-normal"
                              >
                                Custom date
                              </Label>
                            </div>
                          </RadioGroup>

                          {endDateOption === "custom" && (
                            <div className="ml-7 mt-2">
                              <input
                                type="date"
                                id="endDate"
                                value={formData.endDate}
                                onChange={handleFormChange}
                                disabled={isSaving}
                                className="flex w-full rounded-[2px] border border-bluegrey-500 bg-white px-2 pr-10 py-3 text-sm text-bluegrey-900 disabled:cursor-not-allowed disabled:opacity-50"
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
                    disabled={isSaving}
                    className="gap-2 rounded-[2px] bg-blue-500 hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="h-5 w-5" />
                    {isSaving ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => navigate("/")}
                    disabled={isSaving}
                    className="rounded-[2px] text-bluegrey-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="security" className="pt-6">
              {user?.status === "Inactive" ? (
                <div className="flex items-center justify-center min-h-96">
                  <div className="text-center">
                    <p className="text-bluegrey-600 text-lg font-medium">
                      No authenticators configured
                    </p>
                    <p className="text-bluegrey-500 text-sm mt-2">
                      No authenticators linked to this user's account.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col">
                  {/* Activity Dashboard - Highlighted Section */}
                  <div className="bg-gradient-to-br from-blue-50/50 to-transparent border border-blue-100/40 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-blue-500 mb-4">
                      Activity Overview
                    </h2>
                    <AuthenticatorActivityDashboard
                      events={events}
                      authenticatorCategories={allAuthenticators}
                      onReviewCard={(cardType, data) => {
                        setSelectedCardForReview({ cardType, data });
                      }}
                    />
                  </div>

                  {/* Render Authenticators */}
                  {userAuthenticators.some(auth => allAuthenticators.authenticators.includes(auth)) && (
                    <div className="mt-10">
                      <h2 className="text-xl font-semibold text-blue-500 mb-4">
                        Authenticators
                      </h2>
                      <div className="flex flex-col gap-4 max-w-3xl">
                        {userAuthenticators
                          .filter(auth => allAuthenticators.authenticators.includes(auth))
                          .map(auth => renderAuthenticatorCard(auth))}
                      </div>
                    </div>
                  )}

                  {/* Render External Identity Providers */}
                  {userAuthenticators.some(auth => allAuthenticators.externalProviders.includes(auth)) && (
                    <div className="mt-10">
                      <h2 className="text-xl font-semibold text-blue-500 mb-4">
                        External Identity Providers
                      </h2>
                      <div className="flex flex-col gap-4 max-w-3xl">
                        {userAuthenticators
                          .filter(auth => allAuthenticators.externalProviders.includes(auth))
                          .map(auth => renderAuthenticatorCard(auth))}
                      </div>
                    </div>
                  )}

                  {/* Render Passkeys */}
                  {userAuthenticators.some(auth => allAuthenticators.passkeys.includes(auth)) && (
                    <div className="mt-10">
                      <h2 className="text-xl font-semibold text-blue-500 mb-4">
                        Passkeys
                      </h2>
                      <div className="flex flex-col gap-4 max-w-3xl">
                        {userAuthenticators
                          .filter(auth => allAuthenticators.passkeys.includes(auth))
                          .map(auth => renderAuthenticatorCard(auth))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="access" className="pt-6">
              <div className="flex flex-col gap-6">
                {/* Toolbar */}
                <div className="flex items-center justify-between gap-3">
                  <SearchBar
                    value={accessRoleSearchQuery}
                    onChange={setAccessRoleSearchQuery}
                    placeholder="Search access roles"
                    width="w-full max-w-md"
                  />
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
                              <TableRow
                                expandable
                                isExpanded={expandedRoles.has(role.id)}
                              >
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
                                    {role.name} ({role.applications} application
                                    {role.applications !== 1 ? "s" : ""})
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-bluegrey-900">
                                      {role.startDate}{" "}
                                      {role.endDate
                                        ? `- ${role.endDate}`
                                        : "- No end date"}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setIsValidityModalOpen(true)
                                      }
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
                                      <DropdownMenuItem
                                        onClick={() =>
                                          setIsValidityModalOpen(true)
                                        }
                                      >
                                        Edit validity period
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>
                                        Remove access role
                                      </DropdownMenuItem>
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
                                          <NestedTableHeadCell>
                                            Application
                                          </NestedTableHeadCell>
                                          <NestedTableHeadCell>
                                            Permissions
                                          </NestedTableHeadCell>
                                        </NestedTableHeadRow>
                                      </NestedTableHeader>
                                      <NestedTableBody>
                                        {(applicationsList[role.id] || []).map(
                                          (app, appIndex) => (
                                            <NestedTableRow key={appIndex}>
                                              <NestedTableCell>
                                                <span className="text-xs text-bluegrey-900">
                                                  {app.name}
                                                </span>
                                              </NestedTableCell>
                                              <NestedTableCell>
                                                <div className="flex flex-wrap gap-1">
                                                  {app.permissions.map(
                                                    (permission, permIndex) => (
                                                      <span
                                                        key={permIndex}
                                                        className="inline-block bg-bluegrey-100 text-bluegrey-900 px-1.5 py-0.5 rounded text-xs"
                                                      >
                                                        {permission}
                                                      </span>
                                                    ),
                                                  )}
                                                </div>
                                              </NestedTableCell>
                                            </NestedTableRow>
                                          ),
                                        )}
                                      </NestedTableBody>
                                    </NestedTable>
                                  </TableNestedCell>
                                </TableNestedRow>
                              )}
                            </React.Fragment>
                          ))
                        ) : (
                          <TableEmptyState
                            colSpan={4}
                            message="Ready to assign access roles"
                          />
                        )}
                      </TableBody>
                    </TableContent>
                  </TableScroll>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="events" className="pt-6">
              <div className="flex flex-col gap-6">
                <FilterBar
                  columns={[
                    { value: "date", label: "Date" },
                    { value: "eventType", label: "Event type" },
                    { value: "application", label: "Application" },
                    { value: "userId", label: "User ID" },
                    { value: "clientIp", label: "Client IP" },
                    { value: "requestId", label: "Trace ID" },
                    { value: "userAgent", label: "User agent" },
                    { value: "identityApp", label: "Identity app" },
                    { value: "identityAppInstanceId", label: "Identity app instance ID" },
                    { value: "subject", label: "Subject" },
                  ]}
                  filters={eventFilters}
                  onFilterAdd={addEventFilter}
                  onFilterRemove={removeEventFilter}
                  onClearFilters={clearAllEventFilters}
                  searchValue={eventSearchQuery}
                  onSearchChange={setEventSearchQuery}
                  searchPlaceholder="Search events"
                />

                <EventLogSummary
                  filters={eventFilters}
                  searchQuery={eventSearchQuery}
                  onFilterAdd={addEventFilter}
                  events={events}
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Side Sheet for Section Details */}
          <Sheet open={!!openSideSheet} onOpenChange={(open) => !open && handleCloseSideSheet()}>
            <SheetContent side="right" className="w-full sm:w-[402px] p-0 flex flex-col gap-0">
              <div className="relative flex items-center justify-start px-6 py-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex-shrink-0">
                    {getAuthenticatorIcon(openSideSheet)}
                  </div>
                  <div className="flex flex-col gap-0.5 flex-1">
                    <SheetTitle asChild>
                      <h2 className="text-xl font-bold text-bluegrey-750">
                        {openSideSheet}
                      </h2>
                    </SheetTitle>
                  </div>
                </div>
                <button
                  onClick={handleCloseSideSheet}
                  className="absolute right-6 flex items-center justify-center w-10 h-10 rounded hover:bg-bluegrey-50 transition-colors flex-shrink-0"
                  style={{ top: "11px" }}
                  aria-label="Close sheet"
                >
                  <X className="w-6 h-6 text-bluegrey-700" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-6">
              {/* Last Access Section */}
              <div className="flex flex-col gap-3 mb-6 p-4 border border-bluegrey-100 rounded bg-bluegrey-25">
                <h3 className="text-sm font-semibold text-bluegrey-900">Last Access</h3>
                <div className="flex flex-col gap-2 text-xs text-bluegrey-700">
                  <div className="flex items-center gap-2">
                    <span className="text-bluegrey-600 min-w-fit">Location:</span>
                    <span>{authenticatorLocation}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-bluegrey-600 min-w-fit">Date & Time:</span>
                    <span>{openSideSheet ? getAuthenticatorTimestamp(openSideSheet) : "Never used"}</span>
                  </div>
                </div>
              </div>

              {/* Username & Password Section */}
              {openSideSheet === "Username & Password" && (
                <div className="flex flex-col gap-6">
                  {/* Update Username Section */}
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <h3 className="text-xl font-semibold text-blue-500">User name</h3>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="usernameEmail">Email address</Label>
                      <input
                        id="usernameEmail"
                        type="email"
                        value={usernameEmail || user?.email}
                        onChange={(e) => {
                          setUsernameEmail(e.target.value);
                          setUsernameSuccess(false);
                        }}
                        disabled={isSavingUsername}
                        className="flex w-full rounded-[2px] border border-bluegrey-500 bg-white px-2 py-3 text-sm text-bluegrey-900 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                    {usernameSuccess && (
                      <div className="flex items-start rounded-[2px] bg-green-50 relative">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500 rounded-l-[2px]"></div>
                        <div className="flex items-center gap-3 flex-1 pl-6 pr-3 py-2">
                          <div className="flex items-start gap-2 flex-1 py-2">
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-bluegrey-900 leading-5">
                                Username updated successfully
                              </p>
                            </div>
                          </div>
                          <div className="flex justify-end items-center">
                            <button
                              onClick={() => setUsernameSuccess(false)}
                              className="flex w-10 h-10 items-center justify-center rounded-[2px] hover:bg-bluegrey-100 transition-colors flex-shrink-0"
                              aria-label="Close alert"
                            >
                              <X className="w-6 h-6 text-bluegrey-700" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    <Button
                      onClick={() => {
                        setIsSavingUsername(true);
                        setUsernameSuccess(false);
                        setTimeout(() => {
                          setIsSavingUsername(false);
                          setUsernameSuccess(true);
                        }, 1500);
                      }}
                      disabled={isSavingUsername}
                      variant="outline"
                      className="mt-3 mb-6 rounded-[2px] border-2 border-[#041295] text-[#041295] hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed h-auto px-3 py-2 gap-2 w-fit"
                    >
                      {isSavingUsername ? "Updating..." : "Update"}
                    </Button>
                  </div>

                  {/* Password Section */}
                  <div className="flex flex-col gap-4 pt-6 border-t border-bluegrey-200">
                    <h2 className="text-xl font-semibold text-blue-500">Password</h2>

                    {/* Set Temporary Password */}
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-1">
                        <h3 className="text-base font-semibold text-bluegrey-900">Set temporary password</h3>
                        <p className="text-xs text-bluegrey-700">
                          User will be required to change password on next login
                        </p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Label htmlFor="temporaryPassword">Password</Label>
                        <input
                          id="temporaryPassword"
                          type="text"
                          value={temporaryPassword}
                          onChange={(e) => {
                            setTemporaryPassword(e.target.value);
                            setTempPasswordSuccess(false);
                            setTempPasswordError("");
                          }}
                          disabled={isSavingTempPassword}
                          placeholder="Enter temporary password"
                          className="flex w-full rounded-[2px] border border-bluegrey-500 bg-white px-2 py-3 text-sm text-bluegrey-900 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        {tempPasswordError && (
                          <p className="text-xs text-red-500 mt-1">
                            {tempPasswordError}
                          </p>
                        )}
                      </div>
                      {tempPasswordSuccess && (
                        <div className="flex items-start rounded-[2px] bg-green-50 relative">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500 rounded-l-[2px]"></div>
                          <div className="flex items-center gap-3 flex-1 pl-6 pr-3 py-2">
                            <div className="flex items-start gap-2 flex-1 py-2">
                              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-bluegrey-900 leading-5">
                                  Temporary password set successfully
                                </p>
                              </div>
                            </div>
                            <div className="flex justify-end items-center">
                              <button
                                onClick={() => setTempPasswordSuccess(false)}
                                className="flex w-10 h-10 items-center justify-center rounded-[2px] hover:bg-bluegrey-100 transition-colors flex-shrink-0"
                                aria-label="Close alert"
                              >
                                <X className="w-6 h-6 text-bluegrey-700" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                      <Button
                        onClick={() => {
                          setTempPasswordError("");
                          if (!temporaryPassword || temporaryPassword.trim() === "") {
                            setTempPasswordError("Password is required");
                            return;
                          }
                          setIsSavingTempPassword(true);
                          setTempPasswordSuccess(false);
                          setTimeout(() => {
                            setIsSavingTempPassword(false);
                            setTempPasswordSuccess(true);
                            setTemporaryPassword("");
                          }, 1500);
                        }}
                        disabled={isSavingTempPassword}
                        variant="outline"
                        className="mt-3 mb-6 rounded-[2px] border-2 border-[#041295] text-[#041295] hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed h-auto px-3 py-2 gap-2 w-fit"
                      >
                        {isSavingTempPassword ? "Setting..." : "Set temporary password"}
                      </Button>
                    </div>

                    {/* Reset Password */}
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-1">
                        <h3 className="text-base font-semibold text-bluegrey-900">Reset password</h3>
                        <p className="text-xs text-bluegrey-700">
                          Send a password reset link to the user's email address.
                        </p>
                      </div>
                      {resetPasswordSuccess && (
                        <div className="flex items-start rounded-[2px] bg-green-50 relative">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500 rounded-l-[2px]"></div>
                          <div className="flex items-center gap-3 flex-1 pl-6 pr-3 py-2">
                            <div className="flex items-start gap-2 flex-1 py-2">
                              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-bluegrey-900 leading-5">
                                  Password reset link sent to user's email
                                </p>
                              </div>
                            </div>
                            <div className="flex justify-end items-center">
                              <button
                                onClick={() => setResetPasswordSuccess(false)}
                                className="flex w-10 h-10 items-center justify-center rounded-[2px] hover:bg-bluegrey-100 transition-colors flex-shrink-0"
                                aria-label="Close alert"
                              >
                                <X className="w-6 h-6 text-bluegrey-700" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                      <Button
                        onClick={() => {
                          setResetPasswordSuccess(true);
                        }}
                        variant="outline"
                        className="mt-3 mb-6 rounded-[2px] border-2 border-[#041295] text-[#041295] hover:bg-blue-50 h-auto px-3 py-2 w-fit gap-2"
                      >
                        Reset password
                      </Button>
                    </div>

                    {/* Danger Zone */}
                    <div className="flex flex-col gap-4 pt-6 border-t-2 border-red-200">
                      <h2 className="text-xl font-semibold text-red-600">Danger zone</h2>
                      <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-1">
                          <h3 className="text-base font-semibold text-bluegrey-900">Remove password</h3>
                          <p className="text-xs text-bluegrey-700">
                            The current password for this user will be removed. The user will be required to set a new password upon their next login attempt.
                          </p>
                        </div>
                        {removePasswordSuccess && (
                          <div className="flex items-start rounded-[2px] bg-green-50 relative">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500 rounded-l-[2px]"></div>
                            <div className="flex items-center gap-3 flex-1 pl-6 pr-3 py-2">
                              <div className="flex items-start gap-2 flex-1 py-2">
                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-bluegrey-900 leading-5">
                                    Password removed successfully
                                  </p>
                                </div>
                              </div>
                              <div className="flex justify-end items-center">
                                <button
                                  onClick={() => setRemovePasswordSuccess(false)}
                                  className="flex w-10 h-10 items-center justify-center rounded-[2px] hover:bg-bluegrey-100 transition-colors flex-shrink-0"
                                  aria-label="Close alert"
                                >
                                  <X className="w-6 h-6 text-bluegrey-700" />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                        <Button
                          onClick={() => {
                            setRemovePasswordSuccess(true);
                          }}
                          variant="outline"
                          className="mt-3 mb-6 rounded-[2px] border-2 border-red-600 text-red-600 hover:bg-red-50 h-auto px-3 py-2 w-fit gap-2"
                        >
                          Remove password
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SMS OTP Section */}
              {openSideSheet === "SMS OTP" && (
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <h2 className="text-xl font-semibold text-blue-500">Phone number</h2>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="phoneNumber">Phone number</Label>
                      <input
                        id="phoneNumber"
                        type="tel"
                        value={newPhoneNumber || user?.phone || ""}
                        onChange={(e) => {
                          setNewPhoneNumber(e.target.value);
                          setPhoneUpdateSuccess(false);
                        }}
                        className="flex w-full rounded-[2px] border border-bluegrey-500 bg-white px-2 py-3 text-sm text-bluegrey-900"
                      />
                    </div>
                    {phoneUpdateSuccess && (
                      <div className="flex items-start rounded-[2px] bg-green-50 relative">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500 rounded-l-[2px]"></div>
                        <div className="flex items-center gap-3 flex-1 pl-6 pr-3 py-2">
                          <div className="flex items-start gap-2 flex-1 py-2">
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-bluegrey-900 leading-5">
                                Phone number updated successfully
                              </p>
                            </div>
                          </div>
                          <div className="flex justify-end items-center">
                            <button
                              onClick={() => setPhoneUpdateSuccess(false)}
                              className="flex w-10 h-10 items-center justify-center rounded-[2px] hover:bg-bluegrey-100 transition-colors flex-shrink-0"
                              aria-label="Close alert"
                            >
                              <X className="w-6 h-6 text-bluegrey-700" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => {
                        setPhoneOtpError("");
                        setPhoneOtp("");
                        setIsPhoneOtpDialogOpen(true);
                      }}
                      className="mt-3 mb-6 rounded-[2px] border-2 border-[#041295] text-[#041295] hover:bg-blue-50 h-auto px-3 py-2 w-fit gap-2"
                    >
                      Update
                    </Button>
                  </div>

                  <div className="flex flex-col gap-4 pt-6 border-t-2 border-red-200">
                    <h2 className="text-xl font-semibold text-red-600">Danger zone</h2>
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-1">
                        <h3 className="text-base font-semibold text-bluegrey-900">Remove phone number</h3>
                        <p className="text-xs text-bluegrey-700">
                          Remove the phone number for this user account.
                        </p>
                      </div>
                      {removePhoneSuccess && (
                        <div className="flex items-start rounded-[2px] bg-green-50 relative">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500 rounded-l-[2px]"></div>
                          <div className="flex items-center gap-3 flex-1 pl-6 pr-3 py-2">
                            <div className="flex items-start gap-2 flex-1 py-2">
                              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-bluegrey-900 leading-5">
                                  Phone number removed successfully
                                </p>
                              </div>
                            </div>
                            <div className="flex justify-end items-center">
                              <button
                                onClick={() => setRemovePhoneSuccess(false)}
                                className="flex w-10 h-10 items-center justify-center rounded-[2px] hover:bg-bluegrey-100 transition-colors flex-shrink-0"
                                aria-label="Close alert"
                              >
                                <X className="w-6 h-6 text-bluegrey-700" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                      <Button
                        variant="outline"
                        onClick={() => {
                          setRemovePhoneSuccess(true);
                        }}
                        className="mt-3 mb-6 rounded-[2px] border-2 border-red-600 text-red-600 hover:bg-red-50 h-auto px-3 py-2 w-fit gap-2"
                      >
                        Remove phone number
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Danger Zone Section - Only for non-Username & Password and non-SMS OTP authenticators */}
              {openSideSheet && openSideSheet !== "Username & Password" && openSideSheet !== "SMS OTP" && (
                <div className="flex flex-col gap-4">
                  <h2 className="text-xl font-semibold text-red-600">Danger zone</h2>
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <h3 className="text-base font-semibold text-bluegrey-900">Delete authenticator</h3>
                      <p className="text-xs text-bluegrey-700">
                        Permanently delete this authenticator. This action cannot be undone.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        showAlert(`${openSideSheet} authenticator has been deleted.`, "success");
                        handleCloseSideSheet();
                      }}
                      className="mt-3 mb-6 rounded-[2px] border-2 border-red-600 text-red-600 hover:bg-red-50 h-auto px-3 py-2 gap-2 w-fit"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete authenticator
                    </Button>
                  </div>
                </div>
              )}
              </div>

              {/* Footer Section */}
              <div className="border-t border-bluegrey-100 px-6 py-4 flex items-center justify-between gap-3 mt-auto">
                <Button
                  type="button"
                  onClick={handleCloseSideSheet}
                  className="ml-auto gap-2 rounded-[2px] bg-blue-500 hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed h-auto px-3 py-2"
                >
                  Close
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <Dialog open={isValidityModalOpen} onOpenChange={setIsValidityModalOpen}>
        <DialogContent className="max-w-[480px] border-0 bg-white p-0 rounded-sm gap-6 shadow-[0_24px_38px_0_rgba(1,5,50,0.04),4px_9px_46px_0_rgba(1,5,50,0.04),0_11px_15px_0_rgba(1,5,50,0.08)]">
          <VisuallyHidden.Root>
            <DialogTitle>Edit validity period</DialogTitle>
          </VisuallyHidden.Root>
          <div className="flex items-start justify-between px-6 py-4">
            <DialogHeader className="text-left">
              <div className="text-xl font-medium leading-8 text-[#131319]">
                Edit validity period
              </div>
            </DialogHeader>
            <DialogClose className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[2px] hover:bg-bluegrey-50 transition-colors text-[#383A4B]">
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
                  fill="currentColor"
                />
              </svg>
            </DialogClose>
          </div>

          <div className="px-6">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-1">
                <Label
                  htmlFor="modal-start-date"
                  className="text-sm font-normal text-[#131319]"
                >
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
                <Label className="text-sm font-normal text-[#131319]">
                  End date
                </Label>
                <RadioGroup
                  value={modalEndDateOption}
                  onValueChange={(value) =>
                    setModalEndDateOption(value as "no-end" | "custom")
                  }
                  className="gap-3"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem
                      value="no-end"
                      id="modal-no-end"
                      className="border-bluegrey-500"
                    />
                    <Label
                      htmlFor="modal-no-end"
                      className="cursor-pointer text-sm font-normal text-[#131319]"
                    >
                      No end date
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem
                      value="custom"
                      id="modal-custom"
                      className="border-bluegrey-500"
                    />
                    <Label
                      htmlFor="modal-custom"
                      className="cursor-pointer text-sm font-normal text-[#131319]"
                    >
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

          <div className="px-6 py-4">
            <div className="flex items-center justify-between gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsValidityModalOpen(false)}
                className="rounded-[2px] text-[#383A4B] h-10 px-3"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setIsValidityModalOpen(false);
                  showAlert("Validity period updated successfully.", "success");
                }}
                className="gap-2 rounded-[2px] bg-[#041295] text-[#F7F7F9] hover:bg-[#041295]/90 h-10 px-3"
              >
                <Save className="h-5 w-5" />
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Phone Number OTP Verification Dialog */}
      <Dialog open={isPhoneOtpDialogOpen} onOpenChange={setIsPhoneOtpDialogOpen}>
        <DialogContent className="max-w-[480px] border-0 bg-white p-0 rounded-sm gap-6 shadow-[0_24px_38px_0_rgba(1,5,50,0.04),4px_9px_46px_0_rgba(1,5,50,0.04),0_11px_15px_0_rgba(1,5,50,0.08)]">
          <VisuallyHidden.Root>
            <DialogTitle>Verify Phone Number</DialogTitle>
          </VisuallyHidden.Root>
          <div className="flex items-start justify-between px-6 py-4">
            <DialogHeader className="text-left">
              <div className="text-xl font-medium leading-8 text-[#131319]">
                Verify Phone Number
              </div>
            </DialogHeader>
            <DialogClose className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[2px] hover:bg-bluegrey-50 transition-colors text-[#383A4B]">
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
                  fill="currentColor"
                />
              </svg>
            </DialogClose>
          </div>

          <div className="px-6">
            <div className="flex flex-col gap-4">
              <p className="text-sm text-bluegrey-600">
                Enter the OTP sent to {newPhoneNumber || user?.phone} to confirm the phone number update.
              </p>
              <div className="flex flex-col gap-1">
                <Label htmlFor="phoneOtp" className="text-sm font-normal text-[#131319]">
                  OTP Code
                </Label>
                <input
                  id="phoneOtp"
                  type="text"
                  value={phoneOtp}
                  onChange={(e) => {
                    setPhoneOtp(e.target.value);
                    setPhoneOtpError("");
                  }}
                  disabled={isVerifyingPhoneOtp}
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  className="flex w-full rounded-[2px] border border-bluegrey-500 bg-white px-2 py-3 text-sm text-bluegrey-900 disabled:cursor-not-allowed disabled:opacity-50"
                />
                {phoneOtpError && (
                  <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {phoneOtpError}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="px-6 py-4">
            <div className="flex items-center justify-between gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setIsPhoneOtpDialogOpen(false);
                  setPhoneOtp("");
                  setPhoneOtpError("");
                  setNewPhoneNumber("");
                }}
                disabled={isVerifyingPhoneOtp}
                className="rounded-[2px] text-[#383A4B] h-10 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => {
                  if (!phoneOtp || phoneOtp.trim() === "") {
                    setPhoneOtpError("OTP is required");
                    return;
                  }
                  if (phoneOtp.length !== 6) {
                    setPhoneOtpError("Please enter a valid 6-digit OTP");
                    return;
                  }
                  setIsVerifyingPhoneOtp(true);
                  setPhoneOtpError("");
                  setTimeout(() => {
                    setIsVerifyingPhoneOtp(false);
                    setIsPhoneOtpDialogOpen(false);
                    setPhoneUpdateSuccess(true);
                    setPhoneOtp("");
                  }, 1500);
                }}
                disabled={isVerifyingPhoneOtp}
                className="gap-2 rounded-[2px] bg-[#041295] text-[#F7F7F9] hover:bg-[#041295]/90 h-10 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isVerifyingPhoneOtp && <Loader2 className="h-4 w-4 animate-spin" />}
                {isVerifyingPhoneOtp ? "Verifying..." : "Confirm"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Assistant */}
      {user && (
        <AIAssistant
          userData={{
            id: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.displayPhone,
            status: user.status as "Active" | "Inactive",
            startDate: user.startDate,
            endDate: user.endDate,
            address1: user.address1,
            address2: user.address2,
            city: user.city,
            postalCode: user.postalCode,
            country: user.country,
            organization: user.organization,
            accessRoles: user.accessRoles?.map((role) => ({
              id: role.id,
              name: role.name,
              expiryDate: role.expiryDate,
            })),
            recentEvents: events.slice(0, 10).map((event) => ({
              id: event.id,
              eventType: event.eventType,
              date: event.date,
              description: event.description,
            })),
          }}
          isSideSheetOpen={!!openSideSheet}
          selectedCard={selectedCardForReview}
          events={events}
        />
      )}

      {alerts.map((alert, index) => {
        const positionFromBottom = alerts.length - 1 - index;
        const bottomOffset = 80 + positionFromBottom * 72;
        return alert.type === "success" ? (
          <SuccessAlert
            key={alert.id}
            message={alert.message}
            onClose={() => removeAlert(alert.id)}
            bottomOffset={bottomOffset}
            autoClose={true}
            autoCloseDuration={7000}
          />
        ) : (
          <InfoAlert
            key={alert.id}
            message={alert.message}
            onClose={() => removeAlert(alert.id)}
            bottomOffset={bottomOffset}
            autoClose={false}
          />
        );
      })}
    </Layout>
  );
}
