import { CheckCircle, Clock, Ban, Timer } from "lucide-react";

type StatusType =
  | "active"
  | "invited"
  | "invitation-withdrawn"
  | "invitation-expired"
  | "blocked"
  | "grace"
  | "inactive"
  | "invitation-accepted";

interface StatusBadgeProps {
  status: StatusType;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = {
    active: {
      bg: "bg-green-100",
      text: "text-green-900",
      icon: <CheckCircle className="w-5 h-5" />,
      label: "Active",
    },
    "invitation-accepted": {
      bg: "bg-green-100",
      text: "text-green-900",
      icon: <CheckCircle className="w-5 h-5" />,
      label: "Invitation accepted",
    },
    invited: {
      bg: "bg-orange-100",
      text: "text-orange-900",
      icon: (
        <svg
          className="w-5 h-5"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9.99984 1.6665C5.39984 1.6665 1.6665 5.39984 1.6665 9.99984C1.6665 14.5998 5.39984 18.3332 9.99984 18.3332C14.5998 18.3332 18.3332 14.5998 18.3332 9.99984C18.3332 5.39984 14.5998 1.6665 9.99984 1.6665ZM9.99984 16.6665C6.3165 16.6665 3.33317 13.6832 3.33317 9.99984C3.33317 6.3165 6.3165 3.33317 9.99984 3.33317C13.6832 3.33317 16.6665 6.3165 16.6665 9.99984C16.6665 13.6832 13.6832 16.6665 9.99984 16.6665Z"
            fill="currentColor"
          />
          <path
            d="M5.83317 11.2498C6.52353 11.2498 7.08317 10.6902 7.08317 9.99984C7.08317 9.30948 6.52353 8.74984 5.83317 8.74984C5.14281 8.74984 4.58317 9.30948 4.58317 9.99984C4.58317 10.6902 5.14281 11.2498 5.83317 11.2498Z"
            fill="currentColor"
          />
          <path
            d="M9.99984 11.2498C10.6902 11.2498 11.2498 10.6902 11.2498 9.99984C11.2498 9.30948 10.6902 8.74984 9.99984 8.74984C9.30948 8.74984 8.74984 9.30948 8.74984 9.99984C8.74984 10.6902 9.30948 11.2498 9.99984 11.2498Z"
            fill="currentColor"
          />
          <path
            d="M14.1665 11.2498C14.8569 11.2498 15.4165 10.6902 15.4165 9.99984C15.4165 9.30948 14.8569 8.74984 14.1665 8.74984C13.4761 8.74984 12.9165 9.30948 12.9165 9.99984C12.9165 10.6902 13.4761 11.2498 14.1665 11.2498Z"
            fill="currentColor"
          />
        </svg>
      ),
      label: "Invited",
    },
    grace: {
      bg: "bg-orange-100",
      text: "text-orange-900",
      icon: <Timer className="w-5 h-5" />,
      label: "Grace",
    },
    inactive: {
      bg: "bg-orange-100",
      text: "text-orange-900",
      icon: <Ban className="w-5 h-5" />,
      label: "Inactive",
    },
    "invitation-withdrawn": {
      bg: "bg-bluegrey-100",
      text: "text-bluegrey-900",
      icon: <Ban className="w-5 h-5" />,
      label: "Invitation withdrawn",
    },
    "invitation-expired": {
      bg: "bg-bluegrey-100",
      text: "text-bluegrey-900",
      icon: <Ban className="w-5 h-5" />,
      label: "Invitation expired",
    },
    blocked: {
      bg: "bg-bluegrey-100",
      text: "text-bluegrey-900",
      icon: <Ban className="w-5 h-5" />,
      label: "Authentication blocked",
    },
  };

  const config = statusConfig[status];

  return (
    <div
      className={`inline-flex items-center gap-1 px-3 py-1 ${config.bg} rounded-full`}
    >
      <div className="flex items-center gap-1 pr-1.5">
        <div className={config.text}>{config.icon}</div>
        <span className={`text-base ${config.text}`}>{config.label}</span>
      </div>
    </div>
  );
}
