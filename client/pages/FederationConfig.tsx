import { useState } from "react";
import { Plus, Pencil, Trash2, Layers, ShieldCheck, Shield, Building2, Link2 } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import CreateFederationConfigModal from "@/components/federation/CreateFederationConfigModal";
import { MOCK_FEDERATION_CONFIGS, type FederationConfig } from "@/lib/federationMockData";
import { useToast } from "@/hooks/use-toast";

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
        <Link2 className="w-7 h-7 text-blue-400" />
      </div>
      <div className="text-center">
        <p className="text-base font-semibold text-bluegrey-900 mb-1">
          No federation configurations found
        </p>
        <p className="text-sm text-bluegrey-500 max-w-sm">
          Federation configs link an organization and IdP to specific admin roles and scopes,
          enabling federated admin login.
        </p>
      </div>
      <Button
        onClick={onCreate}
        className="mt-2 flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white h-10 px-4 rounded-[2px]"
      >
        <Plus className="w-4 h-4" />
        Create New Config
      </Button>
    </div>
  );
}

// ─── Scope badges ─────────────────────────────────────────────────────────────

function ScopeBadges({ names }: { names: string[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {names.map((name) => (
        <span
          key={name}
          className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-100"
        >
          {name}
        </span>
      ))}
    </div>
  );
}

// ─── Table row ────────────────────────────────────────────────────────────────

function ConfigRow({
  config,
  onEdit,
  onDelete,
}: {
  config: FederationConfig;
  onEdit: (c: FederationConfig) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <tr className="border-b border-bluegrey-50 hover:bg-bluegrey-25 transition-colors">
      <td className="px-5 py-3.5">
        <span className="flex items-center gap-2 text-sm font-medium text-bluegrey-900">
          <Building2 className="w-4 h-4 text-bluegrey-400 shrink-0" />
          {config.organization_name}
        </span>
      </td>
      <td className="px-5 py-3.5">
        <span className="flex items-center gap-2 text-sm text-bluegrey-800">
          <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
          {config.idp_name}
        </span>
      </td>
      <td className="px-5 py-3.5">
        {config.claim_name ? (
          <div className="flex flex-col gap-1">
            <span className="text-xs text-bluegrey-500">
              <code className="font-mono font-semibold text-bluegrey-700">{config.claim_name}</code>
            </span>
            <div className="flex flex-wrap gap-1">
              {config.claim_values.map((v) => (
                <code
                  key={v}
                  className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100"
                >
                  {v}
                </code>
              ))}
            </div>
          </div>
        ) : (
          <span className="text-xs text-bluegrey-400">—</span>
        )}
      </td>
      <td className="px-5 py-3.5">
        <span className="flex items-center gap-2 text-sm text-bluegrey-800">
          <Shield className="w-4 h-4 text-bluegrey-400 shrink-0" />
          {config.admin_role_name}
        </span>
      </td>
      <td className="px-5 py-3.5">
        <ScopeBadges names={config.scope_names} />
      </td>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onEdit(config)}
            className="h-8 w-8 rounded-md flex items-center justify-center text-bluegrey-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            title="Edit"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(config.id)}
            className="h-8 w-8 rounded-md flex items-center justify-center text-bluegrey-500 hover:bg-red-50 hover:text-red-600 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function FederationConfig() {
  const { toast } = useToast();
  const [configs, setConfigs] = useState<FederationConfig[]>(MOCK_FEDERATION_CONFIGS);
  const [modalOpen, setModalOpen] = useState(false);

  function handleCreated(newConfig: Omit<FederationConfig, "id">) {
    const id = `fc-${Date.now()}`;
    setConfigs((prev) => [...prev, { ...newConfig, id }]);
    toast({ title: "Success", description: "Federation config created successfully." });
    setModalOpen(false);
  }

  function handleDelete(id: string) {
    setConfigs((prev) => prev.filter((c) => c.id !== id));
    toast({ title: "Deleted", description: "Federation config removed." });
  }

  function handleEdit(_config: FederationConfig) {
    toast({ title: "Edit", description: "Edit flow coming soon." });
  }

  return (
    <Layout>
      {/* Page header */}
      <div className="px-4 sm:px-6 lg:px-8 py-6 border-b border-bluegrey-100 bg-white flex items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-2xl font-bold text-bluegrey-900">Federation Configurations</h1>
          <p className="text-sm text-bluegrey-500">
            Map (IdP + Organization) → (Admin Role + Scope) to drive federated admin login.
          </p>
        </div>
        <Button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white h-10 px-4 rounded-[2px] whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm font-medium">Create New Config</span>
        </Button>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        {configs.length === 0 ? (
          <div className="bg-white border border-bluegrey-100 rounded-md">
            <EmptyState onCreate={() => setModalOpen(true)} />
          </div>
        ) : (
          <div className="bg-white border border-bluegrey-100 rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-bluegrey-25 border-b border-bluegrey-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-bluegrey-600 uppercase tracking-wider">
                    Organization
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-bluegrey-600 uppercase tracking-wider">
                    Identity Provider
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-bluegrey-600 uppercase tracking-wider">
                    Claim Values
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-bluegrey-600 uppercase tracking-wider">
                    Admin Role
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-bluegrey-600 uppercase tracking-wider">
                    Scopes
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-bluegrey-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {configs.map((config) => (
                  <ConfigRow
                    key={config.id}
                    config={config}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create modal */}
      <CreateFederationConfigModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={handleCreated}
        existingConfigs={configs}
      />
    </Layout>
  );
}
