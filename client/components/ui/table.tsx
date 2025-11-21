import React from "react";
import { cn } from "@/lib/utils";

interface TableContextType {
  variant?: "flat" | "expandable" | "custom";
}

const TableContext = React.createContext<TableContextType>({});

interface TableProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "flat" | "expandable" | "custom";
}

const Table = React.forwardRef<HTMLDivElement, TableProps>(
  ({ className, variant = "flat", ...props }, ref) => (
    <TableContext.Provider value={{ variant }}>
      <div
        ref={ref}
        className={cn(
          "bg-white rounded border-2 border-bluegrey-100 lg:border-0",
          className,
        )}
        {...props}
      />
    </TableContext.Provider>
  ),
);
Table.displayName = "Table";

const TableScroll = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "overflow-x-auto scrollbar-thin scrollbar-thumb-bluegrey-300 scrollbar-track-bluegrey-50",
      className,
    )}
    {...props}
  />
));
TableScroll.displayName = "TableScroll";

const TableContent = React.forwardRef<
  HTMLTableElement,
  React.TableHTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <table
    ref={ref}
    className={cn("w-full border-collapse", className)}
    {...props}
  />
));
TableContent.displayName = "TableContent";

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("", className)} {...props} />
));
TableHeader.displayName = "TableHeader";

interface TableHeadRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  sticky?: boolean;
}

const TableHeadRow = React.forwardRef<HTMLTableRowElement, TableHeadRowProps>(
  ({ className, sticky = true, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn("border-t-2 border-b-2 border-bluegrey-100", className)}
      {...props}
    />
  ),
);
TableHeadRow.displayName = "TableHeadRow";

interface TableHeadCellProps
  extends React.ThHTMLAttributes<HTMLTableCellElement> {
  sticky?: boolean;
}

const TableHeadCell = React.forwardRef<
  HTMLTableCellElement,
  TableHeadCellProps
>(({ className, sticky = false, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "bg-bluegrey-25 text-left px-3 py-2.5 whitespace-nowrap",
      sticky && "sticky left-0 z-10 shadow-[1px_0_3px_rgba(0,0,0,0.05)]",
      className,
    )}
    {...props}
  />
));
TableHeadCell.displayName = "TableHeadCell";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn("", className)} {...props} />
));
TableBody.displayName = "TableBody";

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  expandable?: boolean;
  isExpanded?: boolean;
}

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, expandable = false, isExpanded = false, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        "group hover:bg-bluegrey-25/50 transition-colors",
        !expandable || !isExpanded ? "border-b-2 border-bluegrey-100" : "",
        className,
      )}
      {...props}
    />
  ),
);
TableRow.displayName = "TableRow";

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  sticky?: boolean;
  height?: "compact" | "default" | "spacious";
}

const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, sticky = false, height = "default", ...props }, ref) => {
    const minHeightClass = {
      compact: "min-h-8",
      default: "min-h-10",
      spacious: "min-h-12",
    }[height];

    return (
      <td
        ref={ref}
        className={cn(
          "px-4 py-2",
          sticky &&
            "sticky left-0 z-10 bg-white border-r border-bluegrey-100 shadow-[1px_0_3px_rgba(0,0,0,0.05)]",
          className,
        )}
        {...props}
      >
        <div
          className={cn(
            "flex items-start overflow-visible",
            minHeightClass,
          )}
        >
          {props.children}
        </div>
      </td>
    );
  },
);
TableCell.displayName = "TableCell";

interface TableActionCellProps
  extends React.TdHTMLAttributes<HTMLTableCellElement> {
  height?: "compact" | "default" | "spacious";
}

const TableActionCell = React.forwardRef<
  HTMLTableCellElement,
  TableActionCellProps
>(({ className, height = "default", ...props }, ref) => {
  const minHeightClass = {
    compact: "min-h-8",
    default: "min-h-10",
    spacious: "min-h-12",
  }[height];

  return (
    <td ref={ref} className={cn("py-2 w-10", className)} {...props}>
      <div className={cn("flex items-start justify-center", minHeightClass)}>
        {props.children}
      </div>
    </td>
  );
});
TableActionCell.displayName = "TableActionCell";

