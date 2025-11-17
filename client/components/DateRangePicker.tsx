import React, { useState } from "react";

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onApply: () => void;
  onCancel: () => void;
}

export default function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onApply,
  onCancel,
}: DateRangePickerProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Date Inputs Row */}
      <div className="flex items-start gap-4">
        {/* Start Date */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-bluegrey-900 leading-5">
            Start Date
          </label>
          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="w-60 h-11 px-2 py-3 text-sm text-bluegrey-900 placeholder:text-bluegrey-500 border border-bluegrey-500 rounded-sm bg-white focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
          />
        </div>

        {/* End Date */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-bluegrey-900 leading-5">
            End Date
          </label>
          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="w-60 h-11 px-2 py-3 text-sm text-bluegrey-900 placeholder:text-bluegrey-500 border border-bluegrey-500 rounded-sm bg-white focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
          />
        </div>
      </div>

      {/* Buttons Row */}
      <div className="flex justify-end items-start gap-4">
        <button
          onClick={onCancel}
          className="h-10 px-3 text-sm font-medium text-bluegrey-700 hover:bg-bluegrey-50 rounded-sm transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onApply}
          disabled={!startDate || !endDate}
          className="h-10 px-3 bg-blue-500 hover:bg-blue-600 text-bluegrey-25 rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          Apply
        </button>
      </div>
    </div>
  );
}
