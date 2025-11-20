import { ChevronDown, ChevronUp } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
  hasSubmenu?: boolean;
  isExpanded?: boolean;
  onToggle?: () => void;
  submenuItems?: SubmenuItemProps[];
}

interface SubmenuItemProps {
  label: string;
  href: string;
  active?: boolean;
}

function SubmenuItem({ label, href, active }: SubmenuItemProps) {
  return (
    <div className="relative">
      <Link
        to={href}
        className={`flex items-center px-12 py-3 transition-colors ${
          active ? "bg-blue-50" : "hover:bg-bluegrey-25"
        }`}
      >
        <span
          className={`text-base leading-6 ${
            active ? "font-bold text-bluegrey-900" : "text-bluegrey-900"
          }`}
        >
          {label}
        </span>
      </Link>
      {active && (
        <div className="absolute left-0 top-0 w-1 h-full bg-[#041295] rounded-r" />
      )}
    </div>
  );
}

function MenuItem({
  icon,
  label,
  href,
  active,
  hasSubmenu,
  isExpanded,
  onToggle,
  submenuItems,
}: MenuItemProps) {
  const handleChevronClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggle) {
      onToggle();
    }
  };

  const firstSubmenuHref = submenuItems?.[0]?.href;
  const navigateHref = hasSubmenu ? firstSubmenuHref || href : href;

  const content = (
    <div className="relative">
      <div
        className={`flex items-center gap-3 px-4 py-[18px] transition-colors ${
          active ? "bg-blue-50" : "hover:bg-bluegrey-25"
        }`}
      >
        <div className="flex items-center gap-2 flex-1">
          <div className="w-6 h-6 flex-shrink-0">{icon}</div>
          <span
            className={`text-base leading-6 ${
              active || isExpanded ? "font-bold text-bluegrey-900" : "text-bluegrey-900"
            }`}
          >
            {label}
          </span>
        </div>
        {hasSubmenu && (
          <button
            onClick={handleChevronClick}
            className="p-0 hover:opacity-70 transition-opacity"
          >
            {isExpanded ? (
              <ChevronUp className="w-6 h-6 text-bluegrey-900" />
            ) : (
              <ChevronDown className="w-6 h-6 text-bluegrey-900" />
            )}
          </button>
        )}
      </div>
      {active && (
        <div className="absolute left-0 top-0 w-1 h-full bg-[#041295] rounded-r" />
      )}
    </div>
  );

  return (
    <div className="flex flex-col">
      <Link to={navigateHref}>{content}</Link>
      {hasSubmenu && isExpanded && submenuItems && (
        <div className="flex flex-col">
          {submenuItems.map((item, index) => (
            <SubmenuItem key={index} {...item} />
          ))}
        </div>
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
  const isAdministratorsActive = location.pathname.startsWith("/administrators");
  const [isAdministratorsExpanded, setIsAdministratorsExpanded] = useState(isAdministratorsActive);

  const isUsersActive = location.pathname === "/" || location.pathname.startsWith("/users/");
  const isEventLogActive = location.pathname === "/event-log";

  useEffect(() => {
    if (isAdministratorsActive && !isAdministratorsExpanded) {
      setIsAdministratorsExpanded(true);
    }
  }, [location.pathname]);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/25 z-30 lg:hidden"
          onClick={onClose}
        />
      )}
      <div
        className={`fixed left-0 top-16 bottom-0 w-60 bg-white shadow-[0_2px_2px_0_rgba(1,5,50,0.02),0_3px_4px_0_rgba(1,5,50,0.02),0_1px_5px_0_rgba(1,5,50,0.04)] z-40 transition-transform duration-300 overflow-y-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <nav className="flex flex-col">
          <MenuItem
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 6C13.1 6 14 6.9 14 8C14 9.1 13.1 10 12 10C10.9 10 10 9.1 10 8C10 6.9 10.9 6 12 6ZM12 15C14.7 15 17.8 16.29 18 17V18H6V17.01C6.2 16.29 9.3 15 12 15ZM12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4ZM12 13C9.33 13 4 14.34 4 17V20H20V17C20 14.34 14.67 13 12 13Z" fill="#131319"/>
              </svg>
            }
            label="Users"
            href="/"
            active={isUsersActive}
          />
          <MenuItem
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 7V3H2V21H22V7H12ZM6 19H4V17H6V19ZM6 15H4V13H6V15ZM6 11H4V9H6V11ZM6 7H4V5H6V7ZM10 19H8V17H10V19ZM10 15H8V13H10V15ZM10 11H8V9H10V11ZM10 7H8V5H10V7ZM20 19H12V17H14V15H12V13H14V11H12V9H20V19ZM18 11H16V13H18V11ZM18 15H16V17H18V15Z" fill="#131319"/>
              </svg>
            }
            label="Organizations"
            href="/organizations"
            active={location.pathname === "/organizations"}
          />
          <MenuItem
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 8H8V4H4V8ZM10 20H14V16H10V20ZM4 20H8V16H4V20ZM4 14H8V10H4V14ZM10 14H14V10H10V14ZM16 4V8H20V4H16ZM10 8H14V4H10V8ZM16 14H20V10H16V14ZM16 20H20V16H16V20Z" fill="#131319"/>
              </svg>
            }
            label="Applications"
            href="/applications"
            active={location.pathname === "/applications"}
          />
          <MenuItem
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 12H14V13.5H18V12Z" fill="#131319"/>
                <path d="M18 15H14V16.5H18V15Z" fill="#131319"/>
                <path d="M20 7H15V4C15 2.9 14.1 2 13 2H11C9.9 2 9 2.9 9 4V7H4C2.9 7 2 7.9 2 9V20C2 21.1 2.9 22 4 22H20C21.1 22 22 21.1 22 20V9C22 7.9 21.1 7 20 7ZM11 4H13V9H11V4ZM20 20H4V9H9C9 10.1 9.9 11 11 11H13C14.1 11 15 10.1 15 9H20V20Z" fill="#131319"/>
                <path d="M9 15C9.82843 15 10.5 14.3284 10.5 13.5C10.5 12.6716 9.82843 12 9 12C8.17157 12 7.5 12.6716 7.5 13.5C7.5 14.3284 8.17157 15 9 15Z" fill="#131319"/>
                <path d="M11.08 16.18C10.44 15.9 9.74 15.75 9 15.75C8.26 15.75 7.56 15.9 6.92 16.18C6.36 16.42 6 16.96 6 17.57V18H12V17.57C12 16.96 11.64 16.42 11.08 16.18Z" fill="#131319"/>
              </svg>
            }
            label="Access roles"
            href="/access-roles"
            active={location.pathname === "/access-roles"}
          />
          <MenuItem
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 3C8.03 3 4 7.03 4 12H1L4.89 15.89L4.96 16.03L9 12H6C6 8.13 9.13 5 13 5C16.87 5 20 8.13 20 12C20 15.87 16.87 19 13 19C11.07 19 9.32 18.21 8.06 16.94L6.64 18.36C8.27 19.99 10.51 21 13 21C17.97 21 22 16.97 22 12C22 7.03 17.97 3 13 3ZM12 8V13L16.28 15.54L17 14.33L13.5 12.25V8H12Z" fill="#131319"/>
              </svg>
            }
            label="Event log"
            href="/event-log"
            active={isEventLogActive}
          />
          <MenuItem
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 15.62C16.6186 15.62 17.12 15.1186 17.12 14.5C17.12 13.8814 16.6186 13.38 16 13.38C15.3814 13.38 14.88 13.8814 14.88 14.5C14.88 15.1186 15.3814 15.62 16 15.62Z" fill="#131319"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M16 16.5C15.27 16.5 13.81 16.86 13.76 17.58C14.26 18.29 15.08 18.75 16 18.75C16.92 18.75 17.74 18.29 18.24 17.58C18.19 16.86 16.73 16.5 16 16.5Z" fill="#131319"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M17 10.09V5.27L9.5 2L2 5.27V10.18C2 14.72 5.2 18.97 9.5 20C10.05 19.87 10.58 19.68 11.1 19.45C12.18 20.99 13.97 22 16 22C19.31 22 22 19.31 22 16C22 13.03 19.84 10.57 17 10.09ZM10 16C10 16.56 10.08 17.11 10.23 17.62C9.99 17.73 9.75 17.84 9.5 17.92C6.33 16.92 4 13.68 4 10.18V6.58L9.5 4.18L15 6.58V10.09C12.16 10.57 10 13.03 10 16ZM16 20C13.79 20 12 18.21 12 16C12 13.79 13.79 12 16 12C18.21 12 20 13.79 20 16C20 18.21 18.21 20 16 20Z" fill="#131319"/>
              </svg>
            }
            label="Administrators"
            href="/administrators"
            active={isAdministratorsActive}
            hasSubmenu={true}
            isExpanded={isAdministratorsExpanded}
            onToggle={() => setIsAdministratorsExpanded(!isAdministratorsExpanded)}
            submenuItems={[
              {
                label: "All administrators",
                href: "/administrators/all",
                active: location.pathname === "/administrators/all",
              },
              {
                label: "Administrators roles",
                href: "/administrators/roles",
                active: location.pathname === "/administrators/roles",
              },
              {
                label: "Scopes",
                href: "/administrators/scopes",
                active: location.pathname === "/administrators/scopes",
              },
            ]}
          />
        </nav>
      </div>
    </>
  );
}
