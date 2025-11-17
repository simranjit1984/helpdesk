import { Search } from "lucide-react";

interface SearchBarProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  width?: string;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search",
  width = "w-full sm:w-[280px]",
}: SearchBarProps) {
  return (
    <div className={width}>
      <div className="relative">
        <div className="flex items-center gap-2 px-2 py-3 border border-bluegrey-500 rounded-sm bg-white">
          <Search className="w-5 h-5 text-bluegrey-500 flex-shrink-0" />
          <input
            type="text"
            placeholder={placeholder}
            value={value || ""}
            onChange={(e) => onChange?.(e.target.value)}
            className="flex-1 text-sm text-bluegrey-500 placeholder:text-bluegrey-500 outline-none bg-transparent"
          />
        </div>
      </div>
    </div>
  );
}
