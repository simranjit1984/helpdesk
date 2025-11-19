import React, { useState, useRef, useEffect } from "react";
import { X, ChevronDown } from "lucide-react";
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
  placeholder = " ",
  className,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [focusedOptionIndex, setFocusedOptionIndex] = useState(-1);
  const [focusedChipIndex, setFocusedChipIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);

  const listboxId = "multi-select-listbox";

  // Filter available options (exclude already selected)
  const filteredOptions = options.filter(
    (option) =>
      !selectedValues.includes(option.value) &&
      option.label.toLowerCase().includes(inputValue.toLowerCase()),
  );

  // Get labels for selected values
  const selectedLabels = selectedValues.map((value) => ({
    value,
    label: options.find((opt) => opt.value === value)?.label || value,
  }));

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setInputValue("");
        setFocusedOptionIndex(-1);
        setFocusedChipIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset focused option when filtered options change
  useEffect(() => {
    setFocusedOptionIndex(-1);
  }, [inputValue]);

  const handleInputFocus = () => {
    setFocusedChipIndex(-1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    if (newValue.trim()) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
    setFocusedOptionIndex(-1);
  };


  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedOptionIndex(0);
        } else {
          setFocusedOptionIndex((prev) =>
            prev < filteredOptions.length - 1 ? prev + 1 : prev,
          );
        }
        break;

      case "ArrowUp":
        e.preventDefault();
        if (isOpen) {
          setFocusedOptionIndex((prev) => (prev > 0 ? prev - 1 : -1));
        }
        break;

      case "Enter":
        e.preventDefault();
        if (isOpen && focusedOptionIndex >= 0) {
          const option = filteredOptions[focusedOptionIndex];
          handleSelectOption(option.value);
        }
        break;

      case "Escape":
        if (isOpen) {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(false);
          setInputValue("");
          setFocusedOptionIndex(-1);
          setFocusedChipIndex(-1);
        }
        break;

      case "Backspace":
        if (inputValue === "") {
          e.preventDefault();
          if (focusedChipIndex === -1 && selectedValues.length > 0) {
            // First Backspace: focus the last chip
            setFocusedChipIndex(selectedValues.length - 1);
          } else if (focusedChipIndex >= 0) {
            // Second Backspace: remove the focused chip
            handleRemoveValue(selectedValues[focusedChipIndex]);
            setFocusedChipIndex(-1);
          }
        }
        break;

      case "Tab":
        if (isOpen) {
          setIsOpen(false);
          setInputValue("");
          setFocusedOptionIndex(-1);
        }
        break;

      default:
        break;
    }
  };

  const handleSelectOption = (value: string) => {
    onChange([...selectedValues, value]);
    setInputValue("");
    setIsOpen(false);
    setFocusedOptionIndex(-1);
    inputRef.current?.focus();
  };

  const handleRemoveValue = (valueToRemove: string) => {
    onChange(selectedValues.filter((v) => v !== valueToRemove));
    setFocusedChipIndex(-1);
    inputRef.current?.focus();
  };

  const handleChipKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      handleRemoveValue(selectedValues[index]);
    }
  };

  const handleOptionClick = (value: string) => {
    handleSelectOption(value);
  };

  return (
    <div className={cn("flex flex-col gap-1", className)} ref={containerRef}>
      {label && (
        <label className="text-sm text-bluegrey-900 leading-5 font-normal">
          {label}
        </label>
      )}

      <div className="relative w-full">
        {/* Input Container */}
        <div
          className={cn(
            "flex min-h-11 w-full flex-wrap items-start gap-1 rounded-sm border border-bluegrey-500 bg-white px-2 py-1.5 relative",
            "focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2",
          )}
          onClick={() => inputRef.current?.focus()}
        >
          {/* Selected Chips */}
          {selectedLabels.map((item, index) => (
            <div
              key={item.value}
              className={cn(
                "flex items-center gap-1 rounded-sm px-2 py-1 flex-shrink-0 h-7",
                focusedChipIndex === index
                  ? "bg-bluegrey-200 ring-1 ring-blue-500"
                  : "bg-bluegrey-100",
              )}
            >
              <span className="text-xs text-bluegrey-900 leading-4 whitespace-nowrap">
                {item.label}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveValue(item.value);
                }}
                onKeyDown={(e) => handleChipKeyDown(e, index)}
                className="flex h-3.5 w-3.5 items-center justify-center rounded-full hover:bg-bluegrey-300 transition-colors flex-shrink-0 ml-0.5"
                aria-label={`Remove ${item.label}`}
              >
                <X className="h-3 w-3 text-bluegrey-900" />
              </button>
            </div>
          ))}

          {/* Input Field */}
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-autocomplete="list"
            aria-haspopup="listbox"
            aria-controls={listboxId}
            aria-expanded={isOpen}
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleInputKeyDown}
            placeholder={selectedValues.length === 0 ? placeholder : ""}
            className="flex-1 min-w-[40px] bg-transparent text-sm text-bluegrey-900 outline-none placeholder:text-bluegrey-500 py-1"
          />

          {/* Dropdown Arrow */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsOpen(!isOpen);
              inputRef.current?.focus();
            }}
            className="absolute right-2 top-1/4 p-1 hover:bg-bluegrey-100 rounded transition-colors flex-shrink-0"
            aria-label="Toggle dropdown"
          >
            <ChevronDown className="h-5 w-5 text-bluegrey-500" />
          </button>
        </div>

        {/* Dropdown List */}
        {isOpen && filteredOptions.length > 0 && (
          <div
            ref={listboxRef}
            id={listboxId}
            role="listbox"
            className="absolute z-50 top-full left-0 right-0 mt-1 rounded-sm border border-bluegrey-100 bg-white shadow-lg max-h-60 overflow-y-auto"
            style={{
              boxShadow:
                "0 8px 10px 0 rgba(1, 5, 50, 0.14), 0 3px 14px 0 rgba(1, 5, 50, 0.12), 0 4px 5px 0 rgba(1, 5, 50, 0.20)",
            }}
          >
            {filteredOptions.map((option, index) => (
              <button
                key={option.value}
                role="option"
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleOptionClick(option.value);
                }}
                onMouseEnter={() => setFocusedOptionIndex(index)}
                aria-selected={focusedOptionIndex === index}
                className={cn(
                  "w-full px-3 py-2 text-left text-sm text-bluegrey-900 transition-colors cursor-pointer",
                  focusedOptionIndex === index
                    ? "bg-bluegrey-50"
                    : "hover:bg-bluegrey-50",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}

        {/* Empty state */}
        {isOpen && filteredOptions.length === 0 && inputValue && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1 rounded-sm border border-bluegrey-100 bg-white shadow-lg p-3">
            <p className="text-sm text-bluegrey-600 text-center">
              No results found
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
