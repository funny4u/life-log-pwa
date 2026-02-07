import { NotificationManager } from "@/components/features/NotificationManager";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // This layout is guaranteed to have NO navigation bar
    return (
        <div className="flex flex-col h-[100dvh] w-full bg-background relative overflow-hidden">
            <NotificationManager />
            <main className="flex-1 w-full min-h-0 overflow-y-auto overflow-x-hidden scroll-smooth overscroll-contain">
                {children}
            </main>
        </div>
    );
}
