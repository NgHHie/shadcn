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
  ClockIcon,
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { toastSuccess, toastInfo, toastError } from "@/lib/toast";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export const schema = z.object({
  id: z.number(),
  question: z.string(),
  code: z.string(),
  time: z.string(),
  status: z.string(),
  duration: z.string(),
  result: z.string(),
  type: z.string(),
});

type SchemaType = z.infer<typeof schema>;

export function HistoryTable({ data }: { data: SchemaType[] }) {
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

  // Dialog state
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedSubmission, setSelectedSubmission] =
    React.useState<SchemaType | null>(null);

  const handleRowClick = (submission: SchemaType) => {
    setSelectedSubmission(submission);
    setDialogOpen(true);
    toastInfo(`Xem chi tiết submission: ${submission.question}`, {
      description: `Kết quả: ${submission.result} - ${submission.status}`,
    });
  };
  const handleViewSolution = () => {
    toastSuccess("Mở solution", {
      description: "Xem lời giải chi tiết cho bài tập này",
      action: {
        label: "Bookmark",
        onClick: () => toastSuccess("Đã lưu solution vào bookmark"),
      },
    });
  };

  const handleResubmit = (submission: SchemaType) => {
    toastInfo("Chuẩn bị submit lại", {
      description: `Tải lại code cho bài: ${submission.question}`,
      action: {
        label: "Đi đến editor",
        onClick: () => {
          // Navigate to editor
          toastSuccess("Đã tải code vào editor");
        },
      },
    });
  };

  const columns: ColumnDef<SchemaType>[] = [
    {
      accessorKey: "question",
      header: "Câu hỏi",
      cell: ({ row }) => (
        <div className="text-left pr-2 font-medium tabular-nums">
          {row.original.question}
        </div>
      ),
      enableHiding: false,
    },
    {
      accessorKey: "code",
      header: "Mã câu hỏi",
      cell: ({ row }) => (
        <div className="w-24">
          <Badge variant="outline" className="px-1.5 text-muted-foreground">
            {row.original.code}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "time",
      header: "Thời gian",
      cell: ({ row }) => {
        return (
          <div className="text-left text-sm text-muted-foreground">
            {row.original.time}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => {
        const status = row.original.status;
        let icon = null;
        let bgColor = "bg-red-100 dark:bg-red-900/20";
        let textColor = "text-red-700 dark:text-red-400";
        let displayText = status;

        switch (status) {
          case "AC":
            icon = <CircleCheckIcon className="size-3" />;
            bgColor = "bg-green-100 dark:bg-green-900/20";
            textColor = "text-green-700 dark:text-green-400";
            displayText = "Accepted";
            break;
          case "WA":
            icon = <XCircleIcon className="size-3" />;
            displayText = "Wrong Answer";
            break;
          case "TLE":
            icon = <TimerIcon className="size-3" />;
            displayText = "Time Limit Exceeded";
            break;
          case "RE":
            icon = <AlertTriangleIcon className="size-3" />;
            displayText = "Runtime Error";
            break;
          default:
            icon = <CircleIcon className="size-3" />;
            bgColor = "bg-gray-100 dark:bg-gray-900/20";
            textColor = "text-gray-700 dark:text-gray-400";
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
    {
      accessorKey: "duration",
      header: () => <div className="w-full text-right">Thực thi</div>,
      cell: ({ row }) => (
        <div className="text-right tabular-nums">{row.original.duration}</div>
      ),
    },
    {
      accessorKey: "result",
      header: "Kết quả",
      cell: ({ row }) => {
        const result = row.original.result;
        const [passed, total] = result.split("/").map(Number);

        let bgColor = "";
        let textColor = "";

        if (passed === total) {
          bgColor = "bg-green-100 dark:bg-green-900/20";
          textColor = "text-green-700 dark:text-green-400";
        } else {
          bgColor = "bg-red-100 dark:bg-red-900/20";
          textColor = "text-red-700 dark:text-red-400";
        }

        return (
          <Badge
            variant="outline"
            className={`px-2 py-1 ${bgColor} ${textColor} border-0 font-medium rounded-full transition-all duration-200 hover:bg-opacity-80`}
          >
            {result}
          </Badge>
        );
      },
    },
    {
      accessorKey: "type",
      header: () => <div className="w-full text-right">Database</div>,
      cell: ({ row }) => (
        <div className="text-right pr-2 tabular-nums">{row.original.type}</div>
      ),
    },
  ];

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

  // Calculate statistics
  const stats = React.useMemo(() => {
    const accepted = data.filter((item) => item.status === "AC").length;
    const total = data.length;
    const wrongAnswer = data.filter((item) => item.status === "WA").length;
    const timeLimit = data.filter((item) => item.status === "TLE").length;
    const runtimeError = data.filter((item) => item.status === "RE").length;

    return { accepted, wrongAnswer, timeLimit, runtimeError, total };
  }, [data]);

  return (
    <>
      <Tabs
        defaultValue="all"
        className="flex w-full flex-col justify-start gap-6"
      >
        <div className="flex items-center justify-between px-4 lg:px-6">
          <Label htmlFor="view-selector" className="sr-only">
            View
          </Label>
          <Select defaultValue="all">
            <SelectTrigger
              className="@4xl/main:hidden flex w-fit"
              id="view-selector"
            >
              <SelectValue placeholder="Select a view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="wrong-answer">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <TabsList className="@4xl/main:flex hidden">
            <TabsTrigger value="all">Tất cả</TabsTrigger>
            <TabsTrigger value="accepted" className="gap-1">
              Accepted{" "}
              <Badge
                variant="secondary"
                className="flex h-5 w-5 items-center justify-center rounded-full bg-muted-foreground/30"
              >
                {stats.accepted}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="wrong-answer" className="gap-1">
              Rejected{" "}
              <Badge
                variant="secondary"
                className="flex h-5 w-5 items-center justify-center rounded-full bg-muted-foreground/30"
              >
                {stats.wrongAnswer}
              </Badge>
            </TabsTrigger>
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
                  table
                    .getColumn("question")
                    ?.setFilterValue(event.target.value)
                }
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <SearchIcon className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>
        <TabsContent
          value="all"
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
                      className="hover:bg-sidebar-accent transition-colors cursor-pointer"
                      onClick={() => handleRowClick(row.original)}
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
          value="accepted"
          className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
        >
          <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
        </TabsContent>
        <TabsContent
          value="wrong-answer"
          className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
        >
          <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
        </TabsContent>
        <TabsContent
          value="time-limit"
          className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
        >
          <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
        </TabsContent>
      </Tabs>

      {/* Submission Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-4xl bg-background border-border max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <span>{selectedSubmission?.question}</span>
              <Badge variant="outline" className="text-xs">
                {selectedSubmission?.code}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-auto space-y-4">
            {/* Submission Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg border">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Trạng thái</p>
                <div className="flex items-center gap-2">
                  {selectedSubmission?.status === "AC" && (
                    <CircleCheckIcon className="size-4 text-green-600" />
                  )}
                  {selectedSubmission?.status === "WA" && (
                    <XCircleIcon className="size-4 text-red-600" />
                  )}
                  {selectedSubmission?.status === "TLE" && (
                    <TimerIcon className="size-4 text-yellow-600" />
                  )}
                  {selectedSubmission?.status === "RE" && (
                    <AlertTriangleIcon className="size-4 text-red-600" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      selectedSubmission?.status === "AC"
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {selectedSubmission?.status === "AC" && "Accepted"}
                    {selectedSubmission?.status === "WA" && "Wrong Answer"}
                    {selectedSubmission?.status === "TLE" &&
                      "Time Limit Exceeded"}
                    {selectedSubmission?.status === "RE" && "Runtime Error"}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Thời gian</p>
                <p className="text-sm font-medium">
                  {selectedSubmission?.time}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Thực thi</p>
                <p className="text-sm font-medium">
                  {selectedSubmission?.duration}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Kết quả</p>
                <p className="text-sm font-medium">
                  {selectedSubmission?.result}
                </p>
              </div>
            </div>

            {/* Database Type */}
            <div className="p-4 bg-muted/50 rounded-lg border">
              <p className="text-xs text-muted-foreground mb-1">Database</p>
              <Badge variant="secondary" className="text-sm">
                {selectedSubmission?.type}
              </Badge>
            </div>

            {/* SQL Code */}
            <div className="space-y-2">
              <p className="text-sm font-medium">SQL Code</p>
              <div className="bg-muted p-4 rounded-md overflow-auto max-h-96 border border-border">
                <pre className="text-sm font-mono whitespace-pre-wrap text-foreground">
                  <code>
                    {/* Placeholder SQL code - you can add actual code property to your schema */}
                    {`-- SQL Query for ${selectedSubmission?.question}
-- Code: ${selectedSubmission?.code}
-- Database: ${selectedSubmission?.type}

SELECT * 
FROM example_table 
WHERE condition = 'value'
ORDER BY column_name;`}
                  </code>
                </pre>
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Submitted: {selectedSubmission?.time} | Database:{" "}
              {selectedSubmission?.type}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setDialogOpen(false);
                  toastInfo("Đã đóng chi tiết submission");
                }}
              >
                Đóng
              </Button>
              {selectedSubmission?.status !== "AC" && (
                <Button
                  variant="default"
                  onClick={() => {
                    setDialogOpen(false);
                    handleResubmit(selectedSubmission!);
                  }}
                >
                  Submit lại
                </Button>
              )}
              <Button
                variant="default"
                onClick={() => {
                  setDialogOpen(false);
                  handleViewSolution();
                }}
              >
                View Solution
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
