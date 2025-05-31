import { useState, useRef, useEffect } from "react";
import { SalesAnalyticsDashboard } from "@/components/editor/sales-analytics-dashboard";
import { SidebarPanel } from "@/components/editor/sidebar-panel";
import { useIsMobile } from "@/hooks/use-mobile";

export function Editor() {
  const isMobile = useIsMobile();
  const [sidebarWidth, setSidebarWidth] = useState(600); // For desktop
  const [sidebarHeight, setSidebarHeight] = useState(300); // For mobile
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Desktop constraints
  const minSidebarWidth = 400;
  const maxSidebarWidth = 1000;

  // Mobile constraints
  const minSidebarHeight = 200;
  const maxSidebarHeight = 600;

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

      if (isMobile) {
        // Mobile: vertical resizing
        const containerHeight = containerRect.height;
        const newHeight = e.clientY - containerRect.top;

        // Ensure we always have at least 30% of container height for bottom component
        const bottomComponentMinHeight = Math.max(200, containerHeight * 0.3);
        const calculatedMaxHeight = containerHeight - bottomComponentMinHeight;

        const effectiveMaxHeight = Math.min(
          maxSidebarHeight,
          calculatedMaxHeight
        );

        if (newHeight >= minSidebarHeight && newHeight <= effectiveMaxHeight) {
          setSidebarHeight(newHeight);
        } else if (newHeight < minSidebarHeight) {
          setSidebarHeight(minSidebarHeight);
        } else if (newHeight > effectiveMaxHeight) {
          setSidebarHeight(effectiveMaxHeight);
        }
      } else {
        // Desktop: horizontal resizing
        const containerWidth = containerRect.width;
        const newWidth = e.clientX - containerRect.left;

        const rightComponentMinWidth = Math.max(300, containerWidth * 0.3);
        const calculatedMaxWidth = containerWidth - rightComponentMinWidth;

        const effectiveMaxWidth = Math.min(maxSidebarWidth, calculatedMaxWidth);

        if (newWidth >= minSidebarWidth && newWidth <= effectiveMaxWidth) {
          setSidebarWidth(newWidth);
        } else if (newWidth < minSidebarWidth) {
          setSidebarWidth(minSidebarWidth);
        } else if (newWidth > effectiveMaxWidth) {
          setSidebarWidth(effectiveMaxWidth);
        }
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
  }, [isDragging, isMobile]);

  // Handle window resize - adjust sidebar dimensions if needed
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();

        if (isMobile) {
          const containerHeight = containerRect.height;
          const bottomComponentMinHeight = Math.max(200, containerHeight * 0.3);
          const calculatedMaxHeight =
            containerHeight - bottomComponentMinHeight;

          if (sidebarHeight > calculatedMaxHeight) {
            setSidebarHeight(calculatedMaxHeight);
          }
        } else {
          const containerWidth = containerRect.width;
          const rightComponentMinWidth = Math.max(300, containerWidth * 0.3);
          const calculatedMaxWidth = containerWidth - rightComponentMinWidth;

          if (sidebarWidth > calculatedMaxWidth) {
            setSidebarWidth(calculatedMaxWidth);
          }
        }
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [sidebarWidth, sidebarHeight, isMobile]);

  if (isMobile) {
    // Mobile layout: vertical (top-bottom) with scrollable content
    return (
      <div className="flex flex-col">
        <div
          ref={containerRef}
          className="flex flex-col min-h-[calc(100vh-4rem)] bg-background rounded-lg border shadow-sm"
        >
          <div
            style={{
              height: `${sidebarHeight}px`,
              minHeight: `${sidebarHeight}px`,
            }}
            className="w-full overflow-hidden border-b"
          >
            <SidebarPanel />
          </div>

          {/* Resizable divider - horizontal for mobile */}
          <div
            className={`relative h-3 w-full bg-muted hover:bg-primary/20 cursor-row-resize z-10 ${
              isDragging ? "bg-primary/30" : ""
            } transition-colors flex-shrink-0`}
            onMouseDown={startDragging}
          >
            {/* Drag handle indicator */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-0.5 w-8 flex items-center justify-center space-x-1">
                <div className="w-1 h-1 rounded-full bg-muted-foreground"></div>
                <div className="w-1 h-1 rounded-full bg-muted-foreground"></div>
                <div className="w-1 h-1 rounded-full bg-muted-foreground"></div>
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-0">
            <SalesAnalyticsDashboard />
          </div>
        </div>
      </div>
    );
  }

  // Desktop layout: horizontal (left-right)
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

        {/* Resizable divider - vertical for desktop */}
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
