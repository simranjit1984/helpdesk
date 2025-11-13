import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Save } from "lucide-react";
import Layout from "@/components/Layout";
import UserDetailHeader from "@/components/UserDetailHeader";
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

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [endDateOption, setEndDateOption] = useState<"no-end" | "custom">("custom");

  // Mock user data - in real app, fetch based on id
  const user = {
    firstName: "Andy",
    lastName: "April",
    email: "andy.april@example.com",
    phone: "1234567890",
    displayPhone: "+1239292929",
    address1: "1223, Fancy Street",
    address2: "",
    city: "Amsterdam",
    postalCode: "125744",
    country: "Netherlands",
    startDate: "2025/04/18",
    endDate: "2025/04/18",
    organization: "InsurCar",
    status: "active" as const,
  };

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
            <TabsList className="h-auto bg-transparent p-0 pt-6">
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
                    <div className="flex flex-col gap-6">
                      <div className="flex flex-col gap-1">
                        <Label htmlFor="startDate" className="flex gap-1">
                          Start date
                          <span className="font-medium text-red-500">*</span>
                        </Label>
                        <Input
                          id="startDate"
                          type="text"
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
                              type="text"
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
            <p className="text-bluegrey-500">Access roles content coming soon...</p>
          </TabsContent>

          <TabsContent value="events" className="pt-6">
            <p className="text-bluegrey-500">Event log content coming soon...</p>
          </TabsContent>
        </Tabs>
      </div>
      </div>
    </Layout>
  );
}
