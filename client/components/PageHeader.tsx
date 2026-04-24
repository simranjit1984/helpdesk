import { useEffect, useState } from "react";
import { ContentHeader } from "@onewelcome/react-lib-components";

interface PageHeaderProps {
  title: string;
}

export default function PageHeader({ title }: PageHeaderProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;

      // Use hysteresis to prevent jumping:
      // Collapse when scrolling past 100px
      // Expand only when scrolling back above 50px
      if (scrollY > 100 && !isCollapsed) {
        setIsCollapsed(true);
      } else if (scrollY < 50 && isCollapsed) {
        setIsCollapsed(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isCollapsed]);

  return (
    <div className="sticky top-16 z-30">
      <ContentHeader title={title} collapsed={isCollapsed} />
    </div>
  );
}
