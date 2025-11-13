import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";

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
  const handleClose = () => {
    primaryAction?.onClick();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md rounded-[2px] bg-white p-0 shadow-[0_24px_38px_0_rgba(1,5,50,0.04),4px_9px_46px_0_rgba(1,5,50,0.04),0_11px_15px_0_rgba(1,5,50,0.08)]">
        <DialogHeader className="border-b border-bluegrey-200 px-6 py-4 text-left">
          <DialogTitle className="text-xl font-medium text-bluegrey-900">
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="px-6 py-4">
          <DialogDescription className="text-base text-bluegrey-500">
            {description}
          </DialogDescription>
        </div>
        <DialogFooter className="border-t border-bluegrey-200 px-6 py-4">
          <div className="flex justify-between gap-2">
            {tertiaryAction && (
              <Button
                variant="ghost"
                onClick={() => {
                  tertiaryAction.onClick();
                  onOpenChange(false);
                }}
                className="text-bluegrey-700"
              >
                {tertiaryAction.label}
              </Button>
            )}
            <div className="flex gap-2">
              {secondaryAction && (
                <Button
                  variant="outline"
                  onClick={() => {
                    secondaryAction.onClick();
                    onOpenChange(false);
                  }}
                >
                  {secondaryAction.label}
                </Button>
              )}
              {primaryAction && (
                <Button
                  onClick={handleClose}
                  className="bg-blue-700 hover:bg-blue-800 text-white"
                >
                  {primaryAction.label}
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
