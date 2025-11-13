import { Search } from "lucide-react";

export default function SearchBar() {
  return (
    <div className="w-full sm:w-[280px]">
      <div className="relative">
        <div className="flex items-center gap-2 px-2 py-3 border border-bluegrey-500 rounded-sm bg-white">
          <Search className="w-5 h-5 text-bluegrey-500 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search"
            className="flex-1 text-sm text-bluegrey-500 placeholder:text-bluegrey-500 outline-none bg-transparent"
          />
        </div>
      </div>
    </div>
  );
}
