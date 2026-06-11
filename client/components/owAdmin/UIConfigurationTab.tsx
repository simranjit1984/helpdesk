import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, Mail, Shield, AppWindow, Key, Calendar, ChevronDown, Save } from "lucide-react";
import OverviewConfigMatrix, { AttributeCapability } from "./OverviewConfigMatrix";
import DetailViewConfig, { DetailAttribute } from "./DetailViewConfig";
import AttributeGlobalConfig from "./AttributeGlobalConfig";
import OrganizationConfig from "./OrganizationConfig";
import FilterConfigTab, { FilterAttributeConfig } from "./FilterConfigTab";

// ─── Default data ─────────────────────────────────────────────────────────────

const DEFAULT_USERS_OVERVIEW: AttributeCapability[] = [
  { id: "firstName",   label: "First Name",   visible: true,  searchable: true,  filterable: false, sortable: true,  disabledCaps: ["filterable"] },
  { id: "lastName",    label: "Last Name",    visible: true,  searchable: true,  filterable: false, sortable: true,  disabledCaps: ["filterable"] },
  { id: "email",       label: "Email",        visible: true,  searchable: true,  filterable: false, sortable: true,  disabledCaps: ["filterable"] },
  { id: "role",        label: "Role",         visible: true,  searchable: true,  filterable: true,  sortable: false, disabledCaps: ["sortable"] },
  { id: "organization",label: "Organization", visible: true,  searchable: false, filterable: true,  sortable: false, disabledCaps: ["searchable", "sortable"] },
  { id: "status",      label: "Status",       visible: true,  searchable: false, filterable: true,  sortable: false, disabledCaps: ["sortable"] },
];

const DEFAULT_USERS_DETAIL: DetailAttribute[] = [
  { id: "firstName",    label: "First Name",   category: "Basic Info",        create: true,  view: true  },
  { id: "lastName",     label: "Last Name",    category: "Basic Info",        create: true,  view: true  },
  { id: "email",        label: "Email",        category: "Contact Info",      create: true,  view: true  },
  { id: "phoneNumber",  label: "Phone Number", category: "Contact Info",      create: false, view: false },
  { id: "status",       label: "Status",       category: "System",            create: false, view: true  },
  { id: "role",         label: "Role",         category: "Access Info",       create: true,  view: true  },
  { id: "organization", label: "Organization", category: "Organization Info", create: true,  view: true  },
];

const DEFAULT_INVITATIONS_OVERVIEW: AttributeCapability[] = [
  { id: "email", label: "Email", visible: true, searchable: true, filterable: true, sortable: true },
  { id: "phoneNumber", label: "Phone Number", visible: true, searchable: true, filterable: true, sortable: false, disabledCaps: ["sortable"] },
  { id: "status", label: "Status", visible: true, searchable: true, filterable: true, sortable: true },
  { id: "invitedBy", label: "Invited By", visible: true, searchable: true, filterable: true, sortable: true },
  { id: "expiryDate", label: "Expiry Date", visible: true, searchable: false, filterable: true, sortable: true, disabledCaps: ["searchable"] },
];

const DEFAULT_INVITATIONS_DETAIL: DetailAttribute[] = [
  { id: "firstName",   label: "First Name",   category: "Basic Info",   create: true,  view: true  },
  { id: "lastName",    label: "Last Name",    category: "Basic Info",   create: true,  view: true  },
  { id: "email",       label: "Email",        category: "Contact Info", create: true,  view: true  },
  { id: "phoneNumber", label: "Phone Number", category: "Contact Info", create: false, view: false },
  { id: "accessRoles", label: "Access Roles", category: "Access Info",  create: true,  view: true  },
  { id: "adminRoles",  label: "Admin Roles",  category: "Access Info",  create: false, view: false },
  { id: "status",      label: "Status",       category: "System",       create: false, view: false },
  { id: "invitedBy",   label: "Invited By",   category: "Access Info",  create: false, view: false },
  { id: "expiryDate",  label: "Expiry Date",  category: "System",       create: true,  view: true  },
];

// ─── Default filter configs ──────────────────────────────────────────────────

const DEFAULT_USERS_FILTER: FilterAttributeConfig[] = [
  {
    id: "role",
    label: "Role",
    valueSource: "app-object",
    appObjectRef: "access-roles",
    valueSelectType: "multiple",
    allowSingleFilterOnly: false,
  },
  {
    id: "organization",
    label: "Organization",
    valueSource: "app-object",
    appObjectRef: "organizations",
    valueSelectType: "single",
    allowSingleFilterOnly: false,
  },
  {
    id: "status",
    label: "Status",
    valueSource: "external-system",
    externalSystemRef: "userStatus",
    valueSelectType: "single",
    allowSingleFilterOnly: true,
  },
];

// ─── Sub-tab style ─────────────────────────────────────────────────────────

const SUB_TAB_CLASS =
  "h-auto py-2.5 px-0 rounded-none bg-transparent text-sm font-medium " +
  "border-b-2 border-transparent shadow-none " +
  "text-bluegrey-500 " +
  "data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 " +
  "data-[state=active]:bg-transparent data-[state=active]:shadow-none " +
  "hover:text-bluegrey-900 transition-colors";

