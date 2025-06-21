// src/types/contest-waiting.ts
export interface ContestWaitingData {
  id: string;
  createdAt: string;
  createdBy: string;
  lastModifiedAt: string;
  contestCode: string;
  name: string;
  description: string;
  startDatetime: string;
  endDatetime: string;
  isPublic: boolean;
  mode: "EXAM" | "PRACTICE";
  status: "OPEN" | "CLOSED" | "SCHEDULED";
  numberUser: number;
  numberQuestion: number;
  duration: number; // minutes
  userCreated: {
    id: string;
    avatar: string;
    userCode: string;
    firstName: string;
    lastName: string;
  };
}
