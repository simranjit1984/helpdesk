import { MoreVertical } from "lucide-react";
import StatusBadge from "./StatusBadge";

type StatusType =
  | "active"
  | "invited"
  | "invitation-withdrawn"
  | "invitation-expired"
  | "blocked"
  | "grace"
  | "inactive"
  | "invitation-accepted";

interface User {
  username: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dateCreated: string;
  status: StatusType;
}

const users: User[] = [
  {
    username: "alison.adams@example.com",
    firstName: "Alison",
    lastName: "Adams",
    phoneNumber: "+44 123456789",
    dateCreated: "2024-07-15 11:57:50",
    status: "active",
  },
  {
    username: "benjamin.brown@example.com",
    firstName: "Benjamin",
    lastName: "Brown",
    phoneNumber: "+33 987654321",
    dateCreated: "2024-07-13 09:23:21",
    status: "invited",
  },
  {
    username: "carla.clarke@example.com",
    firstName: "Carla",
    lastName: "Clarke",
    phoneNumber: "+39 555123456",
    dateCreated: "2024-07-12 13:15:24",
    status: "invitation-withdrawn",
  },
  {
    username: "daniel.davies@example.com",
    firstName: "Daniel",
    lastName: "Davies",
    phoneNumber: "+49 111222333",
    dateCreated: "2024-07-12 11:42:02",
    status: "invitation-expired",
  },
  {
    username: "emma.evans@example.com",
    firstName: "Emma",
    lastName: "Evans",
    phoneNumber: "+46 777888999",
    dateCreated: "2024-07-15 10:52:35",
    status: "active",
  },
  {
    username: "felix.fischer@example.com",
    firstName: "Felix",
    lastName: "Fischer",
    phoneNumber: "+41 333444555",
    dateCreated: "2024-07-12 08:16:38",
    status: "active",
  },
  {
    username: "george.garcia@example.com",
    firstName: "George",
    lastName: "Garcia",
    phoneNumber: "+34 666777888",
    dateCreated: "2024-07-11 11:21:05",
    status: "active",
  },
  {
    username: "hannah.hughes@example.com",
    firstName: "Hannah",
    lastName: "Hughes",
    phoneNumber: "+31 999888777",
    dateCreated: "2024-07-13 08:52:38",
    status: "blocked",
  },
  {
    username: "isabel.ivanova@example.com",
    firstName: "Isabel",
    lastName: "Ivanova",
    phoneNumber: "+32 888999000",
    dateCreated: "2024-07-13 09:33:13",
    status: "grace",
  },
  {
    username: "jack.jensen@example.com",
    firstName: "Jack",
    lastName: "Jensen",
    phoneNumber: "+30 444555666",
    dateCreated: "2024-07-13 10:09:26",
    status: "blocked",
  },
  {
    username: "kate.kennedy@example.com",
    firstName: "Kate",
    lastName: "Kennedy",
    phoneNumber: "+45 222333444",
    dateCreated: "2024-07-14 14:22:11",
    status: "active",
  },
  {
    username: "lucas.lopez@example.com",
    firstName: "Lucas",
    lastName: "Lopez",
    phoneNumber: "+34 111222333",
    dateCreated: "2024-07-10 16:45:30",
    status: "active",
  },
  {
    username: "maria.martinez@example.com",
    firstName: "Maria",
    lastName: "Martinez",
    phoneNumber: "+52 555666777",
    dateCreated: "2024-07-09 10:30:45",
    status: "active",
  },
  {
    username: "nathan.nelson@example.com",
    firstName: "Nathan",
    lastName: "Nelson",
    phoneNumber: "+1 888999000",
    dateCreated: "2024-07-11 09:15:22",
    status: "grace",
  },
  {
    username: "olivia.oliver@example.com",
    firstName: "Olivia",
    lastName: "Oliver",
    phoneNumber: "+61 777888999",
    dateCreated: "2024-07-08 13:40:18",
    status: "inactive",
  },
  {
    username: "peter.parker@example.com",
    firstName: "Peter",
    lastName: "Parker",
    phoneNumber: "+1 555444333",
    dateCreated: "2024-07-14 11:25:50",
    status: "active",
  },
  {
    username: "quinn.quinn@example.com",
    firstName: "Quinn",
    lastName: "Quinn",
    phoneNumber: "+353 666555444",
    dateCreated: "2024-07-07 15:10:35",
    status: "invitation-accepted",
  },
  {
    username: "rachel.rogers@example.com",
    firstName: "Rachel",
    lastName: "Rogers",
    phoneNumber: "+44 333222111",
    dateCreated: "2024-07-12 08:55:42",
    status: "blocked",
  },
  {
    username: "steve.smith@example.com",
    firstName: "Steve",
    lastName: "Smith",
    phoneNumber: "+1 444333222",
    dateCreated: "2024-07-06 12:30:20",
    status: "grace",
  },
];

