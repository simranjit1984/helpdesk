import { CheckCircle, X } from "lucide-react";
import { useEffect } from "react";

interface SuccessAlertProps {
  message: string;
  onClose: () => void;
  autoClose?: boolean;
  autoCloseDuration?: number;
}

export default function SuccessAlert({
  message,
  onClose,
  autoClose = true,
  autoCloseDuration = 5000,
}: SuccessAlertProps) {
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDuration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseDuration, onClose]);

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-[600px] px-4">
      <div className="flex items-start rounded-[2px] bg-green-50 relative">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500 rounded-l-[2px]"></div>
        <div className="flex items-center gap-3 flex-1 pl-6 pr-3 py-2">
          <div className="flex items-start gap-2 flex-1 py-2">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-bluegrey-900 leading-5">
                {message}
              </p>
            </div>
          </div>
          <div className="flex justify-end items-center">
            <button
              onClick={onClose}
              className="flex w-10 h-10 items-center justify-center rounded-[2px] hover:bg-bluegrey-100 transition-colors"
              aria-label="Close alert"
            >
              <X className="w-6 h-6 text-bluegrey-700" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
