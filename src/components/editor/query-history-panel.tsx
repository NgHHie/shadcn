import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { QueryHistoryItem } from "@/types/sales";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface QueryHistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  queryHistory: QueryHistoryItem[];
  onSelectQuery?: (query: QueryHistoryItem) => void;
}

export function QueryHistoryPanel({
  isOpen,
  onClose,
  queryHistory,
  onSelectQuery,
}: QueryHistoryPanelProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState<QueryHistoryItem | null>(
    null
  );

  const handleQueryClick = (query: QueryHistoryItem) => {
    setSelectedQuery(query);
    setDialogOpen(true);
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full w-100 bg-background border-l shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="font-medium text-sm">Query History</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground mb-2 px-2">
          <div className="col-span-3">Time</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Duration</div>
          <div className="col-span-2">Result</div>
          <div className="col-span-3">DB Type</div>
        </div>

        <div className="space-y-2">
          {queryHistory.map((query) => (
            <div
              key={query.id}
              className="grid grid-cols-12 gap-2 p-2 text-sm border rounded-lg hover:bg-muted/50 cursor-pointer"
              onClick={() => handleQueryClick(query)}
            >
              <div className="col-span-3 text-xs">{query.time}</div>
              <div className="col-span-2">
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    query.status === "AC"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {query.status}
                </span>
              </div>
              <div className="col-span-2 text-xs">{query.duration}</div>
              <div className="col-span-2 text-xs">{query.result}</div>
              <div className="col-span-3 text-xs">{query.dbType}</div>
            </div>
          ))}
        </div>
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>SQL Query - {selectedQuery?.time}</DialogTitle>
          </DialogHeader>
          <div className="bg-gray-50 p-4 rounded-md overflow-auto max-h-96">
            <pre className="text-sm font-mono whitespace-pre-wrap">
              <code>{selectedQuery?.sqlCode}</code>
            </pre>
          </div>
          <DialogFooter>
            <div className="flex justify-between w-full">
              <div className="text-sm text-gray-500">
                Status:{" "}
                <span
                  className={
                    selectedQuery?.status === "AC"
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {selectedQuery?.status}
                </span>{" "}
                | Duration: {selectedQuery?.duration}
              </div>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Close
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
