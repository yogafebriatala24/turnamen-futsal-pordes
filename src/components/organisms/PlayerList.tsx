import React, { useState, useMemo } from "react";
import { Player } from "../../services/db";
import { Team } from "../../utils/standings";
import { Select } from "../atoms/Select";
import { Users, Shield } from "lucide-react";

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

  const filteredPlayers = useMemo(() => {
    if (selectedTeamId === "all") {
      return players;
    }
    return players.filter((p) => p.team_id === Number(selectedTeamId));
  }, [players, selectedTeamId]);

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

  // Group players by team if "All Teams" is selected, otherwise list them directly
  const renderPlayersList = () => {
    if (filteredPlayers.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-zinc-500 bg-zinc-900/30 rounded-2xl border border-zinc-850">
          <Users className="w-10 h-10 mb-2 text-zinc-650" />
          <span className="text-sm">Tidak ada pemain terdaftar di tim ini.</span>
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

    // Grouping by Team for "All Teams"
    const grouped: Record<number, Player[]> = {};
    players.forEach((p) => {
      if (!grouped[p.team_id]) grouped[p.team_id] = [];
      grouped[p.team_id].push(p);
    });

    return (
      <div className="space-y-6">
        {teams.map((team) => {
          const teamPlayers = grouped[team.id] || [];

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
      {/* Team Selection Bar */}
      <div className="bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-md p-4 rounded-2xl flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 self-start sm:self-center">
          <Users className="w-4 h-4 text-emerald-500" />
          <span className="text-sm font-bold text-zinc-350">Daftar Pemain Berdasarkan Tim</span>
        </div>

        <div className="w-full sm:w-60">
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

      {/* Players List Grid */}
      {renderPlayersList()}
    </div>
  );
};
