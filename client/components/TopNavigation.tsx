import { ChevronDown, Menu } from "lucide-react";

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

          <div className="flex items-center gap-4 h-full py-3">
            <div className="flex items-center gap-2 h-10">
              <div className="w-20 sm:w-32 h-16 flex items-center justify-center text-primary font-bold text-lg sm:text-xl">
                INSIDR
              </div>
            </div>
          </div>

          <div className="hidden lg:block h-10 w-px bg-bluegrey-100" />

          <button className="hidden lg:flex items-center gap-2 h-10 px-3 rounded-sm hover:bg-bluegrey-25 transition-colors">
            <span className="text-sm font-medium text-bluegrey-700 truncate max-w-[200px]">
              Road Ready Garage
            </span>
            <ChevronDown className="w-5 h-5 text-bluegrey-700 flex-shrink-0" />
          </button>
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

          <button className="flex items-center gap-2 h-10 px-0.5 rounded-sm hover:bg-bluegrey-25 transition-colors">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-base">L</span>
            </div>
            <ChevronDown className="w-5 h-5 text-blue-500" />
          </button>
        </div>
      </div>
    </div>
  );
}