const ENTITY_TAB_CLASS =
  "h-9 px-4 rounded-full text-sm font-medium transition-colors " +
  "bg-transparent text-bluegrey-500 shadow-none " +
  "data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-none " +
  "hover:text-bluegrey-900";

// ─── Entity config (Users + Invitations) ──────────────────────────────────

interface EntityConfigProps {
  overviewDefaults: AttributeCapability[];
  detailDefaults: DetailAttribute[];
  filterDefaults?: FilterAttributeConfig[];
  detailTabLabel?: string;
  detailDescription?: string;
  showDetailCreateColumn?: boolean;
}

function EntityConfig({ overviewDefaults, detailDefaults, filterDefaults = [], detailTabLabel = "Detail View (Single Record)", detailDescription = "Configure which fields appear on the single record view. Visibility and editability can be further restricted per admin role.", showDetailCreateColumn = false }: EntityConfigProps) {
  const [overviewAttrs, setOverviewAttrs] = useState<AttributeCapability[]>(overviewDefaults);
  const [detailAttrs, setDetailAttrs] = useState<DetailAttribute[]>(detailDefaults);
  const [filterConfigs, setFilterConfigs] = useState<FilterAttributeConfig[]>(filterDefaults);

  // Derive filterable attributes live from overview state
  const filterableAttrs = overviewAttrs.filter((a) => a.filterable);

  return (
    <Tabs defaultValue="overview">
      <div className="bg-white border-b border-bluegrey-100 px-6">
        <TabsList className="h-auto bg-transparent p-0 gap-6 -mb-px">
          <TabsTrigger value="overview" className={SUB_TAB_CLASS}>
            Overview (Table View)
          </TabsTrigger>
          <TabsTrigger value="filter-config" className={SUB_TAB_CLASS}>
            Filter Configuration
          </TabsTrigger>
          <TabsTrigger value="detail" className={SUB_TAB_CLASS}>
            {detailTabLabel}
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="overview" className="mt-0 px-6 py-6">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-bluegrey-900">Table view configuration</h3>
          <p className="text-sm text-bluegrey-500 mt-1">
            Control which attributes appear in the list table and which capabilities (search, filter, sort) each supports.
          </p>
        </div>
        <OverviewConfigMatrix
          attributes={overviewAttrs}
          onSave={setOverviewAttrs}
          onReset={() => { setOverviewAttrs(overviewDefaults); return overviewDefaults; }}
        />
      </TabsContent>

      <TabsContent value="filter-config" className="mt-0 px-6 py-6">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-bluegrey-900">Filter configuration</h3>
          <p className="text-sm text-bluegrey-500 mt-1">
            Configure filter behaviour for each attribute that has <strong>Filterable</strong> enabled in the Overview tab. Set default pre-selected values, whether users can select one or many values, and whether activating this filter clears all others.
          </p>
        </div>
        <FilterConfigTab
          filterableAttrs={filterableAttrs}
          initial={filterConfigs}
          onSave={setFilterConfigs}
        />
      </TabsContent>

      <TabsContent value="detail" className="mt-0 px-6 py-6">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-bluegrey-900">Detail view configuration</h3>
          <p className="text-sm text-bluegrey-500 mt-1">
            {detailDescription}
          </p>
        </div>
        <DetailViewConfig
          attributes={detailAttrs}
          onSave={setDetailAttrs}
          onReset={() => { setDetailAttrs(detailDefaults); return detailDefaults; }}
          showCreateColumn={showDetailCreateColumn}
        />
      </TabsContent>
    </Tabs>
  );
}

// ─── Users & Invitations panel ─────────────────────────────────────────────

const PANEL_TAB_CLASS =
  "h-auto py-2.5 px-0 rounded-none bg-transparent text-sm font-medium " +
  "border-b-2 border-transparent shadow-none " +
  "text-bluegrey-500 " +
  "data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 " +
  "data-[state=active]:bg-transparent data-[state=active]:shadow-none " +
  "hover:text-bluegrey-900 transition-colors";

function UsersAndInvitationsPanel() {
  return (
    <Tabs defaultValue="attributes" className="w-full">
      {/* Top-level section tabs */}
      <div className="bg-white border-b border-bluegrey-200 px-6">
        <TabsList className="h-auto bg-transparent p-0 gap-8 -mb-px">
          <TabsTrigger value="attributes" className={PANEL_TAB_CLASS}>
            Attribute Settings
          </TabsTrigger>
          <TabsTrigger value="users" className={PANEL_TAB_CLASS}>
            Users
          </TabsTrigger>
          <TabsTrigger value="invitations" className={PANEL_TAB_CLASS}>
            Invitations
          </TabsTrigger>
        </TabsList>
      </div>

      {/* Attribute-level global config */}
      <TabsContent value="attributes" className="mt-0">
        <AttributeGlobalConfig />
      </TabsContent>

      {/* Entity-specific config */}
      <TabsContent value="users" className="mt-0">
        <EntityConfig
          overviewDefaults={DEFAULT_USERS_OVERVIEW}
          detailDefaults={DEFAULT_USERS_DETAIL}
          filterDefaults={DEFAULT_USERS_FILTER}
        />
      </TabsContent>
      <TabsContent value="invitations" className="mt-0">
        <EntityConfig
          overviewDefaults={DEFAULT_INVITATIONS_OVERVIEW}
          detailDefaults={DEFAULT_INVITATIONS_DETAIL}
          detailTabLabel="Invite / View"
          detailDescription="Configure which fields will be available for create invite and view invite."
          showDetailCreateColumn={true}
        />
      </TabsContent>
    </Tabs>
  );
}

