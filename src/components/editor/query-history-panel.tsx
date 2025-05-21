import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

// Define the query history item type
export interface QueryHistoryItem {
  id: number;
  time: string;
  status: string;
  duration: string;
  result: string;
  dbType: string;
}

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
  return (
    <div
      className={`fixed top-0 right-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-medium">Query History</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 mb-2 px-2">
          <div className="col-span-4">Time</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Duration</div>
          <div className="col-span-2">Result</div>
          <div className="col-span-2">DB Type</div>
        </div>

        <div className="space-y-2">
          {queryHistory.map((query) => (
            <div
              key={query.id}
              className="grid grid-cols-12 gap-2 p-2 text-sm border rounded-md hover:bg-gray-50 cursor-pointer"
              onClick={() => onSelectQuery && onSelectQuery(query)}
            >
              <div className="col-span-4 text-xs">{query.time}</div>
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
              <div className="col-span-2 text-xs">{query.dbType}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
