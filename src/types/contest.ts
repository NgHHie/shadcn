// src/types/contest.ts
export interface Contest {
  id: string;
  createdAt: string;
  createdBy: string;
  lastModifiedAt: string;
  contestCode: string;
  name: string;
  description?: string;
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

export interface ContestListResponse {
  content: Contest[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

export interface ContestJoinStatus {
  contestId: string;
  joined: 0 | 1; // 0 = not joined, 1 = joined
}

export interface CheckJoinRequest {
  contestIds: string[];
  userId: string;
}

export interface JoinContestRequest {
  contest: {
    id: string;
  };
  user: {
    id: string;
  };
}
