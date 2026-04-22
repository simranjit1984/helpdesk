import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OWAdminConsole() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F7F7F9] flex flex-col items-center justify-center px-6">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="w-20 h-20 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-6">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-blue-500">
            <path
              d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM12 7C13.4 7 14.8 8.1 14.8 9.5V11C15.4 11 16 11.6 16 12.3V15.8C16 16.4 15.4 17 14.7 17H9.2C8.6 17 8 16.4 8 15.7V12.2C8 11.6 8.6 11 9.2 11V9.5C9.2 8.1 10.6 7 12 7ZM12 8.2C11.2 8.2 10.5 8.8 10.5 9.5V11H13.5V9.5C13.5 8.8 12.8 8.2 12 8.2Z"
              fill="currentColor"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-bluegrey-900 mb-3">OW Admin Console</h1>
        <p className="text-base text-bluegrey-600 mb-2">
          This console is currently under construction.
        </p>
        <p className="text-sm text-bluegrey-500 mb-8">
          The OW Admin Console will allow platform administrators to manage tenants, system-wide settings, and configurations.
        </p>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium mb-8">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L1 21h22L12 2zm0 3.5L20.5 19h-17L12 5.5zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z" fill="currentColor"/>
          </svg>
          Coming soon
        </div>

        <div>
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to console selection
          </Button>
        </div>
      </div>
    </div>
  );
}
