import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MoreVertical, CheckCircle } from "lucide-react";
import { Button } from "./ui/button";

interface UserDetailHeaderProps {
  firstName: string;
  lastName: string;
  organization: string;
  phone: string;
  email: string;
  status: "active" | "invited" | "blocked" | "inactive" | "grace" | "invitation-withdrawn" | "invitation-expired";
}

export default function UserDetailHeader({
  firstName,
  lastName,
  organization,
  phone,
  email,
  status,
}: UserDetailHeaderProps) {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const scrollStateRef = useRef({ lastY: 0, isCollapsed: false });

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const direction = scrollY > scrollStateRef.current.lastY ? 'down' : 'up';
      scrollStateRef.current.lastY = scrollY;

      let newIsCollapsed = scrollStateRef.current.isCollapsed;

      // Large hysteresis: only change state at clear thresholds
      // Collapse: only when scrolling DOWN past 120px
      if (direction === 'down' && scrollY > 120 && !scrollStateRef.current.isCollapsed) {
        newIsCollapsed = true;
      }
      // Expand: only when scrolling UP below 30px
      else if (direction === 'up' && scrollY < 30 && scrollStateRef.current.isCollapsed) {
        newIsCollapsed = false;
      }

      // Only update state if it actually changed
      if (newIsCollapsed !== scrollStateRef.current.isCollapsed) {
        scrollStateRef.current.isCollapsed = newIsCollapsed;
        setIsCollapsed(newIsCollapsed);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`sticky top-16 bg-bluegrey-25 px-4 sm:px-6 lg:px-8 z-30 transition-all duration-300 ${
        isCollapsed ? "py-3 lg:py-4" : "py-6 lg:py-8"
      }`}
    >
      <div className="flex flex-col gap-1">
        {/* Back button - visible above title when expanded */}
        {!isCollapsed && (
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-blue-500 hover:underline transition-all w-fit"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back to users</span>
          </button>
        )}

        {/* Title row */}
        <div className="flex items-center justify-between gap-8">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* Back button - positioned in front when collapsed */}
            {isCollapsed && (
              <button
                onClick={() => navigate("/")}
                className="flex items-center justify-center text-blue-500 hover:opacity-70 transition-all flex-shrink-0"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
            )}
            <h1
              className={`font-medium text-bluegrey-750 transition-all duration-300 ${
                isCollapsed
                  ? "text-xl sm:text-2xl leading-7"
                  : "text-3xl sm:text-4xl lg:text-[42px] lg:leading-[50px]"
              }`}
            >
              {firstName} {lastName}
            </h1>
            {status === "active" && (
              <div className="flex items-center gap-2 rounded-full bg-green-100 px-3 py-1">
                <CheckCircle className="h-5 w-5 text-green-900" />
                <span className="text-base text-green-900">Active</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              className="rounded-[2px] border-2 border-blue-500 text-blue-500 hover:bg-blue-50"
            >
              Reset password
            </Button>
            <button className="flex h-10 w-10 items-center justify-center rounded-[2px] hover:bg-bluegrey-50 transition-colors">
              <MoreVertical className="h-6 w-6 text-bluegrey-700" />
            </button>
          </div>
        </div>

        {/* Description - hidden when collapsed */}
        {!isCollapsed && (
          <div className="text-base text-bluegrey-900 max-w-4xl">
            <span className="font-bold">{organization}</span>
            <span>  |  {phone}  {email}</span>
          </div>
        )}
      </div>
    </div>
  );
}
