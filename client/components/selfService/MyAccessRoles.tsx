import { useState, useRef, useEffect } from "react";
import {
  Search,
  ChevronDown,
  ChevronRight,
  Building2,
  ShieldCheck,
  LayoutGrid,
  Tag,
  X,
  Check,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Permission {
  name: string;
}

interface AppEntry {
  id: string;
  name: string;
  color: string;
  initials: string;
  permissions: Permission[];
}

interface Role {
  id: string;
  name: string;
  description?: string;
  apps: AppEntry[];
}

interface Organization {
  id: string;
  name: string;
  roles: Role[];
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const DATA: Organization[] = [
  {
    id: "a",
    name: "Company A",
    roles: [
      {
        id: "a-admin",
        name: "Admin",
        description: "Full access across all systems",
        apps: [
          {
            id: "sf",
            name: "Salesforce CRM",
            color: "#00A1E0",
            initials: "SF",
            permissions: [
              { name: "Read" },
              { name: "Write" },
              { name: "Delete" },
            ],
          },
          {
            id: "sn",
            name: "ServiceNow",
            color: "#62D84E",
            initials: "SN",
            permissions: [{ name: "Read" }, { name: "Approve" }],
          },
        ],
      },
      {
        id: "a-dev",
        name: "Developer",
        description: "Access to development tools",
        apps: [
          {
            id: "jp",
            name: "Jira Projects",
            color: "#0052CC",
            initials: "JP",
            permissions: [{ name: "Read" }, { name: "Write" }],
          },
          {
            id: "cf",
            name: "Confluence",
            color: "#172B4D",
            initials: "CF",
            permissions: [{ name: "Read" }, { name: "Write" }],
          },
        ],
      },
      {
        id: "a-member",
        name: "Member",
        description: "Standard member access",
        apps: [
          {
            id: "sl",
            name: "Slack Enterprise",
            color: "#4A154B",
            initials: "SL",
            permissions: [{ name: "Read" }],
          },
        ],
      },
    ],
  },
  {
    id: "b",
    name: "Company B",
    roles: [
      {
        id: "b-viewer",
        name: "Viewer",
        description: "Read-only access",
        apps: [
          {
            id: "sf",
            name: "Salesforce CRM",
            color: "#00A1E0",
            initials: "SF",
            permissions: [{ name: "Read" }],
          },
          {
            id: "mt",
            name: "Microsoft Teams",
            color: "#6264A7",
            initials: "MT",
            permissions: [{ name: "Read" }],
          },
        ],
      },
      {
        id: "b-admin",
        name: "Admin",
        description: "Workspace administrator",
        apps: [
          {
            id: "sl",
            name: "Slack Enterprise",
            color: "#4A154B",
            initials: "SL",
            permissions: [{ name: "Read" }, { name: "Write" }, { name: "Delete" }],
          },
        ],
      },
    ],
  },
  {
    id: "c",
    name: "Company C",
    roles: [
      {
        id: "c-editor",
        name: "Editor",
        description: "Can create and edit content",
        apps: [
          {
            id: "sf",
            name: "Salesforce CRM",
            color: "#00A1E0",
            initials: "SF",
            permissions: [{ name: "Read" }, { name: "Write" }],
          },
          {
            id: "cf",
            name: "Confluence",
            color: "#172B4D",
            initials: "CF",
            permissions: [{ name: "Read" }],
          },
        ],
      },
      {
        id: "c-viewer",
        name: "Viewer",
        description: "Read-only access",
        apps: [
          {
            id: "jp",
            name: "Jira Projects",
            color: "#0052CC",
            initials: "JP",
            permissions: [{ name: "Read" }],
          },
          {
            id: "mt",
            name: "Microsoft Teams",
            color: "#6264A7",
            initials: "MT",
            permissions: [{ name: "Read" }],
          },
        ],
      },
    ],
  },
];

const ALL_ORGS = DATA.map((d) => ({ id: d.id, name: d.name }));

// ─── Permission tag ───────────────────────────────────────────────────────────

const PERMISSION_COLORS: Record<string, string> = {
  Read: "bg-green-50 text-green-700 border-green-200",
  Write: "bg-blue-50 text-blue-700 border-blue-200",
  Delete: "bg-red-50 text-red-700 border-red-200",
  Approve: "bg-amber-50 text-amber-700 border-amber-200",
};

function PermissionTag({ name }: { name: string }) {
  const cls = PERMISSION_COLORS[name] ?? "bg-bluegrey-100 text-bluegrey-700 border-bluegrey-200";
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${cls}`}
    >
      <Tag className="w-2.5 h-2.5" />
      {name}
    </span>
  );
}

// ─── App row ──────────────────────────────────────────────────────────────────

function AppRow({
  app,
  expanded,
  onToggle,
}: {
  app: AppEntry;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-bluegrey-25 transition-colors text-left group"
      >
        <ChevronRight
          className={`w-3.5 h-3.5 text-bluegrey-400 flex-shrink-0 transition-transform ${expanded ? "rotate-90" : ""}`}
        />
        {/* App icon */}
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 shadow-sm"
          style={{ backgroundColor: app.color }}
        >
          <span className="text-white font-bold text-[10px]">{app.initials}</span>
        </div>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <LayoutGrid className="w-3.5 h-3.5 text-bluegrey-400 flex-shrink-0" />
          <span className="text-sm font-medium text-bluegrey-900 truncate">
            {app.name}
          </span>
        </div>
        <span className="text-xs text-bluegrey-400 flex-shrink-0">
          {app.permissions.length} permission{app.permissions.length !== 1 ? "s" : ""}
        </span>
      </button>

      {expanded && (
        <div className="ml-[60px] mt-1 mb-2 flex flex-wrap gap-1.5 px-2">
          {app.permissions.map((p) => (
            <PermissionTag key={p.name} name={p.name} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Role row ─────────────────────────────────────────────────────────────────

function RoleRow({
  role,
  searchQuery,
}: {
  role: Role;
  searchQuery: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [expandedApps, setExpandedApps] = useState<Set<string>>(new Set());

  const toggleApp = (appId: string) => {
    setExpandedApps((prev) => {
      const next = new Set(prev);
      if (next.has(appId)) next.delete(appId);
      else next.add(appId);
      return next;
    });
  };

  const filteredApps = role.apps.filter(
    (a) =>
      !searchQuery ||
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (searchQuery && filteredApps.length === 0) return null;

  return (
    <div className="mb-1">
      {/* Role header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-blue-50 transition-colors text-left group"
      >
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-blue-500 flex-shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-blue-500 flex-shrink-0" />
        )}
        <ShieldCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-semibold text-bluegrey-900">
            {role.name}
          </span>
          {role.description && (
            <span className="ml-2 text-xs text-bluegrey-500">
              — {role.description}
            </span>
          )}
        </div>
        <span className="text-xs text-bluegrey-400 flex-shrink-0">
          {role.apps.length} app{role.apps.length !== 1 ? "s" : ""}
        </span>
      </button>

      {/* Apps */}
      {expanded && (
        <div className="ml-6 pl-4 border-l-2 border-blue-100 mt-1 space-y-0.5">
          {filteredApps.map((app) => (
            <AppRow
              key={app.id}
              app={app}
              expanded={expandedApps.has(app.id)}
              onToggle={() => toggleApp(app.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Organization section ─────────────────────────────────────────────────────

function OrgSection({
  org,
  expanded,
  onToggle,
  searchQuery,
}: {
  org: Organization;
  expanded: boolean;
  onToggle: () => void;
  searchQuery: string;
}) {
  const hasResults = org.roles.some(
    (r) =>
      !searchQuery ||
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.apps.some((a) =>
        a.name.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
  );

  if (searchQuery && !hasResults) return null;

  return (
    <div className="bg-white rounded-xl border border-bluegrey-100 shadow-sm overflow-hidden">
      {/* Org header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-5 py-4 bg-bluegrey-25 hover:bg-bluegrey-50 transition-colors border-b border-bluegrey-100 text-left"
      >
        {expanded ? (
          <ChevronDown className="w-5 h-5 text-bluegrey-600 flex-shrink-0" />
        ) : (
          <ChevronRight className="w-5 h-5 text-bluegrey-600 flex-shrink-0" />
        )}
        <Building2 className="w-5 h-5 text-blue-500 flex-shrink-0" />
        <span className="text-base font-bold text-bluegrey-900 flex-1">
          {org.name}
        </span>
        <span className="text-sm text-bluegrey-500">
          {org.roles.length} role{org.roles.length !== 1 ? "s" : ""}
        </span>
      </button>

      {/* Roles */}
      {expanded && (
        <div className="p-3 space-y-0.5">
          {org.roles.map((role) => (
            <RoleRow key={role.id} role={role} searchQuery={searchQuery} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Org filter dropdown ──────────────────────────────────────────────────────

function OrgFilterDropdown({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const toggle = (id: string) => {
    onChange(
      selected.includes(id)
        ? selected.filter((s) => s !== id)
        : [...selected, id],
    );
  };

  const label =
    selected.length === 0 || selected.length === ALL_ORGS.length
      ? "All organizations"
      : `${selected.length} selected`;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 h-10 px-3 rounded-lg border border-bluegrey-200 bg-white text-sm text-bluegrey-700 hover:border-bluegrey-400 transition-colors min-w-[180px] justify-between"
      >
        <span>{label}</span>
        <ChevronDown
          className={`w-4 h-4 text-bluegrey-500 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute top-12 left-0 z-50 w-56 bg-white rounded-lg shadow-[0_8px_24px_rgba(1,5,50,0.12)] border border-bluegrey-100 py-1">
          {selected.length > 0 && (
            <>
              <button
                onClick={() => onChange([])}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-blue-600 hover:bg-blue-50"
              >
                <X className="w-3 h-3" /> Clear selection
              </button>
              <div className="h-px bg-bluegrey-100 mx-2 mb-1" />
            </>
          )}
          {ALL_ORGS.map((org) => {
            const isSel = selected.includes(org.id);
            return (
              <button
                key={org.id}
                onClick={() => toggle(org.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-bluegrey-25 transition-colors"
              >
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                    isSel ? "bg-blue-500 border-blue-500" : "border-bluegrey-300"
                  }`}
                >
                  {isSel && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="text-sm text-bluegrey-900">{org.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function MyAccessRoles() {
  const [search, setSearch] = useState("");
  const [selectedOrgs, setSelectedOrgs] = useState<string[]>([]);
  // Accordion: only one org expanded at a time; first org open by default
  const [expandedOrgId, setExpandedOrgId] = useState<string | null>(
    DATA[0]?.id ?? null,
  );

  const filteredData = DATA.filter(
    (org) =>
      selectedOrgs.length === 0 || selectedOrgs.includes(org.id),
  );

  return (
    <div className="p-6 lg:p-8">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bluegrey-400" />
          <input
            type="text"
            placeholder="Search roles or applications…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-3 rounded-lg border border-bluegrey-200 bg-white text-sm text-bluegrey-900 placeholder:text-bluegrey-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-bluegrey-400 hover:text-bluegrey-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <OrgFilterDropdown selected={selectedOrgs} onChange={setSelectedOrgs} />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mb-5 px-1">
        <div className="flex items-center gap-1.5 text-xs text-bluegrey-500">
          <Building2 className="w-3.5 h-3.5 text-blue-500" />
          Organization
        </div>
        <div className="flex items-center gap-1.5 text-xs text-bluegrey-500">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
          Role
        </div>
        <div className="flex items-center gap-1.5 text-xs text-bluegrey-500">
          <LayoutGrid className="w-3.5 h-3.5 text-bluegrey-400" />
          Application
        </div>
        <div className="flex items-center gap-1.5 text-xs text-bluegrey-500">
          <Tag className="w-3.5 h-3.5 text-bluegrey-400" />
          Permissions
        </div>
      </div>

      {/* Hierarchy */}
      <div className="space-y-4">
        {filteredData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-14 h-14 rounded-2xl bg-bluegrey-100 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6 text-bluegrey-400" />
            </div>
            <h3 className="text-base font-semibold text-bluegrey-900 mb-1">
              No access roles found
            </h3>
            <p className="text-sm text-bluegrey-500">
              Try adjusting your filters or contact your administrator.
            </p>
          </div>
        ) : (
          filteredData.map((org) => (
            <OrgSection
              key={org.id}
              org={org}
              expanded={expandedOrgId === org.id}
              onToggle={() =>
                setExpandedOrgId((prev) =>
                  prev === org.id ? null : org.id,
                )
              }
              searchQuery={search}
            />
          ))
        )}
      </div>
    </div>
  );
}
