import { useState } from "react";
import { ChevronDown, ChevronRight, MoreVertical } from "lucide-react";
import { DataGrid } from "@/components/ui/data-grid";
import {
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
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DataItem {
  id: string;
  col1: string;
  col2: string;
  col3: string;
  col4: string;
  col5: string;
  col6: string;
  col7: string;
  col8: string;
}

// Generate sample data
const generateData = (count: number): DataItem[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `item-${i + 1}`,
    col1: `Data cell`,
    col2: `Data cell`,
    col3: `Data cell`,
    col4: `Data cell`,
    col5: `Data cell`,
    col6: `Data cell`,
    col7: `Data cell`,
    col8: `Data cell`,
  }));
};

export default function DataGridDemo() {
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const allData = generateData(14);
  const totalItems = allData.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentData = allData.slice(startIndex, endIndex);

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const handleAddItem = () => {
    console.log("Add item clicked");
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-3xl font-bold text-bluegrey-900">
        Data Grid Component
      </h1>

      <DataGrid
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder="Search items"
        onAddItem={handleAddItem}
        addButtonLabel="Add item"
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={setCurrentPage}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setCurrentPage(1);
        }}
      >
        <Table>
          <TableScroll>
            <TableContent>
              <TableHeader>
                <TableHeadRow>
                  <TableHeadCell className="w-9" />
                  <TableHeadCell>
                    <span className="text-sm font-bold text-bluegrey-900">
                      Title
                    </span>
                  </TableHeadCell>
                  <TableHeadCell>
                    <span className="text-sm font-bold text-bluegrey-900">
                      Title
                    </span>
                  </TableHeadCell>
                  <TableHeadCell>
                    <span className="text-sm font-bold text-bluegrey-900">
                      Title
                    </span>
                  </TableHeadCell>
                  <TableHeadCell>
                    <span className="text-sm font-bold text-bluegrey-900">
                      Title
                    </span>
                  </TableHeadCell>
                  <TableHeadCell>
                    <span className="text-sm font-bold text-bluegrey-900">
                      Title
                    </span>
                  </TableHeadCell>
                  <TableHeadCell>
                    <span className="text-sm font-bold text-bluegrey-900">
                      Title
                    </span>
                  </TableHeadCell>
                  <TableHeadCell>
                    <span className="text-sm font-bold text-bluegrey-900">
                      Title
                    </span>
                  </TableHeadCell>
                  <TableHeadCell>
                    <span className="text-sm font-bold text-bluegrey-900">
                      Title
                    </span>
                  </TableHeadCell>
                  <TableHeadCell className="w-10" />
                </TableHeadRow>
              </TableHeader>
              <TableBody>
                {currentData.map((item) => (
                  <TableRow key={item.id}>
                    <TableExpandCell>
                      <button
                        onClick={() => toggleRow(item.id)}
                        className="flex h-10 w-10 items-center justify-center rounded hover:bg-bluegrey-50 transition-colors"
                        aria-label={
                          expandedRows.has(item.id)
                            ? "Collapse row"
                            : "Expand row"
                        }
                      >
                        {expandedRows.has(item.id) ? (
                          <ChevronDown className="h-5 w-5 text-bluegrey-900" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-bluegrey-900" />
                        )}
                      </button>
                    </TableExpandCell>
                    <TableCell>
                      <span className="text-sm text-bluegrey-900 truncate">
                        {item.col1}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-bluegrey-900 truncate">
                        {item.col2}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-bluegrey-900 truncate">
                        {item.col3}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-bluegrey-900 truncate">
                        {item.col4}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-bluegrey-900 truncate">
                        {item.col5}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-bluegrey-900 truncate">
                        {item.col6}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-bluegrey-900 truncate">
                        {item.col7}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-bluegrey-900 truncate">
                        {item.col8}
                      </span>
                    </TableCell>
                    <TableActionCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded hover:bg-bluegrey-50"
                          >
                            <MoreVertical className="h-6 w-6 text-blue-500" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableActionCell>
                  </TableRow>
                ))}
              </TableBody>
            </TableContent>
          </TableScroll>
        </Table>
      </DataGrid>
    </div>
  );
}
