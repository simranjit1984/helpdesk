import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SelfService() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F7F7F9] flex flex-col items-center justify-center px-6">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="w-20 h-20 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-6">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-blue-500">
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"
              fill="currentColor"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-bluegrey-900 mb-3">Self Service</h1>
        <p className="text-base text-bluegrey-600 mb-2">
          This portal is currently under construction.
        </p>
        <p className="text-sm text-bluegrey-500 mb-8">
          The Self Service portal will allow end users to manage their own profile, consents, preferences, and account settings.
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
