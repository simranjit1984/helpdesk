import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OrgAttributeSettings, {
  OrgAttribute,
  SYSTEM_ORG_ATTRIBUTES,
} from "./OrgAttributeSettings";
import OverviewConfigMatrix, { AttributeCapability } from "./OverviewConfigMatrix";
import DetailViewConfig, { DetailAttribute } from "./DetailViewConfig";
import FilterConfigTab, { FilterAttributeConfig } from "./FilterConfigTab";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toOverviewAttrs(attrs: OrgAttribute[]): AttributeCapability[] {
  return attrs.map((a) => ({
    id: a.id,
    label: a.defaultLabel,
    visible: true,
    searchable: true,
    filterable: true,
    sortable: true,
  }));
}

function toDetailAttrs(attrs: OrgAttribute[]): DetailAttribute[] {
  return attrs.map((a) => {
    // System-generated attributes (e.g. Organization ID) can't be set on
    // create, so lock the Create toggle off for them.
    const createDisabled = a.accessLevel === "immutable";
    return {
      id: a.id,
      label: a.defaultLabel,
      category: "",
      create: !createDisabled,
      view: true,
      createDisabled,
    };
  });
}

// ─── Static filter configuration ───────────────────────────────────────────
// Organizations can only be filtered by Status and Organization Name — these
// are fixed, system-defined filters (not derived from the Overview matrix or
// Attribute Settings), matching the locked-source pattern used for Users.

const ORG_FILTER_ATTRS: AttributeCapability[] = [
  { id: "orgName", label: "Organization Name", visible: true, searchable: true, filterable: true, sortable: true },
  { id: "status", label: "Status", visible: true, searchable: true, filterable: true, sortable: true },
  // Description is not a fixed system filter — like the other free-form
  // attributes, an admin can decide whether it filters against a canonical
  // value set (if configured), an admin-defined list, or free text.
  { id: "description", label: "Description", visible: true, searchable: true, filterable: true, sortable: false },
];

const DEFAULT_ORG_FILTER: FilterAttributeConfig[] = [
  {
    id: "orgName",
    label: "Organization Name",
    valueSource: "app-object",
    appObjectRef: "organizations",
    appObjectAttribute: "name",
    valueSelectType: "single",
    locked: true,
  },
  {
    id: "status",
    label: "Status",
    valueSource: "app-object",
    appObjectRef: "organizations",
    appObjectAttribute: "status",
    valueSelectType: "single",
    locked: true,
  },
  {
    id: "description",
    label: "Description",
    valueSource: "free-text",
    valueSelectType: "single",
  },
];

// ─── Tab style ────────────────────────────────────────────────────────────────

const TAB_CLASS =
  "h-auto py-2.5 px-0 rounded-none bg-transparent text-sm font-medium " +
  "border-b-2 border-transparent shadow-none " +
  "text-bluegrey-500 " +
  "data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 " +
  "data-[state=active]:bg-transparent data-[state=active]:shadow-none " +
  "hover:text-bluegrey-900 transition-colors";

// ─── Main component ───────────────────────────────────────────────────────────

