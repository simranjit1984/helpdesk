import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import AccessRoles from "./pages/AccessRoles";
import Administrators from "./pages/Administrators";
import AllAdministrators from "./pages/AllAdministrators";
import AdministratorsRoles from "./pages/AdministratorsRoles";
import Scopes from "./pages/Scopes";
import AddAdminRole from "./pages/AddAdminRole";

const queryClient = new QueryClient();

export const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/organizations" element={<Organizations />} />
          <Route path="/organizations/new" element={<AddOrganization />} />
          <Route path="/organizations/:id" element={<OrganizationDetail />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/access-roles" element={<AccessRoles />} />
          <Route path="/event-log" element={<EventLog />} />
          <Route path="/administrators" element={<Administrators />} />
          <Route path="/administrators/all" element={<AllAdministrators />} />
          <Route path="/administrators/roles" element={<AdministratorsRoles />} />
          <Route path="/administrators/roles/create" element={<AddAdminRole />} />
          <Route path="/administrators/scopes" element={<Scopes />} />
          <Route path="/invitations" element={<Navigate to="/?tab=invitations" replace />} />
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
