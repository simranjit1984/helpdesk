import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Send, MoreVertical } from "lucide-react";
import {
  DataGrid,
  DataGridRow,
  DataGridCell,
} from "@onewelcome/react-lib-components";
import type { HeaderCell, PageSize } from "@onewelcome/react-lib-components";
import StatusBadge from "./StatusBadge";
import ConfirmationModal from "./ConfirmationModal";
import FilterBar from "./FilterBar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

const PAGE_SIZE: PageSize = 25;

type StatusType =
  | "active"
  | "invited"
  | "invitation-withdrawn"
  | "invitation-expired"
  | "blocked"
  | "grace"
  | "inactive";

export interface AccessRole {
  id: string;
  name: string;
  applications: number;
  startDate: string;
  endDate: string | null;
}

interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dateCreated: string;
  status: StatusType;
  organizations: string[];
  accessRoles?: AccessRole[];
}

export const baseUsers: Partial<User>[] = [
  {
    id: "1",
    username: "alison.adams@example.com",
    firstName: "Alison",
    lastName: "Adams",
    phoneNumber: "+44 123456789",
    dateCreated: "2024-07-15 11:57:50",
    status: "active",
    organizations: ["Acme Corp", "Tech Solutions", "Global Services"],
  },
  {
    id: "2",
    username: "benjamin.brown@example.com",
    firstName: "Benjamin",
    lastName: "Brown",
    phoneNumber: "+33 987654321",
    dateCreated: "2024-07-13 09:23:21",
    status: "invited",
    organizations: ["Beta Industries"],
  },
  {
    id: "3",
    username: "carla.clarke@example.com",
    firstName: "Carla",
    lastName: "Clarke",
    phoneNumber: "+39 555123456",
    dateCreated: "2024-07-12 13:15:24",
    status: "invitation-withdrawn",
    organizations: ["Gamma Ltd"],
  },
  {
    id: "4",
    username: "daniel.davies@example.com",
    firstName: "Daniel",
    lastName: "Davies",
    phoneNumber: "+49 111222333",
    dateCreated: "2024-07-12 11:42:02",
    status: "invitation-expired",
    organizations: ["Delta Partners"],
  },
  {
    id: "5",
    username: "emma.evans@example.com",
    firstName: "Emma",
    lastName: "Evans",
    phoneNumber: "+46 777888999",
    dateCreated: "2024-07-15 10:52:35",
    status: "active",
    organizations: ["Epsilon Group", "Zeta Enterprises"],
  },
  {
    id: "6",
    username: "felix.fischer@example.com",
    firstName: "Felix",
    lastName: "Fischer",
    phoneNumber: "+41 333444555",
    dateCreated: "2024-07-12 08:16:38",
    status: "active",
    organizations: ["Theta Systems"],
  },
  {
    id: "7",
    username: "george.garcia@example.com",
    firstName: "George",
    lastName: "Garcia",
    phoneNumber: "+34 666777888",
    dateCreated: "2024-07-11 11:21:05",
    status: "active",
    organizations: ["Iota Solutions", "Kappa Tech", "Lambda Consulting", "Mu Digital"],
  },
  {
    id: "8",
    username: "hannah.hughes@example.com",
    firstName: "Hannah",
    lastName: "Hughes",
    phoneNumber: "+31 999888777",
    dateCreated: "2024-07-13 08:52:38",
    status: "blocked",
    organizations: ["Nu Analytics", "Xi Networks"],
  },
  {
    id: "9",
    username: "isabel.ivanova@example.com",
    firstName: "Isabel",
    lastName: "Ivanova",
    phoneNumber: "+32 888999000",
    dateCreated: "2024-07-13 09:33:13",
    status: "grace",
    organizations: ["Omicron Ventures", "Pi Financial", "Rho Marketing", "Sigma Retail", "Tau Logistics"],
  },
  {
    id: "10",
    username: "jack.jensen@example.com",
    firstName: "Jack",
    lastName: "Jensen",
    phoneNumber: "+30 444555666",
    dateCreated: "2024-07-13 10:09:26",
    status: "blocked",
    organizations: ["Upsilon Resources", "Phi Communications"],
  },
  {
    username: "kate.kennedy@example.com",
    firstName: "Kate",
    lastName: "Kennedy",
    phoneNumber: "+45 222333444",
    dateCreated: "2024-07-14 14:22:11",
    status: "active",
    organizations: ["Chi Manufacturing", "Psi Entertainment"],
  },
  {
    username: "lucas.lopez@example.com",
    firstName: "Lucas",
    lastName: "Lopez",
    phoneNumber: "+34 111222333",
    dateCreated: "2024-07-10 16:45:30",
    status: "active",
    organizations: ["Omega Technologies", "Alpha Analytics", "Beta Healthcare"],
  },
  {
    username: "maria.martinez@example.com",
    firstName: "Maria",
    lastName: "Martinez",
    phoneNumber: "+52 555666777",
    dateCreated: "2024-07-09 10:30:45",
    status: "active",
    organizations: ["Gamma Finance"],
  },
  {
    username: "nathan.nelson@example.com",
    firstName: "Nathan",
    lastName: "Nelson",
    phoneNumber: "+1 888999000",
    dateCreated: "2024-07-11 09:15:22",
    status: "grace",
    organizations: ["Delta Consulting", "Epsilon Legal", "Zeta Real Estate", "Eta Insurance"],
  },
  {
    username: "olivia.oliver@example.com",
    firstName: "Olivia",
    lastName: "Oliver",
    phoneNumber: "+61 777888999",
    dateCreated: "2024-07-08 13:40:18",
    status: "inactive",
    organizations: ["Theta Energy"],
  },
  {
    username: "peter.parker@example.com",
    firstName: "Peter",
    lastName: "Parker",
    phoneNumber: "+1 555444333",
    dateCreated: "2024-07-14 11:25:50",
    status: "active",
    organizations: ["Iota Education", "Kappa Travel"],
  },
  {
    username: "quinn.quinn@example.com",
    firstName: "Quinn",
    lastName: "Quinn",
    phoneNumber: "+353 666555444",
    dateCreated: "2024-07-07 15:10:35",
    status: "active",
    organizations: ["Lambda Food", "Mu Beverage", "Nu Hospitality"],
  },
  {
    username: "rachel.rogers@example.com",
    firstName: "Rachel",
    lastName: "Rogers",
    phoneNumber: "+44 333222111",
    dateCreated: "2024-07-12 08:55:42",
    status: "blocked",
    organizations: ["Xi Fashion", "Omicron Luxury"],
  },
  {
    username: "steve.smith@example.com",
    firstName: "Steve",
    lastName: "Smith",
    phoneNumber: "+1 444333222",
    dateCreated: "2024-07-06 12:30:20",
    status: "grace",
    organizations: ["Pi Sports"],
  },
  {
    username: "thomas.thompson@example.com",
    firstName: "Thomas",
    lastName: "Thompson",
    phoneNumber: "+1 555666777",
    dateCreated: "2024-07-15 09:20:15",
    status: "active",
    organizations: ["Rho Media", "Sigma Publishing", "Tau Broadcasting", "Upsilon Streaming"],
  },
  {
    username: "uma.upadhyay@example.com",
    firstName: "Uma",
    lastName: "Upadhyay",
    phoneNumber: "+91 8899001122",
    dateCreated: "2024-07-14 14:35:40",
    status: "active",
    organizations: ["Phi Software", "Chi Hardware"],
  },
  {
    username: "victor.victor@example.com",
    firstName: "Victor",
    lastName: "Victor",
    phoneNumber: "+33 111222333",
    dateCreated: "2024-07-13 10:15:25",
    status: "active",
    organizations: ["Psi Automotive", "Omega Defense", "Alpha Security", "Beta Telecommunications", "Gamma Aerospace"],
  },
  {
    username: "wendy.williams@example.com",
    firstName: "Wendy",
    lastName: "Williams",
    phoneNumber: "+1 777888999",
    dateCreated: "2024-07-12 16:45:50",
    status: "active",
    organizations: ["Delta Mining", "Epsilon Agriculture"],
  },
  {
    username: "xavier.xu@example.com",
    firstName: "Xavier",
    lastName: "Xu",
    phoneNumber: "+86 2233445566",
    dateCreated: "2024-07-11 11:30:20",
    status: "active",
    organizations: ["Zeta Utilities", "Eta Construction"],
  },
  {
    username: "yara.young@example.com",
    firstName: "Yara",
    lastName: "Young",
    phoneNumber: "+44 555666777",
    dateCreated: "2024-07-10 13:20:35",
    status: "active",
    organizations: ["Theta Transportation", "Iota Logistics", "Kappa Distribution"],
  },
  {
    username: "zoe.zimmerman@example.com",
    firstName: "Zoe",
    lastName: "Zimmerman",
    phoneNumber: "+49 222333444",
    dateCreated: "2024-07-09 15:50:10",
    status: "active",
    organizations: ["Lambda Warehousing"],
  },
  {
    id: "0",
    username: "alice.anderson@example.com",
    firstName: "Alice",
    lastName: "Anderson",
    phoneNumber: "+1 888999000",
    dateCreated: "2024-07-15 08:25:45",
    status: "active",
    organizations: ["InsurCar"],
    accessRoles: [
      {
        id: "1",
        name: "Claim processor",
        applications: 5,
        startDate: "19/09/2024",
        endDate: "18/09/2024",
      },
      {
        id: "2",
        name: "Front desk person",
        applications: 3,
        startDate: "19/09/2024",
        endDate: null,
      },
      {
        id: "3",
        name: "Underwriting Analyst",
        applications: 5,
        startDate: "19/09/2024",
        endDate: "18/09/2024",
      },
    ],
  },
  {
    username: "brandon.brennan@example.com",
    firstName: "Brandon",
    lastName: "Brennan",
    phoneNumber: "+61 3344556677",
    dateCreated: "2024-07-14 12:10:30",
    status: "active",
    organizations: ["Xi Ecommerce", "Omicron Digital"],
  },
  {
    username: "charlotte.chen@example.com",
    firstName: "Charlotte",
    lastName: "Chen",
    phoneNumber: "+86 5566778899",
    dateCreated: "2024-07-13 14:40:20",
    status: "active",
    organizations: ["Pi Analytics", "Rho Data", "Sigma Cloud"],
  },
  {
    username: "david.dunn@example.com",
    firstName: "David",
    lastName: "Dunn",
    phoneNumber: "+1 222333444",
    dateCreated: "2024-07-12 10:05:15",
    status: "active",
    organizations: ["Tau Consulting"],
  },
  {
    username: "emily.edwards@example.com",
    firstName: "Emily",
    lastName: "Edwards",
    phoneNumber: "+44 666777888",
    dateCreated: "2024-07-11 15:30:50",
    status: "active",
    organizations: ["Upsilon Marketing", "Phi Advertising"],
  },
  {
    username: "frank.fleming@example.com",
    firstName: "Frank",
    lastName: "Fleming",
    phoneNumber: "+33 555666777",
    dateCreated: "2024-07-10 09:45:25",
    status: "active",
    organizations: ["Chi PR"],
  },
  {
    username: "grace.grant@example.com",
    firstName: "Grace",
    lastName: "Grant",
    phoneNumber: "+1 111222333",
    dateCreated: "2024-07-09 16:20:40",
    status: "active",
    organizations: ["Psi Design", "Omega Branding", "Alpha UX", "Beta Visual"],
  },
  {
    username: "henry.harris@example.com",
    firstName: "Henry",
    lastName: "Harris",
    phoneNumber: "+49 333444555",
    dateCreated: "2024-07-15 13:15:10",
    status: "active",
    organizations: ["Gamma Creative"],
  },
  {
    username: "iris.ingram@example.com",
    firstName: "Iris",
    lastName: "Ingram",
    phoneNumber: "+61 4455667788",
    dateCreated: "2024-07-14 11:50:35",
    status: "active",
    organizations: ["Delta Development", "Epsilon Quality", "Zeta Testing"],
  },
  {
    username: "james.jackson@example.com",
    firstName: "James",
    lastName: "Jackson",
    phoneNumber: "+1 333444555",
    dateCreated: "2024-07-13 09:30:20",
    status: "active",
    organizations: ["Eta DevOps"],
  },
  {
    username: "karen.kemp@example.com",
    firstName: "Karen",
    lastName: "Kemp",
    phoneNumber: "+44 777888999",
    dateCreated: "2024-07-12 14:25:45",
    status: "active",
    organizations: ["Theta Infrastructure", "Iota Cloud"],
  },
  {
    username: "leon.lewis@example.com",
    firstName: "Leon",
    lastName: "Lewis",
    phoneNumber: "+33 666777888",
    dateCreated: "2024-07-11 10:40:15",
    status: "active",
    organizations: ["Kappa Systems", "Lambda Networks", "Mu Servers", "Nu Database", "Xi Storage"],
  },
  {
    username: "maggie.miller@example.com",
    firstName: "Maggie",
    lastName: "Miller",
    phoneNumber: "+1 444555666",
    dateCreated: "2024-07-10 15:55:30",
    status: "active",
    organizations: ["Omicron Security"],
  },
  {
    username: "noah.norman@example.com",
    firstName: "Noah",
    lastName: "Norman",
    phoneNumber: "+49 444555666",
    dateCreated: "2024-07-09 12:30:50",
    status: "active",
    organizations: ["Pi Monitoring", "Rho Alerting"],
  },
  {
    username: "oscar.owen@example.com",
    firstName: "Oscar",
    lastName: "Owen",
    phoneNumber: "+61 5566778899",
    dateCreated: "2024-07-15 10:15:20",
    status: "active",
    organizations: ["Sigma Automation", "Tau Orchestration"],
  },
  {
    username: "paul.perry@example.com",
    firstName: "Paul",
    lastName: "Perry",
    phoneNumber: "+1 555666777",
    dateCreated: "2024-07-14 16:40:35",
    status: "active",
    organizations: ["Upsilon Configuration"],
  },
  {
    username: "quinn.quinn2@example.com",
    firstName: "Quinn",
    lastName: "Quinn",
    phoneNumber: "+44 888999000",
    dateCreated: "2024-07-13 13:25:10",
    status: "active",
    organizations: ["Phi Backup", "Chi Recovery"],
  },
  {
    username: "ruby.robinson@example.com",
    firstName: "Ruby",
    lastName: "Robinson",
    phoneNumber: "+33 777888999",
    dateCreated: "2024-07-12 11:50:45",
    status: "active",
    organizations: ["Psi Migration", "Omega Integration", "Alpha Synchronization"],
  },
  {
    username: "samuel.sanders@example.com",
    firstName: "Samuel",
    lastName: "Sanders",
    phoneNumber: "+1 666777888",
    dateCreated: "2024-07-11 14:10:20",
    status: "active",
    organizations: ["Beta Validation"],
  },
  {
    username: "tina.taylor@example.com",
    firstName: "Tina",
    lastName: "Taylor",
    phoneNumber: "+49 555666777",
    dateCreated: "2024-07-10 10:35:30",
    status: "active",
    organizations: ["Gamma Performance", "Delta Optimization"],
  },
  {
    username: "uncle.usher@example.com",
    firstName: "Uncle",
    lastName: "Usher",
    phoneNumber: "+61 6677889900",
    dateCreated: "2024-07-09 15:45:15",
    status: "active",
    organizations: ["Epsilon Compliance", "Zeta Governance", "Eta Risk", "Theta Audit"],
  },
];

