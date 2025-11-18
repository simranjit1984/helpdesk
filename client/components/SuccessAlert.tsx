import { CheckCircle, X } from "lucide-react";
import { useEffect, useState, useCallback } from "react";

interface SuccessAlertProps {
  message: string;
  onClose: () => void;
  autoClose?: boolean;
  autoCloseDuration?: number;
  bottomOffset?: number;
}

export default function SuccessAlert({
  message,
  onClose,
  autoClose = true,
  autoCloseDuration = 7000,
  bottomOffset = 80,
}: SuccessAlertProps) {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (!autoClose) return;

    const autoCloseTimer = setTimeout(() => {
      setIsClosing(true);
    }, autoCloseDuration);

    return () => clearTimeout(autoCloseTimer);
  }, [autoClose, autoCloseDuration]);

  useEffect(() => {
    if (isClosing) {
      const animationTimer = setTimeout(() => {
        onClose();
      }, 300);
      return () => clearTimeout(animationTimer);
    }
  }, [isClosing, onClose]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  }, [onClose]);

  return (
    <div
      className={`fixed left-0 right-0 z-50 flex justify-center px-4 ${isClosing ? "animate-slide-down-out" : "animate-slide-up-in"}`}
      style={{ bottom: `${bottomOffset}px` }}
    >
      <div className="flex items-start rounded-[2px] bg-green-50 relative w-[600px]">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500 rounded-l-[2px]"></div>
        <div className="flex items-center gap-3 flex-1 pl-6 pr-3 py-2">
          <div className="flex items-start gap-2 flex-1 py-2">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-bluegrey-900 leading-5 line-clamp-2">
                {message}
              </p>
            </div>
          </div>
          <div className="flex justify-end items-center">
            <button
              onClick={handleClose}
              className="flex w-10 h-10 items-center justify-center rounded-[2px] hover:bg-bluegrey-100 transition-colors flex-shrink-0"
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
