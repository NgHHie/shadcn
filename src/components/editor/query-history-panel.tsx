// src/components/editor/query-history-panel.tsx
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { QueryHistoryItem } from "@/types/sales";
import { useEffect, useRef, useState } from "react";
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
}: QueryHistoryPanelProps) {
  const { t } = useTranslation("editor");
  const panelRef = useRef<HTMLDivElement>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState<QueryHistoryItem | null>(
    null
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    // Chỉ thêm event listener khi panel đang mở
    if (isOpen && !dialogOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Cleanup function
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, dialogOpen, onClose]);

  const handleQueryClick = (query: QueryHistoryItem) => {
    setSelectedQuery(query);
    setDialogOpen(true);
  };

  return (
    <div
      ref={panelRef}
      className={`fixed top-0 right-0 h-full w-100 bg-background border-l border-border shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex items-center justify-between p-2 pl-4 border-b border-border bg-background">
        <h3 className="font-medium text-sm text-foreground">
          {t("queryHistory.title")}
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-4 bg-background">
        <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground mb-2 px-2">
          <div className="col-span-3">{t("queryHistory.headers.time")}</div>
          <div className="col-span-2 text-center">
            {t("queryHistory.headers.status")}
          </div>
          <div className="col-span-2 text-center">
            {t("queryHistory.headers.duration")}
          </div>
          <div className="col-span-2 text-center">
            {t("queryHistory.headers.result")}
          </div>
          <div className="col-span-3">{t("queryHistory.headers.dbType")}</div>
        </div>

        <div className="space-y-2">
          {queryHistory.map((query, index) => (
            <div
              key={query.id}
              className={`grid grid-cols-12 gap-2 p-2 text-sm border rounded-lg cursor-pointer transition-all duration-200 ${
                index === 0
                  ? "border-primary bg-primary/5 hover:bg-primary/10 shadow-sm ring-1 ring-primary/20"
                  : "border-border hover:bg-muted/50"
              }`}
              onClick={() => handleQueryClick(query)}
            >
              <div
                className={`col-span-3 text-xs ${
                  index === 0 ? "text-primary font-medium" : "text-foreground"
                }`}
              >
                {query.time}
              </div>
              <div className="col-span-2 flex justify-center">
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    query.status === "AC"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : query.status === "PENDING"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 animate-pulse"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  }`}
                >
                  {query.status === "PENDING" ? "PENDING..." : query.status}
                </span>
              </div>
              <div
                className={`col-span-2 text-xs text-center ${
                  index === 0 ? "text-primary font-medium" : "text-foreground"
                }`}
              >
                {query.duration}
              </div>
              <div
                className={`col-span-2 text-xs text-center ${
                  index === 0 ? "text-primary font-medium" : "text-foreground"
                }`}
              >
                {query.result}
              </div>
              <div
                className={`col-span-3 text-xs ${
                  index === 0 ? "text-primary font-medium" : "text-foreground"
                }`}
              >
                {query.dbType}
              </div>
            </div>
          ))}
        </div>
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl bg-background border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              SQL Query - {selectedQuery?.time}
            </DialogTitle>
          </DialogHeader>
          <div className="bg-muted p-4 rounded-md overflow-auto max-h-96 border border-border">
            <pre className="text-sm font-mono whitespace-pre-wrap text-foreground">
              <code>{selectedQuery?.sqlCode}</code>
            </pre>
          </div>
          <DialogFooter>
            <div className="flex justify-between w-full">
              <div className="text-sm text-muted-foreground">
                Status:{" "}
                <span
                  className={
                    selectedQuery?.status === "AC"
                      ? "text-green-600 dark:text-green-400"
                      : selectedQuery?.status === "PENDING"
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-red-600 dark:text-red-400"
                  }
                >
                  {selectedQuery?.status === "PENDING"
                    ? "PENDING..."
                    : selectedQuery?.status}
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
