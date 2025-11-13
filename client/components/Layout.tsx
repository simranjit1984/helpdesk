import TopNavigation from "./TopNavigation";
import LeftSidebar from "./LeftSidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      <TopNavigation />
      <LeftSidebar />
      <main className="ml-60 mt-16">{children}</main>
    </div>
  );
}
