import { useEffect, useState } from "react";

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
    <div
      className={`sticky top-16 bg-bluegrey-25 px-4 sm:px-6 lg:px-8 z-30 transition-all duration-300 ${
        isCollapsed ? "py-3 lg:py-4" : "py-6 lg:py-8"
      }`}
    >
      <h1
        className={`font-medium leading-tight text-bluegrey-750 transition-all duration-300 ${
          isCollapsed
            ? "text-xl sm:text-2xl lg:text-2xl lg:leading-8"
            : "text-3xl sm:text-4xl lg:text-[42px] lg:leading-[50px]"
        }`}
      >
        {title}
      </h1>
    </div>
  );
}
