import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Save, Search, MoreVertical, Pencil, Calendar, ChevronDown, ChevronRight } from "lucide-react";
import Layout from "@/components/Layout";
import UserDetailHeader from "@/components/UserDetailHeader";
import SuccessAlert from "@/components/SuccessAlert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { getUserById } from "@/components/UsersTable";

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [endDateOption, setEndDateOption] = useState<"no-end" | "custom">("custom");
  const [isValidityModalOpen, setIsValidityModalOpen] = useState(false);
  const [modalStartDate, setModalStartDate] = useState("2025/04/18");
  const [modalEndDateOption, setModalEndDateOption] = useState<"no-end" | "custom">("custom");
  const [modalEndDate, setModalEndDate] = useState("2025/04/18");
  const [expandedRoles, setExpandedRoles] = useState<Set<string>>(new Set());
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

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

  // Fetch user data based on ID
  const foundUser = id ? getUserById(id) : null;

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
    startDate: "2025/04/18",
    endDate: "2025/04/18",
    organization: "InsurCar",
    status: "active" as const,
    accessRoles: foundUser.accessRoles || [],
  } : null;

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
            <form className="flex flex-col gap-10">
              <div className="flex w-full max-w-sm flex-col gap-6">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="firstName">First name</Label>
                  <Input
                    id="firstName"
                    defaultValue={user.firstName}
                    className="rounded-[2px] border-bluegrey-500"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input
                    id="lastName"
                    defaultValue={user.lastName}
                    className="rounded-[2px] border-bluegrey-500"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <Label htmlFor="email">Email ID</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue={user.email}
                    readOnly
                    className="rounded-[2px] border-bluegrey-100 cursor-text"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <Label htmlFor="phone">Phone number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    defaultValue={user.phone}
                    className="rounded-[2px] border-bluegrey-500"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <Label htmlFor="address1">Address 1</Label>
                  <Input
                    id="address1"
                    defaultValue={user.address1}
                    className="rounded-[2px] border-bluegrey-500"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <Label htmlFor="address2">Address 2</Label>
                  <Input
                    id="address2"
                    defaultValue={user.address2}
                    className="rounded-[2px] border-bluegrey-500"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    defaultValue={user.city}
                    className="rounded-[2px] border-bluegrey-500"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <Label htmlFor="postalCode">Postal code</Label>
                  <Input
                    id="postalCode"
                    defaultValue={user.postalCode}
                    className="rounded-[2px] border-bluegrey-500"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <Label htmlFor="country">Country</Label>
                  <Select defaultValue={user.country}>
                    <SelectTrigger className="rounded-[2px] border-bluegrey-500">
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
                        <Input
                          id="startDate"
                          type="date"
                          defaultValue={user.startDate}
                          className="rounded-[2px] border-bluegrey-500"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <Label>End date</Label>
                        <RadioGroup
                          value={endDateOption}
                          onValueChange={(value) => setEndDateOption(value as "no-end" | "custom")}
                          className="gap-3"
                        >
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="no-end" id="no-end" />
                            <Label htmlFor="no-end" className="cursor-pointer font-normal">
                              No end date
                            </Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="custom" id="custom" />
                            <Label htmlFor="custom" className="cursor-pointer font-normal">
                              Custom date
                            </Label>
                          </div>
                        </RadioGroup>

                        {endDateOption === "custom" && (
                          <div className="ml-7 mt-2">
                            <Input
                              type="date"
                              defaultValue={user.endDate}
                              className="rounded-[2px] border-bluegrey-500"
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
                  className="gap-2 rounded-[2px] bg-blue-500 hover:bg-opacity-90"
                >
                  <Save className="h-5 w-5" />
                  Save
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate("/")}
                  className="rounded-[2px] text-bluegrey-700"
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
                <div className="w-full max-w-md">
                  <div className="relative">
                    <div className="flex items-center gap-2 px-2 py-3 border border-bluegrey-500 rounded-sm bg-white">
                      <Search className="w-5 h-5 text-bluegrey-500 flex-shrink-0" />
                      <input
                        type="text"
                        placeholder="Search access roles"
                        className="flex-1 text-sm text-bluegrey-500 placeholder:text-bluegrey-500 outline-none bg-transparent"
                      />
                    </div>
                  </div>
                </div>
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
            <p className="text-bluegrey-500">Event log content coming soon...</p>
          </TabsContent>
        </Tabs>
      </div>
      </div>

      <Dialog open={isValidityModalOpen} onOpenChange={setIsValidityModalOpen}>
        <DialogContent className="max-w-[480px] border-0 bg-white p-0 rounded-sm shadow-[0_24px_38px_0_rgba(1,5,50,0.04),4px_9px_46px_0_rgba(1,5,50,0.04),0_11px_15px_0_rgba(1,5,50,0.08)]">
          <div className="flex items-start justify-between px-6 py-4">
            <DialogHeader className="text-left">
              <DialogTitle className="text-xl font-medium leading-8 text-bluegrey-900">
                Edit validity period
              </DialogTitle>
            </DialogHeader>
            <DialogClose className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[2px] hover:bg-bluegrey-50 transition-colors">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="#383A4B"/>
              </svg>
            </DialogClose>
          </div>

          <div className="px-6 py-4">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-1">
                <Label htmlFor="modal-start-date" className="text-sm font-normal text-bluegrey-900">
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
                <Label className="text-sm font-normal text-bluegrey-900">End date</Label>
                <RadioGroup
                  value={modalEndDateOption}
                  onValueChange={(value) => setModalEndDateOption(value as "no-end" | "custom")}
                  className="gap-3"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="no-end" id="modal-no-end" className="border-bluegrey-500" />
                    <Label htmlFor="modal-no-end" className="cursor-pointer text-sm font-normal text-bluegrey-900">
                      No end date
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="custom" id="modal-custom" className="border-bluegrey-500" />
                    <Label htmlFor="modal-custom" className="cursor-pointer text-sm font-normal text-bluegrey-900">
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

          <div className="border-t border-[#DEDEE6] px-6 py-4">
            <div className="flex items-center justify-between gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsValidityModalOpen(false)}
                className="rounded-[2px] text-bluegrey-700"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setIsValidityModalOpen(false);
                  setShowSuccessAlert(true);
                }}
                className="gap-2 rounded-[2px] bg-blue-500 hover:bg-opacity-90"
              >
                <Save className="h-5 w-5" />
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {showSuccessAlert && (
        <SuccessAlert
          message="Validity period updated successfully"
          onClose={() => setShowSuccessAlert(false)}
        />
      )}
    </Layout>
  );
}
