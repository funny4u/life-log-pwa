import { getLogs, getCategories } from "@/app/actions";
import { StatsClient } from "@/components/features/StatsClient";

export const dynamic = 'force-dynamic';

export default async function StatsPage() {
    const [logs, categories] = await Promise.all([
        getLogs(),
        getCategories()
    ]);

    return <StatsClient logs={logs} categories={categories} />;
}
