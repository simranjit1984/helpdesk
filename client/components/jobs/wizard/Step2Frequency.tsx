import { Frequency, DAYS_OF_WEEK, FREQUENCY_LABELS } from "@/lib/jobsMockData";

interface Props {
  frequency: Frequency;
  frequencyDays: string[];
  frequencyDayOfMonth: number;
  onChange: (patch: {
    frequency?: Frequency;
    frequencyDays?: string[];
    frequencyDayOfMonth?: number;
  }) => void;
  errors: { twiceWeekly?: string; monthly?: string };
  showErrors: boolean;
}

const RADIO_CLASS =
  "w-4 h-4 border border-bluegrey-400 rounded-full appearance-none checked:border-blue-600 checked:bg-blue-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-300";

export default function Step2Frequency({
  frequency,
  frequencyDays,
  frequencyDayOfMonth,
  onChange,
  errors,
  showErrors,
}: Props) {
  const handleFrequencyChange = (f: Frequency) => {
    const patch: Parameters<typeof onChange>[0] = { frequency: f };
    if (f === "weekly") patch.frequencyDays = ["Monday"];
    if (f === "twice-weekly") patch.frequencyDays = ["Monday", "Thursday"];
    if (f === "monthly") patch.frequencyDayOfMonth = frequencyDayOfMonth || 1;
    onChange(patch);
  };

  const handleDay1Change = (day: string) => {
    onChange({ frequencyDays: [day, frequencyDays[1] || "Thursday"] });
  };

  const handleDay2Change = (day: string) => {
    onChange({ frequencyDays: [frequencyDays[0] || "Monday", day] });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-bluegrey-900 mb-1">Execution frequency</h3>
        <p className="text-sm text-bluegrey-600">
          Choose how often the cleanup job should run.
        </p>
      </div>

      {/* Frequency radio group */}
      <div className="space-y-3">
        {(["daily", "weekly", "twice-weekly", "monthly"] as Frequency[]).map((f) => (
          <label
            key={f}
            className="flex items-center gap-3 p-4 rounded-lg border border-bluegrey-200 cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-colors"
          >
            <input
              type="radio"
              className={RADIO_CLASS}
              checked={frequency === f}
              onChange={() => handleFrequencyChange(f)}
            />
            <span className="text-sm font-medium text-bluegrey-900">{FREQUENCY_LABELS[f]}</span>
          </label>
        ))}
      </div>

      {/* Conditional pickers */}
      {frequency === "weekly" && (
        <div className="space-y-2 pl-2">
          <label className="block text-sm font-medium text-bluegrey-700">Day of week</label>
          <select
            value={frequencyDays[0] || "Monday"}
            onChange={(e) => onChange({ frequencyDays: [e.target.value] })}
            className="w-48 border border-bluegrey-300 rounded-md px-3 py-2 text-sm text-bluegrey-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            {DAYS_OF_WEEK.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      )}

      {frequency === "twice-weekly" && (
        <div className="space-y-2 pl-2">
          <label className="block text-sm font-medium text-bluegrey-700">Days of week</label>
          <div className="flex items-center gap-3">
            <select
              value={frequencyDays[0] || "Monday"}
              onChange={(e) => handleDay1Change(e.target.value)}
              className="w-40 border border-bluegrey-300 rounded-md px-3 py-2 text-sm text-bluegrey-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              {DAYS_OF_WEEK.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <span className="text-sm text-bluegrey-500">and</span>
            <select
              value={frequencyDays[1] || "Thursday"}
              onChange={(e) => handleDay2Change(e.target.value)}
              className="w-40 border border-bluegrey-300 rounded-md px-3 py-2 text-sm text-bluegrey-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              {DAYS_OF_WEEK.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          {showErrors && errors.twiceWeekly && (
            <p className="text-xs text-red-600">{errors.twiceWeekly}</p>
          )}
        </div>
      )}

      {frequency === "monthly" && (
        <div className="space-y-2 pl-2">
          <label className="block text-sm font-medium text-bluegrey-700">Day of month</label>
          <select
            value={frequencyDayOfMonth || 1}
            onChange={(e) => onChange({ frequencyDayOfMonth: Number(e.target.value) })}
            className="w-32 border border-bluegrey-300 rounded-md px-3 py-2 text-sm text-bluegrey-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <p className="text-xs text-bluegrey-500">
            Day 29–31 may be skipped in shorter months. Choose 1–28 for consistent execution.
          </p>
          {showErrors && errors.monthly && (
            <p className="text-xs text-red-600">{errors.monthly}</p>
          )}
        </div>
      )}
    </div>
  );
}
