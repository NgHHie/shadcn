// src/hooks/use-user-action-tracker.ts (Updated để sử dụng API có sẵn)
import { useEffect, useCallback } from "react";
import { contestApi, TrackerData } from "@/lib/apiContest";

interface UseUserActionTrackerProps {
  contestId: string;
  enabled: boolean;
}

export const useUserActionTracker = ({
  contestId,
  enabled,
}: UseUserActionTrackerProps) => {
  const sendLog = useCallback(
    (data: Omit<TrackerData, "contestId">) => {
      if (!enabled || !contestId) return;

      const payload: TrackerData = {
        ...data,
        contestId,
      };

      // Sử dụng API có sẵn từ apiContest.ts
      contestApi
        .sendLogTracker(payload)
        .then(() => {
          console.log("Tracker log sent successfully:", payload);
        })
        .catch((error) => {
          console.error("Failed to send tracker log:", error);
        });
    },
    [contestId, enabled]
  );

  const handlePasteFallback = useCallback(async (): Promise<string> => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      return clipboardText;
    } catch (error) {
      return "không thể lấy nội dung paste";
    }
  }, []);

  useEffect(() => {
    if (!enabled || !contestId) return;

    // External Link Click Tracker
    const handleClick = (event: Event) => {
      const target = (event.target as Element)?.closest(
        "a"
      ) as HTMLAnchorElement;
      if (target && !target.href.includes(window.location.origin)) {
        sendLog({
          actionType: "EXTERNAL_LINK_CLICK",
          detail: `Click vào url: ${target.href}`,
        });
      }
    };

    // Tab Switch Tracker
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        sendLog({
          actionType: "TAB_SWITCH",
          detail: `Mở hoặc chuyển sang tab khác`,
        });
      } else if (document.visibilityState === "visible") {
        sendLog({
          actionType: "TAB_RETURN",
          detail: `Quay trở lại tab làm bài`,
        });
      }
    };

    // Copy/Paste Tracker
    const handleKeyCombination = async (event: KeyboardEvent) => {
      // Check for Ctrl+C (Copy)
      if (event.ctrlKey && event.key === "c") {
        const selectedText = window.getSelection()?.toString() || "";
        sendLog({
          actionType: "COPY",
          detail: `Người dùng sao chép: "${selectedText}"`,
        });
      }

      // Check for Ctrl+V (Paste)
      if (event.ctrlKey && event.key === "v") {
        const message = await handlePasteFallback();
        sendLog({
          actionType: "PASTE",
          detail: `Người dùng dán: "${message}"`,
        });
      }
    };

    // Add event listeners
    document.addEventListener("click", handleClick);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("keydown", handleKeyCombination);

    // Cleanup
    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("keydown", handleKeyCombination);
    };
  }, [enabled, contestId, sendLog, handlePasteFallback]);

  return {
    sendLog,
    enabled,
  };
};
