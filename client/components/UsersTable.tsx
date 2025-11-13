import { MoreVertical } from "lucide-react";
import StatusBadge from "./StatusBadge";

interface User {
  username: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dateCreated: string;
  status: "active" | "inactive";
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
    status: "active",
  },
  {
    username: "carla.clarke@example.com",
    firstName: "Carla",
    lastName: "Clarke",
    phoneNumber: "+39 555123456",
    dateCreated: "2024-07-12 13:15:24",
    status: "active",
  },
  {
    username: "daniel.davies@example.com",
    firstName: "Daniel",
    lastName: "Davies",
    phoneNumber: "+49 111222333",
    dateCreated: "2024-07-12 11:42:02",
    status: "active",
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
    status: "active",
  },
  {
    username: "isabel.ivanova@example.com",
    firstName: "Isabel",
    lastName: "Ivanova",
    phoneNumber: "+32 888999000",
    dateCreated: "2024-07-13 09:33:13",
    status: "active",
  },
  {
    username: "jack.jensen@example.com",
    firstName: "Jack",
    lastName: "Jensen",
    phoneNumber: "+30 444555666",
    dateCreated: "2024-07-13 10:09:26",
    status: "active",
  },
];

export default function UsersTable() {
  return (
    <div className="bg-white rounded">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-bluegrey-100">
              <th className="bg-bluegrey-25 text-left px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-bluegrey-900">
                    Username
                  </span>
                </div>
              </th>
              <th className="bg-bluegrey-25 text-left px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-bluegrey-900">
                    First name
                  </span>
                </div>
              </th>
              <th className="bg-bluegrey-25 text-left px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-bluegrey-900">
                    Last name
                  </span>
                </div>
              </th>
              <th className="bg-bluegrey-25 text-left px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-bluegrey-900">
                    Phone number
                  </span>
                </div>
              </th>
              <th className="bg-bluegrey-25 text-left px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-bluegrey-900">
                    Date created
                  </span>
                </div>
              </th>
              <th className="bg-bluegrey-25 text-left px-3 py-2.5">
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
                <td className="px-4 py-1">
                  <div className="h-10 flex items-center">
                    <span className="text-sm text-bluegrey-900 truncate">
                      {user.username}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-1">
                  <div className="h-10 flex items-center">
                    <span className="text-sm text-bluegrey-900">
                      {user.firstName}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-1">
                  <div className="h-10 flex items-center">
                    <span className="text-sm text-bluegrey-900">
                      {user.lastName}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-1">
                  <div className="h-10 flex items-center">
                    <span className="text-sm text-bluegrey-900">
                      {user.phoneNumber}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-1">
                  <div className="h-10 flex items-center">
                    <span className="text-sm text-bluegrey-900">
                      {user.dateCreated}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-1">
                  <div className="h-10 flex items-center">
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
