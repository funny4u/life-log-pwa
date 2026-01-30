import { getLogs, getCategories } from "@/app/actions";
import { SearchClient } from "@/components/features/SearchClient";

export const dynamic = 'force-dynamic';

export default async function SearchPage() {
    const [logs, categories] = await Promise.all([
        getLogs(),
        getCategories()
    ]);

    return <SearchClient initialLogs={logs} initialCategories={categories} />;
}