// ─── Coming soon placeholder ───────────────────────────────────────────────

function ComingSoonSection({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center justify-center min-h-[320px]">
      <div className="text-center max-w-xs">
        <div className="w-12 h-12 rounded-xl bg-bluegrey-50 flex items-center justify-center mx-auto mb-3">
          <Icon className="w-6 h-6 text-bluegrey-300" />
        </div>
        <p className="text-sm font-medium text-bluegrey-600 mb-1">{label}</p>
        <p className="text-xs text-bluegrey-400">UI configuration for this entity is coming soon.</p>
      </div>
    </div>
  );
}

// ─── General Settings ─────────────────────────────────────────────────────────

const DATE_FORMATS = [
  { value: "DD/MM/YYYY", label: "DD/MM/YYYY (e.g. 25/01/2025)" },
  { value: "MM/DD/YYYY", label: "MM/DD/YYYY (e.g. 01/25/2025)" },
  { value: "YYYY-MM-DD", label: "YYYY-MM-DD (e.g. 2025-01-25)" },
  { value: "DD-MM-YYYY", label: "DD-MM-YYYY (e.g. 25-01-2025)" },
  { value: "DD MMM YYYY", label: "DD MMM YYYY (e.g. 25 Jan 2025)" },
  { value: "MMM DD, YYYY", label: "MMM DD, YYYY (e.g. Jan 25, 2025)" },
];

function GeneralSettings() {
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaved(false);
    await new Promise((r) => setTimeout(r, 400));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="border-b border-bluegrey-100 bg-bluegrey-25/50 px-6 py-4">
      <div className="flex flex-col sm:flex-row sm:items-end gap-4">
        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-bluegrey-400">
            General Settings
          </p>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-sm font-medium text-bluegrey-700 whitespace-nowrap">
              <Calendar className="w-4 h-4 text-bluegrey-400" />
              Date format
            </label>
            <div className="relative">
              <select
                value={dateFormat}
                onChange={(e) => { setDateFormat(e.target.value); setSaved(false); }}
                className="h-9 pl-3 pr-8 text-sm border border-bluegrey-300 rounded-[2px] bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-bluegrey-900"
              >
                {DATE_FORMATS.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-bluegrey-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          className={`h-9 px-4 text-sm font-medium rounded-[2px] flex items-center gap-1.5 transition-colors ${
            saved
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          <Save className="w-3.5 h-3.5" />
          {saved ? "Saved" : "Save"}
        </button>
      </div>
    </div>
  );
}

// ─── Entity options ────────────────────────────────────────────────────────

const ENTITY_OPTIONS = [
  { value: "users-invitations", label: "Users & Invitations" },
  { value: "organization", label: "Organization" },
  { value: "access-role", label: "Access Role" },
  { value: "application", label: "Application" },
  { value: "permission", label: "Permission" },
];

// ─── Main component ────────────────────────────────────────────────────────

export default function UIConfigurationTab() {
  const [entity, setEntity] = useState("users-invitations");

  const selectedLabel = ENTITY_OPTIONS.find((o) => o.value === entity)?.label ?? "";

  return (
    <div>
      {/* General Settings bar */}
      <GeneralSettings />

      {/* Header bar — entity selector on LEFT, description on right */}
      <div className="px-6 py-4 border-b border-bluegrey-100 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
        {/* Left: selector */}
        <div className="flex items-center gap-3 shrink-0">
          <label className="text-sm font-medium text-bluegrey-700 whitespace-nowrap">
            Entity
          </label>
          <Select value={entity} onValueChange={setEntity}>
            <SelectTrigger className="w-52 text-sm h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ENTITY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Divider */}
        <div className="hidden sm:block h-6 w-px bg-bluegrey-200" />

        {/* Right: description */}
        <p className="text-sm text-bluegrey-500">
          Configure attribute visibility, search, filter, sort and detail view layout for{" "}
          <span className="font-medium text-bluegrey-700">{selectedLabel}</span>.
        </p>
      </div>

      {/* Content area */}
      {entity === "users-invitations" && <UsersAndInvitationsPanel />}
      {entity === "organization" && <OrganizationConfig />}
      {entity === "access-role" && <ComingSoonSection icon={Shield} label="Access Role" />}
      {entity === "application" && <ComingSoonSection icon={AppWindow} label="Application" />}
      {entity === "permission" && <ComingSoonSection icon={Key} label="Permission" />}
    </div>
  );
}
