import { InsightCardProps } from "./InsightCard";

export interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: "Active" | "Inactive";
  phone?: string;
  startDate?: string;
  endDate?: string;
  address1?: string;
  address2?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  organization?: string;
  accessRoles?: Array<{
    id: string;
    name: string;
    expiryDate?: string;
  }>;
  recentEvents?: Array<{
    id: string;
    eventType: string;
    date: string;
    description?: string;
  }>;
}

export interface Insight extends InsightCardProps {
  id: string;
  priority: number;
}

export const generateUserInsights = (userData: UserData): Insight[] => {
  const insights: Insight[] = [];

  // 1. Account Validity Check
  const accountValidity = checkAccountValidity(userData);
  if (accountValidity) {
    insights.push(accountValidity);
  }

  // 2. Access Roles Analysis
  const rolesInsight = analyzeAccessRoles(userData);
  if (rolesInsight) {
    insights.push(rolesInsight);
  }

  // 3. Security Recommendations
  const securityInsights = generateSecurityRecommendations(userData);
  insights.push(...securityInsights);

  // 4. Recent Activity Summary
  const activityInsight = summarizeRecentActivity(userData);
  if (activityInsight) {
    insights.push(activityInsight);
  }

  // Sort by priority (higher first)
  return insights.sort((a, b) => b.priority - a.priority);
};

