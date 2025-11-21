import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OrganizationSelectionModalProps {
  isOpen: boolean;
  organizations: string[];
  userName: string;
  onContinue: (selectedOrganization: string) => void;
  onCancel: () => void;
}

export const OrganizationSelectionModal = ({
  isOpen,
  organizations,
  userName,
  onContinue,
  onCancel,
}: OrganizationSelectionModalProps) => {
  const [selectedOrganization, setSelectedOrganization] = useState<string>(
    organizations[0] || ""
  );

  const handleContinue = () => {
    if (selectedOrganization) {
      onContinue(selectedOrganization);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Select Organization</AlertDialogTitle>
          <AlertDialogDescription>
            {userName} belongs to multiple organizations. Please select the
            organization context for viewing their details.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-4">
          <Select value={selectedOrganization} onValueChange={setSelectedOrganization}>
            <SelectTrigger>
              <SelectValue placeholder="Select an organization" />
            </SelectTrigger>
            <SelectContent>
              {organizations.map((org) => (
                <SelectItem key={org} value={org}>
                  {org}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-end gap-2">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleContinue}>
            Continue
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};
