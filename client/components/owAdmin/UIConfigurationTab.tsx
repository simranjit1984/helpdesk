import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import OverviewConfigMatrix, { AttributeCapability } from "./OverviewConfigMatrix";
import DetailViewConfig, { DetailAttribute } from "./DetailViewConfig";

// ─── Default data ─────────────────────────────────────────────────────────────

const DEFAULT_USERS_OVERVIEW: AttributeCapability[] = [
  { id: "firstName", label: "First Name", visible: true, searchable: true, filterable: true, sortable: true },
  { id: "lastName", label: "Last Name", visible: true, searchable: true, filterable: true, sortable: true },
  { id: "email", label: "Email", visible: true, searchable: true, filterable: true, sortable: true },
  { id: "role", label: "Role", visible: true, searchable: true, filterable: true, sortable: false, disabledCaps: ["sortable"] },
  { id: "organization", label: "Organization", visible: true, searchable: false, filterable: true, sortable: true, disabledCaps: ["searchable"] },
];

const DEFAULT_USERS_DETAIL: DetailAttribute[] = [
  { id: "firstName", label: "First Name", visible: true, editable: true, section: "basic" },
  { id: "lastName", label: "Last Name", visible: true, editable: true, section: "basic" },
  { id: "email", label: "Email", visible: true, editable: false, section: "basic" },
  { id: "role", label: "Role", visible: true, editable: true, section: "access" },
  { id: "organization", label: "Organization", visible: true, editable: false, section: "organization" },
  { id: "status", label: "Status", visible: true, editable: true, section: "access" },
];

const DEFAULT_INVITATIONS_OVERVIEW: AttributeCapability[] = [
  { id: "email", label: "Email", visible: true, searchable: true, filterable: true, sortable: true },
  { id: "phoneNumber", label: "Phone Number", visible: true, searchable: true, filterable: true, sortable: false, disabledCaps: ["sortable"] },
  { id: "status", label: "Status", visible: true, searchable: true, filterable: true, sortable: true },
  { id: "invitedBy", label: "Invited By", visible: true, searchable: true, filterable: true, sortable: true },
  { id: "expiryDate", label: "Expiry Date", visible: true, searchable: false, filterable: true, sortable: true, disabledCaps: ["searchable"] },
];

const DEFAULT_INVITATIONS_DETAIL: DetailAttribute[] = [
  { id: "email", label: "Email", visible: true, editable: false, section: "basic" },
  { id: "phoneNumber", label: "Phone Number", visible: true, editable: true, section: "basic" },
  { id: "status", label: "Status", visible: true, editable: false, section: "access" },
  { id: "invitedBy", label: "Invited By", visible: true, editable: false, section: "access" },
  { id: "expiryDate", label: "Expiry Date", visible: true, editable: true, section: "access" },
];

// ─── Sub-tab trigger style ─────────────────────────────────────────────────

const SUB_TAB_CLASS =
  "h-auto py-2.5 px-0 rounded-none bg-transparent text-sm font-medium " +
  "border-b-2 border-transparent shadow-none " +
  "text-bluegrey-500 " +
  "data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 " +
  "data-[state=active]:bg-transparent data-[state=active]:shadow-none " +
  "hover:text-bluegrey-900 transition-colors";

// ─── Entity config block ───────────────────────────────────────────────────

interface EntityConfigProps {
  overviewDefaults: AttributeCapability[];
  detailDefaults: DetailAttribute[];
}

function EntityConfig({ overviewDefaults, detailDefaults }: EntityConfigProps) {
  const [overviewAttrs, setOverviewAttrs] = useState<AttributeCapability[]>(overviewDefaults);
  const [detailAttrs, setDetailAttrs] = useState<DetailAttribute[]>(detailDefaults);

  return (
    <Tabs defaultValue="overview">
      {/* Sub-tab bar */}
      <div className="bg-white border-b border-bluegrey-100 px-6">
        <TabsList className="h-auto bg-transparent p-0 gap-6 -mb-px">
          <TabsTrigger value="overview" className={SUB_TAB_CLASS}>
            Overview (Table View)
          </TabsTrigger>
          <TabsTrigger value="detail" className={SUB_TAB_CLASS}>
            Detail View (Single Record)
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
          onReset={() => {
            setOverviewAttrs(overviewDefaults);
            return overviewDefaults;
          }}
        />
      </TabsContent>

      <TabsContent value="detail" className="mt-0 px-6 py-6">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-bluegrey-900">Detail view configuration</h3>
          <p className="text-sm text-bluegrey-500 mt-1">
            Configure which fields appear on the single record view, whether they are editable, and which section they belong to. Drag rows to reorder.
          </p>
        </div>
        <DetailViewConfig
          attributes={detailAttrs}
          onSave={setDetailAttrs}
          onReset={() => {
            setDetailAttrs(detailDefaults);
            return detailDefaults;
          }}
        />
      </TabsContent>
    </Tabs>
  );
}

// ─── Entity tab style ──────────────────────────────────────────────────────

const ENTITY_TAB_CLASS =
  "h-9 px-4 rounded-full text-sm font-medium transition-colors " +
  "bg-transparent text-bluegrey-500 shadow-none " +
  "data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-none " +
  "hover:text-bluegrey-900";

// ─── Main UIConfigurationTab ───────────────────────────────────────────────

const SCOPE_OPTIONS = [
  { value: "global", label: "Global" },
  { value: "organization", label: "Organization-specific" },
  { value: "role", label: "Role-specific" },
];

export default function UIConfigurationTab() {
  const [scope, setScope] = useState("global");

  return (
    <div>
      {/* Section description + scope selector */}
      <div className="px-6 py-5 border-b border-bluegrey-100 flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-0 sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-bluegrey-900">UI Configuration</h2>
          <p className="text-sm text-bluegrey-500 mt-1 max-w-xl">
            Configure which attributes are visible, searchable, filterable, and sortable for each entity. Customise both the overview table and single-record detail view.
          </p>
        </div>

        {/* Configuration scope */}
        <div className="flex items-center gap-3 shrink-0">
          <label className="text-sm font-medium text-bluegrey-700 whitespace-nowrap">
            Configuration scope
          </label>
          <Select value={scope} onValueChange={setScope}>
            <SelectTrigger className="w-48 text-sm h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SCOPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Entity tabs */}
      <Tabs defaultValue="users" className="w-full">
        <div className="px-6 py-3 border-b border-bluegrey-100 flex items-center gap-2 bg-bluegrey-25">
          <TabsList className="h-auto bg-bluegrey-100 p-1 rounded-full gap-1">
            <TabsTrigger value="users" className={ENTITY_TAB_CLASS}>
              Users
            </TabsTrigger>
            <TabsTrigger value="invitations" className={ENTITY_TAB_CLASS}>
              Invitations
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="users" className="mt-0">
          <EntityConfig
            overviewDefaults={DEFAULT_USERS_OVERVIEW}
            detailDefaults={DEFAULT_USERS_DETAIL}
          />
        </TabsContent>

        <TabsContent value="invitations" className="mt-0">
          <EntityConfig
            overviewDefaults={DEFAULT_INVITATIONS_OVERVIEW}
            detailDefaults={DEFAULT_INVITATIONS_DETAIL}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
