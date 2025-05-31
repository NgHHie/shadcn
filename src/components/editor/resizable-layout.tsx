"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { SalesAnalyticsDashboard } from "@/components/editor/sales-analytics-dashboard";
import { SidebarPanel } from "@/components/editor/sidebar-panel";

export function ResizableLayout() {
  const [sidebarWidth, setSidebarWidth] = useState(500); // Initial width in pixels
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const startDragging = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const stopDragging = () => {
    setIsDragging(false);
  };

  const onMouseMove = (e: MouseEvent) => {
    if (isDragging && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = e.clientX - containerRect.left;

      const maxWidth = containerRect.width * 0.8; // 80% width của container
      const minWidth = 200; // width tối thiểu

      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setSidebarWidth(newWidth);
      }
    }
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", stopDragging);
    }

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", stopDragging);
    };
  }, [isDragging]);

  return (
    <div ref={containerRef} className="flex h-screen bg-gray-50">
      <div
        style={{ width: `${sidebarWidth}px`, minWidth: `${sidebarWidth}px` }}
        className="h-full overflow-hidden"
      >
        <SidebarPanel />
      </div>

      {/* Resizable divider */}
      <div
        className={`relative w-2 bg-gray-200 hover:bg-green-500 cursor-col-resize z-10 ${
          isDragging ? "bg-green-600" : ""
        } transition-colors`}
        onMouseDown={startDragging}
      >
        {/* Drag handle indicator */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-0.5 h-8 flex flex-col items-center justify-center space-y-1">
            <div className="w-1 h-1 rounded-full bg-gray-500"></div>
            <div className="w-1 h-1 rounded-full bg-gray-500"></div>
            <div className="w-1 h-1 rounded-full bg-gray-500"></div>
          </div>
        </div>
      </div>

      <div className="flex-1">
        <SalesAnalyticsDashboard />
      </div>
    </div>
  );
}
