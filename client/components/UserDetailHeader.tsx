import { useEffect, useState } from "react";
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

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (scrollY > 100 && !isCollapsed) {
        setIsCollapsed(true);
      } else if (scrollY < 50 && isCollapsed) {
        setIsCollapsed(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isCollapsed]);

  return (
    <div
      className={`sticky top-16 bg-bluegrey-25 px-4 sm:px-6 lg:px-8 z-30 transition-all duration-300 ${
        isCollapsed ? "py-3 lg:py-4" : "py-6 lg:py-8"
      }`}
    >
      <div className="flex flex-col gap-4">
        {/* Back button */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-blue-500 hover:underline transition-all w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Back to users</span>
        </button>

        {/* Title row */}
        <div className="flex items-center justify-between gap-8">
          <div className="flex items-center gap-4 flex-1 min-w-0">
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
          <div className="text-base text-bluegrey-900">
            <span className="font-bold">{organization}</span>
            <span> | {phone} {email}</span>
          </div>
        )}
      </div>
    </div>
  );
}