interface TableExpandCellProps
  extends React.TdHTMLAttributes<HTMLTableCellElement> {
  height?: "compact" | "default" | "spacious";
}

const TableExpandCell = React.forwardRef<
  HTMLTableCellElement,
  TableExpandCellProps
>(({ className, height = "default", ...props }, ref) => {
  const heightClass = {
    compact: "h-8",
    default: "h-10",
    spacious: "h-12",
  }[height];

  return (
    <td ref={ref} className={cn("px-3 py-1 w-10 relative", className)} style={{ overflow: "visible" }} {...props}>
      <div className={cn("flex items-center justify-center relative", heightClass)}>
        {props.children}
      </div>
    </td>
  );
});
TableExpandCell.displayName = "TableExpandCell";

interface TableNestedRowProps
  extends React.HTMLAttributes<HTMLTableRowElement> {
  colSpan: number;
}

const TableNestedRow = React.forwardRef<
  HTMLTableRowElement,
  TableNestedRowProps
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "bg-bluegrey-25/30 border-b-2 border-bluegrey-100",
      className,
    )}
    {...props}
  />
));
TableNestedRow.displayName = "TableNestedRow";

interface TableNestedCellProps
  extends React.TdHTMLAttributes<HTMLTableCellElement> {
  nestedTable?: boolean;
}

const TableNestedCell = React.forwardRef<
  HTMLTableCellElement,
  TableNestedCellProps
>(({ className, nestedTable = false, ...props }, ref) => (
  <td ref={ref} className={cn("px-3 py-0 pr-0", className)} {...props} />
));
TableNestedCell.displayName = "TableNestedCell";

interface NestedTableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  compact?: boolean;
}

const NestedTable = React.forwardRef<HTMLTableElement, NestedTableProps>(
  ({ className, compact = false, ...props }, ref) => (
    <table
      ref={ref}
      className={cn("w-full border-collapse", className)}
      {...props}
    />
  ),
);
NestedTable.displayName = "NestedTable";

const NestedTableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("", className)} {...props} />
));
NestedTableHeader.displayName = "NestedTableHeader";

const NestedTableHeadRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn("border-b-2 border-bluegrey-200 bg-bluegrey-50", className)}
    {...props}
  />
));
NestedTableHeadRow.displayName = "NestedTableHeadRow";

const NestedTableHeadCell = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th ref={ref} className={cn("text-left px-3 py-2", className)} {...props}>
    <span className="text-xs font-semibold text-bluegrey-700 uppercase tracking-wider">
      {props.children}
    </span>
  </th>
));
NestedTableHeadCell.displayName = "NestedTableHeadCell";

const NestedTableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn("", className)} {...props} />
));
NestedTableBody.displayName = "NestedTableBody";

const NestedTableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b border-bluegrey-100 last:border-b-0 hover:bg-bluegrey-50/50 transition-colors",
      className,
    )}
    {...props}
  />
));
NestedTableRow.displayName = "NestedTableRow";

const NestedTableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td ref={ref} className={cn("px-3 py-2", className)} {...props} />
));
NestedTableCell.displayName = "NestedTableCell";

interface EmptyStateProps extends React.HTMLAttributes<HTMLTableRowElement> {
  colSpan: number;
  message: string;
}

const TableEmptyState = React.forwardRef<HTMLTableRowElement, EmptyStateProps>(
  ({ colSpan, message, className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn("border-b-2 border-bluegrey-100", className)}
      {...props}
    >
      <td colSpan={colSpan} className="px-8 py-16">
        <p className="text-sm text-bluegrey-600 text-center">{message}</p>
      </td>
    </tr>
  ),
);
TableEmptyState.displayName = "TableEmptyState";

export {
  Table,
  TableScroll,
  TableContent,
  TableHeader,
  TableHeadRow,
  TableHeadCell,
  TableBody,
  TableRow,
  TableCell,
  TableActionCell,
  TableExpandCell,
  TableNestedRow,
  TableNestedCell,
  TableEmptyState,
  NestedTable,
  NestedTableHeader,
  NestedTableHeadRow,
  NestedTableHeadCell,
  NestedTableBody,
  NestedTableRow,
  NestedTableCell,
  type TableContextType,
};
