import { ALLOWED_HOURS, formatHour } from "@/lib/jobsMockData";

interface Props {
  executionHour: number;
  onChange: (hour: number) => void;
}

export default function Step3TimeWindow({ executionHour, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-bluegrey-900 mb-1">Execution time window</h3>
        <p className="text-sm text-bluegrey-600">
          Cleanup jobs are restricted to the low-traffic maintenance window between{" "}
          <span className="font-medium">22:00 and 05:00 CET</span> to minimise impact on active
          users.
        </p>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-bluegrey-700">
          Execution hour{" "}
          <span className="text-bluegrey-400 font-normal">(CET timezone)</span>
        </label>

        <div className="flex flex-wrap gap-2">
          {ALLOWED_HOURS.map((hour) => (
            <button
              key={hour}
              type="button"
              onClick={() => onChange(hour)}
              className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
                executionHour === hour
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-bluegrey-700 border-bluegrey-300 hover:border-blue-400 hover:bg-blue-50"
              }`}
            >
              {formatHour(hour)}
            </button>
          ))}
        </div>

        <p className="text-xs text-bluegrey-500 mt-2">
          Selected:{" "}
          <span className="font-medium text-bluegrey-800">{formatHour(executionHour)} CET</span>
        </p>
      </div>

      <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
        <span className="font-medium">Note:</span> Execution time is in Central European Time
        (CET/CEST). Ensure this window aligns with your organisation's maintenance policy.
      </div>
    </div>
  );
}
