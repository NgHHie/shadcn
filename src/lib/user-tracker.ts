// src/lib/user-tracker.ts

export interface TrackerData {
  actionType:
    | "EXTERNAL_LINK_CLICK"
    | "TAB_SWITCH"
    | "TAB_RETURN"
    | "COPY"
    | "PASTE";
  detail: string;
  contestId: string;
}

export const sendLogTracker = async (payload: TrackerData) => {
  try {
    const response = await fetch(
      "https://api.learnsql.store/api/app/tracker/push",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage
            .getItem("access_token")
            ?.replace(/"/g, "")}`,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to send tracker log:", error);
    throw error;
  }
};

export const checkContestTracker = async (
  contestId: string
): Promise<boolean> => {
  try {
    const response = await fetch(
      `https://api.learnsql.store/api/app/contest/${contestId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage
            .getItem("access_token")
            ?.replace(/"/g, "")}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.isTracker || false;
  } catch (error) {
    console.error("Failed to check contest tracker:", error);
    return false;
  }
};