export default function UsersTable() {
  return (
    <div className="bg-white rounded border-2 border-bluegrey-100 lg:border-0">
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-bluegrey-300 scrollbar-track-bluegrey-50">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-bluegrey-100">
              <th className="sticky left-0 z-10 bg-bluegrey-25 text-left px-3 py-2.5 whitespace-nowrap w-64 shadow-[1px_0_3px_rgba(0,0,0,0.05)]">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-bluegrey-900">
                    Username
                  </span>
                </div>
              </th>
              <th className="bg-bluegrey-25 text-left px-3 py-2.5 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-bluegrey-900">
                    First name
                  </span>
                </div>
              </th>
              <th className="bg-bluegrey-25 text-left px-3 py-2.5 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-bluegrey-900">
                    Last name
                  </span>
                </div>
              </th>
              <th className="bg-bluegrey-25 text-left px-3 py-2.5 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-bluegrey-900">
                    Phone number
                  </span>
                </div>
              </th>
              <th className="bg-bluegrey-25 text-left px-3 py-2.5 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-bluegrey-900">
                    Date created
                  </span>
                </div>
              </th>
              <th className="bg-bluegrey-25 text-left px-3 py-2.5 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-bluegrey-900">
                    Status
                  </span>
                </div>
              </th>
              <th className="bg-bluegrey-25 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr
                key={index}
                className="border-b-2 border-bluegrey-100 hover:bg-bluegrey-25/50 transition-colors"
              >
                <td className="sticky left-0 z-10 bg-white px-4 py-1 border-r border-bluegrey-100 shadow-[1px_0_3px_rgba(0,0,0,0.05)]">
                  <div className="h-10 flex items-center w-56">
                    <span className="text-sm text-bluegrey-900 truncate">
                      {user.username}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-1">
                  <div className="h-10 flex items-center whitespace-nowrap overflow-hidden">
                    <span className="text-sm text-bluegrey-900 truncate">
                      {user.firstName}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-1">
                  <div className="h-10 flex items-center whitespace-nowrap overflow-hidden">
                    <span className="text-sm text-bluegrey-900 truncate">
                      {user.lastName}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-1">
                  <div className="h-10 flex items-center whitespace-nowrap overflow-hidden">
                    <span className="text-sm text-bluegrey-900 truncate">
                      {user.phoneNumber}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-1">
                  <div className="h-10 flex items-center whitespace-nowrap overflow-hidden">
                    <span className="text-sm text-bluegrey-900 truncate">
                      {user.dateCreated}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-1">
                  <div className="h-10 flex items-center whitespace-nowrap">
                    <StatusBadge status={user.status} />
                  </div>
                </td>
                <td className="py-1">
                  <div className="h-10 flex items-center justify-center">
                    <button className="w-10 h-10 flex items-center justify-center rounded hover:bg-bluegrey-100 transition-colors">
                      <MoreVertical className="w-6 h-6 text-blue-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
