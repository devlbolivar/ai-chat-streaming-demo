import { createClient } from "@/utils/supabase/server";
import { Header } from "@/components/dashboard/Header";
import { Sidebar } from "@/components/dashboard/Sidebar";
import type { Chat } from "@/types";

export default async function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Fetch user's chats for the sidebar
    const { data: chats } = await supabase
        .from("chats")
        .select("*")
        .eq("user_id", user?.id || "")
        .order("updated_at", { ascending: false });

    return (
        <div className="flex h-screen bg-background-light dark:bg-background-dark overflow-hidden">
            <Sidebar user={user} chats={(chats as Chat[]) || []} />
            <main className="flex-1 flex flex-col h-full min-w-0 bg-background-dark relative">
                <Header />
                {children}
            </main>
        </div>
    );
}
