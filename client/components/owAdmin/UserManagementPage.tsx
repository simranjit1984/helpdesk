import { useState } from "react";
import { ArrowLeft, Mail, RotateCw, Ban, ShieldCheck, MoreVertical, Trash2, Lock, Unlock } from "lucide-react";
import {
  Tabs,
  Tab,
  Button,
  InputWrapper,
  Modal,
  ModalHeader,
  ModalContent,
  ModalActions,
} from "@onewelcome/react-lib-components";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SuperadminUser {
  id: string;
  name: string;
  email: string;
  orgId: string;
  status: "Active" | "Suspended";
}

type InvitationStatus = "Pending" | "Expired" | "Revoked";

interface Invitation {
  id: string;
  email: string;
  sentAt: string;
  status: InvitationStatus;
}

interface UserManagementPageProps {
  rootOrgName: string;
  onBack: () => void;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function buildMockUsers(rootOrgName: string): SuperadminUser[] {
  return [
    { id: "u1", name: "Amelia Ward", email: "amelia.ward@" + rootOrgName + ".com", orgId: rootOrgName, status: "Active" },
    { id: "u2", name: "Noah Bennett", email: "noah.bennett@" + rootOrgName + ".com", orgId: rootOrgName, status: "Active" },
    { id: "u3", name: "Priya Nair", email: "priya.nair@" + rootOrgName + ".com", orgId: rootOrgName, status: "Suspended" },
    { id: "u4", name: "Lucas Ferreira", email: "lucas.ferreira@sub-org.com", orgId: "orphan-org", status: "Active" },
  ];
}

const INITIAL_INVITATIONS: Invitation[] = [
  { id: "i1", email: "sam.taylor@example.com", sentAt: "2025-06-12", status: "Pending" },
  { id: "i2", email: "morgan.lee@example.com", sentAt: "2025-05-30", status: "Expired" },
];

// ─── Small shared bits ─────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Active: "bg-green-100 text-green-700",
    Suspended: "bg-red-100 text-red-700",
    Pending: "bg-amber-100 text-amber-700",
    Expired: "bg-bluegrey-100 text-bluegrey-500",
    Revoked: "bg-bluegrey-100 text-bluegrey-500",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${styles[status] ?? "bg-bluegrey-100 text-bluegrey-600"}`}>
      {status}
    </span>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="py-12 text-center">
      <p className="text-sm text-bluegrey-400">{label}</p>
    </div>
  );
}

interface ActionsMenuItem {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  destructive?: boolean;
}

function ActionsMenu({ items, ariaLabel }: { items: ActionsMenuItem[]; ariaLabel: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          title={ariaLabel}
          className="h-7 w-7 flex items-center justify-center rounded-md border border-bluegrey-200 hover:bg-bluegrey-50 text-bluegrey-500 hover:text-blue-600 transition-colors"
        >
          <MoreVertical className="w-3.5 h-3.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        {items.map((item) => (
          <DropdownMenuItem
            key={item.label}
            onClick={item.onClick}
            className={`cursor-pointer flex items-center gap-2 ${item.destructive ? "text-red-600 hover:bg-red-50" : ""}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Invite modal ──────────────────────────────────────────────────────────────

function InviteSuperadminModal({
  open,
  onClose,
  onInvite,
}: {
  open: boolean;
  onClose: () => void;
  onInvite: (email: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [sending, setSending] = useState(false);

  const reset = () => {
    setEmail("");
    setError(undefined);
    setSending(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSend = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Email address is required.");
      return;
    }
    if (!EMAIL_REGEX.test(trimmed)) {
      setError("Enter a valid email address.");
      return;
    }
    setError(undefined);
    setSending(true);
    await new Promise((res) => setTimeout(res, 900));
    setSending(false);
    onInvite(trimmed);
    reset();
  };

  return (
    <Modal id="invite-superadmin-modal" open={open} onClose={handleClose}>
      <ModalHeader
        id="invite-superadmin-modal-label"
        title="Invite superadmin"
        description="Send an invitation to join the root organisation with the superadmin role."
      />
      <ModalContent id="invite-superadmin-modal-description">
        <div className="space-y-4">
          <InputWrapper
            label="Email address"
            type="email"
            name="inviteEmail"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setEmail(e.target.value);
              setError(undefined);
            }}
            required
            error={!!error}
            errorMessage={error}
          />
          <div className="flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2.5">
            <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <p className="text-xs text-blue-700">
              This invitation will always grant the <span className="font-semibold">Superadmin</span> role.
              No other role can be selected.
            </p>
          </div>
        </div>
      </ModalContent>
      <ModalActions cancelAction={{ label: "Cancel" }}>
        <Button variant="fill" color="primary" loading={sending} onClick={handleSend}>
          Send invite
        </Button>
      </ModalActions>
    </Modal>
  );
}

// ─── Users tab ─────────────────────────────────────────────────────────────────

function UsersTable({
  users,
  onDelete,
  onToggleBlock,
}: {
  users: SuperadminUser[];
  onDelete: (id: string) => void;
  onToggleBlock: (id: string) => void;
}) {
  if (users.length === 0) {
    return <EmptyState label="No superadmins found for this root organisation." />;
  }

  return (
    <div className="rounded-lg border border-bluegrey-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-bluegrey-25 border-b border-bluegrey-200">
          <tr>
            <th className="text-left font-semibold text-bluegrey-500 px-4 py-2.5">Name</th>
            <th className="text-left font-semibold text-bluegrey-500 px-4 py-2.5">Email</th>
            <th className="text-left font-semibold text-bluegrey-500 px-4 py-2.5">Status</th>
            <th className="text-right font-semibold text-bluegrey-500 px-4 py-2.5">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-bluegrey-100">
          {users.map((u) => (
            <tr key={u.id} className="hover:bg-bluegrey-25 transition-colors">
              <td className="px-4 py-3 text-bluegrey-900 font-medium">{u.name}</td>
              <td className="px-4 py-3 text-bluegrey-600 font-mono text-xs">{u.email}</td>
              <td className="px-4 py-3">
                <StatusBadge status={u.status} />
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end">
                  <ActionsMenu
                    ariaLabel="User actions"
                    items={[
                      {
                        label: u.status === "Suspended" ? "Unblock user authentication" : "Block user authentication",
                        icon: u.status === "Suspended" ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />,
                        onClick: () => onToggleBlock(u.id),
                      },
                      {
                        label: "Delete user",
                        icon: <Trash2 className="w-3.5 h-3.5" />,
                        onClick: () => onDelete(u.id),
                        destructive: true,
                      },
                    ]}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Invitations tab ────────────────────────────────────────────────────────────

function InvitationsTable({
  invitations,
  onResend,
  onRevoke,
}: {
  invitations: Invitation[];
  onResend: (id: string) => void;
  onRevoke: (id: string) => void;
}) {
  if (invitations.length === 0) {
    return <EmptyState label="No pending invitations." />;
  }

  return (
    <div className="rounded-lg border border-bluegrey-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-bluegrey-25 border-b border-bluegrey-200">
          <tr>
            <th className="text-left font-semibold text-bluegrey-500 px-4 py-2.5">Email</th>
            <th className="text-left font-semibold text-bluegrey-500 px-4 py-2.5">Sent</th>
            <th className="text-left font-semibold text-bluegrey-500 px-4 py-2.5">Status</th>
            <th className="text-right font-semibold text-bluegrey-500 px-4 py-2.5">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-bluegrey-100">
          {invitations.map((inv) => (
            <tr key={inv.id} className="hover:bg-bluegrey-25 transition-colors">
              <td className="px-4 py-3 text-bluegrey-900 font-mono text-xs">{inv.email}</td>
              <td className="px-4 py-3 text-bluegrey-500">{inv.sentAt}</td>
              <td className="px-4 py-3">
                <StatusBadge status={inv.status} />
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end">
                  <ActionsMenu
                    ariaLabel="Invitation actions"
                    items={[
                      ...(inv.status !== "Revoked"
                        ? [
                            {
                              label: "Resend invitation",
                              icon: <RotateCw className="w-3.5 h-3.5" />,
                              onClick: () => onResend(inv.id),
                            },
                          ]
                        : []),
                      ...(inv.status === "Pending"
                        ? [
                            {
                              label: "Withdraw invitation",
                              icon: <Ban className="w-3.5 h-3.5" />,
                              onClick: () => onRevoke(inv.id),
                              destructive: true,
                            },
                          ]
                        : []),
                    ]}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main page ──────────────────────────────────────────────────────────────────

export default function UserManagementPage({ rootOrgName, onBack }: UserManagementPageProps) {
  const [tab, setTab] = useState(0);
  const [users, setUsers] = useState<SuperadminUser[]>(() => buildMockUsers(rootOrgName));
  const [invitations, setInvitations] = useState<Invitation[]>(INITIAL_INVITATIONS);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);

  const rootOrgUsers = users.filter((u) => u.orgId === rootOrgName);

  const handleInvite = (email: string) => {
    setInvitations((prev) => [
      { id: "i" + Date.now(), email, sentAt: new Date().toISOString().slice(0, 10), status: "Pending" },
      ...prev,
    ]);
    setInviteModalOpen(false);
    setTab(1);
    setBanner(`Invitation sent to ${email}.`);
    setTimeout(() => setBanner(null), 4000);
  };

  const handleDeleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    setBanner("User was deleted.");
    setTimeout(() => setBanner(null), 4000);
  };

  const handleToggleBlock = (id: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, status: u.status === "Suspended" ? "Active" : "Suspended" } : u,
      ),
    );
    setBanner("User authentication status updated.");
    setTimeout(() => setBanner(null), 4000);
  };

  const handleResend = (id: string) => {
    setInvitations((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, sentAt: new Date().toISOString().slice(0, 10), status: "Pending" } : inv)),
    );
    setBanner("Invitation resent.");
    setTimeout(() => setBanner(null), 4000);
  };

  const handleRevoke = (id: string) => {
    setInvitations((prev) => prev.map((inv) => (inv.id === id ? { ...inv, status: "Revoked" } : inv)));
    setBanner("Invitation revoked.");
    setTimeout(() => setBanner(null), 4000);
  };

  const pendingCount = invitations.filter((i) => i.status === "Pending").length;

  return (
    <div className="px-6 py-8 max-w-4xl">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-bluegrey-500 hover:text-bluegrey-900 transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to tenant settings
      </button>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-lg font-semibold text-bluegrey-900">User & superadmin management</h1>
          <p className="text-sm text-bluegrey-500 mt-0.5">
            Showing superadmins for root organisation{" "}
            <span className="font-mono font-medium text-bluegrey-700">{rootOrgName}</span>.
          </p>
        </div>
        <Button
          variant="fill"
          color="primary"
          onClick={() => setInviteModalOpen(true)}
          style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}
        >
          <Mail className="w-4 h-4" />
          Invite superadmin
        </Button>
      </div>

      {banner && (
        <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 mb-4 text-xs text-green-700">
          {banner}
        </div>
      )}

      <Tabs selected={tab} onTabChange={setTab}>
        <Tab title={`Users (${rootOrgUsers.length})`}>
          <div className="pt-4">
            <UsersTable users={rootOrgUsers} onDelete={handleDeleteUser} onToggleBlock={handleToggleBlock} />
          </div>
        </Tab>
        <Tab title={`Invitations (${pendingCount})`}>
          <div className="pt-4">
            <InvitationsTable invitations={invitations} onResend={handleResend} onRevoke={handleRevoke} />
          </div>
        </Tab>
      </Tabs>

      <InviteSuperadminModal
        open={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        onInvite={handleInvite}
      />
    </div>
  );
}