const checkAccountValidity = (userData: UserData): Insight | null => {
  if (!userData.endDate) {
    return {
      id: "account-validity",
      priority: 100,
      type: "info",
      severity: "medium",
      title: "Account Status",
      description: `User account is currently ${userData.status}. No expiry date set.`,
      actions: [
        {
          label: "Set Expiry Date",
          onClick: () => {
            document.getElementById("endDate")?.focus();
          },
        },
      ],
    };
  }

  const endDate = new Date(userData.endDate);
  const today = new Date();
  const daysUntilExpiry = Math.ceil(
    (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilExpiry < 0) {
    return {
      id: "account-expired",
      priority: 150,
      type: "error",
      severity: "high",
      title: "Account Expired",
      description: `User account validity expired ${Math.abs(daysUntilExpiry)} days ago on ${endDate.toLocaleDateString()}. Immediate action required.`,
      actions: [
        {
          label: "Update Validity",
          variant: "primary",
          onClick: () => {
            document.getElementById("endDate")?.focus();
          },
        },
      ],
    };
  }

  if (daysUntilExpiry <= 30) {
    return {
      id: "account-expiring-soon",
      priority: 120,
      type: "warning",
      severity: "high",
      title: "Account Expiry Warning",
      description: `User account will expire in ${daysUntilExpiry} days on ${endDate.toLocaleDateString()}. Renewal recommended.`,
      actions: [
        {
          label: "Extend Validity",
          variant: "primary",
          onClick: () => {
            document.getElementById("endDate")?.focus();
          },
        },
      ],
    };
  }

  return {
    id: "account-valid",
    priority: 10,
    type: "success",
    severity: "low",
    title: "Account Valid",
    description: `User account is valid until ${endDate.toLocaleDateString()} (${daysUntilExpiry} days remaining).`,
  };
};

const analyzeAccessRoles = (userData: UserData): Insight | null => {
  const roles = userData.accessRoles || [];

  if (roles.length === 0) {
    return {
      id: "no-roles",
      priority: 110,
      type: "warning",
      severity: "medium",
      title: "No Access Roles",
      description:
        "User has no assigned access roles. They may have limited functionality or access.",
      actions: [
        {
          label: "Add Role",
          variant: "primary",
          onClick: () => {
            const accessTab = document.querySelector('[value="access"]') as HTMLElement;
            if (accessTab) {
              accessTab.click();
              setTimeout(() => {
                const addButton = document.querySelector(
                  '[data-action="add-role"]'
                ) as HTMLElement;
                if (addButton) {
                  addButton.scrollIntoView({ behavior: "smooth", block: "center" });
                  addButton.classList.add("ring-2", "ring-blue-500");
                }
              }, 300);
            }
          },
        },
      ],
    };
  }

  // Check for expiring roles
  const expiringRoles = roles.filter((role) => {
    if (!role.expiryDate) return false;
    const expiry = new Date(role.expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil(
      (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  });

  if (expiringRoles.length > 0) {
    return {
      id: "roles-expiring",
      priority: 100,
      type: "warning",
      severity: "medium",
      title: "Access Roles Expiring Soon",
      description: `${expiringRoles.length} role(s) will expire within 30 days: ${expiringRoles.map((r) => r.name).join(", ")}`,
      actions: [
        {
          label: "Review Roles",
          onClick: () => {
            const accessTab = document.querySelector('[value="access"]') as HTMLElement;
            if (accessTab) {
              accessTab.click();
            }
          },
        },
      ],
    };
  }

  return {
    id: "roles-ok",
    priority: 5,
    type: "success",
    severity: "low",
    title: "Access Roles",
    description: `User has ${roles.length} active role(s). All roles are valid.`,
  };
};

const generateSecurityRecommendations = (userData: UserData): Insight[] => {
  const recommendations: Insight[] = [];

  // Recommendation 1: Enable MFA
  recommendations.push({
    id: "enable-mfa",
    priority: 90,
    type: "tip",
    severity: "medium",
    title: "Security: Enable Multi-Factor Authentication",
    description:
      "Consider enabling multi-factor authentication (MFA) for enhanced account security and compliance.",
    actions: [
      {
        label: "Configure MFA",
        onClick: () => {
          const securityTab = document.querySelector('[value="security"]') as HTMLElement;
          if (securityTab) {
            securityTab.click();
            setTimeout(() => {
              const mfaButton = document.querySelector(
                '[data-action="configure-mfa"]'
              ) as HTMLElement;
              if (mfaButton) {
                mfaButton.scrollIntoView({ behavior: "smooth", block: "center" });
              }
            }, 300);
          }
        },
      },
    ],
  });

  // Recommendation 2: Review Account Activity
  recommendations.push({
    id: "review-activity",
    priority: 50,
    type: "tip",
    severity: "low",
    title: "Security: Review Recent Activity",
    description: "Periodically review user activity logs to monitor for suspicious access patterns.",
    actions: [
      {
        label: "View Event Log",
        onClick: () => {
          const eventsTab = document.querySelector('[value="events"]') as HTMLElement;
          if (eventsTab) {
            eventsTab.click();
          }
        },
      },
    ],
  });

  return recommendations;
};

const summarizeRecentActivity = (userData: UserData): Insight | null => {
  const events = userData.recentEvents || [];

  if (events.length === 0) {
    return {
      id: "no-recent-activity",
      priority: 20,
      type: "info",
      severity: "low",
      title: "Recent Activity",
      description: "No recent activity found for this user.",
    };
  }

  const loginEvents = events.filter((e) => e.eventType.toLowerCase().includes("login"));
  const failedEvents = events.filter(
    (e) =>
      e.eventType.toLowerCase().includes("failed") ||
      e.description?.toLowerCase().includes("failed")
  );

  let description = `User has ${events.length} recent event(s). `;
  if (loginEvents.length > 0) {
    description += `${loginEvents.length} login event(s). `;
  }
  if (failedEvents.length > 0) {
    description += `⚠️ ${failedEvents.length} failed event(s) detected.`;
  }

  return {
    id: "recent-activity",
    priority: failedEvents.length > 0 ? 80 : 30,
    type: failedEvents.length > 0 ? "warning" : "info",
    severity: failedEvents.length > 0 ? "medium" : "low",
    title: "Recent Activity Summary",
    description: description.trim(),
    actions: [
      {
        label: "View Details",
        onClick: () => {
          const eventsTab = document.querySelector('[value="events"]') as HTMLElement;
          if (eventsTab) {
            eventsTab.click();
          }
        },
      },
    ],
  };
};
