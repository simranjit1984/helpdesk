interface Props {
  gracePeriodDays: number;
  onChange: (days: number) => void;
  showErrors: boolean;
}

export default function StepGracePeriod({ gracePeriodDays, onChange, showErrors }: Props) {
  const triggerCondition =
    gracePeriodDays === 0
      ? "Remove when: end date ≤ today (immediate)"
      : `Remove when: end date + ${gracePeriodDays} day${gracePeriodDays !== 1 ? "s" : ""} ≤ today`;

  const handleChange = (val: string) => {
    const n = Number(val);
    if (!isNaN(n)) {
      onChange(Math.min(30, Math.max(0, n)));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-bluegrey-900 mb-1">
          End date & grace period
        </h3>
        <p className="text-sm text-bluegrey-600">
          Configure how end dates are evaluated. Users or roles are removed when{" "}
          <span className="font-medium text-bluegrey-800">TODAY ≥ end date + grace period</span>.
        </p>
      </div>

      <div className="p-4 rounded-lg border border-bluegrey-200 space-y-5">
        {/* Grace period input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-bluegrey-700">
            Grace period (days)
          </label>
          <div className="flex items-center gap-4">
            <input
              type="number"
              min={0}
              max={30}
              value={gracePeriodDays}
              onChange={(e) => handleChange(e.target.value)}
              className="w-20 border border-bluegrey-300 rounded-md px-3 py-2 text-sm text-bluegrey-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <span className="text-xs text-bluegrey-500">Between 0 and 30 days</span>
          </div>
          <p className="text-xs text-bluegrey-500">
            Allow{" "}
            <span className="font-medium">
              {gracePeriodDays === 0 ? "no" : gracePeriodDays}
            </span>{" "}
            {gracePeriodDays === 1 ? "day" : "days"} after the end date before removal.{" "}
            Set to 0 for immediate removal when end date is reached.
          </p>
          {showErrors && (gracePeriodDays < 0 || gracePeriodDays > 30) && (
            <p className="text-xs text-red-600">Grace period must be between 0 and 30 days.</p>
          )}
        </div>

        {/* Slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-bluegrey-400">
            <span>0 days (immediate)</span>
            <span>30 days</span>
          </div>
          <input
            type="range"
            min={0}
            max={30}
            value={gracePeriodDays}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer"
          />
        </div>

        {/* Trigger condition summary */}
        <div className="rounded-md bg-bluegrey-50 border border-bluegrey-200 px-4 py-3">
          <span className="text-xs font-semibold text-bluegrey-500 uppercase tracking-wide block mb-1">
            Trigger condition
          </span>
          <span className="text-sm font-medium text-bluegrey-900">{triggerCondition}</span>
        </div>
      </div>

      {/* Info box */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 space-y-1">
        <p className="text-xs font-semibold text-blue-700">Conflict resolution</p>
        <p className="text-xs text-blue-600">
          If the end date is still in the future at execution time, the user or role is skipped
          and the event is logged as informational. No data is modified.
        </p>
      </div>
    </div>
  );
}
