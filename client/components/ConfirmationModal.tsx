import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { X } from "lucide-react";

interface ConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  tertiaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export default function ConfirmationModal({
  open,
  onOpenChange,
  title,
  description,
  primaryAction,
  secondaryAction,
  tertiaryAction,
}: ConfirmationModalProps) {
  const handlePrimaryClick = () => {
    primaryAction?.onClick();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[480px] rounded-[2px] border-0 bg-white p-0 shadow-[0_24px_38px_0_rgba(1,5,50,0.04),4px_9px_46px_0_rgba(1,5,50,0.04),0_11px_15px_0_rgba(1,5,50,0.08)]">
        <div className="flex items-start justify-between px-6 py-4">
          <DialogHeader className="text-left">
            <DialogTitle className="text-xl font-medium leading-8 text-bluegrey-900">
              {title}
            </DialogTitle>
          </DialogHeader>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-[2px] p-2 text-bluegrey-700 transition-colors hover:bg-bluegrey-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="px-6 py-4">
          <DialogDescription className="text-base leading-5 text-bluegrey-500">
            {description}
          </DialogDescription>
        </div>

        <div className="border-t border-[#DEDEE6] px-6 py-4">
          <div className="flex items-center justify-between gap-2">
            {tertiaryAction && (
              <Button
                variant="ghost"
                onClick={() => {
                  tertiaryAction.onClick();
                  onOpenChange(false);
                }}
                className="rounded-[2px] text-bluegrey-700"
              >
                {tertiaryAction.label}
              </Button>
            )}
            {!tertiaryAction && <div />}
            <div className="flex gap-2">
              {secondaryAction && (
                <Button
                  variant="outline"
                  onClick={() => {
                    secondaryAction.onClick();
                    onOpenChange(false);
                  }}
                  className="rounded-[2px] border-2 border-blue-500 text-blue-500 hover:bg-blue-50"
                >
                  {secondaryAction.label}
                </Button>
              )}
              {primaryAction && (
                <Button
                  onClick={handlePrimaryClick}
                  className="rounded-[2px] bg-blue-500 text-white hover:bg-opacity-90"
                >
                  {primaryAction.label}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
