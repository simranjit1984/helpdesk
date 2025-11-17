import { CheckCircle, X } from "lucide-react";
import { useEffect, useState } from "react";

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
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsClosing(true);
        setTimeout(() => {
          onClose();
        }, 300);
      }, autoCloseDuration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseDuration, onClose]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <style>
      {`
        @keyframes slideUpIn {
          from {
            opacity: 0;
            transform: translateY(100px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideDownOut {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(100px);
          }
        }
        .alert-enter {
          animation: slideUpIn 0.3s ease-out forwards;
        }
        .alert-exit {
          animation: slideDownOut 0.3s ease-in forwards;
        }
      `}
    </style>
  );

  return (
    <div className={`fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-[600px] px-4 ${isClosing ? 'alert-exit' : 'alert-enter'}`}>
      <div className="flex items-start rounded-[2px] bg-green-50 relative">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500 rounded-l-[2px]"></div>
        <div className="flex items-center gap-3 flex-1 pl-6 pr-3 py-2">
          <div className="flex items-start gap-2 flex-1 py-2">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-bluegrey-900 leading-5">
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
