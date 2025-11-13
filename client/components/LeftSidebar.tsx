import {
  Users,
  Building2,
  Badge,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  hasSubmenu?: boolean;
}

function MenuItem({ icon, label, active, hasSubmenu }: MenuItemProps) {
  return (
    <div className="relative">
      <button
        className={`w-full flex items-center gap-3 px-4 py-[18px] transition-colors ${
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
      </button>
      {active && (
        <div className="absolute right-0 top-0 w-1 h-full bg-blue-500 rounded-l" />
      )}
    </div>
  );
}

export default function LeftSidebar() {
  return (
    <div className="fixed left-0 top-16 bottom-0 w-60 bg-white shadow-[0_2px_2px_0_rgba(1,5,50,0.02),0_3px_4px_0_rgba(1,5,50,0.02),0_1px_5px_0_rgba(1,5,50,0.04)] z-40">
      <nav className="flex flex-col">
        <MenuItem
          icon={<Users className="w-6 h-6 text-bluegrey-900" />}
          label="Users"
          active
        />
        <MenuItem
          icon={<Building2 className="w-6 h-6 text-bluegrey-900" />}
          label="Organizations"
        />
        <MenuItem
          icon={<Badge className="w-6 h-6 text-bluegrey-900" />}
          label="Access roles"
        />
        <MenuItem
          icon={<ShieldCheck className="w-6 h-6 text-bluegrey-900" />}
          label="Administrators"
          hasSubmenu
        />
      </nav>
    </div>
  );
}
