// src/components/contest-editor/contest-controls.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Play, Upload, Send, Loader2, Database } from "lucide-react";
import { QuestionDetail } from "@/lib/api";

interface ContestControlsProps {
  selectedDatabase: string;
  setSelectedDatabase: (value: string) => void;
  availableDatabases: Array<{ id: string; name: string }>;
  handleUploadClick: () => void;
  isUploading: boolean;
  question?: QuestionDetail | null;
  runQuery: () => void;
  isRunning: boolean;
  submitSolution: () => void;
  isSubmitting: boolean;
}

export function ContestControls({
  selectedDatabase,
  setSelectedDatabase,
  availableDatabases,
  handleUploadClick,
  isUploading,
  question,
  runQuery,
  isRunning,
  submitSolution,
  isSubmitting,
}: ContestControlsProps) {
  return (
    <div className="flex-shrink-0 border-b p-3">
      <div className="flex items-center gap-3">
        {/* Database Selection */}
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4" />
          <Select value={selectedDatabase} onValueChange={setSelectedDatabase}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Chọn DB" />
            </SelectTrigger>
            <SelectContent>
              {availableDatabases.map((db) => (
                <SelectItem key={db.id} value={db.name}>
                  {db.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 ml-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleUploadClick}
            disabled={isUploading || !question}
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            Upload
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={runQuery}
            disabled={isRunning || !question}
          >
            {isRunning ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            Run
          </Button>

          <Button
            size="sm"
            onClick={submitSolution}
            disabled={isSubmitting || !question}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
}
