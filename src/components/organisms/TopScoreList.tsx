import React from "react";
import { Player } from "../../services/db";
import { Trophy, Download } from "lucide-react";
import { downloadTopScoreImage } from "../../utils/imageGenerator";

interface TopScoreListProps {
  players: Player[];
  loading?: boolean;
}

export const TopScoreList: React.FC<TopScoreListProps> = ({
  players,
  loading = false,
}) => {
  // Filter players with goals > 0 and limit to top 5
  const displayPlayers = React.useMemo(() => {
    return players.filter((p) => p.goals > 0).slice(0, 5);
  }, [players]);

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-16 bg-zinc-900/40 rounded-xl border border-zinc-800 flex items-center justify-between px-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-zinc-800 rounded-full" />
              <div className="space-y-2">
                <div className="h-4 w-28 bg-zinc-800 rounded" />
                <div className="h-3 w-16 bg-zinc-800 rounded" />
              </div>
            </div>
            <div className="h-8 w-10 bg-zinc-800 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (displayPlayers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-zinc-500 bg-zinc-900/30 rounded-2xl border border-zinc-850">
        <Trophy className="w-10 h-10 mb-2 text-zinc-650" />
        <span className="text-sm">Belum ada data pencetak gol (minimal 1 gol).</span>
      </div>
    );
  }

  // Helper for rank styles
  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-400 text-zinc-950 font-black text-sm shadow-md shadow-amber-400/20 ring-4 ring-amber-400/10">
            1
          </span>
        );
      case 2:
        return (
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-300 text-zinc-950 font-black text-sm shadow-md shadow-zinc-300/20 ring-4 ring-zinc-300/10">
            2
          </span>
        );
      case 3:
        return (
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-700 text-zinc-100 font-black text-sm shadow-md shadow-amber-800/20 ring-4 ring-amber-800/10">
            3
          </span>
        );
      default:
        return (
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-800/50 text-zinc-550 font-bold text-sm">
            {rank}
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Download Header for Top Score list */}
      <div className="flex items-center justify-between bg-zinc-900/90 px-5 py-4 border border-zinc-800/80 rounded-2xl gap-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 shrink-0" />
          <h3 className="text-xs sm:text-sm font-bold text-zinc-200 tracking-wider uppercase truncate">
            Top Score Sementara
          </h3>
        </div>
        <button
          onClick={() => downloadTopScoreImage(players)}
          className="shrink-0 px-2.5 py-1 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-white text-[10px] sm:text-xs font-bold rounded-lg border border-zinc-750 transition-all cursor-pointer flex items-center gap-1 active:scale-95"
          title="Download Poster Top Score"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">Download Poster</span>
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {displayPlayers.map((player, index) => {
          const rank = index + 1;
          const isTopThree = rank <= 3;

          return (
            <div
              key={player.id}
              className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 ${
                isTopThree
                  ? "bg-gradient-to-r from-zinc-900/70 to-zinc-900/40 border-zinc-800/90 shadow-md"
                  : "bg-zinc-900/35 border-zinc-850/60"
              } hover:border-zinc-700/60`}
            >
              {/* Left side: Rank, Name, Team */}
              <div className="flex items-center gap-4 min-w-0">
                <div className="flex-shrink-0">{getRankBadge(rank)}</div>
                <div className="min-w-0">
                  <h4 className="font-bold text-zinc-100 text-sm tracking-wide truncate">
                    {player.name}
                  </h4>
                  <p className="text-xs text-zinc-500 font-medium truncate mt-0.5">
                    {player.teams?.name || "Tanpa Tim"}
                  </p>
                </div>
              </div>

              {/* Right side: Goals Badge */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-500 tracking-wide uppercase mr-1">
                  Gol
                </span>
                <span
                  className={`text-xl font-black px-3.5 py-1 rounded-xl flex items-center justify-center ${
                    isTopThree
                      ? "bg-emerald-600/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-zinc-850 text-zinc-300"
                  }`}
                >
                  {player.goals}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
