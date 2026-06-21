import { getDashboardData } from "@/lib/data";
import Dashboard from "./components/Dashboard";

// Always read fresh — never cache PII/aggregates.
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export default async function Page() {
  const data = await getDashboardData();
  return <Dashboard data={data} />;
}
