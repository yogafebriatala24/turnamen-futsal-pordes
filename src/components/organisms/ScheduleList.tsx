import React, { useState, useMemo } from "react";
import { Match, MatchCard } from "../molecules/MatchCard";
import { Select } from "../atoms/Select";
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
    const list = Array.from(new Set(matches.map((m) => m.round)));

    list.sort((a, b) => {
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
        if (
          lower.includes("perebutan") ||
          lower.includes("juara 3") ||
          lower.includes("ketiga")
        )
          return 40;
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

    return ["all", ...list];
  }, [matches]);

  const filteredMatches = useMemo(() => {
    return matches.filter((match) => {
      const matchStatus =
        statusFilter === "all" || match.status === statusFilter;
      const matchRound = roundFilter === "all" || match.round === roundFilter;
      return matchStatus && matchRound;
    });
  }, [matches, statusFilter, roundFilter]);

  const sortedMatches = useMemo(() => {
    return [...filteredMatches].sort((a, b) => {
      const getPriority = (status: string) => {
        if (status === "ongoing") return 0;
        if (status === "scheduled") return 1;
        if (status === "finished") return 2;
        return 99;
      };

      const pA = getPriority(a.status);
      const pB = getPriority(b.status);

      if (pA !== pB) {
        return pA - pB;
      }
      // If same status:
      // Recently finished matches first, but live and scheduled matches earliest first
      if (a.status === "finished") {
        return new Date(b.match_date).getTime() - new Date(a.match_date).getTime();
      }
      return new Date(a.match_date).getTime() - new Date(b.match_date).getTime();
    });
  }, [filteredMatches]);

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
      <div className="bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-md p-4 rounded-2xl flex flex-col sm:flex-row gap-4 items-center justify-between relative z-30">
        <div className="flex items-center gap-2 self-start sm:self-center">
          <Filter className="w-4 h-4 text-emerald-500" />
          <span className="text-sm font-bold text-zinc-350">
            Filter Jadwal & Hasil
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {/* Status Filter */}
          <div className="w-full sm:w-44">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: "all", label: "Semua Status" },
                { value: "scheduled", label: "Mendatang" },
                { value: "ongoing", label: "Berlangsung (LIVE)" },
                { value: "finished", label: "Selesai" },
              ]}
              placeholder="Pilih Status"
            />
          </div>

          {/* Round Filter */}
          <div className="w-full sm:w-44">
            <Select
              value={roundFilter}
              onChange={(e) => setRoundFilter(e.target.value)}
              options={rounds.map((r) => ({
                value: r,
                label: r === "all" ? "Semua Babak" : r,
              }))}
              placeholder="Pilih Babak"
            />
          </div>
        </div>
      </div>

      {/* Fixtures Grid */}
      {sortedMatches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-zinc-500 bg-zinc-900/30 rounded-2xl border border-zinc-850">
          <Calendar className="w-10 h-10 mb-2 text-zinc-650" />
          <span className="text-sm">
            Tidak ada jadwal pertandingan yang cocok.
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedMatches.map((match) => (
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
