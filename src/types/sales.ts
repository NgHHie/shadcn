export interface SalesDataItem {
  opp_created_date: string;
  opp_created_week: string;
  opp_created_dow: number;
  opp_owner: string;
  stage_name: string;
  opp_amount: number;
  opp_count: number;
}

export interface QueryHistoryItem {
  id: number;
  time: string;
  status: string;
  duration: string;
  result: string;
  dbType: string;
  sqlCode: string;
}
