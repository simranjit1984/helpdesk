import { useState } from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  width?: string;
}

export default function SearchBar({
  value: externalValue,
  onChange,
  placeholder = "Search",
  width = "w-full sm:w-[280px]",
}: SearchBarProps) {
  const [internalValue, setInternalValue] = useState("");

  // Determine if this is a controlled or uncontrolled component
  const isControlled = externalValue !== undefined && onChange !== undefined;
  const currentValue = isControlled ? externalValue : internalValue;

  const handleChange = (newValue: string) => {
    if (isControlled) {
      onChange?.(newValue);
    } else {
      setInternalValue(newValue);
    }
  };

  return (
    <div className={width}>
      <div className="relative">
        <div className="flex items-center gap-2 px-2 py-3 border border-bluegrey-500 rounded-sm bg-white">
          <Search className="w-5 h-5 text-bluegrey-500 flex-shrink-0" />
          <input
            type="text"
            name="search"
            id="search-input"
            placeholder={placeholder}
            value={currentValue}
            onChange={(e) => handleChange(e.target.value)}
            className="flex-1 text-sm text-bluegrey-500 placeholder:text-bluegrey-500 outline-none bg-transparent"
            autoComplete="off"
          />
        </div>
      </div>
    </div>
  );
}
