import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LogOut, User, ArrowLeft, Settings } from "lucide-react";
import { ContentHeader, LeftNav, LeftNavMenuItem, Icon, Icons } from "@onewelcome/react-lib-components";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import UIConfigurationTab from "@/components/owAdmin/UIConfigurationTab";
import DMv2DeployTab from "@/components/owAdmin/DMv2DeployTab";

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

// ─── Nav items builder ────────────────────────────────────────────────────────

function buildNavItems(activeSection: string, uiConfigEnabled: boolean): LeftNavMenuItem[] {
  return [
    {
      key: "dashboard",
      path: "dashboard",
      title: "DMv2 Deploy",
      active: activeSection === "dashboard",
      iconComponent: <Icon icon={Icons.Build} />,
    },
    {
      key: "ui-config",
      path: "ui-config",
      title: "UI Configuration",
      active: activeSection === "ui-config",
      disabled: !uiConfigEnabled,
      iconComponent: <Icon icon={Icons.Grid} />,
    },
    {
      key: "settings",
      path: "settings",
      title: "System Settings",
      active: activeSection === "settings",
      disabled: true,
      iconComponent: <Icon icon={Icons.Gearwheel} />,
    },
  ];
}

// ─── Page header titles ───────────────────────────────────────────────────────

const PAGE_TITLES: Record<string, string> = {
  dashboard: "DMv2 Deploy",
  "ui-config": "UI Configuration",
  settings: "System Settings",
};

// ─── Main page ────────────────────────────────────────────────────────────────

export default function OWAdminConsole() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSection = searchParams.get("section") ?? "dashboard";

  // Deployment state — once deployed, UI Configuration unlocks
  const [isDeployed, setIsDeployed] = useState(false);
  const [deployedOrgName, setDeployedOrgName] = useState<string>("");

  // Collapse ContentHeader on scroll
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  useEffect(() => {
    const onScroll = () => setHeaderCollapsed(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const setSection = (key: string) => {
    setSearchParams({ section: key });
  };

  function handleDeployed(orgName: string) {
    setIsDeployed(true);
    setDeployedOrgName(orgName);
  }

  return (
    <div className="min-h-screen bg-[#F7F7F9] flex flex-col">
      <AdminTopBar />

      <div className="flex flex-1">
        {/* UCL Left navigation */}
        <LeftNav
          items={buildNavItems(activeSection, true)}
          navigate={(path) => setSection(path)}
          isSideMenuOpen={true}
          marginTop="4rem"
          internalLinkPrefix="#"
        />

        {/* Main content */}
        <main className="flex-1 min-w-0 flex flex-col">
          {/* Page header */}
          <ContentHeader title={PAGE_TITLES[activeSection] ?? "Admin"} collapsed={headerCollapsed}>
            {activeSection === "dashboard"
              ? isDeployed
                ? `Tenant deployed · ${deployedOrgName}`
                : "Configure and deploy a new DMv2 tenant. Once deployed, the UI Configuration section will become available."
              : undefined}
          </ContentHeader>

          {/* Content */}
          <div className="bg-white flex-1">
            {activeSection === "dashboard" && (
              <DMv2DeployTab
                isDeployed={isDeployed}
                deployedOrgName={deployedOrgName}
                onDeployed={(orgName) => handleDeployed(orgName)}
              />
            )}
            {activeSection === "ui-config" && <UIConfigurationTab />}
            {activeSection === "settings" && (
              <div className="flex-1 flex items-center justify-center min-h-[400px]">
                <div className="text-center max-w-xs">
                  <div className="w-14 h-14 rounded-2xl bg-bluegrey-50 flex items-center justify-center mx-auto mb-4">
                    <Settings className="w-7 h-7 text-bluegrey-300" />
                  </div>
                  <h2 className="text-base font-semibold text-bluegrey-700 mb-2">System Settings</h2>
                  <p className="text-sm text-bluegrey-400">This section is coming soon.</p>
                </div>
              </div>
            )}
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
