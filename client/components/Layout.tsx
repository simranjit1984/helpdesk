import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import TopNavigation from "./TopNavigation";
import LeftSidebar from "./LeftSidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  // Focus management: When page changes, focus first interactive element
  useEffect(() => {
    if (!mainRef.current) return;

    // Helper function to check if element is visible
    const isVisible = (element: HTMLElement): boolean => {
      const style = window.getComputedStyle(element);
      const isHidden = style.display === "none" || style.visibility === "hidden" || style.opacity === "0";
      return !isHidden;
    };

    // Small delay to ensure content has rendered
    const timer = setTimeout(() => {
      const main = mainRef.current;
      if (!main) return;

      // List of selectors for interactive elements in priority order
      const interactiveSelectors = [
        'input:not([type="hidden"]):not([disabled])',
        'button:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        'a[href]',
        '[role="button"]:not([aria-disabled="true"])',
        '[role="tab"]:not([aria-disabled="true"])',
        '[role="menuitem"]:not([aria-disabled="true"])',
      ];

      let firstInteractive: HTMLElement | null = null;

      // Find the first interactive element
      for (const selector of interactiveSelectors) {
        const element = main.querySelector(selector) as HTMLElement;
        if (element && isVisible(element)) {
          firstInteractive = element;
          break;
        }
      }

      // Focus the first interactive element if found
      if (firstInteractive) {
        firstInteractive.focus({ preventScroll: false });
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="bg-white">
      <TopNavigation onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <LeftSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main ref={mainRef} className="ml-0 lg:ml-72 mt-16 transition-all duration-300">
        {children}
      </main>
    </div>
  );
}
