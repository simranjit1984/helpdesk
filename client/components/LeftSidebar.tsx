import { ChevronDown, ChevronUp } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
  hasSubmenu?: boolean;
  isExpanded?: boolean;
  onToggle?: () => void;
  submenuItems?: SubmenuItemProps[];
  itemRef?: React.RefObject<HTMLAnchorElement>;
}

interface SubmenuItemProps {
  label: string;
  href: string;
  active?: boolean;
}

function SubmenuItem({ label, href, active }: SubmenuItemProps) {
  const ref = useRef<HTMLAnchorElement>(null);

  return (
    <div className="relative">
      <Link
        ref={ref}
        to={href}
        className={`block focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors ${
          active ? "bg-blue-50" : "hover:bg-bluegrey-25"
        }`}
      >
        <div className="flex items-center px-12 py-3">
        <span
          className={`text-base leading-6 ${
            active ? "font-bold text-bluegrey-900" : "text-bluegrey-900"
          }`}
        >
          {label}
        </span>
        </div>
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
  itemRef,
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
            aria-label={isExpanded ? `Collapse ${label}` : `Expand ${label}`}
            tabIndex={-1}
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
      <Link
        ref={itemRef}
        to={navigateHref}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        {content}
      </Link>
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
  const isAdministratorsActive = location.pathname === "/administrators";
  const isAdministratorsSubmenuActive = location.pathname.startsWith("/administrators/");
  const [isAdministratorsExpanded, setIsAdministratorsExpanded] = useState(
    isAdministratorsActive || isAdministratorsSubmenuActive
  );

  const isDelegatedActive = location.pathname.startsWith("/settings");
  const [isDelegatedExpanded, setIsDelegatedExpanded] = useState(isDelegatedActive);

  const isUsersActive = location.pathname === "/users" || location.pathname.startsWith("/users/");
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if ((isAdministratorsActive || isAdministratorsSubmenuActive) && !isAdministratorsExpanded) {
      setIsAdministratorsExpanded(true);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (isDelegatedActive && !isDelegatedExpanded) {
      setIsDelegatedExpanded(true);
    }
  }, [location.pathname]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowUp" && e.key !== "ArrowDown") {
      return;
    }

    e.preventDefault();
    const nav = navRef.current;
    if (!nav) return;

    // Get all focusable elements in the navigation
    const focusableElements = Array.from(
      nav.querySelectorAll("a[href]")
    ) as HTMLAnchorElement[];

    if (focusableElements.length === 0) return;

    // Find the currently focused element
    const currentElement = document.activeElement as HTMLElement;
    const currentIndex = focusableElements.indexOf(
      currentElement as HTMLAnchorElement
    );

    let nextIndex: number;

    if (e.key === "ArrowDown") {
      nextIndex = currentIndex + 1;
      if (nextIndex >= focusableElements.length) {
        nextIndex = 0; // Wrap to first
      }
    } else {
      // ArrowUp
      nextIndex = currentIndex - 1;
      if (nextIndex < 0) {
        nextIndex = focusableElements.length - 1; // Wrap to last
      }
    }

    focusableElements[nextIndex].focus();
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/25 z-30 lg:hidden"
          onClick={onClose}
        />
      )}
      <div
        className={`fixed left-0 top-16 bottom-0 w-72 bg-white shadow-[0_2px_2px_0_rgba(1,5,50,0.02),0_3px_4px_0_rgba(1,5,50,0.02),0_1px_5px_0_rgba(1,5,50,0.04)] z-40 transition-transform duration-300 overflow-y-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <nav
          ref={navRef}
          className="flex flex-col"
          onKeyDown={handleKeyDown}
          role="navigation"
          aria-label="Main navigation"
        >
          <MenuItem
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 6C13.1 6 14 6.9 14 8C14 9.1 13.1 10 12 10C10.9 10 10 9.1 10 8C10 6.9 10.9 6 12 6ZM12 15C14.7 15 17.8 16.29 18 17V18H6V17.01C6.2 16.29 9.3 15 12 15ZM12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4ZM12 13C9.33 13 4 14.34 4 17V20H20V17C20 14.34 14.67 13 12 13Z" fill="#131319"/>
              </svg>
            }
            label="Users"
            href="/users"
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
            ]}
          />
          <MenuItem
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" fill="#131319"/>
                <path d="M10 8h2v8h-2zM14 8h2v8h-2z" fill="none"/>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l7 4.5-7 4.5z" fill="#131319" opacity="0"/>
                <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" fill="#131319"/>
              </svg>
            }
            label="Delegated user management"
            href="/settings"
            active={isDelegatedActive}
            hasSubmenu={true}
            isExpanded={isDelegatedExpanded}
            onToggle={() => setIsDelegatedExpanded(!isDelegatedExpanded)}
            submenuItems={[
              {
                label: "Settings",
                href: "/settings",
                active: location.pathname === "/settings",
              },
            ]}
          />
        </nav>
      </div>
    </>
  );
}
