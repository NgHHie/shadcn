import { Leaderboard } from "@/components/rank/leader-dashboard";
import data from "./data.json";

export function RankPage() {
  return <Leaderboard data={data} />;
}
