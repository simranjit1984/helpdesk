import { useState, useRef, useEffect } from "react";
import { Search, MoreHorizontal, ChevronDown, X, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrgAccess {
  orgId: string;
  orgName: string;
  role: string;
}

interface Application {
  id: string;
  name: string;
  category: string;
  color: string;
  initials: string;
  orgAccess: OrgAccess[];
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const APPS: Application[] = [
  {
    id: "1",
    name: "Salesforce CRM",
    category: "CRM",
    color: "#00A1E0",
    initials: "SF",
    orgAccess: [
      { orgId: "a", orgName: "Company A", role: "Admin" },
      { orgId: "b", orgName: "Company B", role: "Viewer" },
      { orgId: "c", orgName: "Company C", role: "Editor" },
    ],
  },
  {
    id: "2",
    name: "Jira Projects",
    category: "Project Management",
    color: "#0052CC",
    initials: "JP",
    orgAccess: [
      { orgId: "a", orgName: "Company A", role: "Developer" },
      { orgId: "c", orgName: "Company C", role: "Viewer" },
    ],
  },
  {
    id: "3",
    name: "Slack Enterprise",
    category: "Communication",
    color: "#4A154B",
    initials: "SL",
    orgAccess: [
      { orgId: "a", orgName: "Company A", role: "Member" },
      { orgId: "b", orgName: "Company B", role: "Admin" },
    ],
  },
  {
    id: "4",
    name: "Microsoft Teams",
    category: "Communication",
    color: "#6264A7",
    initials: "MT",
    orgAccess: [
      { orgId: "b", orgName: "Company B", role: "Member" },
      { orgId: "c", orgName: "Company C", role: "Member" },
    ],
  },
  {
    id: "5",
    name: "ServiceNow",
    category: "ITSM",
    color: "#62D84E",
    initials: "SN",
    orgAccess: [
      { orgId: "a", orgName: "Company A", role: "Approver" },
      { orgId: "b", orgName: "Company B", role: "Requester" },
    ],
  },
  {
    id: "6",
    name: "Confluence",
    category: "Knowledge Base",
    color: "#172B4D",
    initials: "CF",
    orgAccess: [
      { orgId: "a", orgName: "Company A", role: "Contributor" },
      { orgId: "c", orgName: "Company C", role: "Reader" },
    ],
  },
];

const ALL_ORGS = [
  { id: "a", name: "Company A" },
  { id: "b", name: "Company B" },
  { id: "c", name: "Company C" },
];

// ─── App icon ─────────────────────────────────────────────────────────────────

function AppIcon({ app }: { app: Application }) {
  return (
    <div
      className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
      style={{ backgroundColor: app.color }}
    >
      <span className="text-white font-bold text-lg tracking-wide">
        {app.initials}
      </span>
    </div>
  );
}

// ─── Org chip (display only) ─────────────────────────────────────────────────

function OrgChip({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 whitespace-nowrap">
      {name}
    </span>
  );
}

// ─── 3-dot menu ───────────────────────────────────────────────────────────────

function AppMenu({ app }: { app: Application }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-bluegrey-100 text-bluegrey-500 transition-colors"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-9 z-50 w-56 bg-white rounded-lg shadow-[0_8px_24px_rgba(1,5,50,0.12)] border border-bluegrey-100 py-1">
          <div className="px-3 py-2 border-b border-bluegrey-100">
            <p className="text-xs font-semibold uppercase tracking-wider text-bluegrey-500">
              Access by organization
            </p>
          </div>
          {app.orgAccess.map((oa) => (
            <div
              key={oa.orgId}
              className="flex items-center justify-between px-3 py-2.5 hover:bg-bluegrey-25"
            >
              <span className="text-sm text-bluegrey-900">{oa.orgName}</span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-bluegrey-100 text-bluegrey-700">
                {oa.role}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Application card ─────────────────────────────────────────────────────────

function AppCard({ app }: { app: Application }) {
  const { toast } = useToast();
  const MAX_CHIPS = 2;
  const visibleOrgs = app.orgAccess.slice(0, MAX_CHIPS);
  const hiddenCount = app.orgAccess.length - MAX_CHIPS;

  const handleLaunch = () => {
    const orgList = app.orgAccess.map((o) => o.orgName).join(", ");
    toast({
      title: `Launching ${app.name}`,
      description: `Available in: ${orgList}`,
    });
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleLaunch}
      onKeyDown={(e) => e.key === "Enter" && handleLaunch()}
      className="bg-white rounded-xl border border-bluegrey-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200 p-5 flex flex-col gap-4 cursor-pointer group"
    >
      {/* Card header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <AppIcon app={app} />
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-bluegrey-900 truncate group-hover:text-blue-600 transition-colors">
              {app.name}
            </h3>
            <p className="text-xs text-bluegrey-500 mt-0.5">{app.category}</p>
          </div>
        </div>
        {/* Stop propagation so menu click doesn't trigger card launch */}
        <div onClick={(e) => e.stopPropagation()}>
          <AppMenu app={app} />
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-bluegrey-100" />

      {/* Org chips — display only */}
      <div>
        <p className="text-xs text-bluegrey-500 mb-2 font-medium">
          Available in
        </p>
        <div className="flex flex-wrap gap-1.5">
          {visibleOrgs.map((oa) => (
            <OrgChip key={oa.orgId} name={oa.orgName} />
          ))}
          {hiddenCount > 0 && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-bluegrey-100 text-bluegrey-600 border border-bluegrey-200">
              +{hiddenCount} more
            </span>
          )}
        </div>
      </div>
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
    selected.length === 0
      ? "All organizations"
      : selected.length === ALL_ORGS.length
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
          {/* Clear all */}
          {selected.length > 0 && (
            <>
              <button
                onClick={() => onChange([])}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-blue-600 hover:bg-blue-50 transition-colors"
              >
                <X className="w-3 h-3" /> Clear selection
              </button>
              <div className="h-px bg-bluegrey-100 mx-2 mb-1" />
            </>
          )}
          {ALL_ORGS.map((org) => {
            const isSelected = selected.includes(org.id);
            return (
              <button
                key={org.id}
                onClick={() => toggle(org.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-bluegrey-25 transition-colors"
              >
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                    isSelected
                      ? "bg-blue-500 border-blue-500"
                      : "border-bluegrey-300"
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 text-white" />}
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

// ─── Sort dropdown ────────────────────────────────────────────────────────────

function SortDropdown({
  value,
  onChange,
}: {
  value: "az" | "za";
  onChange: (v: "az" | "za") => void;
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

  const OPTIONS = [
    { value: "az" as const, label: "A → Z" },
    { value: "za" as const, label: "Z → A" },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 h-10 px-3 rounded-lg border border-bluegrey-200 bg-white text-sm text-bluegrey-700 hover:border-bluegrey-400 transition-colors"
      >
        <span>{OPTIONS.find((o) => o.value === value)?.label}</span>
        <ChevronDown
          className={`w-4 h-4 text-bluegrey-500 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute top-12 right-0 z-50 w-32 bg-white rounded-lg shadow-[0_8px_24px_rgba(1,5,50,0.12)] border border-bluegrey-100 py-1">
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 text-sm transition-colors ${
                value === opt.value
                  ? "text-blue-600 font-medium bg-blue-50"
                  : "text-bluegrey-900 hover:bg-bluegrey-25"
              }`}
            >
              {opt.label}
              {value === opt.value && <Check className="w-3.5 h-3.5" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ApplicationLaunchpad() {
  const [search, setSearch] = useState("");
  const [selectedOrgs, setSelectedOrgs] = useState<string[]>([]);
  const [sort, setSort] = useState<"az" | "za">("az");

  const filtered = APPS.filter((app) => {
    const matchesSearch = app.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesOrg =
      selectedOrgs.length === 0 ||
      app.orgAccess.some((oa) => selectedOrgs.includes(oa.orgId));

    return matchesSearch && matchesOrg;
  }).sort((a, b) =>
    sort === "az"
      ? a.name.localeCompare(b.name)
      : b.name.localeCompare(a.name),
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
            placeholder="Search applications…"
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

        <div className="flex items-center gap-2">
          <OrgFilterDropdown
            selected={selectedOrgs}
            onChange={setSelectedOrgs}
          />
          <SortDropdown value={sort} onChange={setSort} />
        </div>
      </div>

      {/* Summary */}
      <p className="text-xs text-bluegrey-500 mb-4">
        {filtered.length} application{filtered.length !== 1 ? "s" : ""} found
      </p>

      {/* Grid or empty state */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-14 h-14 rounded-2xl bg-bluegrey-100 flex items-center justify-center mb-4">
            <Search className="w-6 h-6 text-bluegrey-400" />
          </div>
          <h3 className="text-base font-semibold text-bluegrey-900 mb-1">
            No applications assigned
          </h3>
          <p className="text-sm text-bluegrey-500">
            {search || selectedOrgs.length > 0
              ? "Try adjusting your filters."
              : "Contact your administrator to request access."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((app) => (
            <AppCard key={app.id} app={app} />
          ))}
        </div>
      )}
    </div>
  );
}
