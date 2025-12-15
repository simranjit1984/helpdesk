import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MoreVertical } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import ConfirmationModal from "./ConfirmationModal";
import StatusBadge from "./StatusBadge";
import { useToast } from "@/hooks/use-toast";

interface OrganizationDetailHeaderProps {
  organizationName: string;
  description?: string;
  status?: "active" | "inactive";
  isNew?: boolean;
  showActions?: boolean;
}

export default function OrganizationDetailHeader({
  organizationName,
  description,
  status,
  isNew = false,
  showActions = false,
}: OrganizationDetailHeaderProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    label: string;
    action: string;
  } | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const scrollStateRef = useRef({ lastY: 0, isCollapsed: false });

  const getMenuItems = () => {
    if (isNew) return [];

    return [
      { label: "Delete organization", action: "Delete organization" },
    ];
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
        description: `Action performed for ${organizationName}`,
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
      const direction = scrollY > scrollStateRef.current.lastY ? "down" : "up";
      scrollStateRef.current.lastY = scrollY;

      let newIsCollapsed = scrollStateRef.current.isCollapsed;

      if (
        direction === "down" &&
        scrollY > 120 &&
        !scrollStateRef.current.isCollapsed
      ) {
        newIsCollapsed = true;
      } else if (
        direction === "up" &&
        scrollY < 30 &&
        scrollStateRef.current.isCollapsed
      ) {
        newIsCollapsed = false;
      }

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
        {!isCollapsed && (
          <button
            onClick={() => navigate("/organizations")}
            className="flex items-center gap-2 text-blue-500 hover:underline transition-all w-fit"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back to organizations</span>
          </button>
        )}

        <div className="flex items-center justify-between gap-8">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {isCollapsed && (
              <button
                onClick={() => navigate("/organizations")}
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
              {organizationName}
            </h1>
            {status && !isNew && (
              <div className="flex-shrink-0">
                <StatusBadge status={status} />
              </div>
            )}
          </div>

          {showActions && !isNew && menuItems.length > 0 && (
            <div className="flex items-center gap-4">
              <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                <DropdownMenuTrigger asChild>
                  <button
                    className={`flex h-10 w-10 items-center justify-center rounded-[2px] transition-colors ${isOpen ? "bg-bluegrey-50" : "hover:bg-bluegrey-50"}`}
                  >
                    <MoreVertical className="h-6 w-6 text-bluegrey-700" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[200px]">
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
            </div>
          )}
        </div>

        {!isCollapsed && description && (
          <div className="text-base text-bluegrey-900 max-w-4xl h-auto flex-grow-0">
            {description}
          </div>
        )}
      </div>

      <ConfirmationModal
        open={isConfirmModalOpen}
        onOpenChange={setIsConfirmModalOpen}
        title={pendingAction?.label || ""}
        description={`Are you sure you want to ${pendingAction?.label?.toLowerCase()}?`}
        tertiaryAction={{
          label: "Cancel",
          onClick: handleCancelAction,
        }}
        primaryAction={{
          label: "Continue",
          onClick: handleConfirmAction,
        }}
      />
    </div>
  );
}
