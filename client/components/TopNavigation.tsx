import { Menu, Settings, LogOut, User, ChevronDown } from "lucide-react";
import NotificationPanel from "./NotificationPanel";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface TopNavigationProps {
  onMenuClick: () => void;
}

export default function TopNavigation({ onMenuClick }: TopNavigationProps) {
  return (
    <div className="fixed top-0 left-0 right-0 h-16 bg-white shadow-[0_2px_4px_0_rgba(1,5,50,0.04),0_4px_5px_0_rgba(1,5,50,0.04),0_1px_10px_0_rgba(1,5,50,0.08)] z-50">
      <div className="flex items-center justify-between h-full px-3">
        <div className="flex items-center gap-3 lg:gap-12 h-full">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-bluegrey-25 rounded transition-colors"
          >
            <Menu className="w-6 h-6 text-bluegrey-700" />
          </button>

          <div className="flex items-center gap-4 h-full">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2F82e2f8ec35ab46749ef52edc2f137b7b%2Fbdd4b384c28d4324be102c97f6f95202"
              alt="InsurCar Inc."
              className="h-full w-auto"
            />
          </div>

          <div className="hidden lg:block h-10 w-px bg-bluegrey-100" />

          <span className="text-sm font-medium text-bluegrey-700 truncate max-w-[200px]">
            InsurCar
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 h-10 pl-2 sm:pl-4">
          <button className="hidden sm:block h-10 px-3 rounded-sm hover:bg-bluegrey-25 transition-colors">
            <span className="text-sm font-medium text-bluegrey-700">Docs</span>
          </button>

          <button className="hidden md:flex items-center gap-2 h-10 px-3 rounded-sm hover:bg-bluegrey-25 transition-colors">
            <span className="text-sm font-medium text-bluegrey-700">
              English
            </span>
            <ChevronDown className="w-5 h-5 text-bluegrey-700" />
          </button>

          <NotificationPanel />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 h-10 px-0.5 rounded-sm hover:bg-bluegrey-25 transition-colors">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-white font-bold text-base">L</span>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5">
                <p className="text-sm font-semibold text-bluegrey-900">
                  Lucia Anderson
                </p>
                <p className="text-xs text-bluegrey-600">Administrator</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer flex items-center gap-2">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer flex items-center gap-2 text-red-600 hover:bg-red-50">
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
