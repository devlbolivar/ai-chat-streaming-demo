import { login, signup } from "./actions";

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>;
}) {
    const { error } = await searchParams;

    return (
        <div className="flex h-screen w-full items-center justify-center bg-background-dark p-4">
            <div className="w-full max-w-sm flex-col gap-6 p-8 bg-surface-dark border border-border-color rounded-2xl shadow-neon flex">
                <div className="flex flex-col items-center gap-2">
                    <div className="bg-primary/10 rounded-xl p-3 flex items-center justify-center mb-2">
                        <span className="material-symbols-outlined text-primary text-3xl">
                            smart_toy
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">
                        Welcome Back
                    </h1>
                    <p className="text-sm text-slate-400">
                        Sign in to access your AI workspace
                    </p>
                </div>

                {error && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                        <span className="material-symbols-outlined text-[18px]">
                            error
                        </span>
                        <span>{error}</span>
                    </div>
                )}

                <form className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <label
                            className="text-xs font-semibold text-slate-300 uppercase tracking-wider"
                            htmlFor="email"
                        >
                            Email
                        </label>
                        <input
                            className="px-4 py-3 rounded-xl bg-background-dark border border-border-color text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all font-sans"
                            id="email"
                            name="email"
                            type="email"
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label
                            className="text-xs font-semibold text-slate-300 uppercase tracking-wider"
                            htmlFor="password"
                        >
                            Password
                        </label>
                        <input
                            className="px-4 py-3 rounded-xl bg-background-dark border border-border-color text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all font-sans"
                            id="password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        formAction={login}
                        className="mt-2 w-full flex items-center justify-center gap-2 rounded-xl h-12 bg-primary hover:bg-cyan-400 text-background-dark font-bold shadow-neon transition-all hover:shadow-[0_0_15px_rgba(13,204,242,0.3)] cursor-pointer"
                    >
                        Log In
                    </button>
                    <button
                        formAction={signup}
                        className="w-full flex items-center justify-center gap-2 rounded-xl h-12 bg-surface-hover hover:bg-surface-hover/80 text-white font-bold border border-border-color transition-colors cursor-pointer"
                    >
                        Sign Up
                    </button>
                </form>
            </div>
        </div>
    );
}
