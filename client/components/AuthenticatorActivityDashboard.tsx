import React, { useMemo } from "react";
import { CheckCircle, AlertCircle, Clock, Shield, Brain } from "lucide-react";
import { Event } from "./mockEvents";

interface AuthenticatorActivityDashboardProps {
  events: Event[];
  authenticatorCategories: {
    authenticators: string[];
    externalProviders: string[];
    passkeys: string[];
  };
  onReviewCard?: (cardType: string, data: any) => void;
}

const getAuthenticatorFromEvent = (event: Event): string | null => {
  if (!event.description) return null;

  const description = event.description.toLowerCase();

  if (description.includes("sms otp")) return "SMS OTP";
  if (description.includes("email otp")) return "Email OTP";
  if (description.includes("totp")) return "TOTP";
  if (description.includes("qr code")) return "QR code Enrollment";
  if (description.includes("push") || description.includes("mfa")) return "Push MFA";
  if (description.includes("magic link")) return "Magic link authentication";
  if (description.includes("username") || description.includes("password")) return "Username & Password";

  if (description.includes("google")) return "Google";
  if (description.includes("facebook")) return "Facebook";
  if (description.includes("apple")) return "Apple";
  if (description.includes("digid")) return "DigiD";
  if (description.includes("eherkenning")) return "eHerkenning";
  if (description.includes("microsoft entra") || description.includes("entra id")) return "Microsoft EntraID";
  if (description.includes("microsoft ad")) return "Microsoft AD";

  if (description.includes("icloud") || description.includes("keychain")) return "iCloud Keychain";
  if (description.includes("safenet") || description.includes("fido")) return "Safenet FIDO Key";
  if (description.includes("chrome passkey") || description.includes("chrome")) return "Chrome Passkey";
  if (description.includes("yubikey") || description.includes("yubi")) return "Yubikey";

  return null;
};

const isAuthenticatorEvent = (event: Event): boolean => {
  return getAuthenticatorFromEvent(event) !== null;
};

const getEventStatus = (description: string): "success" | "failure" => {
  const lowerDesc = description?.toLowerCase() || "";
  if (lowerDesc.includes("failed") || lowerDesc.includes("failure") || lowerDesc.includes("lockout") || lowerDesc.includes("invalid")) {
    return "failure";
  }
  return "success";
};

export default function AuthenticatorActivityDashboard({
  events,
  authenticatorCategories,
}: AuthenticatorActivityDashboardProps) {
  const stats = useMemo(() => {
    const authEvents = events.filter(isAuthenticatorEvent);
    const successCount = authEvents.filter(
      (e) => getEventStatus(e.description || "") === "success"
    ).length;
    const failureCount = authEvents.filter(
      (e) => getEventStatus(e.description || "") === "failure"
    ).length;
    const totalCount = authEvents.length;
    const successRate = totalCount > 0 ? Math.round((successCount / totalCount) * 100) : 0;

    // Get latest event date
    const latestEvent = authEvents.length > 0 ? authEvents[0] : null;

    // Count unique authenticators used
    const uniqueAuthenticators = new Set(
      authEvents.map((e) => getAuthenticatorFromEvent(e)).filter(Boolean)
    ).size;

    return {
      totalCount,
      successCount,
      failureCount,
      successRate,
      latestEvent: latestEvent?.date || "Never",
      uniqueAuthenticators,
    };
  }, [events]);

  const getStatusColor = (successRate: number) => {
    if (successRate === 100) return "text-green-600";
    if (successRate >= 75) return "text-green-500";
    if (successRate >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Events Card */}
        <div className="bg-white border border-bluegrey-100 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <p className="text-xs font-semibold text-bluegrey-600 uppercase tracking-wide">
                Total Events
              </p>
              <p className="text-2xl font-bold text-bluegrey-900">
                {stats.totalCount}
              </p>
            </div>
            <Clock className="h-5 w-5 text-bluegrey-400 flex-shrink-0" />
          </div>
          <p className="text-xs text-bluegrey-600 mt-2">
            Last activity: {stats.latestEvent}
          </p>
        </div>

        {/* Success Rate Card */}
        <div className="bg-white border border-bluegrey-100 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <p className="text-xs font-semibold text-bluegrey-600 uppercase tracking-wide">
                Success Rate
              </p>
              <p className={`text-2xl font-bold ${getStatusColor(stats.successRate)}`}>
                {stats.successRate}%
              </p>
            </div>
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
          </div>
          <p className="text-xs text-bluegrey-600 mt-2">
            {stats.successCount} successful out of {stats.totalCount}
          </p>
        </div>

        {/* Failed Events Card */}
        <div className="bg-white border border-bluegrey-100 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <p className="text-xs font-semibold text-bluegrey-600 uppercase tracking-wide">
                Failed Events
              </p>
              <p className={`text-2xl font-bold ${stats.failureCount > 0 ? "text-red-600" : "text-green-600"}`}>
                {stats.failureCount}
              </p>
            </div>
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          </div>
          <p className="text-xs text-bluegrey-600 mt-2">
            {stats.failureCount > 0 ? "Review failed attempts" : "No failures detected"}
          </p>
        </div>

        {/* Active Authenticators Card */}
        <div className="bg-white border border-bluegrey-100 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <p className="text-xs font-semibold text-bluegrey-600 uppercase tracking-wide">
                Active Authenticators
              </p>
              <p className="text-2xl font-bold text-bluegrey-900">
                {stats.uniqueAuthenticators}
              </p>
            </div>
            <Shield className="h-5 w-5 text-blue-600 flex-shrink-0" />
          </div>
          <p className="text-xs text-bluegrey-600 mt-2">
            in use
          </p>
        </div>
      </div>

    </div>
  );
}
