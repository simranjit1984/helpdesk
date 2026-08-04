import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PersonaSelection from "./pages/PersonaSelection";
import Index from "./pages/Index";
import EventLog from "./pages/EventLog";
import UserDetail from "./pages/UserDetail";
import TooltipDemo from "./pages/TooltipDemo";
import DataGridDemo from "./pages/DataGridDemo";
import NotFound from "./pages/NotFound";
import Organizations from "./pages/Organizations";
import OrganizationDetail from "./pages/OrganizationDetail";
import AddOrganization from "./pages/AddOrganization";
import Applications from "./pages/Applications";
import AddApplication from "./pages/AddApplication";
import ApplicationDetail from "./pages/ApplicationDetail";
import AccessRoles from "./pages/AccessRoles";
import AddAccessRole from "./pages/AddAccessRole";
import BulkAccessRoleAssignment from "./pages/BulkAccessRoleAssignment";
import BulkAccessRoleJobs from "./pages/BulkAccessRoleJobs";
import BulkAccessRoleJobDetail from "./pages/BulkAccessRoleJobDetail";
import Administrators from "./pages/Administrators";
import AllAdministrators from "./pages/AllAdministrators";
import AdministratorsRoles from "./pages/AdministratorsRoles";
import Scopes from "./pages/Scopes";
import ScopeDetail from "./pages/ScopeDetail";
import AddAdminRole from "./pages/AddAdminRole";
import AddAccessRolesToOrg from "./pages/AddAccessRolesToOrg";
import Settings from "./pages/Settings";
import OWAdminConsole from "./pages/OWAdminConsole";
import SelfService from "./pages/SelfService";
import BulkInvite from "./pages/BulkInvite";
import BulkInvitationJobs from "./pages/BulkInvitationJobs";
import BulkInvitationJobDetail from "./pages/BulkInvitationJobDetail";

const queryClient = new QueryClient();

export const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* ── Persona selection landing ────────────────────────────── */}
          <Route path="/" element={<PersonaSelection />} />

          {/* ── OW Admin Console (placeholder) ──────────────────────── */}
          <Route path="/ow-admin" element={<OWAdminConsole />} />

          {/* ── Self Service (placeholder) ──────────────────────────── */}
          <Route path="/self-service" element={<SelfService />} />

          {/* ── DMv2 Management Console ──────────────────────────────── */}
          <Route path="/users" element={<Index />} />
          <Route path="/organizations" element={<Organizations />} />
          <Route path="/organizations/new" element={<AddOrganization />} />
          <Route path="/organizations/:id" element={<OrganizationDetail />} />
          <Route path="/organizations/:id/access-roles/add" element={<AddAccessRolesToOrg />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/applications/new" element={<AddApplication />} />
          <Route path="/applications/:id" element={<ApplicationDetail />} />
          <Route path="/access-roles" element={<AccessRoles />} />
          <Route path="/access-roles/new" element={<AddAccessRole />} />
          <Route path="/bulk-access-role-assignment" element={<BulkAccessRoleAssignment />} />
          <Route path="/bulk-access-role-jobs" element={<BulkAccessRoleJobs />} />
          <Route path="/bulk-access-role-jobs/:jobId" element={<BulkAccessRoleJobDetail />} />
          <Route path="/event-log" element={<EventLog />} />
          <Route path="/administrators" element={<Administrators />} />
          <Route path="/administrators/all" element={<AllAdministrators />} />
          <Route path="/administrators/roles" element={<AdministratorsRoles />} />
          <Route path="/administrators/roles/create" element={<AddAdminRole />} />
          <Route path="/administrators/scopes" element={<Scopes />} />
          <Route path="/administrators/scopes/:scopeId" element={<ScopeDetail />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/jobs" element={<Navigate to="/ow-admin?section=jobs" replace />} />
          <Route path="/bulk-invite" element={<BulkInvite />} />
          <Route path="/bulk-invite-jobs" element={<BulkInvitationJobs />} />
          <Route path="/bulk-invite-jobs/:jobId" element={<BulkInvitationJobDetail />} />
          <Route path="/invitations" element={<Navigate to="/users?tab=invitations" replace />} />
          <Route path="/users/:id" element={<UserDetail />} />
          <Route path="/tooltip-demo" element={<TooltipDemo />} />
          <Route path="/data-grid-demo" element={<DataGridDemo />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);
