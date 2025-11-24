import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, Users, Building2, Package, Shield, Clock, Lock } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  type: "user" | "organization" | "application" | "role" | "administrator" | "scope" | "event";
  href?: string;
}

interface GroupedResults {
  [key: string]: SearchResult[];
}

const MOCK_DATA: SearchResult[] = [
  // Users
  {
    id: "user-1",
    title: "John Smith",
    subtitle: "john.smith@example.com",
    type: "user",
    href: "/users/user-1",
  },
  {
    id: "user-2",
    title: "Sarah Johnson",
    subtitle: "sarah.j@example.com",
    type: "user",
    href: "/users/user-2",
  },
  {
    id: "user-3",
    title: "Mike Chen",
    subtitle: "mike.chen@example.com",
    type: "user",
    href: "/users/user-3",
  },
  {
    id: "user-4",
    title: "Emma Wilson",
    subtitle: "emma.w@example.com",
    type: "user",
    href: "/users/user-4",
  },
  // Organizations
  {
    id: "org-1",
    title: "InsurCar Inc.",
    subtitle: "Primary tenant",
    type: "organization",
    href: "/organizations/org-1",
  },
  {
    id: "org-2",
    title: "TechVision Solutions",
    subtitle: "Subsidiary",
    type: "organization",
    href: "/organizations/org-2",
  },
  {
    id: "org-3",
    title: "Global Logistics Corp",
    subtitle: "Partner",
    type: "organization",
    href: "/organizations/org-3",
  },
  // Applications
  {
    id: "app-1",
    title: "Claims Processing System",
    subtitle: "app-claims-001",
    type: "application",
    href: "/applications/app-1",
  },
  {
    id: "app-2",
    title: "Customer Portal",
    subtitle: "app-customer-portal",
    type: "application",
    href: "/applications/app-2",
  },
  {
    id: "app-3",
    title: "Analytics Dashboard",
    subtitle: "app-analytics",
    type: "application",
    href: "/applications/app-3",
  },
  // Access Roles
  {
    id: "role-1",
    title: "Administrator",
    subtitle: "Full system access",
    type: "role",
    href: "/access-roles/role-1",
  },
  {
    id: "role-2",
    title: "Claims Manager",
    subtitle: "Claims management access",
    type: "role",
    href: "/access-roles/role-2",
  },
  {
    id: "role-3",
    title: "Viewer",
    subtitle: "Read-only access",
    type: "role",
    href: "/access-roles/role-3",
  },
  // Administrators
  {
    id: "admin-1",
    title: "Lucia Anderson",
    subtitle: "Super Administrator",
    type: "administrator",
    href: "/administrators/all",
  },
  {
    id: "admin-2",
    title: "Robert Martinez",
    subtitle: "System Administrator",
    type: "administrator",
    href: "/administrators/all",
  },
  // Scopes
  {
    id: "scope-1",
    title: "user.read",
    subtitle: "Read user information",
    type: "scope",
    href: "/administrators/scopes",
  },
  {
    id: "scope-2",
    title: "organization.write",
    subtitle: "Write organization data",
    type: "scope",
    href: "/administrators/scopes",
  },
  {
    id: "scope-3",
    title: "application.delete",
    subtitle: "Delete applications",
    type: "scope",
    href: "/administrators/scopes",
  },
  // Events
  {
    id: "event-1",
    title: "User Created",
    subtitle: "2 hours ago",
    type: "event",
    href: "/event-log",
  },
  {
    id: "event-2",
    title: "Organization Updated",
    subtitle: "5 hours ago",
    type: "event",
    href: "/event-log",
  },
  {
    id: "event-3",
    title: "Role Permission Changed",
    subtitle: "1 day ago",
    type: "event",
    href: "/event-log",
  },
];

const typeConfig = {
  user: {
    icon: Users,
    label: "Users",
    color: "text-blue-600",
  },
  organization: {
    icon: Building2,
    label: "Organizations",
    color: "text-purple-600",
  },
  application: {
    icon: Package,
    label: "Applications",
    color: "text-green-600",
  },
  role: {
    icon: Lock,
    label: "Access Roles",
    color: "text-orange-600",
  },
  administrator: {
    icon: Shield,
    label: "Administrators",
    color: "text-red-600",
  },
  scope: {
    icon: Lock,
    label: "Scopes",
    color: "text-indigo-600",
  },
  event: {
    icon: Clock,
    label: "Events",
    color: "text-gray-600",
  },
};

export default function GlobalSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [groupedResults, setGroupedResults] = useState<GroupedResults>({});
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setGroupedResults({});
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = MOCK_DATA.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.subtitle?.toLowerCase().includes(query)
    );

    const grouped = filtered.reduce((acc, item) => {
      const key = item.type;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {} as GroupedResults);

    setGroupedResults(grouped);
  }, [searchQuery]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "/" && !isOpen) {
      e.preventDefault();
      inputRef.current?.focus();
      setIsOpen(true);
    }
    if (e.key === "Escape" && isOpen) {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  }, [isOpen]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  const totalResults = Object.values(groupedResults).reduce((sum, items) => sum + items.length, 0);

  const handleClear = () => {
    setSearchQuery("");
    inputRef.current?.focus();
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="relative hidden lg:block flex-1 max-w-2xl">
          <div className="flex items-center gap-2 px-3 py-2 border border-bluegrey-300 rounded-sm bg-white transition-all hover:border-bluegrey-500 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
            <Search className="w-4 h-4 text-bluegrey-500 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search everything... (press / to search)"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.trim()) {
                  setIsOpen(true);
                }
              }}
              className="flex-1 text-sm text-bluegrey-700 placeholder:text-bluegrey-500 outline-none bg-transparent"
              autoComplete="off"
            />
            {searchQuery && (
              <button
                onClick={handleClear}
                className="text-bluegrey-400 hover:text-bluegrey-600 transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </PopoverTrigger>

      {searchQuery && (
        <PopoverContent
          align="start"
          className="w-96 p-0 rounded-md shadow-lg border border-bluegrey-200 max-h-96 overflow-y-auto"
        >
          {totalResults === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 px-4">
              <Search className="w-10 h-10 text-bluegrey-300 mb-2" />
              <p className="text-sm text-bluegrey-500">No results found for "{searchQuery}"</p>
            </div>
          ) : (
            <div className="bg-white rounded-md">
              {Object.entries(groupedResults).map(([type, results]) => {
                const config = typeConfig[type as keyof typeof typeConfig];
                const Icon = config.icon;

                return (
                  <div key={type}>
                    <div className="px-4 py-2 bg-bluegrey-50 border-b border-bluegrey-100 flex items-center gap-2 sticky top-0">
                      <Icon className={`w-4 h-4 ${config.color}`} />
                      <h3 className="text-xs font-semibold text-bluegrey-700 uppercase tracking-wider">
                        {config.label}
                      </h3>
                      <span className="ml-auto text-xs text-bluegrey-500">
                        {results.length}
                      </span>
                    </div>
                    {results.map((result) => (
                      <a
                        key={result.id}
                        href={result.href || "#"}
                        className="block px-4 py-2.5 hover:bg-bluegrey-50 transition-colors border-b border-bluegrey-100 last:border-b-0"
                        onClick={() => setIsOpen(false)}
                      >
                        <div className="flex items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-bluegrey-900 truncate">
                              {result.title}
                            </p>
                            {result.subtitle && (
                              <p className="text-xs text-bluegrey-500 truncate">
                                {result.subtitle}
                              </p>
                            )}
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </PopoverContent>
      )}
    </Popover>
  );
}
