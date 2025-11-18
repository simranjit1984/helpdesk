import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Save, MoreVertical, Pencil, Calendar, ChevronDown, ChevronRight, PlusCircle, Search } from "lucide-react";
import Layout from "@/components/Layout";
import UserDetailHeader from "@/components/UserDetailHeader";
import SuccessAlert from "@/components/SuccessAlert";
import InfoAlert from "@/components/InfoAlert";
import SearchBar from "@/components/SearchBar";
import FilterBar from "@/components/FilterBar";
import FilterTag from "@/components/FilterTag";
import EventTable from "@/components/EventTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Table,
  TableScroll,
  TableContent,
  TableHeader,
  TableHeadRow,
  TableHeadCell,
  TableBody,
  TableRow,
  TableCell,
  TableActionCell,
  TableExpandCell,
  TableNestedRow,
  TableNestedCell,
  NestedTable,
  NestedTableHeader,
  NestedTableHeadRow,
  NestedTableHeadCell,
  NestedTableBody,
  NestedTableRow,
  NestedTableCell,
  TableEmptyState,
} from "@/components/ui/table";
import { getUserByUsername } from "@/components/UsersTable";

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [endDateOption, setEndDateOption] = useState<"no-end" | "custom">("custom");
  const [isValidityModalOpen, setIsValidityModalOpen] = useState(false);
  const [modalStartDate, setModalStartDate] = useState("2025/04/18");
  const [modalEndDateOption, setModalEndDateOption] = useState<"no-end" | "custom">("custom");
  const [modalEndDate, setModalEndDate] = useState("2025/04/18");
  const [expandedRoles, setExpandedRoles] = useState<Set<string>>(new Set());
  interface Alert {
    id: string;
    message: string;
    type: "success" | "info";
  }
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [accessRoleSearchQuery, setAccessRoleSearchQuery] = useState("");
  const [eventSearchQuery, setEventSearchQuery] = useState("");
  const [eventFilters, setEventFilters] = useState<Array<{ id: string; column: string; operator: string; value: string }>>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address1: "",
    address2: "",
    city: "",
    postalCode: "",
    country: "",
    startDate: "2025-04-18",
    endDate: "2025-04-18",
  });

  useEffect(() => {
    const now = new Date();
    const fourteenDaysAgo = new Date(now);
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const formatDate = (date: Date) => {
      return date.toISOString().slice(0, 16).replace("T", " ");
    };

    const startDate = formatDate(fourteenDaysAgo);
    const endDate = formatDate(now);

    setEventFilters([
      {
        id: "default-date-filter",
        column: "date",
        operator: "between",
        value: `${startDate}|${endDate}`,
      },
    ]);
  }, []);

  // Fetch user data based on username (email)
  const decodedId = id ? decodeURIComponent(id) : null;
  const foundUser = decodedId ? getUserByUsername(decodedId) : null;

  const user = foundUser ? {
    firstName: foundUser.firstName,
    lastName: foundUser.lastName,
    email: foundUser.username,
    phone: foundUser.phoneNumber,
    displayPhone: foundUser.phoneNumber,
    address1: "1223, Fancy Street",
    address2: "",
    city: "Amsterdam",
    postalCode: "125744",
    country: "Netherlands",
    startDate: "2025-04-18",
    endDate: "2025-04-18",
    organization: "InsurCar",
    status: foundUser.status,
    accessRoles: foundUser.accessRoles || [],
  } : null;

  // Initialize form data when user is loaded
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        address1: user.address1,
        address2: user.address2,
        city: user.city,
        postalCode: user.postalCode,
        country: user.country,
        startDate: user.startDate,
        endDate: user.endDate,
      });
    }
  }, [user]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleCountryChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      country: value,
    }));
  };

  const handleSaveBasicInfo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);

    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      showAlert("Changes saved successfully.", "success");
    }, 1500);
  };

  const applicationsList: Record<string, Array<{ name: string; permissions: string[] }>> = {
    "1": [
      { name: "Claims Management System", permissions: ["View claims", "Create claims", "Approve claims"] },
      { name: "Policy Database", permissions: ["View policies", "Export data"] },
      { name: "Customer Portal", permissions: ["View customer info", "Update contact"] },
      { name: "Analytics Dashboard", permissions: ["View reports", "Access metrics"] },
      { name: "Audit Logger", permissions: ["View logs", "Export audit trail"] },
    ],
    "2": [
      { name: "Customer Helpdesk", permissions: ["View tickets", "Resolve tickets", "Escalate issues"] },
      { name: "Appointment Scheduler", permissions: ["View appointments", "Book appointments"] },
      { name: "CRM System", permissions: ["View customers", "Update customer info"] },
    ],
    "3": [
      { name: "Document Management", permissions: ["View documents", "Upload documents", "Archive docs"] },
      { name: "Policy Database", permissions: ["View policies"] },
      { name: "Email Service", permissions: ["Send emails", "Track opens"] },
      { name: "Template Builder", permissions: ["View templates", "Create templates"] },
      { name: "Compliance Checker", permissions: ["Run compliance checks"] },
    ],
  };

  const toggleRoleExpanded = (roleId: string) => {
    const newExpanded = new Set(expandedRoles);
    if (newExpanded.has(roleId)) {
      newExpanded.delete(roleId);
    } else {
      newExpanded.add(roleId);
    }
    setExpandedRoles(newExpanded);
  };


  const showAlert = useCallback((message: string, type: "success" | "info") => {
    const alertId = `alert-${Date.now()}-${Math.random()}`;
    const newAlert: Alert = { id: alertId, message, type };
    setAlerts((prev) => [...prev, newAlert]);
  }, []);

  const removeAlert = useCallback((alertId: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
  }, []);

  const addEventFilter = (filter: { id: string; column: string; operator: string; value: string }) => {
    // Check if the same filter already exists
    const isDuplicate = eventFilters.some(
      (existingFilter) =>
        existingFilter.column === filter.column &&
        existingFilter.operator === filter.operator &&
        existingFilter.value === filter.value
    );

    if (isDuplicate) {
      showAlert("This filter already applied.", "info");
      return;
    }

    setEventFilters([...eventFilters, filter]);
  };

  const removeEventFilter = (id: string) => {
    setEventFilters(eventFilters.filter((f) => f.id !== id));
  };

  const clearAllEventFilters = () => {
    setEventFilters([]);
  };

  if (!user) {
    return (
      <Layout>
        <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <p className="text-bluegrey-600">User not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <UserDetailHeader
        firstName={user.firstName}
        lastName={user.lastName}
        organization={user.organization}
        phone={user.displayPhone}
        email={user.email}
        status={user.status}
      />

      <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="bg-white">
        <Tabs defaultValue="basic" className="w-full">
          <div className="border-b border-bluegrey-100">
            <TabsList className="h-auto bg-transparent p-0">
              <TabsTrigger
                value="basic"
                className="relative rounded-none border-b-4 border-transparent px-4 py-2 text-base font-normal data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-blue-500 data-[state=active]:shadow-none"
              >
                Basic information
              </TabsTrigger>
              <TabsTrigger
                value="access"
                className="relative rounded-none border-b-4 border-transparent px-4 py-2 text-base font-normal data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-blue-500 data-[state=active]:shadow-none"
              >
                Access roles
              </TabsTrigger>
              <TabsTrigger
                value="events"
                className="relative rounded-none border-b-4 border-transparent px-4 py-2 text-base font-normal data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-blue-500 data-[state=active]:shadow-none"
              >
                Event log
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="basic" className="pt-6">
            <form onSubmit={handleSaveBasicInfo} className="flex flex-col gap-10">
              <div className="flex w-full max-w-sm flex-col gap-6">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="firstName">First name</Label>
                  <input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleFormChange}
                    disabled={isSaving}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <Label htmlFor="lastName">Last name</Label>
                  <input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleFormChange}
                    disabled={isSaving}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <Label htmlFor="email">Email ID</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    readOnly
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <Label htmlFor="phone">Phone number</Label>
                  <input
                    id="phone"
                    type="text"
                    value={formData.phone}
                    onChange={handleFormChange}
                    disabled={isSaving}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <Label htmlFor="address1">Address 1</Label>
                  <input
                    id="address1"
                    type="text"
                    value={formData.address1}
                    onChange={handleFormChange}
                    disabled={isSaving}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <Label htmlFor="address2">Address 2</Label>
                  <input
                    id="address2"
                    type="text"
                    value={formData.address2}
                    onChange={handleFormChange}
                    disabled={isSaving}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <Label htmlFor="city">City</Label>
                  <input
                    id="city"
                    type="text"
                    value={formData.city}
                    onChange={handleFormChange}
                    disabled={isSaving}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <Label htmlFor="postalCode">Postal code</Label>
                  <input
                    id="postalCode"
                    type="text"
                    value={formData.postalCode}
                    onChange={handleFormChange}
                    disabled={isSaving}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <Label htmlFor="country">Country</Label>
                  <Select value={formData.country} onValueChange={handleCountryChange} disabled={isSaving}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Netherlands">Netherlands</SelectItem>
                      <SelectItem value="Belgium">Belgium</SelectItem>
                      <SelectItem value="Germany">Germany</SelectItem>
                      <SelectItem value="France">France</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-4 pt-6">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-xl font-bold text-blue-500">Validity period</h3>
                    <p className="text-xs text-bluegrey-700">
                      Period during which user is authorize to access content in context of this organization.
                    </p>
                  </div>

                  <div className="rounded bg-bluegrey-50 p-6">
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-1">
                        <Label htmlFor="startDate" className="flex gap-1">
                          Start date
                          <span className="font-medium text-red-500">*</span>
                        </Label>
                        <input
                          id="startDate"
                          type="date"
                          value={formData.startDate}
                          onChange={handleFormChange}
                          disabled={isSaving}
                          className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <Label>End date</Label>
                        <RadioGroup
                          value={endDateOption}
                          onValueChange={(value) => setEndDateOption(value as "no-end" | "custom")}
                          className="gap-3"
                          disabled={isSaving}
                        >
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="no-end" id="no-end" disabled={isSaving} />
                            <Label htmlFor="no-end" className="cursor-pointer font-normal">
                              No end date
                            </Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="custom" id="custom" disabled={isSaving} />
                            <Label htmlFor="custom" className="cursor-pointer font-normal">
                              Custom date
                            </Label>
                          </div>
                        </RadioGroup>

                        {endDateOption === "custom" && (
                          <div className="ml-7 mt-2">
                            <input
                              type="date"
                              id="endDate"
                              value={formData.endDate}
                              onChange={handleFormChange}
                              disabled={isSaving}
                              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="gap-2 rounded-[2px] bg-blue-500 hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="h-5 w-5" />
                  {isSaving ? "Saving..." : "Save"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate("/")}
                  disabled={isSaving}
                  className="rounded-[2px] text-bluegrey-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="access" className="pt-6">
            <div className="flex flex-col gap-6">
              {/* Toolbar */}
              <div className="flex items-center justify-between gap-3">
                <SearchBar
                  value={accessRoleSearchQuery}
                  onChange={setAccessRoleSearchQuery}
                  placeholder="Search access roles"
                  width="w-full max-w-md"
                />
                <Button className="rounded-[2px] bg-blue-500 hover:bg-opacity-90">
                  Assign access role
                </Button>
              </div>

              {/* Table */}
              <Table variant="expandable">
                <TableScroll>
                  <TableContent>
                    <TableHeader>
                      <TableHeadRow>
                        <TableHeadCell className="w-10"></TableHeadCell>
                        <TableHeadCell>Access role</TableHeadCell>
                        <TableHeadCell>Validity period</TableHeadCell>
                        <TableHeadCell className="w-10"></TableHeadCell>
                      </TableHeadRow>
                    </TableHeader>
                    <TableBody>
                      {user.accessRoles && user.accessRoles.length > 0 ? (
                        user.accessRoles.map((role) => (
                          <React.Fragment key={role.id}>
                            <TableRow expandable isExpanded={expandedRoles.has(role.id)}>
                              <TableExpandCell>
                                <button
                                  type="button"
                                  onClick={() => toggleRoleExpanded(role.id)}
                                  className="flex h-10 w-10 items-center justify-center rounded hover:bg-bluegrey-100 transition-colors"
                                  aria-label="Toggle applications"
                                >
                                  {expandedRoles.has(role.id) ? (
                                    <ChevronDown className="h-5 w-5 text-bluegrey-700" />
                                  ) : (
                                    <ChevronRight className="h-5 w-5 text-bluegrey-700" />
                                  )}
                                </button>
                              </TableExpandCell>
                              <TableCell>
                                <span className="text-sm text-bluegrey-900">
                                  {role.name} ({role.applications} application{role.applications !== 1 ? 's' : ''})
                                </span>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-bluegrey-900">
                                    {role.startDate} {role.endDate ? `- ${role.endDate}` : '- No end date'}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setIsValidityModalOpen(true)}
                                    className="flex h-10 w-10 items-center justify-center rounded hover:bg-bluegrey-100 transition-colors flex-shrink-0"
                                    aria-label="Edit validity period"
                                  >
                                    <Pencil className="h-6 w-6 text-bluegrey-700" />
                                  </button>
                                </div>
                              </TableCell>
                              <TableActionCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <button className="flex h-10 w-10 items-center justify-center rounded hover:bg-bluegrey-100 transition-colors">
                                      <MoreVertical className="h-6 w-6 text-bluegrey-700" />
                                    </button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setIsValidityModalOpen(true)}>
                                      Edit validity period
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>Remove access role</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableActionCell>
                            </TableRow>
                            {expandedRoles.has(role.id) && (
                              <TableNestedRow colSpan={4}>
                                <TableExpandCell></TableExpandCell>
                                <TableNestedCell colSpan={3}>
                                  <NestedTable>
                                    <NestedTableHeader>
                                      <NestedTableHeadRow>
                                        <NestedTableHeadCell>Application</NestedTableHeadCell>
                                        <NestedTableHeadCell>Permissions</NestedTableHeadCell>
                                      </NestedTableHeadRow>
                                    </NestedTableHeader>
                                    <NestedTableBody>
                                      {(applicationsList[role.id] || []).map((app, appIndex) => (
                                        <NestedTableRow key={appIndex}>
                                          <NestedTableCell>
                                            <span className="text-xs text-bluegrey-900">{app.name}</span>
                                          </NestedTableCell>
                                          <NestedTableCell>
                                            <div className="flex flex-wrap gap-1">
                                              {app.permissions.map((permission, permIndex) => (
                                                <span
                                                  key={permIndex}
                                                  className="inline-block bg-bluegrey-100 text-bluegrey-900 px-1.5 py-0.5 rounded text-xs"
                                                >
                                                  {permission}
                                                </span>
                                              ))}
                                            </div>
                                          </NestedTableCell>
                                        </NestedTableRow>
                                      ))}
                                    </NestedTableBody>
                                  </NestedTable>
                                </TableNestedCell>
                              </TableNestedRow>
                            )}
                          </React.Fragment>
                        ))
                      ) : (
                        <TableEmptyState colSpan={4} message="Ready to assign access roles" />
                      )}
                    </TableBody>
                  </TableContent>
                </TableScroll>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="events" className="pt-6">
            <div className="flex flex-col gap-6">
              <FilterBar
                columns={[
                  { value: "date", label: "Date" },
                  { value: "eventType", label: "Event type" },
                  { value: "application", label: "Application" },
                  { value: "userId", label: "User ID" },
                  { value: "clientIp", label: "Client IP" },
                ]}
                filters={eventFilters}
                onFilterAdd={addEventFilter}
                onFilterRemove={removeEventFilter}
                onClearFilters={clearAllEventFilters}
                searchValue={eventSearchQuery}
                onSearchChange={setEventSearchQuery}
                searchPlaceholder="Search events"
              />

              <EventTable
                filters={eventFilters}
                searchQuery={eventSearchQuery}
                onFilterAdd={addEventFilter}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
      </div>

      <Dialog open={isValidityModalOpen} onOpenChange={setIsValidityModalOpen}>
        <DialogContent className="max-w-[480px] border-0 bg-white p-0 rounded-sm gap-6 shadow-[0_24px_38px_0_rgba(1,5,50,0.04),4px_9px_46px_0_rgba(1,5,50,0.04),0_11px_15px_0_rgba(1,5,50,0.08)]">
          <div className="flex items-start justify-between px-6 py-4">
            <DialogHeader className="text-left">
              <DialogTitle className="text-xl font-medium leading-8 text-[#131319]">
                Edit validity period
              </DialogTitle>
            </DialogHeader>
            <DialogClose className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[2px] hover:bg-bluegrey-50 transition-colors text-[#383A4B]">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
              </svg>
            </DialogClose>
          </div>

          <div className="px-6">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-1">
                <Label htmlFor="modal-start-date" className="text-sm font-normal text-[#131319]">
                  Start date
                </Label>
                <div className="relative">
                  <Input
                    id="modal-start-date"
                    type="text"
                    value={modalStartDate}
                    onChange={(e) => setModalStartDate(e.target.value)}
                    className="rounded-[2px] border-bluegrey-500 pr-10 text-sm"
                    placeholder="2025/04/18"
                  />
                  <Calendar className="absolute right-2 top-1/2 h-5 w-5 -translate-y-1/2 text-bluegrey-900 pointer-events-none" />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <Label className="text-sm font-normal text-[#131319]">End date</Label>
                <RadioGroup
                  value={modalEndDateOption}
                  onValueChange={(value) => setModalEndDateOption(value as "no-end" | "custom")}
                  className="gap-3"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="no-end" id="modal-no-end" className="border-bluegrey-500" />
                    <Label htmlFor="modal-no-end" className="cursor-pointer text-sm font-normal text-[#131319]">
                      No end date
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="custom" id="modal-custom" className="border-bluegrey-500" />
                    <Label htmlFor="modal-custom" className="cursor-pointer text-sm font-normal text-[#131319]">
                      Custom date
                    </Label>
                  </div>
                </RadioGroup>

                {modalEndDateOption === "custom" && (
                  <div className="ml-7 mt-2">
                    <div className="relative">
                      <Input
                        type="text"
                        value={modalEndDate}
                        onChange={(e) => setModalEndDate(e.target.value)}
                        className="rounded-[2px] border-bluegrey-500 pr-10 text-sm"
                        placeholder="2025/04/18"
                      />
                      <Calendar className="absolute right-2 top-1/2 h-5 w-5 -translate-y-1/2 text-bluegrey-900 pointer-events-none" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="px-6 py-4">
            <div className="flex items-center justify-between gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsValidityModalOpen(false)}
                className="rounded-[2px] text-[#383A4B] h-10 px-3"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setIsValidityModalOpen(false);
                  showAlert("Validity period updated successfully.", "success");
                }}
                className="gap-2 rounded-[2px] bg-[#041295] text-[#F7F7F9] hover:bg-[#041295]/90 h-10 px-3"
              >
                <Save className="h-5 w-5" />
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {alerts.map((alert, index) => {
        const positionFromBottom = alerts.length - 1 - index;
        const bottomOffset = 80 + positionFromBottom * 72;
        return alert.type === "success" ? (
          <SuccessAlert
            key={alert.id}
            message={alert.message}
            onClose={() => removeAlert(alert.id)}
            bottomOffset={bottomOffset}
            autoClose={true}
            autoCloseDuration={7000}
          />
        ) : (
          <InfoAlert
            key={alert.id}
            message={alert.message}
            onClose={() => removeAlert(alert.id)}
            bottomOffset={bottomOffset}
            autoClose={false}
          />
        );
      })}
    </Layout>
  );
}
