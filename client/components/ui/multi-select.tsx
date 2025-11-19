import React, { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export function MultiSelect({
  options,
  selectedValues,
  onChange,
  label,
  placeholder = "",
  className,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter options based on search term
  const filteredOptions = options.filter(
    (option) =>
      !selectedValues.includes(option.value) &&
      option.label.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleRemoveValue = (valueToRemove: string) => {
    onChange(selectedValues.filter((v) => v !== valueToRemove));
  };

  const handleSelectOption = (value: string) => {
    onChange([...selectedValues, value]);
    setSearchTerm("");
    inputRef.current?.focus();
  };

  const getSelectedLabels = () => {
    return selectedValues
      .map((value) => options.find((opt) => opt.value === value)?.label || value)
      .filter(Boolean);
  };

  return (
    <div className={cn("flex flex-col gap-1", className)} ref={containerRef}>
      {label && (
        <label className="text-sm text-bluegrey-900 leading-5 font-normal">
          {label}
        </label>
      )}
      
      <div className="relative">
        {/* Input Container */}
        <div
          className={cn(
            "flex min-h-[44px] w-full items-center gap-1.5 rounded-sm border border-bluegrey-500 bg-white px-2 py-3",
            "focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2",
          )}
          onClick={() => {
            inputRef.current?.focus();
            setIsOpen(true);
          }}
        >
          {/* Selected Tags */}
          {selectedValues.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {getSelectedLabels().map((label, index) => (
                <div
                  key={selectedValues[index]}
                  className="flex items-center gap-1 rounded-sm bg-bluegrey-100 px-3 py-1"
                >
                  <span className="text-base text-bluegrey-900 leading-6">
                    {label}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveValue(selectedValues[index]);
                    }}
                    className="flex h-5 w-5 items-center justify-center rounded-full hover:bg-bluegrey-200 transition-colors"
                  >
                    <X className="h-4 w-4 text-bluegrey-900" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Input Field */}
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={selectedValues.length === 0 ? placeholder : ""}
            className="flex-1 min-w-[60px] bg-transparent text-sm text-bluegrey-900 outline-none placeholder:text-bluegrey-500"
          />
        </div>

        {/* Dropdown */}
        {isOpen && filteredOptions.length > 0 && (
          <div
            className="absolute z-50 mt-1 w-full rounded-sm border border-bluegrey-100 bg-white shadow-lg max-h-60 overflow-y-auto"
            style={{
              boxShadow:
                "0 8px 10px 0 rgba(1, 5, 50, 0.14), 0 3px 14px 0 rgba(1, 5, 50, 0.12), 0 4px 5px 0 rgba(1, 5, 50, 0.20)",
            }}
          >
            {filteredOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelectOption(option.value)}
                className="w-full px-3 py-2 text-left text-sm text-bluegrey-900 hover:bg-bluegrey-50 transition-colors"
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
