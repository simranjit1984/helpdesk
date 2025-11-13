import { useState } from "react";
import TopNavigation from "./TopNavigation";
import LeftSidebar from "./LeftSidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <TopNavigation onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <LeftSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="ml-0 lg:ml-60 mt-16 transition-all duration-300">
        {children}
      </main>
    </div>
  );
}
