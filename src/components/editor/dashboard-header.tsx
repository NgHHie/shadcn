// src/components/editor/dashboard-header.tsx
"use client";

import { Button } from "@/components/ui/button";
import { History, Upload, Terminal, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QuestionDetail } from "@/lib/api";
import { toastError, toastWarning } from "@/lib/toast";

interface DashboardHeaderProps {
  isMobile: boolean;
  selectedDatabase: string;
  setSelectedDatabase: (value: string) => void;
  availableDatabases: Array<{ id: string; name: string }>;
  question: QuestionDetail | null | undefined;
  isUploading: boolean;
  handleUploadClick: () => void;
  isHistoryOpen: boolean;
  setIsHistoryOpen: (value: boolean) => void;
}

export function DashboardHeader({
  isMobile,
  selectedDatabase,
  setSelectedDatabase,
  availableDatabases,
  question,
  isUploading,
  handleUploadClick,
  isHistoryOpen,
  setIsHistoryOpen,
}: DashboardHeaderProps) {
  return (
    <div
      className={`flex items-center gap-2 border-b p-2 bg-muted/30 flex-shrink-0 ${
        isMobile ? "flex-wrap" : "overflow-x-auto"
      }`}
    >
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 rounded-full bg-primary/10 text-primary flex-shrink-0 border-primary/20"
        >
          <Terminal className="h-4 w-4" />
        </Button>
        <span
          className={`font-medium whitespace-nowrap text-foreground ${
            isMobile ? "text-xs" : "text-sm"
          }`}
        >
          SQL Editor
        </span>
      </div>

      <div
        className={`flex items-center gap-2 ${
          isMobile ? "flex-wrap w-full mt-2" : "ml-4"
        }`}
      >
        <Select value={selectedDatabase} onValueChange={setSelectedDatabase}>
          <SelectTrigger
            className={`gap-1 whitespace-nowrap flex-shrink-0 ${
              isMobile ? "text-xs h-7 w-[140px]" : "w-[160px]"
            }`}
          >
            <SelectValue placeholder="Chọn database" />
          </SelectTrigger>
          <SelectContent>
            {availableDatabases.length > 0 ? (
              availableDatabases.map((db) => (
                <SelectItem key={db.id} value={db.name}>
                  {db.name}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="default" disabled>
                Chưa có database
              </SelectItem>
            )}
          </SelectContent>
        </Select>

        <Button
          variant="ghost"
          size="sm"
          className={`gap-1 ${isMobile ? "text-xs h-7" : ""}`}
          onClick={handleUploadClick}
          disabled={isUploading || !question || !selectedDatabase}
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          <span
            className={`${isMobile ? "text-xs" : "text-sm"} ${
              isMobile ? "" : "hidden sm:inline"
            }`}
          >
            {isUploading ? "Uploading..." : isMobile ? "Upload" : "Upload file"}
          </span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className={`gap-1 ${isMobile ? "text-xs h-7" : ""}`}
          onClick={() => setIsHistoryOpen(!isHistoryOpen)}
        >
          <History className="h-4 w-4" />
          <span
            className={`${isMobile ? "text-xs" : "text-sm"} ${
              isMobile ? "" : "hidden sm:inline"
            }`}
          >
            History
          </span>
        </Button>
      </div>
    </div>
  );
}
