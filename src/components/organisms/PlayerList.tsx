import React, { useState, useMemo } from "react";
import { Player } from "../../services/db";
import { Team } from "../../utils/standings";
import { Select } from "../atoms/Select";
import { Users, Shield, Search, X } from "lucide-react";

interface PlayerListProps {
  players: Player[];
  teams: Team[];
  loading?: boolean;
}

export const PlayerList: React.FC<PlayerListProps> = ({
  players,
  teams,
  loading = false,
}) => {
  const [selectedTeamId, setSelectedTeamId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter players by team and search query
  const filteredPlayers = useMemo(() => {
    let list = players;
    if (selectedTeamId !== "all") {
      list = list.filter((p) => p.team_id === Number(selectedTeamId));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    return list;
  }, [players, selectedTeamId, searchQuery]);

  // Only display teams that have matching search players (if search is active)
  const activeTeams = useMemo(() => {
    if (!searchQuery.trim()) return teams;
    const matchingTeamIds = new Set(filteredPlayers.map((p) => p.team_id));
    return teams.filter((t) => matchingTeamIds.has(t.id));
  }, [teams, filteredPlayers, searchQuery]);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 bg-zinc-900/60 rounded-xl w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 6].map((i) => (
            <div key={i} className="h-20 bg-zinc-900/40 rounded-2xl border border-zinc-800" />
          ))}
        </div>
      </div>
    );
  }

  const renderPlayersList = () => {
    if (filteredPlayers.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-zinc-500 bg-zinc-900/30 rounded-2xl border border-zinc-850">
          <Users className="w-10 h-10 mb-2 text-zinc-650" />
          <span className="text-sm">
            {searchQuery ? "Tidak ada nama pemain yang cocok dengan pencarian." : "Tidak ada pemain terdaftar di tim ini."}
          </span>
        </div>
      );
    }

    if (selectedTeamId !== "all") {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {filteredPlayers.map((player) => (
            <div
              key={player.id}
              className="bg-zinc-900/40 border border-zinc-850 p-4 rounded-2xl flex items-center justify-between hover:border-zinc-800 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-zinc-400 text-xs">
                  {player.name.substring(0, 1).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-zinc-200 text-sm">{player.name}</h4>
                  <p className="text-[10px] text-zinc-500 font-medium">Pemain Terdaftar</p>
                </div>
              </div>
              {player.goals > 0 && (
                <span className="text-xs font-bold text-emerald-450 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/15">
                  {player.goals} Gol
                </span>
              )}
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {activeTeams.map((team) => {
          const teamPlayers = filteredPlayers.filter((p) => p.team_id === team.id);

          return (
            <div
              key={team.id}
              className="bg-zinc-900/20 border border-zinc-900 rounded-2xl p-5 space-y-3"
            >
              <div className="flex items-center gap-2 border-b border-zinc-850/50 pb-2">
                <Shield className="w-4 h-4 text-emerald-500" />
                <h3 className="text-sm font-extrabold text-zinc-250 uppercase tracking-wide">
                  {team.name} <span className="text-xs text-zinc-500 font-medium">({team.group_name})</span>
                </h3>
                <span className="ml-auto text-[10px] text-zinc-500 font-semibold bg-zinc-850 px-2.5 py-0.5 rounded-full">
                  {teamPlayers.length} Pemain
                </span>
              </div>

              {teamPlayers.length === 0 ? (
                <p className="text-xs text-zinc-600 italic pl-1">Belum ada pemain yang didaftarkan.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {teamPlayers.map((player) => (
                    <div
                      key={player.id}
                      className="bg-zinc-900/50 border border-zinc-850/60 px-3.5 py-3 rounded-xl flex items-center justify-between hover:border-zinc-800 transition-all"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-zinc-400 text-xs flex-shrink-0">
                          {player.name.substring(0, 1).toUpperCase()}
                        </div>
                        <span className="text-xs font-bold text-zinc-200 truncate">{player.name}</span>
                      </div>
                      {player.goals > 0 && (
                        <span className="text-[10px] font-bold text-emerald-450 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/10 flex-shrink-0">
                          {player.goals} Gol
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Team Selection & Search Bar */}
      <div className="bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-md p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between relative z-30">
        <div className="flex items-center gap-2 self-start md:self-center">
          <Users className="w-4 h-4 text-emerald-500" />
          <span className="text-sm font-bold text-zinc-350">Daftar Pemain Berdasarkan Tim</span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Search Player Name Input */}
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3.5 top-3 w-3.5 h-3.5 text-zinc-550" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama pemain..."
              className="w-full pl-9 pr-8 py-2 bg-zinc-950 border border-zinc-850 hover:border-zinc-800 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl text-xs text-zinc-200 placeholder-zinc-550 transition-all outline-none focus:ring-4"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-3 text-zinc-550 hover:text-zinc-300 cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Team Selector Select */}
          <div className="w-full sm:w-56">
            <Select
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              options={[
                { value: "all", label: "Semua Tim" },
                ...teams.map((t) => ({ value: String(t.id), label: t.name })),
              ]}
              placeholder="Pilih Tim"
            />
          </div>
        </div>
      </div>

      {/* Players List Grid */}
      {renderPlayersList()}
    </div>
  );
};
