import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MoreVertical, CheckCircle } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ label: string; action: string } | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const scrollStateRef = useRef({ lastY: 0, isCollapsed: false });

  const getMenuItems = () => {
    switch (status) {
      case "active":
        return [
          { label: "Assign administrator role", action: "Assign administrator role" },
          { label: "Block authorization", action: "Block authorization" },
          { label: "Block authentication", action: "Block authentication" },
          { label: "Remove user from organization", action: "Remove user from organization" },
          { label: "Delete user", action: "Delete user" },
        ];
      case "blocked":
        return [
          { label: "Assign administrator role", action: "Assign administrator role" },
          { label: "Block authorization", action: "Block authorization" },
          { label: "Unblock authentication", action: "Unblock authentication" },
          { label: "Remove user from organization", action: "Remove user from organization" },
          { label: "Delete user", action: "Delete user" },
        ];
      default:
        return [];
    }
  };

  const handleActionClick = (item: { label: string; action: string }) => {
    setPendingAction(item);
    setIsConfirmModalOpen(true);
    setIsOpen(false);
  };

  const handleConfirmAction = () => {
    if (pendingAction) {
      toast({
        title: pendingAction.action,
        description: `Action performed for ${firstName} ${lastName}`,
      });
      setIsConfirmModalOpen(false);
      setPendingAction(null);
    }
  };

  const handleCancelAction = () => {
    setIsConfirmModalOpen(false);
    setPendingAction(null);
  };

  const menuItems = getMenuItems();

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
            {menuItems.length > 0 && (
              <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                <DropdownMenuTrigger asChild>
                  <button className={`flex h-10 w-10 items-center justify-center rounded-[2px] transition-colors ${isOpen ? "bg-bluegrey-50" : "hover:bg-bluegrey-50"}`}>
                    <MoreVertical className="h-6 w-6 text-bluegrey-700" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[280px]">
                  {menuItems.map((item) => (
                    <DropdownMenuItem
                      key={item.action}
                      onClick={() => handleActionClick(item)}
                    >
                      {item.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Description - hidden when collapsed */}
        {!isCollapsed && (
          <div className="text-base text-bluegrey-900 max-w-4xl h-auto flex-grow-0 flex items-center gap-2">
            <span className="font-bold">{organization}</span>
            <span>|</span>
            <span>{phone}</span>
            <span>{email}</span>
          </div>
        )}
      </div>

      <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
        <DialogContent className="max-w-[480px] border-0 bg-white p-0 rounded-sm shadow-[0_24px_38px_0_rgba(1,5,50,0.04),4px_9px_46px_0_rgba(1,5,50,0.04),0_11px_15px_0_rgba(1,5,50,0.08)]">
          <div className="flex items-start justify-between px-6 py-4">
            <DialogHeader className="text-left">
              <DialogTitle className="text-xl font-medium leading-8 text-bluegrey-900">
                {pendingAction?.label}
              </DialogTitle>
            </DialogHeader>
          </div>

          <div className="px-6 py-4">
            <DialogDescription className="text-base text-bluegrey-900">
              Are you sure you want {pendingAction?.label?.toLowerCase()}?
            </DialogDescription>
          </div>

          <div className="border-t border-[#DEDEE6] px-6 py-4">
            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={handleCancelAction}
                className="rounded-[2px] text-bluegrey-700"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleConfirmAction}
                className="gap-2 rounded-[2px] bg-blue-500 hover:bg-opacity-90"
              >
                Continue
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
