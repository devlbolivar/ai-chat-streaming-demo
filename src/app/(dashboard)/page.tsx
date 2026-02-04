import { createClient } from "@/utils/supabase/server";
import { ChatInterface } from "@/components/dashboard/ChatInterface";
import { redirect } from "next/navigation";
import type { Message } from "@/types";

interface PageProps {
    searchParams: Promise<{ chat?: string; new?: string }>;
}

export default async function DashboardPage({ searchParams }: PageProps) {
    const supabase = await createClient();
    const { chat: requestedChatId, new: createNew } = await searchParams;

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    let chatId: string;

    // If creating a new chat
    if (createNew === "true") {
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
        // Redirect to the new chat (removes ?new=true from URL)
        redirect(`/?chat=${newChat.id}`);
    }

    // If a specific chat is requested, verify it exists and belongs to the user
    if (requestedChatId) {
        const { data: chat } = await supabase
            .from("chats")
            .select("id")
            .eq("id", requestedChatId)
            .eq("user_id", user.id)
            .single();

        if (chat) {
            chatId = chat.id;
        } else {
            // Chat not found or doesn't belong to user, redirect to default
            redirect("/");
        }
    } else {
        // Get or create the most recent chat
        const { data: chats } = await supabase
            .from("chats")
            .select("id")
            .eq("user_id", user.id)
            .order("updated_at", { ascending: false })
            .limit(1);

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
    }

    // Fetch messages for this chat
    const { data: messages } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });

    return (
        <ChatInterface
            key={chatId}
            initialMessages={(messages as Message[]) || []}
            chatId={chatId}
        />
    );
}
