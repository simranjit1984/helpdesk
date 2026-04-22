import { useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface PersonaTileProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  disabled?: boolean;
  badge?: string;
}

function PersonaTile({ icon, title, description, href, disabled, badge }: PersonaTileProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (!disabled) {
      navigate(href);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`
        group relative flex flex-col items-center text-center gap-6 p-10 rounded-2xl border-2 transition-all duration-200
        ${disabled
          ? "border-bluegrey-100 bg-white cursor-not-allowed opacity-60"
          : "border-bluegrey-100 bg-white hover:border-blue-500 hover:shadow-[0_8px_30px_rgba(4,18,149,0.12)] cursor-pointer active:scale-[0.99]"
        }
      `}
    >
      {badge && (
        <span className="absolute top-4 right-4 text-xs font-medium px-2.5 py-1 rounded-full bg-bluegrey-100 text-bluegrey-700">
          {badge}
        </span>
      )}

      {/* Icon container */}
      <div
        className={`
          w-20 h-20 rounded-2xl flex items-center justify-center transition-colors duration-200
          ${disabled
            ? "bg-bluegrey-100"
            : "bg-blue-50 group-hover:bg-blue-500"
          }
        `}
      >
        <div
          className={`transition-colors duration-200 ${disabled ? "text-bluegrey-400" : "text-blue-500 group-hover:text-white"}`}
        >
          {icon}
        </div>
      </div>

      {/* Text */}
      <div className="flex flex-col gap-2">
        <h2
          className={`text-xl font-semibold transition-colors duration-200 ${disabled ? "text-bluegrey-400" : "text-bluegrey-900 group-hover:text-blue-500"}`}
        >
          {title}
        </h2>
        <p className="text-sm text-bluegrey-600 leading-relaxed max-w-[220px]">
          {description}
        </p>
      </div>

      {/* Arrow indicator */}
      {!disabled && (
        <div
          className={`
            w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200
            border-bluegrey-200 group-hover:border-blue-500 group-hover:bg-blue-500
          `}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            className="transition-colors duration-200 text-bluegrey-400 group-hover:text-white"
          >
            <path
              d="M9 18l6-6-6-6"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </button>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function OWAdminIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM12 7C13.4 7 14.8 8.1 14.8 9.5V11C15.4 11 16 11.6 16 12.3V15.8C16 16.4 15.4 17 14.7 17H9.2C8.6 17 8 16.4 8 15.7V12.2C8 11.6 8.6 11 9.2 11V9.5C9.2 8.1 10.6 7 12 7ZM12 8.2C11.2 8.2 10.5 8.8 10.5 9.5V11H13.5V9.5C13.5 8.8 12.8 8.2 12 8.2Z"
        fill="currentColor"
      />
    </svg>
  );
}

function DMv2Icon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M16 11C17.66 11 18.99 9.66 18.99 8C18.99 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 10.99 9.66 10.99 8C10.99 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V19H15V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15.02 17 16.5V19H23V16.5C23 14.17 18.33 13 16 13Z"
        fill="currentColor"
      />
    </svg>
  );
}

function SelfServiceIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"
        fill="currentColor"
      />
    </svg>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function PersonaSelection() {
  return (
    <div className="min-h-screen bg-[#F7F7F9] flex flex-col">
      {/* Top bar */}
      <header className="h-16 bg-white shadow-[0_2px_4px_0_rgba(1,5,50,0.04),0_4px_5px_0_rgba(1,5,50,0.04),0_1px_10px_0_rgba(1,5,50,0.08)] flex items-center px-6 justify-between">
        <div className="flex items-center gap-6">
          <img
            src="https://cdn.cookielaw.org/logos/467a8616-fd17-4578-b473-813e8a67f9f6/0199b9ad-7fd9-79d5-afb8-5b5726f4bbc8/22ee737d-6777-4142-b416-eadb243496af/Thales_Logo.160px.png"
            alt="Thales"
            className="h-8 w-auto"
          />
        </div>

        <div className="flex items-center gap-4">
          <button className="hidden sm:block h-10 px-3 rounded-sm hover:bg-bluegrey-25 transition-colors">
            <span className="text-sm font-medium text-bluegrey-700">Docs</span>
          </button>
          <button className="hidden md:flex items-center gap-2 h-10 px-3 rounded-sm hover:bg-bluegrey-25 transition-colors">
            <span className="text-sm font-medium text-bluegrey-700">English</span>
            <ChevronDown className="w-4 h-4 text-bluegrey-700" />
          </button>

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
                <p className="text-sm font-semibold text-bluegrey-900">Lucia Anderson</p>
                <p className="text-xs text-bluegrey-600">lucia.anderson@insurcar.com</p>
                <p className="text-xs text-bluegrey-600">InsurCar Inc.</p>
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

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        {/* Header text */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-bluegrey-900 mb-3">
            Welcome to OneWelcome
          </h1>
          <p className="text-base text-bluegrey-600 max-w-md">
            Select a console to continue. Each console is tailored for a different role and set of responsibilities.
          </p>
        </div>

        {/* Tiles grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
          <PersonaTile
            icon={<OWAdminIcon />}
            title="OW Admin Console"
            description="Manage platform-level settings, tenants, and system-wide configurations."
            href="/ow-admin"
            disabled
            badge="Coming soon"
          />

          <PersonaTile
            icon={<DMv2Icon />}
            title="DMv2 Management Console"
            description="Manage delegated users, organizations, access roles, and administrator assignments."
            href="/users"
          />

          <PersonaTile
            icon={<SelfServiceIcon />}
            title="Self Service"
            description="Allow end users to manage their own profile, consents, and account settings."
            href="/self-service"
            disabled
            badge="Coming soon"
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 flex items-center justify-center">
        <p className="text-xs text-bluegrey-500">
          &copy; {new Date().getFullYear()} Thales Group. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
