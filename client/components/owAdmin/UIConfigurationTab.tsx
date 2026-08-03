import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, Mail, Shield, AppWindow, Key, ChevronDown } from "lucide-react";
import OverviewConfigMatrix, { AttributeCapability } from "./OverviewConfigMatrix";
import DetailViewConfig, { DetailAttribute } from "./DetailViewConfig";
import OrganizationConfig from "./OrganizationConfig";
import FilterConfigTab, { FilterAttributeConfig } from "./FilterConfigTab";

// ─── Default data ─────────────────────────────────────────────────────────────

const DEFAULT_USERS_OVERVIEW: AttributeCapability[] = [
  { id: "firstName",   label: "First Name",   visible: true,  searchable: true,  filterable: false, sortable: true },
  { id: "lastName",    label: "Last Name",    visible: true,  searchable: true,  filterable: false, sortable: true },
  { id: "email",       label: "Email",        visible: true,  searchable: true,  filterable: false, sortable: true },
  { id: "role",        label: "Access roles", visible: true,  searchable: false, filterable: true,  sortable: false, disabledCaps: ["searchable", "sortable"] },
  { id: "organization",label: "Organization", visible: true,  searchable: false, filterable: true,  sortable: false, disabledCaps: ["searchable", "sortable"] },
  { id: "status",      label: "Status",       visible: true,  searchable: false, filterable: true,  sortable: false, disabledCaps: ["searchable", "sortable"] },
];

const DEFAULT_USERS_DETAIL: DetailAttribute[] = [
  { id: "firstName",    label: "First Name",   category: "Basic Info",        create: true,  view: true  },
  { id: "lastName",     label: "Last Name",    category: "Basic Info",        create: true,  view: true  },
  { id: "email",        label: "Email",        category: "Contact Info",      create: true,  view: true  },
  { id: "phoneNumber",  label: "Phone Number", category: "Contact Info",      create: false, view: false },
  { id: "status",       label: "Status",       category: "System",            create: false, view: true  },
  { id: "role",         label: "Access roles", category: "Access Info",       create: true,  view: true  },
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
  { id: "firstName",   label: "First Name",   category: "Basic Info",   create: true,  mandatory: true,  view: true },
  { id: "lastName",    label: "Last Name",    category: "Basic Info",   create: true,  mandatory: true,  view: true },
  { id: "email",       label: "Email",        category: "Contact Info", create: true,  mandatory: true,  view: true },
  { id: "phoneNumber", label: "Phone Number", category: "Contact Info", create: false, mandatory: false, view: true },
  { id: "accessRoles", label: "Access Roles", category: "Access Info",  create: true,  mandatory: true,  view: true },
  { id: "adminRoles",  label: "Admin Roles",  category: "Access Info",  create: false, mandatory: false, view: true },
  { id: "status",      label: "Status",       category: "System",       create: false, mandatory: false, view: true, createDisabled: true },
  { id: "invitedBy",   label: "Invited By",   category: "Access Info",  create: false, mandatory: false, view: true, createDisabled: true },
  { id: "expiryDate",  label: "Expiry Date",  category: "System",       create: true,  mandatory: true,  view: true },
];

// ─── Default filter configs ──────────────────────────────────────────────────

const DEFAULT_USERS_FILTER: FilterAttributeConfig[] = [
  {
    id: "role",
    label: "Access roles",
    valueSource: "app-object",
    appObjectRef: "access-roles",
    appObjectAttribute: "name",
    valueSelectType: "multiple",
    locked: true,
  },
  {
    id: "organization",
    label: "Organization",
    valueSource: "app-object",
    appObjectRef: "organizations",
    appObjectAttribute: "name",
    valueSelectType: "single",
    locked: true,
  },
  {
    id: "status",
    label: "Status",
    valueSource: "external-system",
    externalSystemAttribute: "userStatus",
    externalSystemFallback: [],
    valueSelectType: "single",
    locked: true,
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
  detailThreeColumnMode?: boolean;
}

function EntityConfig({ overviewDefaults, detailDefaults, filterDefaults = [], detailTabLabel = "Detail View (Single Record)", detailDescription = "Configure which fields appear on the single record view. Visibility and editability can be further restricted per admin role.", detailThreeColumnMode = false }: EntityConfigProps) {
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
            Configure filter behaviour for each attribute that has <strong>Filterable</strong> enabled in the Overview tab.
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
          showCategoryColumn={false}
          threeColumnMode={detailThreeColumnMode}
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
    <Tabs defaultValue="users" className="w-full">
      {/* Top-level section tabs */}
      <div className="bg-white border-b border-bluegrey-200 px-6">
        <TabsList className="h-auto bg-transparent p-0 gap-8 -mb-px">
          <TabsTrigger value="users" className={PANEL_TAB_CLASS}>
            Users
          </TabsTrigger>
          <TabsTrigger value="invitations" className={PANEL_TAB_CLASS}>
            Invitations
          </TabsTrigger>
        </TabsList>
      </div>

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
          detailDescription="Configure which fields will be available for create invite, mandatory on invite, and view invite."
          detailThreeColumnMode={true}
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
