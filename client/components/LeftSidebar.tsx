import { Users, History, ChevronDown } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
  hasSubmenu?: boolean;
}

function MenuItem({ icon, label, href, active, hasSubmenu }: MenuItemProps) {
  return (
    <div className="relative">
      <Link
        to={href}
        className={`w-full flex items-center gap-3 px-4 py-[18px] transition-colors block ${
          active ? "bg-blue-50" : "hover:bg-bluegrey-25"
        }`}
      >
        <div className="flex items-center gap-2 flex-1">
          <div className="w-6 h-6 flex-shrink-0">{icon}</div>
          <span
            className={`text-base ${
              active ? "font-bold text-bluegrey-900" : "text-bluegrey-900"
            }`}
          >
            {label}
          </span>
        </div>
        {hasSubmenu && <ChevronDown className="w-6 h-6 text-bluegrey-900" />}
      </Link>
      {active && (
        <div className="absolute right-0 top-0 w-1 h-full bg-blue-500 rounded-l" />
      )}
    </div>
  );
}

interface LeftSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LeftSidebar({ isOpen, onClose }: LeftSidebarProps) {
  const location = useLocation();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}
      <div
        className={`fixed left-0 top-16 bottom-0 w-60 bg-white shadow-[0_2px_2px_0_rgba(1,5,50,0.02),0_3px_4px_0_rgba(1,5,50,0.02),0_1px_5px_0_rgba(1,5,50,0.04)] z-40 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <nav className="flex flex-col">
          <MenuItem
            icon={<Users className="w-6 h-6 text-bluegrey-900" />}
            label="Users"
            href="/"
            active={location.pathname === "/"}
          />
          <MenuItem
            icon={<History className="w-6 h-6 text-bluegrey-900" />}
            label="Event log"
            href="/event-log"
            active={location.pathname === "/event-log"}
          />
        </nav>
      </div>
    </>
  );
}
