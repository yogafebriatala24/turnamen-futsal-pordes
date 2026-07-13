import React, { useState, useMemo } from "react";
import { Match, MatchCard } from "../molecules/MatchCard";
import { Calendar, Filter } from "lucide-react";

interface ScheduleListProps {
  matches: Match[];
  loading?: boolean;
  isAdmin?: boolean;
  onEdit?: (match: Match) => void;
  onDelete?: (id: number) => void;
}

export const ScheduleList: React.FC<ScheduleListProps> = ({
  matches,
  loading = false,
  isAdmin = false,
  onEdit,
  onDelete,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roundFilter, setRoundFilter] = useState<string>("all");

  const rounds = useMemo(() => {
    const list = new Set(matches.map((m) => m.round));
    return ["all", ...Array.from(list)];
  }, [matches]);

  const filteredMatches = useMemo(() => {
    return matches.filter((match) => {
      const matchStatus =
        statusFilter === "all" || match.status === statusFilter;
      const matchRound = roundFilter === "all" || match.round === roundFilter;
      return matchStatus && matchRound;
    });
  }, [matches, statusFilter, roundFilter]);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 bg-zinc-900/60 rounded-xl w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-44 bg-zinc-900/40 rounded-2xl border border-zinc-800"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Interactive Filters Panel */}
      <div className="bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-md p-4 rounded-2xl flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 self-start sm:self-center">
          <Filter className="w-4 h-4 text-emerald-500" />
          <span className="text-sm font-bold text-zinc-300">
            Filter Jadwal{" "}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Status Filter */}
          <div className="flex-1 sm:flex-initial">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-300 focus:border-emerald-500 focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="scheduled">Mendatang</option>
              <option value="ongoing">Berlangsung (LIVE)</option>
              <option value="finished">Selesai</option>
            </select>
          </div>

          {/* Round Filter */}
          <div className="flex-1 sm:flex-initial">
            <select
              value={roundFilter}
              onChange={(e) => setRoundFilter(e.target.value)}
              className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-300 focus:border-emerald-500 focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Babak</option>
              {rounds
                .filter((r) => r !== "all")
                .map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {/* Fixtures Grid */}
      {filteredMatches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-zinc-500 bg-zinc-900/30 rounded-2xl border border-zinc-850">
          <Calendar className="w-10 h-10 mb-2 text-zinc-650" />
          <span className="text-sm">
            Tidak ada jadwal pertandingan yang cocok.
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMatches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              isAdmin={isAdmin}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};
