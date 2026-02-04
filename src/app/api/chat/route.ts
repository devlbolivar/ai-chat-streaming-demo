import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { createClient } from "@/utils/supabase/server";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Check authentication
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return new Response("Unauthorized", { status: 401 });
        }

        const { chatId, message } = await request.json();

        if (!chatId || !message) {
            return new Response("Missing chatId or message", { status: 400 });
        }

        // Verify user owns this chat
        const { data: chat, error: chatError } = await supabase
            .from("chats")
            .select("id")
            .eq("id", chatId)
            .eq("user_id", user.id)
            .single();

        if (chatError || !chat) {
            return new Response("Chat not found", { status: 404 });
        }

        // Save user message to database
        await supabase.from("messages").insert({
            chat_id: chatId,
            role: "user",
            content: message,
        });

        // Get conversation history for context
        const { data: history } = await supabase
            .from("messages")
            .select("role, content")
            .eq("chat_id", chatId)
            .order("created_at", { ascending: true })
            .limit(20);

        const messages = (history || []).map((msg) => ({
            role: msg.role as "user" | "assistant" | "system",
            content: msg.content,
        }));

        // Stream AI response
        const result = streamText({
            model: google("gemini-2.0-flash"),
            messages,
            onFinish: async ({ text }) => {
                // Save assistant response to database
                await supabase.from("messages").insert({
                    chat_id: chatId,
                    role: "assistant",
                    content: text,
                });

                // Update chat title if it's the first message
                const { data: chatData } = await supabase
                    .from("chats")
                    .select("title")
                    .eq("id", chatId)
                    .single();

                if (!chatData?.title) {
                    // Generate a title from the first message
                    const title =
                        message.length > 50
                            ? message.substring(0, 50) + "..."
                            : message;
                    await supabase
                        .from("chats")
                        .update({ title, updated_at: new Date().toISOString() })
                        .eq("id", chatId);
                }
            },
        });

        return result.toTextStreamResponse();
    } catch (error) {
        console.error("Chat API error:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return new Response(`Error: ${errorMessage}`, { status: 500 });
    }
}
