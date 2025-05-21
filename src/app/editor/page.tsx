import { useState, useRef, useEffect } from "react";
import { SalesAnalyticsDashboard } from "@/components/editor/sales-analytics-dashboard";
import { SidebarPanel } from "@/components/editor/sidebar-panel";

export function Editor() {
  const [sidebarWidth, setSidebarWidth] = useState(320); // Initial width in pixels
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const minSidebarWidth = 240;
  const maxSidebarWidth = 600;

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
      const containerWidth = containerRect.width;
      const newWidth = e.clientX - containerRect.left;

      // Ensure we always have at least 30% of container width for right component
      const rightComponentMinWidth = Math.max(300, containerWidth * 0.3);
      const calculatedMaxWidth = containerWidth - rightComponentMinWidth;

      // Use the smaller of our static max and calculated max
      const effectiveMaxWidth = Math.min(maxSidebarWidth, calculatedMaxWidth);

      // Apply constraints
      if (newWidth >= minSidebarWidth && newWidth <= effectiveMaxWidth) {
        setSidebarWidth(newWidth);
      } else if (newWidth < minSidebarWidth) {
        setSidebarWidth(minSidebarWidth);
      } else if (newWidth > effectiveMaxWidth) {
        setSidebarWidth(effectiveMaxWidth);
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

  // Handle window resize - adjust sidebar width if needed
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth =
          containerRef.current.getBoundingClientRect().width;
        const rightComponentMinWidth = Math.max(300, containerWidth * 0.3);
        const calculatedMaxWidth = containerWidth - rightComponentMinWidth;

        // If current sidebar width is too large after resize, adjust it
        if (sidebarWidth > calculatedMaxWidth) {
          setSidebarWidth(calculatedMaxWidth);
        }
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [sidebarWidth]);

  return (
    <div className="flex flex-col">
      <div
        ref={containerRef}
        className="flex h-[calc(100vh-4rem)] overflow-hidden bg-background rounded-lg border shadow-sm"
      >
        <div
          style={{ width: `${sidebarWidth}px`, minWidth: `${sidebarWidth}px` }}
          className="h-full overflow-hidden border-r"
        >
          <SidebarPanel />
        </div>

        {/* Resizable divider - making it a bit wider for easier grabbing */}
        <div
          className={`relative w-3 bg-muted hover:bg-primary/20 cursor-col-resize z-10 ${
            isDragging ? "bg-primary/30" : ""
          } transition-colors flex-shrink-0`}
          onMouseDown={startDragging}
        >
          {/* Drag handle indicator */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-0.5 h-8 flex flex-col items-center justify-center space-y-1">
              <div className="w-1 h-1 rounded-full bg-muted-foreground"></div>
              <div className="w-1 h-1 rounded-full bg-muted-foreground"></div>
              <div className="w-1 h-1 rounded-full bg-muted-foreground"></div>
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0 overflow-hidden">
          <SalesAnalyticsDashboard />
        </div>
      </div>
    </div>
  );
}
