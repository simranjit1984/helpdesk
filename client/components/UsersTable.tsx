import { MoreVertical, ChevronUp, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import ConfirmationModal from "./ConfirmationModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Label } from "./ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
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
} from "./ui/table";
import { useToast } from "@/hooks/use-toast";

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

type SortColumn =
  | "username"
  | "firstName"
  | "lastName"
  | "phoneNumber"
  | "status";
type SortDirection = "asc" | "desc";

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
    // Navigate to user detail page
    if (item.action === "View details" || item.action === "View invitation") {
      navigate(`/users/${encodeURIComponent(user.username)}`);
      return;
    }

    // Special case: Reset password when authentication is blocked
    if (item.action === "Reset password" && user.status === "blocked") {
      setIsBlockedModal(true);
      setIsOpen(false);
      return;
    }

    // All other actions need confirmation
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

interface UsersTableProps {
  searchQuery?: string;
  filters?: Array<{
    id: string;
    column: string;
    operator: string;
    value: string;
  }>;
}

export default function UsersTable({
  searchQuery = "",
  filters = [],
}: UsersTableProps) {
  const navigate = useNavigate();
  const [sortColumn, setSortColumn] = useState<SortColumn>("username");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [selectedUserForOrganization, setSelectedUserForOrganization] =
    useState<User | null>(null);
  const [selectedOrganization, setSelectedOrganization] = useState<string>("");

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const getFilteredUsers = () => {
    let filtered = baseUsers;

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.username?.toLowerCase().includes(query) ||
          user.firstName?.toLowerCase().includes(query) ||
          user.lastName?.toLowerCase().includes(query) ||
          user.phoneNumber?.toLowerCase().includes(query) ||
          user.status?.toLowerCase().includes(query) ||
          user.organizations?.some((org) => org.toLowerCase().includes(query)),
      );
    }

    // Apply filters
    filters.forEach((filter) => {
      filtered = filtered.filter((user) => {
        const fieldValue = (user[filter.column as keyof typeof user] || "")
          .toString()
          .toLowerCase();

        switch (filter.operator) {
          case "between": {
            // Handle date range filter
            const [startStr, endStr] = filter.value.split("|");
            const startDate = new Date(startStr).getTime();
            const endDate = new Date(endStr).getTime();
            const fieldDate = new Date(fieldValue).getTime();
            return fieldDate >= startDate && fieldDate <= endDate;
          }
          case "is": {
            // Handle multi-select "is" operator
            const selectedValues = filter.value.split(",").map((v) => v.toLowerCase());
            return selectedValues.includes(fieldValue);
          }
          case "isNot": {
            // Handle multi-select "is not" operator
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

  const getSortedUsers = () => {
    const filteredUsers = getFilteredUsers();
    const sorted = [...filteredUsers].sort((a, b) => {
      let aVal: any = a[sortColumn];
      let bVal: any = b[sortColumn];

      if (typeof aVal === "string") {
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

  return (
    <>
      <Table variant="flat">
        <TableScroll>
          <TableContent>
            <TableHeader>
              <TableHeadRow>
                <TableHeadCell sticky className="w-64">
                  <SortHeader column="username" label="Username" />
                </TableHeadCell>
                <TableHeadCell>
                  <SortHeader column="firstName" label="First name" />
                </TableHeadCell>
                <TableHeadCell>
                  <SortHeader column="lastName" label="Last name" />
                </TableHeadCell>
                <TableHeadCell>
                  <SortHeader column="phoneNumber" label="Phone number" />
                </TableHeadCell>
                <TableHeadCell>
                  <span className="text-sm font-bold text-bluegrey-900">Organization</span>
                </TableHeadCell>
                <TableHeadCell>
                  <SortHeader column="status" label="Status" />
                </TableHeadCell>
                <TableHeadCell></TableHeadCell>
              </TableHeadRow>
            </TableHeader>
            <TableBody>
              {getSortedUsers().map((user, index) => (
                <TableRow key={index}>
                  <TableCell sticky className="w-56">
                    <button
                      type="button"
                      onClick={() => {
                        if (user.organizations.length > 1) {
                          setSelectedUserForOrganization(user);
                        } else {
                          navigate(
                            `/users/${encodeURIComponent(user.username)}?organization=${encodeURIComponent(user.organizations[0])}`
                          );
                        }
                      }}
                      className="text-sm text-bluegrey-900 group-hover:text-blue-500 truncate transition-colors text-left w-full"
                    >
                      {user.username}
                    </button>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-bluegrey-900 truncate">
                      {user.firstName}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-bluegrey-900 truncate">
                      {user.lastName}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-bluegrey-900 truncate">
                      {user.phoneNumber}
                    </span>
                  </TableCell>
                  {user.organizations.length === 1 ? (
                    <TableCell>
                      <span className="text-sm text-bluegrey-900 truncate">
                        {user.organizations[0]}
                      </span>
                    </TableCell>
                  ) : (
                    <td className="px-4 py-1">
                      <div className="flex flex-col gap-2">
                        {user.organizations.map((org, index) => (
                          <span key={index} className="text-sm text-bluegrey-900">
                            {org}
                          </span>
                        ))}
                      </div>
                    </td>
                  )}
                  <TableCell>
                    <StatusBadge status={user.status} />
                  </TableCell>
                  <TableActionCell>
                    <UserActionsMenu user={user} />
                  </TableActionCell>
                </TableRow>
              ))}
            </TableBody>
          </TableContent>
        </TableScroll>
      </Table>
      <ConfirmationModal
        open={selectedUserForOrganization !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedUserForOrganization(null);
            setSelectedOrganization("");
          }
        }}
        title="Select Organization"
        description={`${selectedUserForOrganization?.firstName} ${selectedUserForOrganization?.lastName} belongs to multiple organizations. Please select the organization context for viewing their details.`}
        primaryAction={{
          label: "Continue",
          onClick: () => {
            if (selectedUserForOrganization && selectedOrganization) {
              navigate(
                `/users/${encodeURIComponent(selectedUserForOrganization.username)}?organization=${encodeURIComponent(selectedOrganization)}`
              );
              setSelectedUserForOrganization(null);
              setSelectedOrganization("");
            }
          },
        }}
        tertiaryAction={{
          label: "Cancel",
          onClick: () => {
            setSelectedUserForOrganization(null);
            setSelectedOrganization("");
          },
        }}
      >
        {selectedUserForOrganization && (
          <Select
            value={selectedOrganization}
            onValueChange={setSelectedOrganization}
          >
            <SelectTrigger>
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
        )}
      </ConfirmationModal>
    </>
  );
}
