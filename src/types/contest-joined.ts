// src/types/contest-joined.ts
// Types riêng cho contest joined page, không ảnh hưởng types cũ

export interface ContestJoinedDetail {
  id: string;
  createdAt: string;
  createdBy: string;
  lastModifiedAt: string;
  contestCode: string;
  name: string;
  startDatetime: string;
  endDatetime: string;
  mode: "PRACTICE" | "EXAM";
  status: "OPEN" | "CLOSED" | "SCHEDULED";
  isTracker: boolean;
  questions: ContestJoinedQuestion[];
}

export interface ContestJoinedQuestion {
  id: string;
  createdAt: string;
  createdBy: string;
  lastModifiedAt: string;
  question: {
    id: string;
    createdAt: string;
    createdBy: string;
    lastModifiedAt: string;
    questionCode: string;
    title: string;
    point: number;
    type:
      | "SELECT"
      | "INSERT"
      | "UPDATE"
      | "DELETE"
      | "CREATE"
      | "PROCEDURE"
      | "INDEX";
    enable: boolean;
    isSynchorus: boolean;
    totalSub: number;
    acceptance: number;
    level: "EASY" | "MEDIUM" | "HARD";
    prefixCode: string;
    isShare: boolean;
    questionDetails: Array<{
      id: string;
      lastModifiedAt: string;
      typeDatabase: {
        id: string;
        name: string;
      };
    }>;
  };
  point: number;
}

export interface ContestQuestionStatus {
  status: "AC" | "WA" | "PENDING";
  questionId: string;
  completed: "done" | "pending";
}

export interface CheckQuestionStatusRequest {
  questionIds: string[];
  userId: string;
}
