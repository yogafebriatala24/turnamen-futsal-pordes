import React, { useState, useMemo } from "react";
import { StandingRow } from "../../utils/standings";
import { Trophy, Shield } from "lucide-react";

interface StandingsTableProps {
  standings: Record<string, StandingRow[]>;
  loading?: boolean;
}

export const StandingsTable: React.FC<StandingsTableProps> = ({
  standings,
  loading = false,
}) => {
  const [highlightedRow, setHighlightedRow] = useState<string | null>(null);

  const groups = useMemo(() => {
    return Object.keys(standings).sort((a, b) => {
      const getPriority = (name: string) => {
        const lower = name.toLowerCase();
        if (lower.includes("grup a")) return 1;
        if (lower.includes("grup b")) return 2;
        if (lower.includes("grup c")) return 3;
        if (lower.includes("grup d")) return 4;
        if (lower.includes("grup e")) return 5;
        if (lower.includes("grup")) return 10;
        if (lower.includes("penyisihan")) return 11;
        if (lower.includes("perempat") || lower.includes("quarter")) return 20;
        if (lower.includes("semi")) return 30;
        if (lower.includes("perebutan") || lower.includes("juara 3") || lower.includes("ketiga")) return 40;
        if (lower.includes("final")) return 50;
        return 100;
      };

      const pA = getPriority(a);
      const pB = getPriority(b);

      if (pA !== pB) {
        return pA - pB;
      }
      return a.localeCompare(b);
    });
  }, [standings]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4 animate-pulse">
        {[1, 2].map((i) => (
          <div key={i} className="bg-zinc-900/40 rounded-2xl p-4 border border-zinc-800">
            <div className="h-5 w-24 bg-zinc-800 rounded mb-4" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="h-10 bg-zinc-800/60 rounded" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-zinc-500 bg-zinc-900/30 rounded-2xl border border-zinc-850">
        <Trophy className="w-10 h-10 mb-2 text-zinc-650" />
        <span className="text-sm">Belum ada data klasemen.</span>
      </div>
    );
  }

  const renderEmblem = (name: string, url?: string) => {
    if (url) {
      return (
        <img
          src={url}
          alt={name}
          className="w-5 h-5 sm:w-6 sm:h-6 object-contain rounded-full bg-zinc-850 p-0.5"
        />
      );
    }
    const initials = name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();

    return (
      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-[8px] sm:text-[9px] text-emerald-400 flex-shrink-0">
        {initials}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-8">
      {groups.map((groupName) => {
        const rows = standings[groupName];

        return (
          <div
            key={groupName}
            className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-zinc-800/80 overflow-hidden shadow-xl"
          >
            {/* Group Title Header */}
            <div className="bg-zinc-900/90 px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-200 tracking-wider uppercase">
                {groupName}
              </h3>
              <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/15">
                Klasemen Grup
              </span>
            </div>

            {/* Standings Table container (responsive horizontal scrolling on tiny screens) */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800/60 text-[10px] font-bold text-zinc-500 uppercase tracking-wider bg-zinc-950/20">
                    <th className="py-2.5 px-2 sm:py-3 sm:px-4 w-9 sm:w-12 min-w-[36px] sm:min-w-[48px] max-w-[36px] sm:max-w-[48px] text-center sticky left-0 z-20 bg-zinc-900 text-[9px] sm:text-[10px]">POS</th>
                    <th className="py-2.5 px-2 sm:py-3 sm:px-4 min-w-[110px] sm:min-w-[150px] sticky left-[36px] sm:left-[48px] z-20 bg-zinc-900 border-r border-zinc-800/80 text-[9px] sm:text-[10px]">TIM</th>
                    <th className="py-2.5 px-1 sm:py-3 sm:px-3 text-center w-10 sm:w-12 text-[9px] sm:text-[10px]">MAIN</th>
                    <th className="py-2.5 px-1 sm:py-3 sm:px-2 text-center w-8 sm:w-10 text-[9px] sm:text-[10px]">M</th>
                    <th className="py-2.5 px-1 sm:py-3 sm:px-2 text-center w-8 sm:w-10 text-[9px] sm:text-[10px]">S</th>
                    <th className="py-2.5 px-1 sm:py-3 sm:px-2 text-center w-8 sm:w-10 text-[9px] sm:text-[10px]">K</th>
                    <th className="py-2.5 px-1 sm:py-3 sm:px-2 text-center w-8 sm:w-10 text-[9px] sm:text-[10px]">GM</th>
                    <th className="py-2.5 px-1 sm:py-3 sm:px-2 text-center w-8 sm:w-10 text-[9px] sm:text-[10px]">GK</th>
                    <th className="py-2.5 px-1 sm:py-3 sm:px-3 text-center w-10 sm:w-14 text-[9px] sm:text-[10px]">SG</th>
                    <th className="py-2.5 px-2 sm:py-3 sm:px-4 text-center w-12 sm:w-16 sticky right-0 z-20 bg-zinc-900 border-l border-zinc-800/80 text-[9px] sm:text-[10px]">POIN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850/40 text-sm text-zinc-300">
                  {rows.map((row, index) => {
                    const isTopTwo = index < 2; // Qualify highlight
                    return (
                      <tr
                        key={row.teamId}
                        className={`transition-colors duration-150 ${
                          isTopTwo
                            ? "bg-emerald-950/20 hover:bg-emerald-950/30 text-emerald-100"
                            : "hover:bg-zinc-800/25"
                        }`}
                      >
                        {/* Position */}
                        <td className={`py-3.5 px-4 text-center font-bold sticky left-0 z-10 ${
                          isTopTwo 
                            ? "bg-[#0c2417] text-emerald-350" 
                            : "bg-zinc-900 text-zinc-500"
                        }`}>
                          <span
                            className={`inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-md text-[10px] sm:text-xs ${
                              isTopTwo
                                ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/25"
                                : "text-zinc-550"
                            }`}
                          >
                            {index + 1}
                          </span>
                        </td>

                        {/* Team Name */}
                        <td className={`py-2 px-2 sm:py-3.5 sm:px-4 font-semibold sticky left-[36px] sm:left-[48px] z-10 border-r border-zinc-800/60 text-xs sm:text-sm ${
                          isTopTwo 
                            ? "bg-[#0c2417] text-emerald-300" 
                            : "bg-zinc-900 text-zinc-200"
                        }`}>
                          <div className="flex items-center gap-1.5 sm:gap-2.5">
                            {renderEmblem(row.name, row.logoUrl)}
                            <span className="truncate max-w-[80px] sm:max-w-[160px]">{row.name}</span>
                            {row.isLive && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-black bg-rose-500/20 text-rose-450 border border-rose-500/30 animate-pulse ml-1 flex-shrink-0">
                                LIVE
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Played */}
                        <td className="py-2 px-1 sm:py-3.5 sm:px-3 text-center font-medium text-xs sm:text-sm text-zinc-300">
                          {row.played}
                        </td>

                        {/* Won */}
                        <td className="py-2 px-1 sm:py-3.5 sm:px-2 text-center text-xs sm:text-sm text-zinc-400">
                          {row.won}
                        </td>

                        {/* Drawn */}
                        <td className="py-2 px-1 sm:py-3.5 sm:px-2 text-center text-xs sm:text-sm text-zinc-400">
                          {row.drawn}
                        </td>

                        {/* Lost */}
                        <td className="py-2 px-1 sm:py-3.5 sm:px-2 text-center text-xs sm:text-sm text-zinc-400">
                          {row.lost}
                        </td>

                        {/* GM */}
                        <td className="py-2 px-1 sm:py-3.5 sm:px-2 text-center text-xs sm:text-sm text-zinc-500">
                          {row.goalsFor}
                        </td>

                        {/* GK */}
                        <td className="py-2 px-1 sm:py-3.5 sm:px-2 text-center text-xs sm:text-sm text-zinc-500">
                          {row.goalsAgainst}
                        </td>

                        {/* Goal Difference */}
                        <td
                          className={`py-2 px-1 sm:py-3.5 sm:px-3 text-center font-semibold text-xs sm:text-sm ${
                            row.goalDifference > 0
                              ? "text-emerald-500"
                              : row.goalDifference < 0
                              ? "text-rose-500"
                              : "text-zinc-500"
                          }`}
                        >
                          {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                        </td>

                        {/* Points */}
                        <td className={`py-2 px-2 sm:py-3.5 sm:px-4 text-center font-extrabold text-xs sm:text-sm sticky right-0 z-10 border-l border-zinc-800/60 ${
                          isTopTwo 
                            ? "bg-[#0c2417] text-emerald-300" 
                            : "bg-zinc-900 text-white"
                        }`}>
                          {row.points}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Legend info footer */}
            <div className="px-5 py-2.5 bg-zinc-950/40 border-t border-zinc-800 text-[10px] text-zinc-550 flex flex-wrap gap-x-4 gap-y-1">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600/20 border border-emerald-500/20" />
                Lolos Kualifikasi
              </span>
              <span className="inline">•</span>
              <span>M: Menang</span>
              <span>S: Seri</span>
              <span>K: Kalah</span>
              <span>GM: Gol Memasukkan</span>
              <span>GK: Gol Kemasukan</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
