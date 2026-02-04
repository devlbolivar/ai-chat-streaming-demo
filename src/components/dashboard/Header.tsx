export function Header() {
    return (
        <header className="flex items-center justify-between border-b border-border-color px-6 py-4 bg-background-dark/95 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                    <h2 className="text-white text-lg font-bold leading-tight tracking-tight flex items-center gap-2 group cursor-pointer hover:text-primary transition-colors">
                        Project Omega Analysis
                        <span className="material-symbols-outlined text-slate-500 text-[16px] opacity-0 group-hover:opacity-100 transition-opacity">
                            edit
                        </span>
                    </h2>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                    <span className="text-green-500 text-xs font-medium">Connected</span>
                    <span className="text-slate-600 text-xs">•</span>
                    <span className="text-slate-500 text-xs">GPT-4 Turbo</span>
                </div>
            </div>
            <div className="flex gap-2">
                <button
                    className="flex items-center justify-center rounded-lg h-9 w-9 bg-surface-dark hover:bg-surface-hover text-slate-300 border border-border-color transition-colors cursor-pointer"
                    title="Chat Settings"
                >
                    <span className="material-symbols-outlined text-[20px]">tune</span>
                </button>
                <button
                    className="flex items-center justify-center rounded-lg h-9 w-9 bg-surface-dark hover:bg-surface-hover text-slate-300 border border-border-color transition-colors cursor-pointer"
                    title="Export Chat"
                >
                    <span className="material-symbols-outlined text-[20px]">
                        ios_share
                    </span>
                </button>
            </div>
        </header>
    );
}