// Assign IDs based on array index
export const users: User[] = baseUsers.map(
  (user, index) =>
    ({
      ...user,
      id: user.id || (index + 1).toString(),
    }) as User,
);

// Helper function to get a user by ID
export function getUserById(id: string): User | undefined {
  return baseUsers.find((user) => user.id === id) as User | undefined;
}

// Helper function to get a user by username (email)
export function getUserByUsername(username: string): User | undefined {
  return baseUsers.find((user) => user.username === username) as
    | User
    | undefined;
}

// ─── Column definitions ───────────────────────────────────────────────────────

const HEADERS: HeaderCell[] = [
  { name: "username", headline: "Email" },
  { name: "firstName", headline: "First name" },
  { name: "lastName", headline: "Last name" },
  { name: "phoneNumber", headline: "Phone number", disableSorting: true },
  { name: "organizations", headline: "Organization", disableSorting: true },
  { name: "status", headline: "Status" },
  { name: "actions", headline: "", disableSorting: true },
];

// ─── Search field options ─────────────────────────────────────────────────────

const SEARCH_FIELDS = [
  { value: "all", label: "All fields" },
  { value: "email", label: "Email" },
  { value: "firstName", label: "First name" },
  { value: "lastName", label: "Last name" },
  { value: "phoneNumber", label: "Phone number" },
];

