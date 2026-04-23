import { Tag, Icons } from "@onewelcome/react-lib-components";

type StatusType =
  | "active"
  | "invited"
  | "invitation-withdrawn"
  | "invitation-expired"
  | "blocked"
  | "grace"
  | "inactive"
  | "suspended"
  | "pending";

interface StatusBadgeProps {
  status: StatusType;
}

interface StatusConfig {
  icon: Icons;
  label: string;
  /** Pass undefined to use a built-in Tag variant instead */
  backgroundColor?: string;
  color?: string;
  variant?: "enabled" | "disabled";
}

const STATUS_CONFIG: Record<StatusType, StatusConfig> = {
  active: {
    icon: Icons.CheckmarkCircle,
    label: "Active",
    variant: "enabled", // uses UCL var(--color-green100) automatically
  },
  invited: {
    icon: Icons.Envelope,
    label: "Invited",
    backgroundColor: "var(--color-orange50)",
    color: "var(--color-orange600)",
  },
  grace: {
    icon: Icons.Clock,
    label: "Grace",
    backgroundColor: "var(--color-orange50)",
    color: "var(--color-orange600)",
  },
  pending: {
    icon: Icons.PendingCircle,
    label: "Pending",
    backgroundColor: "var(--color-orange50)",
    color: "var(--color-orange600)",
  },
  inactive: {
    icon: Icons.MinusCircle,
    label: "Inactive",
    variant: "disabled", // uses UCL var(--color-blue-grey100) automatically
  },
  suspended: {
    icon: Icons.MinusCircle,
    label: "Suspended",
    variant: "disabled",
  },
  "invitation-withdrawn": {
    icon: Icons.TimesCircle,
    label: "Invitation withdrawn",
    variant: "disabled",
  },
  "invitation-expired": {
    icon: Icons.TimesCircle,
    label: "Invitation expired",
    variant: "disabled",
  },
  blocked: {
    icon: Icons.Forbidden,
    label: "Authentication blocked",
    backgroundColor: "var(--color-red50)",
    color: "var(--color-red700)",
  },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const { icon, label, variant, backgroundColor, color } = STATUS_CONFIG[status];

  return (
    <Tag
      icon={icon}
      variant={variant}
      backgroundColor={backgroundColor}
      color={color}
    >
      {label}
    </Tag>
  );
}
