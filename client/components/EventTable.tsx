import { useState, useMemo } from "react";
import { ChevronUp, ChevronDown, ChevronRight } from "lucide-react";
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
  timestamp: string;
  username: string;
  action: EventAction;
  description: string;
  ip_address: string;
  user_agent: string;
}

type SortColumn = "timestamp" | "username" | "action";

interface EventTableProps {
  filters: Array<{ id: string; column: string; operator: string; value: string }>;
  searchQuery?: string;
  filterByUsername?: string;
}

const EVENT_ACTIONS: Record<EventAction, string> = {
  user_created: "User Created",
  user_deleted: "User Deleted",
  user_updated: "User Updated",
  user_login: "User Login",
  user_logout: "User Logout",
  password_changed: "Password Changed",
  role_assigned: "Role Assigned",
  role_revoked: "Role Revoked",
  permission_granted: "Permission Granted",
  permission_revoked: "Permission Revoked",
};

const MOCK_USERNAMES = [
  "alison.adams@example.com",
  "benjamin.brown@example.com",
  "carla.clarke@example.com",
  "daniel.davies@example.com",
  "emma.evans@example.com",
  "felix.fischer@example.com",
  "george.garcia@example.com",
  "hannah.hughes@example.com",
  "isabel.ivanova@example.com",
  "jack.jensen@example.com",
  "kate.kennedy@example.com",
  "lucas.lopez@example.com",
];

const MOCK_ACTIONS: EventAction[] = [
  "user_created",
  "user_deleted",
  "user_updated",
  "user_login",
  "user_logout",
  "password_changed",
  "role_assigned",
  "role_revoked",
  "permission_granted",
  "permission_revoked",
];

const MOCK_IPS = [
  "192.168.1.1",
  "10.0.0.1",
  "172.16.0.1",
  "203.0.113.42",
  "198.51.100.5",
  "192.0.2.100",
];

const MOCK_USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15",
];

const generateMockEvents = (): Event[] => {
  const events: Event[] = [];
  const now = new Date();
  now.setHours(23, 59, 59, 999);

  for (let dayOffset = 0; dayOffset <= 13; dayOffset++) {
    const date = new Date(now);
    date.setDate(date.getDate() - dayOffset);
    date.setHours(0, 0, 0, 0);

    const eventsPerDay = Math.floor(Math.random() * 10) + 6;

    for (let i = 0; i < eventsPerDay; i++) {
      const randomHour = Math.floor(Math.random() * 24);
      const randomMinute = Math.floor(Math.random() * 60);
      const randomSecond = Math.floor(Math.random() * 60);

      const eventDate = new Date(date);
      eventDate.setHours(randomHour, randomMinute, randomSecond);

      const username = MOCK_USERNAMES[Math.floor(Math.random() * MOCK_USERNAMES.length)];
      const action = MOCK_ACTIONS[Math.floor(Math.random() * MOCK_ACTIONS.length)];
      const ip = MOCK_IPS[Math.floor(Math.random() * MOCK_IPS.length)];
      const userAgent = MOCK_USER_AGENTS[Math.floor(Math.random() * MOCK_USER_AGENTS.length)];

      const descriptions: Record<EventAction, string> = {
        user_created: `New user created: ${username}`,
        user_deleted: `User deleted: ${username}`,
        user_updated: `User profile updated: ${username}`,
        user_login: `User logged in: ${username}`,
        user_logout: `User logged out: ${username}`,
        password_changed: `Password changed for: ${username}`,
        role_assigned: `Role assigned to: ${username}`,
        role_revoked: `Role revoked from: ${username}`,
        permission_granted: `Permission granted to: ${username}`,
        permission_revoked: `Permission revoked from: ${username}`,
      };

      const year = eventDate.getFullYear();
      const month = String(eventDate.getMonth() + 1).padStart(2, "0");
      const day = String(eventDate.getDate()).padStart(2, "0");
      const hours = String(eventDate.getHours()).padStart(2, "0");
      const minutes = String(eventDate.getMinutes()).padStart(2, "0");
      const seconds = String(eventDate.getSeconds()).padStart(2, "0");
      const timestamp = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

      events.push({
        id: `event-${dayOffset}-${i}`,
        timestamp,
        username,
        action,
        description: descriptions[action],
        ip_address: ip,
        user_agent: userAgent,
      });
    }
  }

  return events.sort((a, b) => new Date(b.timestamp.replace(" ", "T")).getTime() - new Date(a.timestamp.replace(" ", "T")).getTime());
};

const baseEvents = generateMockEvents();

export default function EventTable({ filters, searchQuery = "", filterByUsername }: EventTableProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn>("timestamp");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
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

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
  };

  const getFilteredEvents = () => {
    let filtered = [...baseEvents];

    if (filterByUsername) {
      filtered = filtered.filter((event) => event.username === filterByUsername);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.username.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query) ||
          event.action.includes(query)
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
            return fieldValue.toLowerCase().includes(filter.value.toLowerCase());
          case "equals":
            return fieldValue.toLowerCase() === filter.value.toLowerCase();
          case "startsWith":
            return fieldValue.toLowerCase().startsWith(filter.value.toLowerCase());
          case "endsWith":
            return fieldValue.toLowerCase().endsWith(filter.value.toLowerCase());
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
        <span className="text-sm font-bold text-bluegrey-900">
          {label}
        </span>
        <div className="w-4 h-4">
          {isActive && (
            sortDirection === "asc" ? (
              <ChevronUp className="w-4 h-4 text-blue-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-blue-500" />
            )
          )}
        </div>
      </button>
    );
  };

  return (
    <Table variant="flat">
      <TableScroll>
        <TableContent>
          <TableHeader>
            <TableHeadRow>
              <TableHeadCell sticky className="w-48">
                <SortHeader column="timestamp" label="Timestamp" />
              </TableHeadCell>
              <TableHeadCell className="w-64">
                <SortHeader column="username" label="Username" />
              </TableHeadCell>
              <TableHeadCell>
                <SortHeader column="action" label="Action" />
              </TableHeadCell>
              <TableHeadCell>
                <span className="text-sm font-bold text-bluegrey-900">Description</span>
              </TableHeadCell>
              <TableHeadCell>
                <span className="text-sm font-bold text-bluegrey-900">IP Address</span>
              </TableHeadCell>
            </TableHeadRow>
          </TableHeader>
          <TableBody>
            {getSortedEvents().map((event, index) => (
              <TableRow key={index}>
                <TableCell sticky className="w-48">
                  <span className="text-sm text-bluegrey-900">{event.timestamp}</span>
                </TableCell>
                <TableCell className="w-64">
                  <span className="text-sm text-blue-500 font-medium">{event.username}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-bluegrey-900">{EVENT_ACTIONS[event.action]}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-bluegrey-700">{event.description}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-bluegrey-700">{event.ip_address}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </TableContent>
      </TableScroll>
    </Table>
  );
}
