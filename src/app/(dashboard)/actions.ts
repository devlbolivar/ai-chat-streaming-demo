"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function createNewChat() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

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

    revalidatePath("/", "layout");
    redirect("/");
}

export async function deleteChat(chatId: string) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Delete the chat (messages will cascade delete due to foreign key)
    await supabase.from("chats").delete().eq("id", chatId).eq("user_id", user.id);

    revalidatePath("/", "layout");
    redirect("/");
}
