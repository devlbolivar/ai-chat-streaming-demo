import { createClient } from "@/utils/supabase/server";
import { ChatInterface } from "@/components/dashboard/ChatInterface";
import { redirect } from "next/navigation";
import type { Message } from "@/types";

export default async function DashboardPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Get or create the current chat
    // For now, we'll use the most recent chat or create a new one
    let { data: chats } = await supabase
        .from("chats")
        .select("id")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(1);

    let chatId: string;

    if (!chats || chats.length === 0) {
        // Create a new chat
        const { data: newChat, error } = await supabase
            .from("chats")
            .insert({
                user_id: user.id,
                title: null,
            })
            .select("id")
            .single();

        if (error || !newChat) {
            throw new Error("Failed to create chat");
        }
        chatId = newChat.id;
    } else {
        chatId = chats[0].id;
    }

    // Fetch messages for this chat
    const { data: messages } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });

    return (
        <ChatInterface
            initialMessages={(messages as Message[]) || []}
            chatId={chatId}
        />
    );
}
