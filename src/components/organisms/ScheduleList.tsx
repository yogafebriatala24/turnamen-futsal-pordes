import React, { useState, useMemo } from "react";
import { MatchCard } from "../molecules/MatchCard";
import type { Match } from "../molecules/MatchCard";
import { Select } from "../atoms/Select";
import { Calendar, Filter, Users, X, Clock, Shield, Download } from "lucide-react";
import { Player } from "../../services/db";
import { getPlayerSuspensionStatus } from "../../utils/suspensions";
import { downloadDayScheduleImage } from "../../utils/imageGenerator";

interface ScheduleListProps {
  matches: Match[];
  players?: Player[];
  loading?: boolean;
  isAdmin?: boolean;
  onEdit?: (match: Match) => void;
  onDelete?: (id: number) => void;
}

export const ScheduleList: React.FC<ScheduleListProps> = ({
  matches,
  players = [],
  loading = false,
  isAdmin = false,
  onEdit,
  onDelete,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roundFilter, setRoundFilter] = useState<string>("all");
  const [selectedMatchForDetail, setSelectedMatchForDetail] =
    useState<Match | null>(null);

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

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
      if (a.status === "finished") {
        return (
          new Date(b.match_date).getTime() - new Date(a.match_date).getTime()
        );
      }
      return (
        new Date(a.match_date).getTime() - new Date(b.match_date).getTime()
      );
    });
  }, [filteredMatches]);

  const groupedMatches = useMemo(() => {
    const groups: { [dateKey: string]: Match[] } = {};
    sortedMatches.forEach((match) => {
      const dateKey = match.match_date.split("T")[0];
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(match);
    });

    return Object.keys(groups)
      .sort((a, b) => {
        const aHasActive = groups[a].some(
          (m) => m.status === "scheduled" || m.status === "ongoing",
        );
        const bHasActive = groups[b].some(
          (m) => m.status === "scheduled" || m.status === "ongoing",
        );

        // Put groups containing active matches (scheduled or ongoing) at the top
        if (aHasActive && !bHasActive) return -1;
        if (!aHasActive && bHasActive) return 1;

        // If both groups contain active matches, sort chronologically ascending (earliest first)
        if (aHasActive && bHasActive) {
          return new Date(a).getTime() - new Date(b).getTime();
        }

        // If both groups contain only finished matches, sort reverse-chronologically (newest first)
        return new Date(b).getTime() - new Date(a).getTime();
      })
      .map((dateKey) => ({
        dateKey,
        matches: groups[dateKey],
      }));
  }, [sortedMatches]);

  const formatHeaderDate = (dateKey: string) => {
    const d = new Date(dateKey);
    return d.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

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
        <div className="space-y-8 animate-in fade-in duration-300">
          {groupedMatches.map(({ dateKey, matches: dayMatches }) => (
            <div key={dateKey} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80 gap-4">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-1.5 h-6 bg-emerald-500 rounded-full animate-pulse shrink-0" />
                  <h3 className="text-sm sm:text-base font-black text-zinc-200 tracking-wide capitalize truncate">
                    {formatHeaderDate(dateKey)}
                  </h3>
                  <span className="text-[10px] sm:text-xs font-bold text-emerald-450 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/15 shrink-0">
                    {dayMatches.length} Laga
                  </span>
                </div>
                
                <button
                  onClick={() => downloadDayScheduleImage(dateKey, dayMatches)}
                  className="shrink-0 px-2.5 py-1 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-white text-[10px] sm:text-xs font-bold rounded-lg border border-zinc-750 transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                  title="Download Poster Jadwal Hari Ini"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Download Poster</span>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dayMatches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    players={players}
                    isAdmin={isAdmin}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onClick={() => setSelectedMatchForDetail(match)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Match Details Modal Pop-up */}
      {selectedMatchForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-lg p-5 shadow-2xl relative max-h-[90vh] overflow-y-auto flex flex-col gap-5 animate-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setSelectedMatchForDetail(null)}
              className="absolute top-4 right-4 text-zinc-550 hover:text-zinc-200 cursor-pointer p-1 hover:bg-zinc-900 rounded-lg transition-colors animate-pulse"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Title Header */}
            <div className="text-center space-y-1">
              <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md uppercase tracking-wider">
                {selectedMatchForDetail.group_name}
              </span>
              <h3 className="text-xs font-semibold text-zinc-550 uppercase tracking-widest mt-1">
                {selectedMatchForDetail.round}
              </h3>
            </div>

            {/* Main Scoreboard VS */}
            <div className="grid grid-cols-7 items-center bg-zinc-900/40 p-4 border border-zinc-900 rounded-2xl">
              {/* Home Team */}
              <div className="col-span-3 flex flex-col items-center text-center gap-1.5 min-w-0">
                {selectedMatchForDetail.teams_home.logo_url ? (
                  <img
                    src={selectedMatchForDetail.teams_home.logo_url}
                    alt={selectedMatchForDetail.teams_home.name}
                    className="w-12 h-12 object-contain rounded-full bg-zinc-800 p-1"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-zinc-850 border border-zinc-750 flex items-center justify-center font-bold text-emerald-405 text-sm tracking-wider shrink-0">
                    {selectedMatchForDetail.teams_home.name
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .substring(0, 2)
                      .toUpperCase()}
                  </div>
                )}
                <span className="text-xs font-bold text-zinc-200 truncate max-w-full">
                  {selectedMatchForDetail.teams_home.name}
                </span>
              </div>

              {/* VS / Score */}
              <div className="col-span-1 flex flex-col items-center justify-center">
                {selectedMatchForDetail.status !== "scheduled" ? (
                  <div className="flex items-center justify-center gap-1 bg-black/40 px-3 py-1.5 rounded-xl border border-zinc-800/80">
                    <span className="text-base font-black text-rose-455">
                      {selectedMatchForDetail.home_score}
                    </span>
                    <span className="text-xs text-zinc-650 font-bold">:</span>
                    <span className="text-base font-black text-rose-455">
                      {selectedMatchForDetail.away_score}
                    </span>
                  </div>
                ) : (
                  <span className="text-[10px] font-black tracking-widest text-zinc-550 bg-zinc-850 px-2 py-0.5 rounded uppercase">
                    VS
                  </span>
                )}
              </div>

              {/* Away Team */}
              <div className="col-span-3 flex flex-col items-center text-center gap-1.5 min-w-0">
                {selectedMatchForDetail.teams_away.logo_url ? (
                  <img
                    src={selectedMatchForDetail.teams_away.logo_url}
                    alt={selectedMatchForDetail.teams_away.name}
                    className="w-12 h-12 object-contain rounded-full bg-zinc-800 p-1"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-zinc-850 border border-zinc-750 flex items-center justify-center font-bold text-emerald-450 text-sm tracking-wider shrink-0">
                    {selectedMatchForDetail.teams_away.name
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .substring(0, 2)
                      .toUpperCase()}
                  </div>
                )}
                <span className="text-xs font-bold text-zinc-200 truncate max-w-full">
                  {selectedMatchForDetail.teams_away.name}
                </span>
              </div>
            </div>

            {/* Time and Date Info */}
            <div className="flex justify-around bg-zinc-900/20 border border-zinc-900 p-3 rounded-xl text-xs text-zinc-400">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                <span>{formatDate(selectedMatchForDetail.match_date)}</span>
              </div>
              <div className="flex items-center gap-1.5 border-l border-zinc-800 pl-4">
                <Clock className="w-3.5 h-3.5 text-emerald-500" />
                <span>{formatTime(selectedMatchForDetail.match_date)} WIB</span>
              </div>
            </div>

            {/* Team Squads Section */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-555 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-500" />
                Skuad & Daftar Pemain
              </h4>

              <div className="grid grid-cols-2 gap-4">
                {/* Team 1 Players */}
                <div className="bg-zinc-900/30 p-3 border border-zinc-900 rounded-2xl space-y-2">
                  <h5 className="text-[10px] font-extrabold text-zinc-350 border-b border-zinc-850 pb-1.5 uppercase truncate">
                    {selectedMatchForDetail.teams_home.name}
                  </h5>
                  {players.filter(
                    (p) => p.team_id === selectedMatchForDetail.home_team_id,
                  ).length === 0 ? (
                    <p className="text-[10px] text-zinc-650 italic">
                      Belum ada pemain.
                    </p>
                  ) : (
                    <ul className="space-y-1 max-h-40 overflow-y-auto pr-1 divide-y divide-zinc-900/40">
                      {players
                        .filter(
                          (p) =>
                            p.team_id === selectedMatchForDetail.home_team_id,
                        )
                        .map((player) => {
                          const suspension = getPlayerSuspensionStatus(
                            player.id,
                            player.team_id,
                            selectedMatchForDetail.id,
                            matches,
                          );
                          const matchGoals = Number(
                            selectedMatchForDetail.player_goals?.[
                              String(player.id)
                            ] || 0,
                          );
                          const matchOwnGoals = Number(
                            selectedMatchForDetail.player_goals?.[
                              `own_${player.id}`
                            ] || 0,
                          );
                          const matchYellow = Number(
                            selectedMatchForDetail.player_yellow_cards?.[
                              String(player.id)
                            ] || 0,
                          );
                          const matchRed = Number(
                            selectedMatchForDetail.player_red_cards?.[
                              String(player.id)
                            ] || 0,
                          );
                          return (
                            <li
                              key={player.id}
                              className="text-xs text-zinc-300 flex items-center justify-between py-1"
                            >
                              <span
                                className={`truncate max-w-[150px] font-medium flex items-center gap-1 min-w-0 ${
                                  suspension.isSuspended
                                    ? "text-zinc-650 line-through opacity-60"
                                    : "text-zinc-200"
                                }`}
                              >
                                <span className="truncate">{player.name}</span>
                                <span className="flex gap-0.5 shrink-0">
                                  {selectedMatchForDetail.status !==
                                    "scheduled" &&
                                    matchYellow > 0 && (
                                      <span
                                        className="w-2 h-3 bg-yellow-400 border border-yellow-500/20 rounded-[1px] shadow-sm flex items-center justify-center text-[7px] font-black text-yellow-955 select-none"
                                        title={`${matchYellow} Kartu Kuning`}
                                      >
                                        {matchYellow}
                                      </span>
                                    )}
                                  {selectedMatchForDetail.status !==
                                    "scheduled" &&
                                    matchRed > 0 && (
                                      <span
                                        className="w-2 h-3 bg-red-500 border border-red-600/20 rounded-[1px] shadow-sm flex items-center justify-center text-[7px] font-black text-white select-none"
                                        title={`${matchRed} Kartu Merah`}
                                      >
                                        {matchRed}
                                      </span>
                                    )}
                                </span>
                              </span>
                              {suspension.isSuspended ? (
                                <span className="text-[7px] font-extrabold text-rose-500 bg-rose-500/10 px-1 py-0.5 rounded border border-rose-500/20 shrink-0">
                                  SANKSI
                                </span>
                              ) : (
                                selectedMatchForDetail.status !== "scheduled" &&
                                (matchGoals > 0 || matchOwnGoals > 0) && (
                                  <div className="flex gap-1">
                                    {matchGoals > 0 && (
                                      <span className="text-[8px] font-bold text-emerald-450 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/10">
                                        {matchGoals} Gol
                                      </span>
                                    )}
                                    {matchOwnGoals > 0 && (
                                      <span className="text-[8px] font-bold text-rose-450 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/10" title="Gol Bunuh Diri">
                                        {matchOwnGoals} GBD
                                      </span>
                                    )}
                                  </div>
                                )
                              )}
                            </li>
                          );
                        })}
                    </ul>
                  )}
                </div>

                {/* Team 2 Players */}
                <div className="bg-zinc-900/30 p-3 border border-zinc-900 rounded-2xl space-y-2">
                  <h5 className="text-[10px] font-extrabold text-zinc-350 border-b border-zinc-850 pb-1.5 uppercase truncate">
                    {selectedMatchForDetail.teams_away.name}
                  </h5>
                  {players.filter(
                    (p) => p.team_id === selectedMatchForDetail.away_team_id,
                  ).length === 0 ? (
                    <p className="text-[10px] text-zinc-650 italic">
                      Belum ada pemain.
                    </p>
                  ) : (
                    <ul className="space-y-1 max-h-40 overflow-y-auto pr-1 divide-y divide-zinc-900/40">
                      {players
                        .filter(
                          (p) =>
                            p.team_id === selectedMatchForDetail.away_team_id,
                        )
                        .map((player) => {
                          const suspension = getPlayerSuspensionStatus(
                            player.id,
                            player.team_id,
                            selectedMatchForDetail.id,
                            matches,
                          );
                          const matchGoals = Number(
                            selectedMatchForDetail.player_goals?.[
                              String(player.id)
                            ] || 0,
                          );
                          const matchOwnGoals = Number(
                            selectedMatchForDetail.player_goals?.[
                              `own_${player.id}`
                            ] || 0,
                          );
                          const matchYellow = Number(
                            selectedMatchForDetail.player_yellow_cards?.[
                              String(player.id)
                            ] || 0,
                          );
                          const matchRed = Number(
                            selectedMatchForDetail.player_red_cards?.[
                              String(player.id)
                            ] || 0,
                          );
                          return (
                            <li
                              key={player.id}
                              className="text-xs text-zinc-300 flex items-center justify-between py-1"
                            >
                              <span
                                className={`truncate max-w-[150px] font-medium flex items-center gap-1 min-w-0 ${
                                  suspension.isSuspended
                                    ? "text-zinc-650 line-through opacity-60"
                                    : "text-zinc-200"
                                }`}
                              >
                                <span className="truncate">{player.name}</span>
                                <span className="flex gap-0.5 shrink-0">
                                  {selectedMatchForDetail.status !==
                                    "scheduled" &&
                                    matchYellow > 0 && (
                                      <span
                                        className="w-2 h-3 bg-yellow-400 border border-yellow-500/20 rounded-[1px] shadow-sm flex items-center justify-center text-[7px] font-black text-yellow-955 select-none"
                                        title={`${matchYellow} Kartu Kuning`}
                                      >
                                        {matchYellow}
                                      </span>
                                    )}
                                  {selectedMatchForDetail.status !==
                                    "scheduled" &&
                                    matchRed > 0 && (
                                      <span
                                        className="w-2 h-3 bg-red-500 border border-red-600/20 rounded-[1px] shadow-sm flex items-center justify-center text-[7px] font-black text-white select-none"
                                        title={`${matchRed} Kartu Merah`}
                                      >
                                        {matchRed}
                                      </span>
                                    )}
                                </span>
                              </span>
                              {suspension.isSuspended ? (
                                <span className="text-[7px] font-extrabold text-rose-500 bg-rose-500/10 px-1 py-0.5 rounded border border-rose-500/20 shrink-0">
                                  SANKSI
                                </span>
                              ) : (
                                selectedMatchForDetail.status !== "scheduled" &&
                                (matchGoals > 0 || matchOwnGoals > 0) && (
                                  <div className="flex gap-1">
                                    {matchGoals > 0 && (
                                      <span className="text-[8px] font-bold text-emerald-450 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/10">
                                        {matchGoals} Gol
                                      </span>
                                    )}
                                    {matchOwnGoals > 0 && (
                                      <span className="text-[8px] font-bold text-rose-450 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/10" title="Gol Bunuh Diri">
                                        {matchOwnGoals} GBD
                                      </span>
                                    )}
                                  </div>
                                )
                              )}
                            </li>
                          );
                        })}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