export default function OrganizationConfig() {
  const [orgAttrs, setOrgAttrs] = useState<OrgAttribute[]>(SYSTEM_ORG_ATTRIBUTES);

  // Overview matrix state — synced from orgAttrs when attrs change
  const [overviewAttrs, setOverviewAttrs] = useState<AttributeCapability[]>(
    toOverviewAttrs(SYSTEM_ORG_ATTRIBUTES)
  );
  const [detailAttrs, setDetailAttrs] = useState<DetailAttribute[]>(
    toDetailAttrs(SYSTEM_ORG_ATTRIBUTES)
  );
  const [filterConfigs, setFilterConfigs] = useState<FilterAttributeConfig[]>(DEFAULT_ORG_FILTER);

  // When attribute settings change, merge into overview/detail (preserving
  // existing toggle values for attributes that already exist)
  const handleOrgAttrsChange = (next: OrgAttribute[]) => {
    setOrgAttrs(next);

    setOverviewAttrs((prev) =>
      next.map((a) => {
        const existing = prev.find((p) => p.id === a.id);
        return existing
          ? { ...existing, label: a.defaultLabel }
          : { id: a.id, label: a.defaultLabel, visible: true, searchable: true, filterable: true, sortable: true };
      })
    );

    setDetailAttrs((prev) =>
      next.map((a) => {
        const createDisabled = a.accessLevel === "immutable";
        const existing = prev.find((p) => p.id === a.id);
        return existing
          ? { ...existing, label: a.defaultLabel, createDisabled, create: createDisabled ? false : existing.create }
          : { id: a.id, label: a.defaultLabel, category: "", create: !createDisabled, view: true, createDisabled };
      })
    );
  };

  const handleReset = () => {
    setOrgAttrs(SYSTEM_ORG_ATTRIBUTES);
    setOverviewAttrs(toOverviewAttrs(SYSTEM_ORG_ATTRIBUTES));
    setDetailAttrs(toDetailAttrs(SYSTEM_ORG_ATTRIBUTES));
  };

  return (
    <Tabs defaultValue="attributes" className="w-full">
      <div className="bg-white border-b border-bluegrey-200 px-6">
        <TabsList className="h-auto bg-transparent p-0 gap-8 -mb-px">
          <TabsTrigger value="attributes" className={TAB_CLASS}>
            Attribute Settings
          </TabsTrigger>
          <TabsTrigger value="overview" className={TAB_CLASS}>
            Overview (Table View)
          </TabsTrigger>
          <TabsTrigger value="filter-config" className={TAB_CLASS}>
            Filter Configuration
          </TabsTrigger>
          <TabsTrigger value="createview" className={TAB_CLASS}>
            Create / View
          </TabsTrigger>
        </TabsList>
      </div>

      {/* ── Attribute Settings ── */}
      <TabsContent value="attributes" className="mt-0">
        <OrgAttributeSettings
          attributes={orgAttrs}
          onChange={handleOrgAttrsChange}
          onReset={handleReset}
        />
      </TabsContent>

      {/* ── Overview matrix ── */}
      <TabsContent value="overview" className="mt-0 px-6 py-6">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-bluegrey-900">Organization table view</h3>
          <p className="text-sm text-bluegrey-500 mt-1">
            Control which attributes appear in the organization list and which capabilities (search, filter, sort) each supports.
          </p>
        </div>
        <OverviewConfigMatrix
          attributes={overviewAttrs}
          onSave={setOverviewAttrs}
          onReset={() => {
            const defaults = toOverviewAttrs(orgAttrs);
            setOverviewAttrs(defaults);
            return defaults;
          }}
        />
      </TabsContent>

      {/* ── Filter Configuration ── */}
      <TabsContent value="filter-config" className="mt-0 px-6 py-6">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-bluegrey-900">Filter configuration</h3>
          <p className="text-sm text-bluegrey-500 mt-1">
            Organizations can be filtered by <strong>Status</strong>, <strong>Organization Name</strong> and <strong>Description</strong>. Status and Organization Name are fixed system filters; Description's value source (canonical, admin-defined list, or free text) can be configured below.
          </p>
        </div>
        <FilterConfigTab
          filterableAttrs={ORG_FILTER_ATTRS}
          initial={filterConfigs}
          onSave={setFilterConfigs}
        />
      </TabsContent>

      {/* ── Create / View ── */}
      <TabsContent value="createview" className="mt-0 px-6 py-6">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-bluegrey-900">Create / View configuration</h3>
          <p className="text-sm text-bluegrey-500 mt-1">
            Configure which fields are visible when creating a new organization and when viewing an existing one.
          </p>
        </div>
        <DetailViewConfig
          attributes={detailAttrs}
          onSave={setDetailAttrs}
          showCategoryColumn={false}
          independentCreateView={true}
          onReset={() => {
            const defaults = toDetailAttrs(orgAttrs);
            setDetailAttrs(defaults);
            return defaults;
          }}
        />
      </TabsContent>
    </Tabs>
  );
}
