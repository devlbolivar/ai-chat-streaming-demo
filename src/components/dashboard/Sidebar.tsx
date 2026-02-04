"use client";

import { User } from "@supabase/supabase-js";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import type { Chat } from "@/types";
import { logout } from "@/app/login/actions";

interface SidebarProps {
    user: User | null;
    chats: Chat[];
}

export function Sidebar({ user, chats }: SidebarProps) {
    const searchParams = useSearchParams();
    const currentChatId = searchParams.get("chat");

    // If no chat in URL, the first chat is considered active (most recent)
    const activeChatId = currentChatId || (chats.length > 0 ? chats[0].id : null);

    // Group chats by date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayChats = chats.filter((chat) => {
        const chatDate = new Date(chat.updated_at);
        return chatDate >= today;
    });

    const yesterdayChats = chats.filter((chat) => {
        const chatDate = new Date(chat.updated_at);
        return chatDate >= yesterday && chatDate < today;
    });

    const olderChats = chats.filter((chat) => {
        const chatDate = new Date(chat.updated_at);
        return chatDate < yesterday;
    });

    return (
        <aside className="w-[300px] flex-shrink-0 flex flex-col border-r border-border-color bg-surface-dark h-full relative z-20">
            {/* Logo Header */}
            <div className="p-5 pb-2">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-primary/10 rounded-xl p-2 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-2xl">
                            smart_toy
                        </span>
                    </div>
                    <h1 className="text-white text-lg font-bold tracking-tight">
                        AI Chat Stream
                    </h1>
                </div>
                {/* New Chat Button */}
                <Link
                    href="/?new=true"
                    className="cursor-pointer w-full flex items-center justify-center gap-2 rounded-xl h-11 bg-primary hover:bg-cyan-400 text-background-dark text-sm font-bold shadow-neon transition-all hover:shadow-[0_0_15px_rgba(13,204,242,0.3)]"
                >
                    <span className="material-symbols-outlined text-[20px]">
                        add
                    </span>
                    <span>New Chat</span>
                </Link>
            </div>

            {/* Scrollable History */}
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
                {/* Today Section */}
                {todayChats.length > 0 && (
                    <div className="flex flex-col gap-2">
                        <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Today
                        </h3>
                        {todayChats.map((chat) => (
                            <ChatItem
                                key={chat.id}
                                chat={chat}
                                isActive={chat.id === activeChatId}
                            />
                        ))}
                    </div>
                )}

                {/* Yesterday Section */}
                {yesterdayChats.length > 0 && (
                    <div className="flex flex-col gap-2">
                        <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Yesterday
                        </h3>
                        {yesterdayChats.map((chat) => (
                            <ChatItem
                                key={chat.id}
                                chat={chat}
                                isActive={chat.id === activeChatId}
                            />
                        ))}
                    </div>
                )}

                {/* Older Section */}
                {olderChats.length > 0 && (
                    <div className="flex flex-col gap-2">
                        <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Previous
                        </h3>
                        {olderChats.map((chat) => (
                            <ChatItem
                                key={chat.id}
                                chat={chat}
                                isActive={chat.id === activeChatId}
                            />
                        ))}
                    </div>
                )}

                {/* Empty state */}
                {chats.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <span className="material-symbols-outlined text-slate-600 text-4xl mb-2">
                            chat_bubble_outline
                        </span>
                        <p className="text-slate-500 text-sm">No chats yet</p>
                        <p className="text-slate-600 text-xs">
                            Start a new conversation
                        </p>
                    </div>
                )}
            </div>

            {/* User Profile Footer */}
            <div className="p-4 border-t border-border-color">
                <div className="flex items-center gap-3 w-full p-2 rounded-lg">
                    <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-9 ring-2 ring-border-color bg-gradient-to-br from-primary/30 to-purple-500/30"></div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                            {user?.email || "Guest User"}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                            Free Plan
                        </p>
                    </div>
                    <form action={logout}>
                        <button
                            type="submit"
                            className="cursor-pointer p-2 rounded-lg hover:bg-surface-hover transition-colors"
                            title="Logout"
                        >
                            <span className="material-symbols-outlined text-slate-400 hover:text-red-400 text-[20px]">
                                logout
                            </span>
                        </button>
                    </form>
                </div>
            </div>
        </aside>
    );
}

function ChatItem({
    chat,
    isActive = false,
}: {
    chat: Chat;
    isActive?: boolean;
}) {
    return (
        <Link
            href={`/?chat=${chat.id}`}
            className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors relative overflow-hidden ${isActive
                ? "bg-surface-hover border border-border-color"
                : "hover:bg-surface-hover/50"
                }`}
        >
            {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
            )}
            <span
                className={`material-symbols-outlined text-[20px] ${isActive
                    ? "text-primary"
                    : "text-slate-400 group-hover:text-slate-200"
                    }`}
            >
                {isActive ? "chat_bubble" : "chat_bubble_outline"}
            </span>
            <div className="flex-1 min-w-0">
                <p
                    className={`text-sm font-medium leading-none truncate ${isActive ? "text-white" : "text-slate-300"
                        }`}
                >
                    {chat.title || "New Chat"}
                </p>
            </div>
            <button
                onClick={(e) => e.preventDefault()}
                className="text-slate-400 opacity-0 group-hover:opacity-100 hover:text-white transition-opacity"
            >
                <span className="material-symbols-outlined text-[18px]">
                    more_horiz
                </span>
            </button>
        </Link>
    );
}
