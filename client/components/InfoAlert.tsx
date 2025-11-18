import { Info, X } from "lucide-react";
import { useEffect, useState } from "react";

interface InfoAlertProps {
  message: string;
  onClose: () => void;
  autoClose?: boolean;
  autoCloseDuration?: number;
}

export default function InfoAlert({
  message,
  onClose,
  autoClose = true,
  autoCloseDuration = 5000,
}: InfoAlertProps) {
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
    <div className={`fixed bottom-20 left-0 right-0 z-50 flex justify-center px-4 ${isClosing ? 'animate-slide-down-out' : 'animate-slide-up-in'}`}>
      <div className="flex items-start rounded-[2px] bg-[#E6E7F4] relative max-w-[600px] w-full">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#041295] rounded-l-[2px]"></div>
        <div className="flex items-center gap-3 flex-1 pl-6 pr-3 py-2">
          <div className="flex items-start gap-3 flex-1 py-2">
            <svg 
              className="w-5 h-5 text-[#131319] flex-shrink-0 mt-0.5" 
              viewBox="0 0 20 20" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M9.16699 5.83317H10.8337V7.49984H9.16699V5.83317ZM9.16699 9.1665H10.8337V14.1665H9.16699V9.1665ZM10.0003 1.6665C5.40033 1.6665 1.66699 5.39984 1.66699 9.99984C1.66699 14.5998 5.40033 18.3332 10.0003 18.3332C14.6003 18.3332 18.3337 14.5998 18.3337 9.99984C18.3337 5.39984 14.6003 1.6665 10.0003 1.6665ZM10.0003 16.6665C6.32533 16.6665 3.33366 13.6748 3.33366 9.99984C3.33366 6.32484 6.32533 3.33317 10.0003 3.33317C13.6753 3.33317 16.667 6.32484 16.667 9.99984C16.667 13.6748 13.6753 16.6665 10.0003 16.6665Z" 
                fill="currentColor"
              />
            </svg>
            <div className="flex-1">
              <p className="text-sm text-[#131319] leading-5">
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
              <X className="w-6 h-6 text-[#383A4B]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
