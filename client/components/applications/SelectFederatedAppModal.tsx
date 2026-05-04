import { useState } from "react";
import { X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FEDERATED_APP_OPTIONS } from "@/lib/applicationsMockData";

interface SelectFederatedAppModalProps {
  open: boolean;
  onClose: () => void;
  onContinue: (appId: string) => void;
}

export default function SelectFederatedAppModal({
  open,
  onClose,
  onContinue,
}: SelectFederatedAppModalProps) {
  const [selected, setSelected] = useState("");

  if (!open) return null;

  const handleClose = () => {
    setSelected("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-lg bg-white rounded-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-bluegrey-100">
          <div>
            <h2 className="text-lg font-semibold text-bluegrey-900">Select application</h2>
            <p className="text-sm text-bluegrey-500 mt-0.5">
              Application integrated with SAML, OIDC, or OAuth
            </p>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-bluegrey-50 transition-colors text-bluegrey-600 mt-0.5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-bluegrey-900">
              Applications <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                className={`w-full h-11 pl-3 pr-9 text-sm border-2 rounded-md bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  selected ? "text-bluegrey-900 border-blue-500" : "text-bluegrey-400 border-bluegrey-300"
                }`}
              >
                <option value="" disabled>
                  Select application...
                </option>
                {FEDERATED_APP_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bluegrey-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-bluegrey-100">
          <Button variant="ghost" onClick={handleClose} className="text-bluegrey-700 h-10 px-4">
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (selected) {
                onContinue(selected);
                handleClose();
              }
            }}
            disabled={!selected}
            className="bg-bluegrey-900 hover:bg-bluegrey-800 text-white h-10 px-6 rounded-sm disabled:opacity-50"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
