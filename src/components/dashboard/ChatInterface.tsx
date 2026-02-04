"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import type { Message } from "@/types";

interface ChatInterfaceProps {
    initialMessages: Message[];
    chatId: string;
    userAvatar?: string;
}

export function ChatInterface({
    initialMessages,
    chatId,
    userAvatar,
}: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [input, setInput] = useState("");
    const [isStreaming, setIsStreaming] = useState(false);
    const [streamingContent, setStreamingContent] = useState("");
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop =
                chatContainerRef.current.scrollHeight;
        }
    }, [messages, streamingContent]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isStreaming) return;

        const userMessage = input.trim();
        setInput("");

        // Optimistically add user message
        const tempUserMessage: Message = {
            id: `temp-${Date.now()}`,
            chat_id: chatId,
            role: "user",
            content: userMessage,
            created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, tempUserMessage]);
        setIsStreaming(true);
        setStreamingContent("");

        // Create new abort controller for this request
        abortControllerRef.current = new AbortController();

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chatId,
                    message: userMessage,
                }),
                signal: abortControllerRef.current.signal,
            });

            // Handle rate limit exceeded
            if (response.status === 429) {
                const errorData = await response.json();
                // Remove the optimistic user message
                setMessages((prev) => prev.filter((m) => m.id !== tempUserMessage.id));
                // Show rate limit error as a system message
                const errorMessage: Message = {
                    id: `error-${Date.now()}`,
                    chat_id: chatId,
                    role: "assistant",
                    content: `⚠️ **Daily Limit Reached**\n\nYou've used all ${errorData.limit || 50} messages for today. Your limit will reset at midnight UTC.\n\nUpgrade to Pro for unlimited messages.`,
                    created_at: new Date().toISOString(),
                };
                setMessages((prev) => [...prev, errorMessage]);
                return;
            }

            if (!response.ok) {
                throw new Error("Failed to send message");
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let fullContent = "";

            if (reader) {
                try {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;

                        const chunk = decoder.decode(value, { stream: true });
                        fullContent += chunk;
                        setStreamingContent(fullContent);
                    }
                } catch (readError) {
                    // If aborted, we still want to save the partial content
                    if ((readError as Error).name === "AbortError") {
                        console.log("Stream aborted by user");
                    } else {
                        throw readError;
                    }
                } finally {
                    reader.releaseLock();
                }
            }

            // Add the complete (or partial if stopped) assistant message
            if (fullContent) {
                const assistantMessage: Message = {
                    id: `temp-assistant-${Date.now()}`,
                    chat_id: chatId,
                    role: "assistant",
                    content: fullContent,
                    created_at: new Date().toISOString(),
                };
                setMessages((prev) => [...prev, assistantMessage]);
            }
        } catch (error) {
            if ((error as Error).name === "AbortError") {
                // Handle abort - save partial content if any
                const currentContent = streamingContent;
                if (currentContent) {
                    const assistantMessage: Message = {
                        id: `temp-assistant-${Date.now()}`,
                        chat_id: chatId,
                        role: "assistant",
                        content: currentContent + "\n\n*[Generation stopped]*",
                        created_at: new Date().toISOString(),
                    };
                    setMessages((prev) => [...prev, assistantMessage]);
                }
            } else {
                console.error("Error sending message:", error);
                // Remove optimistic message on error
                setMessages((prev) => prev.filter((m) => m.id !== tempUserMessage.id));
            }
        } finally {
            setIsStreaming(false);
            setStreamingContent("");
            abortControllerRef.current = null;
        }
    };

    const handleStop = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <>
            {/* Message Stream */}
            <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth"
                id="chat-container"
            >
                <div className="h-4"></div>

                {messages.length === 0 && !isStreaming && (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="bg-primary/10 rounded-2xl p-4 mb-4">
                            <span className="material-symbols-outlined text-primary text-4xl">
                                chat_bubble
                            </span>
                        </div>
                        <h2 className="text-xl font-semibold text-white mb-2">
                            Start a conversation
                        </h2>
                        <p className="text-slate-400 max-w-md">
                            Send a message to begin chatting with the AI
                            assistant.
                        </p>
                    </div>
                )}

                {messages.map((message) => (
                    <div key={message.id}>
                        {message.role === "user" ? (
                            <div className="flex items-end gap-4 justify-end group">
                                <div className="flex flex-col items-end gap-1 max-w-[85%] md:max-w-[70%]">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-slate-400 text-xs">
                                            {formatTime(message.created_at)}
                                        </span>
                                        <span className="text-primary text-xs font-medium">
                                            You
                                        </span>
                                    </div>
                                    <div className="rounded-2xl rounded-tr-sm px-5 py-3.5 bg-surface-hover text-slate-100 border border-border-color shadow-sm">
                                        <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
                                            {message.content}
                                        </p>
                                    </div>
                                </div>
                                <div
                                    className="bg-center bg-no-repeat bg-cover rounded-full size-9 shrink-0 ring-2 ring-surface-hover"
                                    style={{
                                        backgroundImage: `url("${userAvatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuChr7kmsZQBD5EgEqAC6ZvxkzYDTuuG5npMKSgdkNINo8CAQL9q6zPfGcjGimErXc3nsjL6f-SMZ7FhifClH5-CDq2eb_Z_FPN2vXaXm96uKnMLyYnse1y1eOmlAYmWjlnNcSqNGm4GPlnhZmLHsW4OQQq3WfLFx1tNaqQp5XWTIpyAE9Ypy_cuWXbZBXXpNuaWqyxp0QQqgLY62BigP7NIPJvH8eVrVaBB8MVNmWGUbA7aA6m9R99T79Eod0wSYD83H9QXW8LcY2P9"}")`,
                                    }}
                                ></div>
                            </div>
                        ) : (
                            <div className="flex items-start gap-4 max-w-[85%] md:max-w-[80%]">
                                <div className="relative">
                                    <div
                                        className="bg-center bg-no-repeat bg-cover rounded-full size-9 shrink-0 ring-2 ring-primary/20 shadow-neon"
                                        style={{
                                            backgroundImage:
                                                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDF6AfIOQDd4I-Vif-jlfHTiydhNHZPVsf-o_sNXwVYqLfVBnQ2U95vVw_IP03eb9mf0Z3-ds1DU-xrxs6D5y4dKrF1TK-inPOk91HyMlU4WoGQD3Fd1ZHq0DBfByn6GhLN-CwzzHV8qGxfS-HXu2v0wJDs8EU842xHTkiDl82-h75-KjY9LXBmXbJ3QCfSHvUBoPO4rSbpfkqtveL5y61GZ_45rs_nw3OdjfNxvur1R6668KwBgjFJgtVlZiAkHE7E2qnOgYaAKEYb")',
                                        }}
                                    ></div>
                                </div>
                                <div className="flex flex-col gap-1 w-full">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-primary text-xs font-bold">
                                            AI Assistant
                                        </span>
                                    </div>
                                    <div className="rounded-2xl rounded-tl-sm px-6 py-5 bg-transparent border border-border-color/50 w-full shadow-sm">
                                        <div className="prose prose-invert prose-p:text-slate-300 prose-headings:text-white max-w-none text-[15px] leading-relaxed">
                                            <p className="whitespace-pre-wrap">
                                                {message.content}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mt-1 opacity-50 hover:opacity-100 transition-opacity">
                                        <button className="p-1.5 hover:bg-surface-hover rounded-md text-slate-500 hover:text-white transition-colors cursor-pointer">
                                            <span className="material-symbols-outlined text-[18px]">
                                                thumb_up
                                            </span>
                                        </button>
                                        <button className="p-1.5 hover:bg-surface-hover rounded-md text-slate-500 hover:text-white transition-colors cursor-pointer">
                                            <span className="material-symbols-outlined text-[18px]">
                                                thumb_down
                                            </span>
                                        </button>
                                        <button
                                            onClick={() =>
                                                copyToClipboard(message.content)
                                            }
                                            className="p-1.5 hover:bg-surface-hover rounded-md text-slate-500 hover:text-white transition-colors cursor-pointer"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">
                                                content_copy
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {/* Streaming message */}
                {isStreaming && (
                    <div className="flex items-start gap-4 max-w-[85%] md:max-w-[80%]">
                        <div className="relative">
                            <div
                                className="bg-center bg-no-repeat bg-cover rounded-full size-9 shrink-0 ring-2 ring-primary/20 shadow-neon"
                                style={{
                                    backgroundImage:
                                        'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDF6AfIOQDd4I-Vif-jlfHTiydhNHZPVsf-o_sNXwVYqLfVBnQ2U95vVw_IP03eb9mf0Z3-ds1DU-xrxs6D5y4dKrF1TK-inPOk91HyMlU4WoGQD3Fd1ZHq0DBfByn6GhLN-CwzzHV8qGxfS-HXu2v0wJDs8EU842xHTkiDl82-h75-KjY9LXBmXbJ3QCfSHvUBoPO4rSbpfkqtveL5y61GZ_45rs_nw3OdjfNxvur1R6668KwBgjFJgtVlZiAkHE7E2qnOgYaAKEYb")',
                                }}
                            ></div>
                            <div className="absolute -bottom-2 -right-2 bg-background-dark rounded-full p-0.5">
                                <span className="material-symbols-outlined text-primary text-[14px] bg-primary/10 rounded-full p-0.5">
                                    bolt
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1 w-full">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-primary text-xs font-bold">
                                    AI Assistant
                                </span>
                                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider border border-primary/20">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                                    Streaming
                                </span>
                            </div>
                            <div className="rounded-2xl rounded-tl-sm px-6 py-5 bg-transparent border border-border-color/50 w-full shadow-sm relative overflow-hidden">
                                <div className="prose prose-invert prose-p:text-slate-300 prose-headings:text-white max-w-none text-[15px] leading-relaxed">
                                    <p className="whitespace-pre-wrap">
                                        {streamingContent}
                                        <span className="inline-block w-2.5 h-5 bg-primary align-middle ml-0.5 blink-cursor"></span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="h-8"></div>
            </div>

            {/* Input Area (Composer) */}
            <div className="p-4 md:px-8 md:pb-8 bg-background-dark/95 backdrop-blur-md border-t border-border-color/50 w-full relative z-20">
                <div className="max-w-4xl mx-auto flex flex-col gap-2">
                    <form onSubmit={handleSubmit}>
                        <div className="relative flex flex-col rounded-xl bg-surface-dark border border-border-color focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all shadow-lg overflow-hidden">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (
                                        e.key === "Enter" &&
                                        !e.shiftKey &&
                                        !isStreaming
                                    ) {
                                        e.preventDefault();
                                        handleSubmit(e);
                                    }
                                }}
                                className="w-full bg-transparent text-white placeholder-slate-500 text-[15px] resize-none focus:outline-none max-h-48 py-3 px-4 min-h-[56px] leading-relaxed"
                                placeholder="Send a message..."
                                rows={1}
                                disabled={isStreaming}
                            />
                            <div className="flex items-center justify-between px-2 pb-2">
                                <div className="flex gap-1">
                                    <button
                                        type="button"
                                        className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                                        title="Attach file"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">
                                            attach_file
                                        </span>
                                    </button>
                                    <button
                                        type="button"
                                        className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                                        title="Browse prompt library"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">
                                            auto_awesome
                                        </span>
                                    </button>
                                </div>
                                <div className="flex gap-2">
                                    {isStreaming ? (
                                        <button
                                            type="button"
                                            onClick={handleStop}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-warning/10 hover:bg-warning/20 text-warning border border-warning/30 rounded-lg text-xs font-bold uppercase tracking-wide transition-all group cursor-pointer"
                                        >
                                            <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-sm bg-warning opacity-75"></span>
                                                <span className="relative inline-flex rounded-sm h-2 w-2 bg-warning"></span>
                                            </span>
                                            Stop Generating
                                        </button>
                                    ) : (
                                        <button
                                            type="submit"
                                            disabled={!input.trim()}
                                            className="flex items-center gap-2 px-4 py-1.5 bg-primary hover:bg-cyan-400 disabled:bg-slate-700 disabled:text-slate-500 text-background-dark rounded-lg text-sm font-bold transition-all cursor-pointer disabled:cursor-not-allowed"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">
                                                send
                                            </span>
                                            Send
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </form>
                    <p className="text-center text-[11px] text-slate-600 mt-2">
                        AI generated content may be inaccurate.
                        <a
                            className="underline hover:text-slate-400 ml-1"
                            href="#"
                        >
                            Terms & Policies
                        </a>
                    </p>
                </div>
            </div>
        </>
    );
}
