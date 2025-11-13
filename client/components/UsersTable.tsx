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
  {
    username: "thomas.thompson@example.com",
    firstName: "Thomas",
    lastName: "Thompson",
    phoneNumber: "+1 555666777",
    dateCreated: "2024-07-15 09:20:15",
    status: "active",
  },
  {
    username: "uma.upadhyay@example.com",
    firstName: "Uma",
    lastName: "Upadhyay",
    phoneNumber: "+91 8899001122",
    dateCreated: "2024-07-14 14:35:40",
    status: "active",
  },
  {
    username: "victor.victor@example.com",
    firstName: "Victor",
    lastName: "Victor",
    phoneNumber: "+33 111222333",
    dateCreated: "2024-07-13 10:15:25",
    status: "active",
  },
  {
    username: "wendy.williams@example.com",
    firstName: "Wendy",
    lastName: "Williams",
    phoneNumber: "+1 777888999",
    dateCreated: "2024-07-12 16:45:50",
    status: "active",
  },
  {
    username: "xavier.xu@example.com",
    firstName: "Xavier",
    lastName: "Xu",
    phoneNumber: "+86 2233445566",
    dateCreated: "2024-07-11 11:30:20",
    status: "active",
  },
  {
    username: "yara.young@example.com",
    firstName: "Yara",
    lastName: "Young",
    phoneNumber: "+44 555666777",
    dateCreated: "2024-07-10 13:20:35",
    status: "active",
  },
  {
    username: "zoe.zimmerman@example.com",
    firstName: "Zoe",
    lastName: "Zimmerman",
    phoneNumber: "+49 222333444",
    dateCreated: "2024-07-09 15:50:10",
    status: "active",
  },
  {
    username: "alice.anderson@example.com",
    firstName: "Alice",
    lastName: "Anderson",
    phoneNumber: "+1 888999000",
    dateCreated: "2024-07-15 08:25:45",
    status: "active",
  },
  {
    username: "brandon.brennan@example.com",
    firstName: "Brandon",
    lastName: "Brennan",
    phoneNumber: "+61 3344556677",
    dateCreated: "2024-07-14 12:10:30",
    status: "active",
  },
  {
    username: "charlotte.chen@example.com",
    firstName: "Charlotte",
    lastName: "Chen",
    phoneNumber: "+86 5566778899",
    dateCreated: "2024-07-13 14:40:20",
    status: "active",
  },
  {
    username: "david.dunn@example.com",
    firstName: "David",
    lastName: "Dunn",
    phoneNumber: "+1 222333444",
    dateCreated: "2024-07-12 10:05:15",
    status: "active",
  },
  {
    username: "emily.edwards@example.com",
    firstName: "Emily",
    lastName: "Edwards",
    phoneNumber: "+44 666777888",
    dateCreated: "2024-07-11 15:30:50",
    status: "active",
  },
  {
    username: "frank.fleming@example.com",
    firstName: "Frank",
    lastName: "Fleming",
    phoneNumber: "+33 555666777",
    dateCreated: "2024-07-10 09:45:25",
    status: "active",
  },
  {
    username: "grace.grant@example.com",
    firstName: "Grace",
    lastName: "Grant",
    phoneNumber: "+1 111222333",
    dateCreated: "2024-07-09 16:20:40",
    status: "active",
  },
  {
    username: "henry.harris@example.com",
    firstName: "Henry",
    lastName: "Harris",
    phoneNumber: "+49 333444555",
    dateCreated: "2024-07-15 13:15:10",
    status: "active",
  },
  {
    username: "iris.ingram@example.com",
    firstName: "Iris",
    lastName: "Ingram",
    phoneNumber: "+61 4455667788",
    dateCreated: "2024-07-14 11:50:35",
    status: "active",
  },
  {
    username: "james.jackson@example.com",
    firstName: "James",
    lastName: "Jackson",
    phoneNumber: "+1 333444555",
    dateCreated: "2024-07-13 09:30:20",
    status: "active",
  },
  {
    username: "karen.kemp@example.com",
    firstName: "Karen",
    lastName: "Kemp",
    phoneNumber: "+44 777888999",
    dateCreated: "2024-07-12 14:25:45",
    status: "active",
  },
  {
    username: "leon.lewis@example.com",
    firstName: "Leon",
    lastName: "Lewis",
    phoneNumber: "+33 666777888",
    dateCreated: "2024-07-11 10:40:15",
    status: "active",
  },
  {
    username: "maggie.miller@example.com",
    firstName: "Maggie",
    lastName: "Miller",
    phoneNumber: "+1 444555666",
    dateCreated: "2024-07-10 15:55:30",
    status: "active",
  },
  {
    username: "noah.norman@example.com",
    firstName: "Noah",
    lastName: "Norman",
    phoneNumber: "+49 444555666",
    dateCreated: "2024-07-09 12:30:50",
    status: "active",
  },
  {
    username: "oscar.owen@example.com",
    firstName: "Oscar",
    lastName: "Owen",
    phoneNumber: "+61 5566778899",
    dateCreated: "2024-07-15 10:15:20",
    status: "active",
  },
  {
    username: "paul.perry@example.com",
    firstName: "Paul",
    lastName: "Perry",
    phoneNumber: "+1 555666777",
    dateCreated: "2024-07-14 16:40:35",
    status: "active",
  },
  {
    username: "quinn.quinn2@example.com",
    firstName: "Quinn",
    lastName: "Quinn",
    phoneNumber: "+44 888999000",
    dateCreated: "2024-07-13 13:25:10",
    status: "active",
  },
  {
    username: "ruby.robinson@example.com",
    firstName: "Ruby",
    lastName: "Robinson",
    phoneNumber: "+33 777888999",
    dateCreated: "2024-07-12 11:50:45",
    status: "active",
  },
  {
    username: "samuel.sanders@example.com",
    firstName: "Samuel",
    lastName: "Sanders",
    phoneNumber: "+1 666777888",
    dateCreated: "2024-07-11 14:10:20",
    status: "active",
  },
  {
    username: "tina.taylor@example.com",
    firstName: "Tina",
    lastName: "Taylor",
    phoneNumber: "+49 555666777",
    dateCreated: "2024-07-10 10:35:30",
    status: "active",
  },
  {
    username: "uncle.usher@example.com",
    firstName: "Uncle",
    lastName: "Usher",
    phoneNumber: "+61 6677889900",
    dateCreated: "2024-07-09 15:45:15",
    status: "active",
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
            {[...users].sort((a, b) => a.username.localeCompare(b.username)).map((user, index) => (
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
