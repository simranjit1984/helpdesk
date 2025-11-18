import React, { useState, useEffect } from "react";

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onApply: () => void;
  onCancel: () => void;
}

interface PresetOption {
  label: string;
  value: string;
  days: number;
}

const PRESET_OPTIONS: PresetOption[] = [
  { label: "Last 24 hours", value: "last_24h", days: 1 },
  { label: "Last 48 hours", value: "last_48h", days: 2 },
  { label: "Last 7 days", value: "last_7d", days: 7 },
  { label: "Last 14 days", value: "last_14d", days: 14 },
];

export default function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onApply,
  onCancel,
}: DateRangePickerProps) {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const applyPreset = (preset: PresetOption) => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - preset.days);

    // Format dates to ISO datetime-local format (YYYY-MM-DDTHH:mm)
    const startIso = start.toISOString().slice(0, 16);
    const endIso = now.toISOString().slice(0, 16);

    onStartDateChange(startIso);
    onEndDateChange(endIso);
    setSelectedPreset(preset.value);
  };

  const handleCustomDateChange = () => {
    setSelectedPreset(null);
  };

  return (
    <div className="flex flex-col gap-4 min-w-max">
      {/* Preset Options */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="text-xs font-medium text-bluegrey-900 uppercase tracking-wide">
          Quick:
        </div>
        {PRESET_OPTIONS.map((preset) => (
          <button
            key={preset.value}
            onClick={() => applyPreset(preset)}
            className={`text-sm transition-colors ${
              selectedPreset === preset.value
                ? "text-blue-600 font-medium underline"
                : "text-blue-500 hover:text-blue-600 hover:underline"
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Custom Date Range */}
      <div className="flex flex-col gap-2 pt-2 border-t border-bluegrey-200">
        <div className="text-xs font-medium text-bluegrey-900 uppercase tracking-wide">
          Custom Range
        </div>
        <div className="flex items-start gap-3">
          {/* Start Date */}
          <div className="flex flex-col gap-1">
            <label htmlFor="filter-start-date" className="text-xs text-bluegrey-700 font-medium">
              Start Date
            </label>
            <input
              id="filter-start-date"
              name="filter-start-date"
              type="datetime-local"
              value={startDate}
              onChange={(e) => {
                onStartDateChange(e.target.value);
                handleCustomDateChange();
              }}
              className="w-52 h-10 px-2 py-2 text-sm text-bluegrey-900 placeholder:text-bluegrey-500 border border-bluegrey-500 rounded-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
              autoComplete="off"
            />
          </div>

          {/* End Date */}
          <div className="flex flex-col gap-1">
            <label htmlFor="filter-end-date" className="text-xs text-bluegrey-700 font-medium">
              End Date
            </label>
            <input
              id="filter-end-date"
              name="filter-end-date"
              type="datetime-local"
              value={endDate}
              onChange={(e) => {
                onEndDateChange(e.target.value);
                handleCustomDateChange();
              }}
              className="w-52 h-10 px-2 py-2 text-sm text-bluegrey-900 placeholder:text-bluegrey-500 border border-bluegrey-500 rounded-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
              autoComplete="off"
            />
          </div>
        </div>
      </div>

      {/* Buttons Row */}
      <div className="flex justify-end items-start gap-4 pt-2">
        <button
          onClick={onCancel}
          className="h-10 px-3 py-2 text-sm font-medium text-[#383A4B] hover:bg-bluegrey-50 rounded-sm transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onApply}
          disabled={!startDate || !endDate}
          className="h-10 px-3 py-2 bg-[#041295] hover:bg-[#041295]/90 text-[#F7F7F9] rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          Apply
        </button>
      </div>
    </div>
  );
}
