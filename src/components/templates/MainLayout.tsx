import React from "react";
import Link from "next/link";
import { Trophy } from "lucide-react";

interface MainLayoutProps {
  children: React.ReactNode;
  activeTab?: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans relative selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Premium Navbar */}
      <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-650 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-all">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold tracking-wider text-white uppercase group-hover:text-emerald-400 transition-colors">
                KARANG TARUNA RW 03
              </h1>
              <p className="text-[10px] text-zinc-500 font-semibold tracking-widest uppercase">
                Futsal Tournament
              </p>
            </div>
          </Link>

          {/* Navigation links hidden per request - Admin can access manually via URL */}
        </div>
      </header>

      {/* Hero Banner / Badge */}
      <section className="relative py-12 px-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950/15 via-zinc-950 to-zinc-950 border-b border-zinc-900 overflow-hidden">
        <div className="max-w-3xl mx-auto text-center space-y-3 relative z-10">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase animate-pulse">
            🔥 Karang Taruna RW 03 Cup
          </span>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white uppercase">
            Turnamen Futsal RW 03
          </h2>
          <p className="text-xs sm:text-sm text-zinc-450 max-w-lg mx-auto font-medium">
            Info klasemen terkini, jadwal tanding, dan daftar pencetak gol
            terbanyak.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-grow max-w-5xl mx-auto w-full px-4 py-8 relative z-10">
        {children}
      </main>

      {/* Sticky Footer */}
      <footer className="border-t border-zinc-900 py-6 text-center text-xs text-zinc-600 bg-zinc-950/60 mt-12">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-medium">
            © {new Date().getFullYear()} Karang Taruna RW 03. All rights
            reserved.
          </p>
          <p className="text-zinc-700 font-semibold uppercase tracking-wider text-[10px]">
            Created by &copy;{"Yoga Febriatala"}
          </p>
        </div>
      </footer>
    </div>
  );
};
