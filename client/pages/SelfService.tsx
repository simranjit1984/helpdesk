import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Home, LogOut, User, Rocket, ShieldCheck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import ApplicationLaunchpad from "@/components/selfService/ApplicationLaunchpad";
import MyAccessRoles from "@/components/selfService/MyAccessRoles";

// ─── Sidebar nav items ────────────────────────────────────────────────────────

type SectionKey = "launchpad" | "access-roles";

interface NavItem {
  key: SectionKey;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    key: "launchpad",
    label: "Application launchpad",
    icon: <Rocket className="w-5 h-5" />,
  },
  {
    key: "access-roles",
    label: "My access roles",
    icon: <ShieldCheck className="w-5 h-5" />,
  },
];

// ─── Main page ────────────────────────────────────────────────────────────────

export default function SelfService() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<SectionKey>("launchpad");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeNav = NAV_ITEMS.find((n) => n.key === activeSection)!;

  return (
    <div className="min-h-screen bg-[#F7F7F9] flex flex-col">
      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white shadow-[0_2px_4px_0_rgba(1,5,50,0.04),0_4px_5px_0_rgba(1,5,50,0.04),0_1px_10px_0_rgba(1,5,50,0.08)] z-50 flex items-center px-4 gap-4">
        {/* Hamburger (mobile) */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden p-2 hover:bg-bluegrey-25 rounded transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" fill="#5D607E" />
          </svg>
        </button>

        {/* Logo */}
        <div className="flex items-center gap-4 h-full">
          <img
            src="https://cdn.cookielaw.org/logos/467a8616-fd17-4578-b473-813e8a67f9f6/0199b9ad-7fd9-79d5-afb8-5b5726f4bbc8/22ee737d-6777-4142-b416-eadb243496af/Thales_Logo.160px.png"
            alt="Thales"
            className="h-8 w-auto"
          />
        </div>

        <div className="hidden lg:block h-8 w-px bg-bluegrey-100" />

        <span className="hidden lg:block text-sm font-medium text-bluegrey-700">
          Self Service
        </span>

        {/* Centre — Main page button */}
        <div className="flex-1 flex items-center justify-center">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 h-10 px-4 rounded-sm border border-bluegrey-200 bg-white hover:bg-bluegrey-25 hover:border-bluegrey-400 transition-all text-sm font-medium text-bluegrey-700"
          >
            <Home className="w-4 h-4 text-bluegrey-600" />
            Main page
          </button>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 sm:gap-4 h-10">
          <button className="hidden sm:block h-10 px-3 rounded-sm hover:bg-bluegrey-25 transition-colors">
            <span className="text-sm font-medium text-bluegrey-700">Docs</span>
          </button>
          <button className="hidden md:flex items-center gap-2 h-10 px-3 rounded-sm hover:bg-bluegrey-25 transition-colors">
            <span className="text-sm font-medium text-bluegrey-700">English</span>
            <ChevronDown className="w-4 h-4 text-bluegrey-700" />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center h-10 px-0.5 rounded-sm hover:bg-bluegrey-25 transition-colors">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-white font-bold text-base">L</span>
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

      {/* ── Body (sidebar + content) ─────────────────────────────────────────── */}
      <div className="flex flex-1 pt-16">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/25 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Left sidebar ─────────────────────────────────────────────────── */}
        <aside
          className={`fixed left-0 top-16 bottom-0 w-72 bg-white shadow-[0_2px_2px_0_rgba(1,5,50,0.02),0_3px_4px_0_rgba(1,5,50,0.02),0_1px_5px_0_rgba(1,5,50,0.04)] z-40 flex flex-col transition-transform duration-300 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          {/* Portal label */}
          <div className="px-4 pt-5 pb-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-bluegrey-500">
              Self Service Portal
            </span>
          </div>

          <nav className="flex flex-col">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.key;
              return (
                <div key={item.key} className="relative">
                  <button
                    onClick={() => {
                      setActiveSection(item.key);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left ${
                      isActive
                        ? "bg-blue-50 text-bluegrey-900"
                        : "hover:bg-bluegrey-25 text-bluegrey-900"
                    }`}
                  >
                    <span
                      className={`flex-shrink-0 ${isActive ? "text-blue-500" : "text-bluegrey-500"}`}
                    >
                      {item.icon}
                    </span>
                    <span
                      className={`text-base leading-6 ${isActive ? "font-bold" : "font-normal"}`}
                    >
                      {item.label}
                    </span>
                  </button>
                  {isActive && (
                    <div className="absolute left-0 top-0 w-1 h-full bg-[#041295] rounded-r" />
                  )}
                </div>
              );
            })}
          </nav>
        </aside>

        {/* ── Main content ─────────────────────────────────────────────────── */}
        <main className="flex-1 ml-0 lg:ml-72 flex flex-col min-h-[calc(100vh-4rem)]">
          {/* Page header bar */}
          <div className="bg-white border-b border-bluegrey-100 px-8 py-5">
            <h1 className="text-2xl font-bold text-bluegrey-900">{activeNav.label}</h1>
          </div>

          {/* Section content */}
          <div className="flex flex-col flex-1">
            {activeSection === "launchpad" && <ApplicationLaunchpad />}
            {activeSection === "access-roles" && <MyAccessRoles />}
          </div>
        </main>
      </div>
    </div>
  );
}
