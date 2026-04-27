import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronDown, LogOut, User, ArrowLeft, Settings, LayoutDashboard, Sliders } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import UIConfigurationTab from "@/components/owAdmin/UIConfigurationTab";

// ─── Top bar ─────────────────────────────────────────────────────────────────

function AdminTopBar() {
  const navigate = useNavigate();

  return (
    <header className="h-16 bg-white border-b border-bluegrey-100 flex items-center px-6 justify-between sticky top-0 z-40 shadow-[0_1px_4px_0_rgba(1,5,50,0.06)]">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1.5 text-sm text-bluegrey-500 hover:text-bluegrey-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Consoles</span>
        </button>

        <div className="h-5 w-px bg-bluegrey-200" />

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-white">
              <path
                d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <span className="text-sm font-semibold text-bluegrey-900">OW Admin Console</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="hidden sm:block h-9 px-3 rounded-sm hover:bg-bluegrey-25 transition-colors">
          <span className="text-sm font-medium text-bluegrey-700">Docs</span>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 h-9 px-0.5 rounded-sm hover:bg-bluegrey-25 transition-colors">
              <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">L</span>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5">
              <p className="text-sm font-semibold text-bluegrey-900">Lucia Anderson</p>
              <p className="text-xs text-bluegrey-600">lucia.anderson@insurcar.com</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer flex items-center gap-2 text-red-600 hover:bg-red-50">
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

// ─── Left sidebar ─────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, disabled: true },
  { key: "ui-config", label: "UI Configuration", icon: Sliders, disabled: false },
  { key: "settings", label: "System Settings", icon: Settings, disabled: true },
];

function AdminSidebar({ active, onSelect }: { active: string; onSelect: (key: string) => void }) {
  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r border-bluegrey-100 bg-white min-h-[calc(100vh-64px)] sticky top-16">
      <nav className="py-4 px-3 flex-1">
        <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-bluegrey-400 mb-1">
          Admin
        </p>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.key;
          return (
            <button
              key={item.key}
              disabled={item.disabled}
              onClick={() => !item.disabled && onSelect(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors mb-0.5 ${
                item.disabled
                  ? "cursor-not-allowed text-bluegrey-300"
                  : isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-bluegrey-700 hover:bg-bluegrey-50 hover:text-bluegrey-900 cursor-pointer"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
              {item.disabled && (
                <span className="ml-auto text-[10px] bg-bluegrey-100 text-bluegrey-400 px-1.5 py-0.5 rounded-full font-medium">
                  Soon
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

// ─── Placeholder panel ────────────────────────────────────────────────────────

function ComingSoonPanel({ label }: { label: string }) {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[400px]">
      <div className="text-center max-w-xs">
        <div className="w-14 h-14 rounded-2xl bg-bluegrey-50 flex items-center justify-center mx-auto mb-4">
          <Settings className="w-7 h-7 text-bluegrey-300" />
        </div>
        <h2 className="text-base font-semibold text-bluegrey-700 mb-2">{label}</h2>
        <p className="text-sm text-bluegrey-400">This section is coming soon.</p>
      </div>
    </div>
  );
}

// ─── Page header ─────────────────────────────────────────────────────────────

const PAGE_TITLES: Record<string, string> = {
  "dashboard": "Dashboard",
  "ui-config": "UI Configuration",
  "settings": "System Settings",
};

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function OWAdminConsole() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSection = searchParams.get("section") ?? "ui-config";

  const setSection = (key: string) => {
    setSearchParams({ section: key });
  };

  return (
    <div className="min-h-screen bg-[#F7F7F9] flex flex-col">
      <AdminTopBar />

      <div className="flex flex-1">
        <AdminSidebar active={activeSection} onSelect={setSection} />

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {/* Page header */}
          <div className="bg-white border-b border-bluegrey-100 px-6 py-5">
            <h1 className="text-2xl font-semibold text-bluegrey-900">
              {PAGE_TITLES[activeSection] ?? "Admin"}
            </h1>
          </div>

          {/* Content */}
          <div className="bg-white mx-6 my-6 rounded-lg border border-bluegrey-100 overflow-hidden">
            {activeSection === "ui-config" && <UIConfigurationTab />}
            {activeSection === "dashboard" && <ComingSoonPanel label="Dashboard" />}
            {activeSection === "settings" && <ComingSoonPanel label="System Settings" />}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="py-4 flex items-center justify-center border-t border-bluegrey-100 bg-white">
        <p className="text-xs text-bluegrey-400">
          &copy; {new Date().getFullYear()} Thales Group · OW Admin Console
        </p>
      </footer>
    </div>
  );
}