// ─── User actions dropdown ────────────────────────────────────────────────────

function UserActionsMenu({ user }: { user: User }) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBlockedModal, setIsBlockedModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    label: string;
    action: string;
  } | null>(null);

  const handleAction = (item: { label: string; action: string }) => {
    if (item.action === "View details" || item.action === "View invitation") {
      navigate(`/users/${encodeURIComponent(user.username)}`);
      return;
    }

    if (item.action === "Reset password" && user.status === "blocked") {
      setIsBlockedModal(true);
      setIsOpen(false);
      return;
    }

    setPendingAction(item);
    setIsModalOpen(true);
    setIsOpen(false);
  };

  const handleConfirmAction = () => {
    if (pendingAction) {
      toast({
        title: pendingAction.action,
        description: `Action performed for ${user.username}`,
      });
      setIsModalOpen(false);
      setPendingAction(null);
    }
  };

  const handleCancelAction = () => {
    setIsModalOpen(false);
    setPendingAction(null);
  };

  const handleCloseBlockedModal = () => {
    setIsBlockedModal(false);
  };

  const getMenuItems = () => {
    switch (user.status) {
      case "active":
        return [
          { label: "View details", action: "View details" },
          { label: "Reset password", action: "Reset password" },
          { label: "Block authentication", action: "Block authentication" },
          { label: "Delete user", action: "Delete user" },
        ];
      case "invited":
        return [
          { label: "View invitation", action: "View invitation" },
          { label: "Resent invitation", action: "Resent invitation" },
          { label: "Withdraw invitation", action: "Withdraw invitation" },
        ];
      case "invitation-withdrawn":
        return [{ label: "View invitation", action: "View invitation" }];
      case "grace":
        return [
          { label: "View details", action: "View details" },
          { label: "Change to active", action: "Change to active" },
        ];
      case "blocked":
        return [
          { label: "View details", action: "View details" },
          { label: "Reset password", action: "Reset password" },
          { label: "Unblock authentication", action: "Unblock authentication" },
          { label: "Delete user", action: "Delete user" },
        ];
      case "invitation-expired":
        return [
          { label: "View invitation", action: "View invitation" },
          { label: "Resent invitation", action: "Resent invitation" },
        ];
      case "inactive":
        return [
          { label: "View details", action: "View details" },
          { label: "Delete user", action: "Delete user" },
        ];
      default:
        return [];
    }
  };

  const items = getMenuItems();

  if (items.length === 0) {
    return (
      <button className="w-10 h-10 flex items-center justify-center rounded hover:bg-bluegrey-100 transition-colors">
        <MoreVertical className="w-6 h-6 text-blue-500" />
      </button>
    );
  }

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <button
            className={`w-10 h-10 flex items-center justify-center rounded transition-colors ${isOpen ? "bg-bluegrey-100" : "hover:bg-bluegrey-100"}`}
          >
            <MoreVertical className="w-6 h-6 text-blue-500" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {items.map((item) => (
            <DropdownMenuItem
              key={item.action}
              onClick={() => handleAction(item)}
            >
              {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmationModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title={pendingAction?.label || ""}
        description={`Are you sure you want to ${pendingAction?.label?.toLowerCase()} for this user?`}
        tertiaryAction={{
          label: "Cancel",
          onClick: handleCancelAction,
        }}
        primaryAction={{
          label: "Continue",
          onClick: handleConfirmAction,
        }}
      />

      <ConfirmationModal
        open={isBlockedModal}
        onOpenChange={setIsBlockedModal}
        title="User authentication blocked"
        description="Please unblock user's authentication status before resetting the password."
        primaryAction={{
          label: "Close",
          onClick: handleCloseBlockedModal,
        }}
      />
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

type Filter = {
  id: string;
  column: string;
  operator: string;
  value: string;
};

interface UsersTableProps {
  allowedStatuses?: StatusType[];
}

function deriveStatusOptions(allowedStatuses?: StatusType[]) {
  const allOptions = [
    { value: "active", label: "Active" },
    { value: "blocked", label: "Authentication blocked" },
    { value: "grace", label: "Grace" },
    { value: "inactive", label: "Inactive" },
    { value: "invited", label: "Invited" },
    { value: "invitation-expired", label: "Invitation expired" },
    { value: "invitation-withdrawn", label: "Invitation withdrawn" },
  ];

  if (!allowedStatuses || allowedStatuses.length === 0) return allOptions;
  return allOptions.filter((opt) =>
    allowedStatuses.includes(opt.value as StatusType),
  );
}

export default function UsersTable({ allowedStatuses }: UsersTableProps) {
  const navigate = useNavigate();

  // ── Internal toolbar state ────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("all");
  const [filters, setFilters] = useState<Filter[]>([]);

  // ── Sort state (UCL uses uppercase direction) ─────────────────────────────
  const [sortColumn, setSortColumn] = useState("username");
  const [sortDir, setSortDir] = useState<"ASC" | "DESC">("ASC");

  // ── Pagination state ──────────────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(PAGE_SIZE);

  // ── Org picker modal state ────────────────────────────────────────────────
  const [selectedUserForOrganization, setSelectedUserForOrganization] =
    useState<User | null>(null);
  const [selectedOrganization, setSelectedOrganization] = useState<string>("");
  const [organizationError, setOrganizationError] = useState<string>("");

  // Reset to page 1 whenever search/filter/sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, searchField, filters, sortColumn, sortDir]);

  // ── Filtering ─────────────────────────────────────────────────────────────
  const getFilteredUsers = (): User[] => {
    let filtered = baseUsers as User[];

    if (allowedStatuses && allowedStatuses.length > 0) {
      filtered = filtered.filter((u) =>
        allowedStatuses.includes(u.status as StatusType),
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((user) => {
        if (searchField === "all" || searchField === "") {
          return (
            user.username?.toLowerCase().includes(query) ||
            user.firstName?.toLowerCase().includes(query) ||
            user.lastName?.toLowerCase().includes(query) ||
            user.phoneNumber?.toLowerCase().includes(query) ||
            user.status?.toLowerCase().includes(query) ||
            user.organizations?.some((org) => org.toLowerCase().includes(query))
          );
        }
        if (searchField === "email") return user.username?.toLowerCase().includes(query);
        if (searchField === "firstName") return user.firstName?.toLowerCase().includes(query);
        if (searchField === "lastName") return user.lastName?.toLowerCase().includes(query);
        if (searchField === "phoneNumber") return user.phoneNumber?.toLowerCase().includes(query);
        return true;
      });
    }

    filters.forEach((filter) => {
      filtered = filtered.filter((user) => {
        const columnKey = filter.column === "email" ? "username" : filter.column;

        if (columnKey === "organizations") {
          const searchTerm = filter.value.toLowerCase();
          return user.organizations?.some((org) =>
            org.toLowerCase().includes(searchTerm),
          ) || false;
        }

        const fieldValue = (user[columnKey as keyof typeof user] || "")
          .toString()
          .toLowerCase();

        switch (filter.operator) {
          case "between": {
            const [startStr, endStr] = filter.value.split("|");
            const startDate = new Date(startStr).getTime();
            const endDate = new Date(endStr).getTime();
            const fieldDate = new Date(fieldValue).getTime();
            return fieldDate >= startDate && fieldDate <= endDate;
          }
          case "is": {
            const selectedValues = filter.value.split(",").map((v) => v.toLowerCase());
            return selectedValues.includes(fieldValue);
          }
          case "isNot": {
            const selectedValues = filter.value.split(",").map((v) => v.toLowerCase());
            return !selectedValues.includes(fieldValue);
          }
          case "contains":
            return fieldValue.includes(filter.value.toLowerCase());
          case "equals":
            return fieldValue === filter.value.toLowerCase();
          case "startsWith":
            return fieldValue.startsWith(filter.value.toLowerCase());
          case "endsWith":
            return fieldValue.endsWith(filter.value.toLowerCase());
          default:
            return true;
        }
      });
    });

    return filtered;
  };

  // ── Sorting ───────────────────────────────────────────────────────────────
  const getSortedUsers = (): User[] => {
    const filteredUsers = getFilteredUsers();
    return [...filteredUsers].sort((a, b) => {
      const fieldKey = sortColumn === "username" ? "username" : sortColumn;
      let aVal: string = ((a[fieldKey as keyof User] as string) || "").toLowerCase();
      let bVal: string = ((b[fieldKey as keyof User] as string) || "").toLowerCase();

      if (aVal < bVal) return sortDir === "ASC" ? -1 : 1;
      if (aVal > bVal) return sortDir === "ASC" ? 1 : -1;
      return 0;
    });
  };

  // ── Derived data ──────────────────────────────────────────────────────────
  const sortedUsers = getSortedUsers();
  const totalCount = sortedUsers.length;
  const pagedUsers = sortedUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const statusOptions = deriveStatusOptions(allowedStatuses);
  const isInvitationsTab =
    allowedStatuses?.every((s) => s.startsWith("invitation") || s === "invited") ?? false;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleRowClick = (user: User) => {
    if (user.organizations.length > 1) {
      setSelectedUserForOrganization(user);
    } else {
      navigate(
        `/users/${encodeURIComponent(user.username)}?organization=${encodeURIComponent(user.organizations[0])}`,
      );
    }
  };

  const handleOrgContinue = () => {
    if (!selectedOrganization) {
      setOrganizationError("Please select organization name before continue");
      return;
    }
    if (selectedUserForOrganization) {
      navigate(
        `/users/${encodeURIComponent(selectedUserForOrganization.username)}?organization=${encodeURIComponent(selectedOrganization)}`,
      );
      setSelectedUserForOrganization(null);
      setSelectedOrganization("");
      setOrganizationError("");
    }
  };

  const handleOrgCancel = () => {
    setSelectedUserForOrganization(null);
    setSelectedOrganization("");
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6">
      {/* Toolbar: FilterBar + Invite button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          <FilterBar
            columns={[
              { value: "organizations", label: "Organization" },
              { value: "status", label: "Status" },
            ]}
            columnOptions={{ status: statusOptions }}
            filters={filters}
            onFilterAdd={(f) => setFilters([...filters, f])}
            onFilterRemove={(id) => setFilters(filters.filter((f) => f.id !== id))}
            onClearFilters={() => setFilters([])}
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder={isInvitationsTab ? "Search invitations" : "Search users"}
            searchFields={SEARCH_FIELDS}
            searchField={searchField}
            onSearchFieldChange={setSearchField}
          />
        </div>
        <Button className="gap-2 shrink-0">
          <Send className="w-4 h-4" />
          Invite user
        </Button>
      </div>

      {/* UCL DataGrid */}
      <DataGrid
        headers={HEADERS}
        data={pagedUsers}
        initialSort={[{ name: "username", direction: "ASC" }]}
        onSort={(sorts) => {
          if (sorts && sorts.length > 0) {
            setSortColumn(sorts[0].name);
            setSortDir(sorts[0].direction as "ASC" | "DESC");
          }
        }}
        paginationProps={{
          currentPage,
          totalElements: totalCount,
          pageSize,
          onPageChange: (page) => setCurrentPage(page),
          onPageSizeChange: (size) => {
            setPageSize(size as PageSize);
            setCurrentPage(1);
          },
        }}
        disableContextMenuColumn={true}
        emptyLabel="No users found"
      >
        {({ item: user }) => (
          <DataGridRow
            item={user}
            headers={HEADERS}
            disableContextMenuColumn={true}
            searchValue={searchQuery}
          >
            {/* Email */}
            <DataGridCell>
              <button
                type="button"
                onClick={() => handleRowClick(user)}
                className="text-sm text-bluegrey-900 hover:text-blue-500 truncate transition-colors text-left"
              >
                {user.username}
              </button>
            </DataGridCell>

            {/* First name */}
            <DataGridCell>
              <span className="text-sm text-bluegrey-900">{user.firstName}</span>
            </DataGridCell>

            {/* Last name */}
            <DataGridCell>
              <span className="text-sm text-bluegrey-900">{user.lastName}</span>
            </DataGridCell>

            {/* Phone */}
            <DataGridCell>
              <span className="text-sm text-bluegrey-900">{user.phoneNumber}</span>
            </DataGridCell>

            {/* Organization */}
            <DataGridCell>
              {user.organizations.length === 1 ? (
                <span className="text-sm text-bluegrey-900">{user.organizations[0]}</span>
              ) : (
                <div className="flex flex-col gap-1">
                  {user.organizations.map((org) => (
                    <span key={org} className="text-sm text-bluegrey-900">
                      {org}
                    </span>
                  ))}
                </div>
              )}
            </DataGridCell>

            {/* Status */}
            <DataGridCell>
              <StatusBadge status={user.status} />
            </DataGridCell>

            {/* Actions */}
            <DataGridCell>
              <UserActionsMenu user={user} />
            </DataGridCell>
          </DataGridRow>
        )}
      </DataGrid>

      {/* Org picker modal */}
      <ConfirmationModal
        open={selectedUserForOrganization !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedUserForOrganization(null);
            setSelectedOrganization("");
            setOrganizationError("");
          }
        }}
        title="Select user's organization"
        description=""
        primaryAction={{
          label: "Continue",
          onClick: handleOrgContinue,
        }}
        tertiaryAction={{
          label: "Cancel",
          onClick: handleOrgCancel,
        }}
      >
        {selectedUserForOrganization && (
          <div className="flex flex-col gap-1">
            <Label className="text-sm font-normal text-[#131319] flex gap-1">
              Please select the organization context for viewing user&apos;s details.
              <span className="font-medium text-red-500">*</span>
            </Label>
            <Select
              value={selectedOrganization}
              onValueChange={(value) => {
                setSelectedOrganization(value);
                setOrganizationError("");
              }}
            >
              <SelectTrigger className="rounded-[2px] border-bluegrey-500 px-2 py-3 text-sm text-bluegrey-900 h-auto">
                <SelectValue placeholder="Select an organization" />
              </SelectTrigger>
              <SelectContent>
                {selectedUserForOrganization.organizations.map((org) => (
                  <SelectItem key={org} value={org}>
                    {org}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {organizationError && (
              <p className="text-sm text-red-500">{organizationError}</p>
            )}
          </div>
        )}
      </ConfirmationModal>
    </div>
  );
}
