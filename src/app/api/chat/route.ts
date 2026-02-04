import { groq } from "@ai-sdk/groq";
import { streamText } from "ai";
import { createClient } from "@/utils/supabase/server";
import { NextRequest } from "next/server";

const DAILY_MESSAGE_LIMIT = 10;

async function checkAndUpdateUsage(supabase: Awaited<ReturnType<typeof createClient>>, userId: string): Promise<{ allowed: boolean; remaining: number }> {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

    // Get or create user usage record
    let { data: usage } = await supabase
        .from("user_usage")
        .select("*")
        .eq("user_id", userId)
        .single();

    if (!usage) {
        // Create new usage record
        const { data: newUsage } = await supabase
            .from("user_usage")
            .insert({
                user_id: userId,
                message_count: 0,
                last_reset_at: today,
            })
            .select()
            .single();
        usage = newUsage;
    }

    if (!usage) {
        return { allowed: false, remaining: 0 };
    }

    // Reset count if it's a new day
    if (usage.last_reset_at !== today) {
        await supabase
            .from("user_usage")
            .update({
                message_count: 0,
                last_reset_at: today,
                updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId);
        usage.message_count = 0;
    }

    const remaining = DAILY_MESSAGE_LIMIT - usage.message_count;

    if (usage.message_count >= DAILY_MESSAGE_LIMIT) {
        return { allowed: false, remaining: 0 };
    }

    // Increment usage count
    await supabase
        .from("user_usage")
        .update({
            message_count: usage.message_count + 1,
            updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

    return { allowed: true, remaining: remaining - 1 };
}

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

        // Check rate limit
        const { allowed, remaining } = await checkAndUpdateUsage(supabase, user.id);
        if (!allowed) {
            return new Response(
                JSON.stringify({
                    error: "Rate limit exceeded",
                    message: "You've reached your daily message limit. Please try again tomorrow.",
                    limit: DAILY_MESSAGE_LIMIT,
                    remaining: 0,
                }),
                {
                    status: 429,
                    headers: { "Content-Type": "application/json" },
                }
            );
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

        // Stream AI response using Groq (llama-3.3-70b-versatile is fast and capable)
        const result = streamText({
            model: groq("llama-3.3-70b-versatile"),
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

        // Add remaining count to response headers
        const response = result.toTextStreamResponse();
        response.headers.set("X-RateLimit-Remaining", remaining.toString());
        response.headers.set("X-RateLimit-Limit", DAILY_MESSAGE_LIMIT.toString());

        return response;
    } catch (error) {
        console.error("Chat API error:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return new Response(`Error: ${errorMessage}`, { status: 500 });
    }
}
