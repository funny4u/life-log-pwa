import { HomeClient } from "@/components/features/HomeClient";
import { getLogs, getCategories } from "@/app/actions";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [logs, categories] = await Promise.all([
    getLogs(),
    getCategories()
  ]);

  return <HomeClient initialLogs={logs} categories={categories} />;
}
