import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  Row,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  AlertTriangleIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  ColumnsIcon,
  SearchIcon,
  ShieldAlertIcon,
  TrendingUpIcon,
  ZapIcon,
  CircleCheckIcon,
  XCircleIcon,
  CircleIcon,
  TimerIcon,
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { toast } from "sonner";
import { z } from "zod";

import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const schema = z.object({
  id: z.number(),
  header: z.string(),
  type: z.string(),
  status: z.string(), // Easy, Medium, Hard
  target: z.string(),
  limit: z.string(),
  reviewer: z.string(), // Not Started, Accepted, Wrong Answer, ...
});

const columns: ColumnDef<z.infer<typeof schema>>[] = [
  {
    accessorKey: "header",
    header: "Câu hỏi",
    cell: ({ row }) => (
      <div className="text-left pr-2 font-medium tabular-nums">
        {row.original.header}
      </div>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "type",
    header: "Mã câu hỏi",
    cell: ({ row }) => (
      <div className="w-32">
        <Badge variant="outline" className="px-1.5 text-muted-foreground">
          {row.original.type}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Độ khó",
    cell: ({ row }) => {
      // Xác định icon và màu sắc dựa trên mức độ khó
      const difficulty = row.original.status;
      let icon = null;
      let bgColor = "";
      let textColor = "";

      if (difficulty === "Easy") {
        icon = <ZapIcon className="size-3" />;
        textColor = "text-green-700";
      } else if (difficulty === "Medium") {
        icon = <AlertTriangleIcon className="size-3" />;
        textColor = "text-yellow-700";
      } else if (difficulty === "Hard") {
        icon = <ShieldAlertIcon className="size-3" />;
        textColor = "text-red-700";
      }

      return (
        <Badge
          variant="outline"
          className={`flex gap-1 px-1.5 ${bgColor} ${textColor} border-0 [&_svg]:size-3`}
        >
          {difficulty}
        </Badge>
      );
    },
  },
  {
    accessorKey: "target",
    header: () => <div className="w-full text-right">Tổng số submit</div>,
    cell: ({ row }) => (
      <div className="text-right pr-2 tabular-nums">{row.original.target}</div>
    ),
  },
  {
    accessorKey: "limit",
    header: () => <div className="w-full text-right">Tỉ lệ đúng</div>,
    cell: ({ row }) => (
      <div className="text-right pr-2 tabular-nums">{row.original.limit}%</div>
    ),
  },
  {
    accessorKey: "reviewer",
    header: "Trạng thái",
    cell: ({ row }) => {
      const status = row.original.reviewer;

      // Xác định icon, màu sắc và hiệu ứng dựa trên trạng thái
      let icon = null;
      let bgColor = "";
      let textColor = "";
      let displayText = status;

      switch (status) {
        case "Not Started":
          icon = <CircleIcon className="size-3" />;
          bgColor = "bg-gray-100";
          textColor = "text-gray-700";
          break;
        case "Accepted":
          icon = <CircleCheckIcon className="size-3" />;
          bgColor = "bg-green-100";
          textColor = "text-green-700";
          break;
        case "Wrong Answer":
          icon = <XCircleIcon className="size-3" />;
          bgColor = "bg-red-100";
          textColor = "text-red-700";
          break;
        case "Time Limit Exceeded":
          icon = <TimerIcon className="size-3" />;
          bgColor = "bg-yellow-100";
          textColor = "text-yellow-700";
          displayText = "TLE";
          break;
        default:
          icon = <CircleIcon className="size-3" />;
          bgColor = "bg-gray-100";
          textColor = "text-gray-700";
      }

      return (
        <Badge
          variant="outline"
          className={`flex gap-1 px-2 py-1 ${bgColor} ${textColor} border-0 font-medium rounded-full transition-all duration-200 hover:bg-opacity-80`}
        >
          {icon}
          {displayText}
        </Badge>
      );
    },
  },
];

export function DataTable({
  data: initialData,
}: {
  data: z.infer<typeof schema>[];
}) {
  // Chuyển đổi dữ liệu ban đầu để phù hợp với định dạng mới
  const convertedData = React.useMemo(() => {
    return initialData.map((item) => {
      // Chuyển đổi trường status
      let newStatus = "Medium";
      if (item.status === "easy") newStatus = "Easy";
      else if (item.status === "medium") newStatus = "Medium";
      else if (item.status === "hard") newStatus = "Hard";

      // Chuyển đổi trường reviewer
      let newReviewer = "Not Started";
      if (item.reviewer === "Eddie Lake") newReviewer = "Accepted";
      else if (item.reviewer === "Jamik Tashpulatov")
        newReviewer = "Wrong Answer";
      else if (item.reviewer === "Assign reviewer") newReviewer = "Not Started";
      else if (item.reviewer === "Emily Whalen")
        newReviewer = "Time Limit Exceeded";

      return {
        ...item,
        status: newStatus,
        reviewer: newReviewer,
      };
    });
  }, [initialData]);

  const [data, setData] = React.useState(() => convertedData);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <Tabs
      defaultValue="outline"
      className="flex w-full flex-col justify-start gap-6"
    >
      <div className="flex items-center justify-between px-4 lg:px-6">
        <Label htmlFor="view-selector" className="sr-only">
          View
        </Label>
        <Select defaultValue="outline">
          <SelectTrigger
            className="@4xl/main:hidden flex w-fit"
            id="view-selector"
          >
            <SelectValue placeholder="Select a view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="outline">Outline</SelectItem>
            <SelectItem value="past-performance">Rejected</SelectItem>
            <SelectItem value="key-personnel">Accepted</SelectItem>
            <SelectItem value="focus-documents">Not started</SelectItem>
          </SelectContent>
        </Select>
        <TabsList className="@4xl/main:flex hidden">
          <TabsTrigger value="outline">Outline</TabsTrigger>
          <TabsTrigger value="past-performance" className="gap-1">
            Rejected{" "}
            <Badge
              variant="secondary"
              className="flex h-5 w-5 items-center justify-center rounded-full bg-muted-foreground/30"
            >
              3
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="key-personnel" className="gap-1">
            Accepted{" "}
            <Badge
              variant="secondary"
              className="flex h-5 w-5 items-center justify-center rounded-full bg-muted-foreground/30"
            >
              2
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="focus-documents">Not Started</TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <span className="hidden lg:inline">Columns</span>
                <span className="lg:hidden">Columns</span>
                <ChevronDownIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="relative">
            <Input
              placeholder="Search..."
              className="h-9 w-[150px] lg:w-[250px]"
              onChange={(event) =>
                table.getColumn("header")?.setFilterValue(event.target.value)
              }
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <SearchIcon className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>
      <TabsContent
        value="outline"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-muted">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="hover:bg-sidebar-accent transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between px-4">
          <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger className="w-20" id="rows-per-page">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <ChevronsLeftIcon />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeftIcon />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRightIcon />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <ChevronsRightIcon />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>
      <TabsContent
        value="past-performance"
        className="flex flex-col px-4 lg:px-6"
      >
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
      <TabsContent value="key-personnel" className="flex flex-col px-4 lg:px-6">
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
      <TabsContent
        value="focus-documents"
        className="flex flex-col px-4 lg:px-6"
      >
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
    </Tabs>
  );
}
