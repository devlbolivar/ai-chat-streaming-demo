import Image from "next/image";
import { User } from "@supabase/supabase-js";
import { logout } from "@/app/login/actions";

export function Sidebar({ user }: { user: User | null }) {
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
                <button className="cursor-pointer w-full flex items-center justify-center gap-2 rounded-xl h-11 bg-primary hover:bg-cyan-400 text-background-dark text-sm font-bold shadow-neon transition-all hover:shadow-[0_0_15px_rgba(13,204,242,0.3)]">
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    <span>New Chat</span>
                </button>
            </div>

            {/* Scrollable History */}
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
                {/* Today Section */}
                <div className="flex flex-col gap-2">
                    <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Today
                    </h3>
                    {/* Active Item */}
                    <div className="group flex items-center gap-3 px-3 py-2.5 rounded-lg bg-surface-hover border border-border-color cursor-pointer relative overflow-hidden">
                        {/* Active Indicator Strip */}
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
                        <span className="material-symbols-outlined text-primary text-[20px]">
                            chat_bubble
                        </span>
                        <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium leading-none truncate">
                                Project Omega Analysis
                            </p>
                            <p className="text-slate-400 text-xs mt-1 truncate">
                                Architecture review...
                            </p>
                        </div>
                        <button className="text-slate-400 opacity-0 group-hover:opacity-100 hover:text-white transition-opacity">
                            <span className="material-symbols-outlined text-[18px]">
                                more_horiz
                            </span>
                        </button>
                    </div>
                    <div className="group flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-hover/50 cursor-pointer transition-colors">
                        <span className="material-symbols-outlined text-slate-400 group-hover:text-slate-200 text-[20px]">
                            chat_bubble_outline
                        </span>
                        <div className="flex-1 min-w-0">
                            <p className="text-slate-300 text-sm font-medium leading-none truncate">
                                React Refactor Help
                            </p>
                        </div>
                        <button className="text-slate-400 opacity-0 group-hover:opacity-100 hover:text-white transition-opacity">
                            <span className="material-symbols-outlined text-[18px]">
                                more_horiz
                            </span>
                        </button>
                    </div>
                </div>

                {/* Yesterday Section */}
                <div className="flex flex-col gap-2">
                    <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Yesterday
                    </h3>
                    <div className="group flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-hover/50 cursor-pointer transition-colors">
                        <span className="material-symbols-outlined text-slate-400 group-hover:text-slate-200 text-[20px]">
                            history_edu
                        </span>
                        <div className="flex-1 min-w-0">
                            <p className="text-slate-300 text-sm font-medium leading-none truncate">
                                Creative Writing
                            </p>
                        </div>
                    </div>
                    <div className="group flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-hover/50 cursor-pointer transition-colors">
                        <span className="material-symbols-outlined text-slate-400 group-hover:text-slate-200 text-[20px]">
                            chat_bubble_outline
                        </span>
                        <div className="flex-1 min-w-0">
                            <p className="text-slate-300 text-sm font-medium leading-none truncate">
                                Untitled Session
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* User Profile Footer */}
            <div className="p-4 border-t border-border-color">
                <div className="flex items-center gap-3 w-full p-2 rounded-lg">
                    <div
                        className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-9 ring-2 ring-border-color"
                        style={{
                            backgroundImage:
                                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAdyemKboK13GsjeEgHrisP75RlezeKIHyyodhRxGtgV2ENUMg0v4oVu3stvg0vBsaXFE6R7kOkjlM72lSqoU6KgML7PkLvuNFLvbp4oE_phHS7sJFIB5Wnf1IseCA7WW_erQwMobVI8ZaCBE86D2AdqWqLORfymZm4dd73uOkIYzQ-R_DuHhHBc4Fx33DE1Qxq9IYNSixK-BpnO3ri_oMUdY0l0jz0xQJv-W73_Cojoa454pJaUdq7C28XkMP_NUgU596bUzv0Lwue")',
                        }}
                    ></div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                            {user?.email || "Guest User"}
                        </p>
                        <p className="text-xs text-slate-400 truncate">Free Plan</p>
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
