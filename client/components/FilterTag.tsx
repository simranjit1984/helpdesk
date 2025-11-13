import { X, PlusCircle } from "lucide-react";

interface FilterTagProps {
  label: string;
  boldText?: string;
  onRemove?: () => void;
  isAddButton?: boolean;
}

export default function FilterTag({
  label,
  boldText,
  onRemove,
  isAddButton,
}: FilterTagProps) {
  return (
    <div className="inline-flex items-center gap-1 px-3 py-1 bg-bluegrey-100 rounded-full">
      <div className="flex items-center gap-1 pr-1.5">
        {isAddButton && <PlusCircle className="w-5 h-5 text-bluegrey-900" />}
        <span className="text-base text-bluegrey-900">
          {label}
          {boldText && <strong className="font-bold ml-1">{boldText}</strong>}
        </span>
      </div>
      {onRemove && (
        <button
          onClick={onRemove}
          className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-bluegrey-500/10 transition-colors"
        >
          <X className="w-4 h-4 text-bluegrey-900" />
        </button>
      )}
    </div>
  );
}
