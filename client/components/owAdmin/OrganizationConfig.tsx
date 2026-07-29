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
  return attrs.map((a) => ({
    id: a.id,
    label: a.defaultLabel,
    category: "",
    create: true,
    view: true,
  }));
}

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
  const [filterConfigs, setFilterConfigs] = useState<FilterAttributeConfig[]>([]);

  // Derive filterable attributes live from the overview matrix state
  const filterableAttrs = overviewAttrs.filter((a) => a.filterable);

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
        const existing = prev.find((p) => p.id === a.id);
        return existing
          ? { ...existing, label: a.defaultLabel }
          : { id: a.id, label: a.defaultLabel, category: "", create: true, view: true };
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
            Configure filter behaviour for each attribute that has <strong>Filterable</strong> enabled in the Overview tab. Set default pre-selected values and whether users can select one or many values.
          </p>
        </div>
        <FilterConfigTab
          filterableAttrs={filterableAttrs}
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
          showCreateColumn={true}
          showCategoryColumn={false}
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
