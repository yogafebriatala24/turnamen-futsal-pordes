import React, { useState, useEffect } from "react";
import type { Match } from "../molecules/MatchCard";
import { Team } from "../../utils/standings";
import {
  createMatch,
  updateMatch,
  deleteMatch,
  updatePlayer,
  Player,
} from "../../services/db";
import { Button } from "../atoms/Button";
import { Input } from "../atoms/Input";
import { Select } from "../atoms/Select";
import { FormField } from "../molecules/FormField";
import { ScheduleList } from "./ScheduleList";
import { Calendar, Plus, X, Award } from "lucide-react";
import { getPlayerSuspensionStatus } from "../../utils/suspensions";

interface AdminMatchManagerProps {
  matches: Match[];
  teams: Team[];
  players: Player[];
  onRefresh: () => void;
}

export const AdminMatchManager: React.FC<AdminMatchManagerProps> = ({
  matches,
  teams,
  players,
  onRefresh,
}) => {
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [homeTeamId, setHomeTeamId] = useState("");
  const [awayTeamId, setAwayTeamId] = useState("");
  const [homeScore, setHomeScore] = useState<string>("");
  const [awayScore, setAwayScore] = useState<string>("");
  const [status, setStatus] = useState<"scheduled" | "ongoing" | "finished">(
    "scheduled",
  );
  const [matchDate, setMatchDate] = useState("");
  const [groupName, setGroupName] = useState("Grup A");
  const [round, setRound] = useState<
    | "Penyisihan"
    | "Perempat Final"
    | "Semi Final"
    | "Perebutan Juara 3"
    | "Final"
  >("Penyisihan");
  const [error, setError] = useState("");
  const [playerGoals, setPlayerGoals] = useState<Record<number, number>>({});
  const [playerOwnGoals, setPlayerOwnGoals] = useState<Record<number, number>>({});
  const [playerYellowCards, setPlayerYellowCards] = useState<Record<number, number>>({});
  const [playerRedCards, setPlayerRedCards] = useState<Record<number, number>>({});

  // Sync player statistics when homeTeamId, awayTeamId or showForm changes
  useEffect(() => {
    if (showForm) {
      const newGoals: Record<number, number> = {};
      const newOwnGoals: Record<number, number> = {};
      const newYellow: Record<number, number> = {};
      const newRed: Record<number, number> = {};
      
      const savedGoals = editingMatch?.player_goals || {};
      const savedYellow = editingMatch?.player_yellow_cards || {};
      const savedRed = editingMatch?.player_red_cards || {};

      players.forEach((player) => {
        if (
          (homeTeamId && player.team_id === Number(homeTeamId)) ||
          (awayTeamId && player.team_id === Number(awayTeamId))
        ) {
          const playerIdStr = String(player.id);
          newGoals[player.id] =
            savedGoals[playerIdStr] !== undefined
              ? Number(savedGoals[playerIdStr])
              : 0;
          newOwnGoals[player.id] =
            savedGoals[`own_${playerIdStr}`] !== undefined
              ? Number(savedGoals[`own_${playerIdStr}`])
              : 0;
          newYellow[player.id] =
            savedYellow[playerIdStr] !== undefined
              ? Number(savedYellow[playerIdStr])
              : 0;
          newRed[player.id] =
            savedRed[playerIdStr] !== undefined
              ? Number(savedRed[playerIdStr])
              : 0;
        }
      });
      setPlayerGoals(newGoals);
      setPlayerOwnGoals(newOwnGoals);
      setPlayerYellowCards(newYellow);
      setPlayerRedCards(newRed);
    } else {
      setPlayerGoals({});
      setPlayerOwnGoals({});
      setPlayerYellowCards({});
      setPlayerRedCards({});
    }
  }, [homeTeamId, awayTeamId, showForm, players, editingMatch]);

  // Automatically determine the match group based on selected round and team groups
  useEffect(() => {
    if (round !== "Penyisihan") {
      setGroupName("Sistem Gugur");
    } else {
      const homeTeam = teams.find((t) => String(t.id) === homeTeamId);
      const awayTeam = teams.find((t) => String(t.id) === awayTeamId);
      if (homeTeam && awayTeam && homeTeam.group_name === awayTeam.group_name) {
        setGroupName(homeTeam.group_name);
      } else if (homeTeam && !awayTeamId) {
        setGroupName(homeTeam.group_name);
      } else if (awayTeam && !homeTeamId) {
        setGroupName(awayTeam.group_name);
      }
    }
  }, [homeTeamId, awayTeamId, round, teams]);

  const adjustGoal = (playerId: number, delta: number) => {
    setPlayerGoals((prev) => ({
      ...prev,
      [playerId]: Math.max(0, (prev[playerId] || 0) + delta),
    }));
  };

  const adjustOwnGoal = (playerId: number, delta: number) => {
    setPlayerOwnGoals((prev) => ({
      ...prev,
      [playerId]: Math.max(0, (prev[playerId] || 0) + delta),
    }));
  };

  const adjustYellowCard = (playerId: number, delta: number) => {
    setPlayerYellowCards((prev) => ({
      ...prev,
      [playerId]: Math.max(0, (prev[playerId] || 0) + delta),
    }));
  };

  const adjustRedCard = (playerId: number, delta: number) => {
    setPlayerRedCards((prev) => ({
      ...prev,
      [playerId]: Math.max(0, (prev[playerId] || 0) + delta),
    }));
  };

  const resetForm = () => {
    setHomeTeamId("");
    setAwayTeamId("");
    setHomeScore("");
    setAwayScore("");
    setStatus("scheduled");
    setMatchDate("");
    setGroupName("Grup A");
    setRound("Penyisihan");
    setEditingMatch(null);
    setShowForm(false);
    setError("");
  };

  const handleEdit = (match: Match) => {
    setEditingMatch(match);
    setHomeTeamId(String(match.home_team_id));
    setAwayTeamId(String(match.away_team_id));
    setHomeScore(match.home_score !== null ? String(match.home_score) : "");
    setAwayScore(match.away_score !== null ? String(match.away_score) : "");
    setStatus(match.status);
    setGroupName(match.group_name);
    setRound(match.round as any);

    // Format ISO string to YYYY-MM-DDTHH:MM for datetime-local input
    if (match.match_date) {
      const date = new Date(match.match_date);
      // Adjust offset to get local time representation
      const tzOffset = date.getTimezoneOffset() * 60000;
      const localISODate = new Date(date.getTime() - tzOffset)
        .toISOString()
        .slice(0, 16);
      setMatchDate(localISODate);
    } else {
      setMatchDate("");
    }

    setShowForm(true);
    // Scroll smoothly to top so the edit form is visible to the admin
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!homeTeamId || !awayTeamId) {
      setError("Kedua tim harus dipilih");
      return;
    }
    if (homeTeamId === awayTeamId) {
      setError("Tim 1 dan Tim 2 tidak boleh sama");
      return;
    }
    if (!matchDate) {
      setError("Tanggal pertandingan harus diisi");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const isScheduled = status === "scheduled";

      // Build the player stats objects mapping player ID string to their counts
      const matchPlayerGoals: Record<string, number> = {};
      const matchPlayerYellow: Record<string, number> = {};
      const matchPlayerRed: Record<string, number> = {};
      
      Object.entries(playerGoals).forEach(([pIdStr, val]) => {
        if (val > 0) matchPlayerGoals[pIdStr] = val;
      });
      Object.entries(playerOwnGoals).forEach(([pIdStr, val]) => {
        if (val > 0) matchPlayerGoals[`own_${pIdStr}`] = val;
      });
      Object.entries(playerYellowCards).forEach(([pIdStr, val]) => {
        if (val > 0) matchPlayerYellow[pIdStr] = val;
      });
      Object.entries(playerRedCards).forEach(([pIdStr, val]) => {
        if (val > 0) matchPlayerRed[pIdStr] = val;
      });

      const payload = {
        home_team_id: Number(homeTeamId),
        away_team_id: Number(awayTeamId),
        home_score: isScheduled || homeScore === "" ? null : Number(homeScore),
        away_score: isScheduled || awayScore === "" ? null : Number(awayScore),
        match_date: new Date(matchDate).toISOString(),
        status,
        group_name: groupName,
        round,
        player_goals: matchPlayerGoals,
        player_yellow_cards: matchPlayerYellow,
        player_red_cards: matchPlayerRed,
      };

      if (editingMatch) {
        await updateMatch(editingMatch.id, payload);
      } else {
        await createMatch(payload);
      }

      // Update players' accumulated goals and cards in the database based on the difference
      const oldPlayerGoals = editingMatch?.player_goals || {};
      const oldPlayerYellow = editingMatch?.player_yellow_cards || {};
      const oldPlayerRed = editingMatch?.player_red_cards || {};
      
      const updates = Object.keys({ ...playerGoals, ...playerYellowCards, ...playerRedCards }).map(
        async (pIdStr) => {
          const playerId = Number(pIdStr);
          const originalPlayer = players.find((p) => p.id === playerId);
          if (originalPlayer) {
            const newG = playerGoals[playerId] || 0;
            const oldG = oldPlayerGoals[pIdStr] !== undefined ? Number(oldPlayerGoals[pIdStr]) : 0;
            const diffG = newG - oldG;

            const newY = playerYellowCards[playerId] || 0;
            const oldY = oldPlayerYellow[pIdStr] !== undefined ? Number(oldPlayerYellow[pIdStr]) : 0;
            const diffY = newY - oldY;

            const newR = playerRedCards[playerId] || 0;
            const oldR = oldPlayerRed[pIdStr] !== undefined ? Number(oldPlayerRed[pIdStr]) : 0;
            const diffR = newR - oldR;

            if (diffG !== 0 || diffY !== 0 || diffR !== 0) {
              await updatePlayer(playerId, {
                goals: Math.max(0, originalPlayer.goals + diffG),
                yellow_cards: Math.max(0, (originalPlayer.yellow_cards || 0) + diffY),
                red_cards: Math.max(0, (originalPlayer.red_cards || 0) + diffR),
              });
            }
          }
        }
      );
      await Promise.all(updates);

      // Handle suspension card resets when match status transitions to/from "finished"
      const oldStatus = editingMatch?.status || "scheduled";
      const newStatus = status;

      if (newStatus === "finished" && oldStatus !== "finished") {
        const teamPlayers = players.filter(
          (p) => p.team_id === Number(homeTeamId) || p.team_id === Number(awayTeamId)
        );
        const resetPromises = teamPlayers.map(async (player) => {
          const suspension = getPlayerSuspensionStatus(
            player.id,
            player.team_id,
            editingMatch?.id || 0,
            matches
          );
          if (suspension.isSuspended) {
            const newY = playerYellowCards[player.id] || 0;
            const oldY = oldPlayerYellow[String(player.id)] !== undefined ? Number(oldPlayerYellow[String(player.id)]) : 0;
            const diffY = newY - oldY;

            const newR = playerRedCards[player.id] || 0;
            const oldR = oldPlayerRed[String(player.id)] !== undefined ? Number(oldPlayerRed[String(player.id)]) : 0;
            const diffR = newR - oldR;

            const baseYellow = Math.max(0, (player.yellow_cards || 0) + diffY);
            const baseRed = Math.max(0, (player.red_cards || 0) + diffR);

            if (suspension.reason === "red_card") {
              await updatePlayer(player.id, { red_cards: Math.max(0, baseRed - 1) });
            } else if (suspension.reason === "yellow_accumulation") {
              await updatePlayer(player.id, { yellow_cards: Math.max(0, baseYellow - 2) });
            }
          }
        });
        await Promise.all(resetPromises);
      } else if (oldStatus === "finished" && newStatus !== "finished") {
        const teamPlayers = players.filter(
          (p) => p.team_id === Number(homeTeamId) || p.team_id === Number(awayTeamId)
        );
        const restorePromises = teamPlayers.map(async (player) => {
          const suspension = getPlayerSuspensionStatus(
            player.id,
            player.team_id,
            editingMatch?.id || 0,
            matches
          );
          if (suspension.isSuspended) {
            const newY = playerYellowCards[player.id] || 0;
            const oldY = oldPlayerYellow[String(player.id)] !== undefined ? Number(oldPlayerYellow[String(player.id)]) : 0;
            const diffY = newY - oldY;

            const newR = playerRedCards[player.id] || 0;
            const oldR = oldPlayerRed[String(player.id)] !== undefined ? Number(oldPlayerRed[String(player.id)]) : 0;
            const diffR = newR - oldR;

            const baseYellow = Math.max(0, (player.yellow_cards || 0) + diffY);
            const baseRed = Math.max(0, (player.red_cards || 0) + diffR);

            if (suspension.reason === "red_card") {
              await updatePlayer(player.id, { red_cards: baseRed + 1 });
            } else if (suspension.reason === "yellow_accumulation") {
              await updatePlayer(player.id, { yellow_cards: baseYellow + 2 });
            }
          }
        });
        await Promise.all(restorePromises);
      }

      resetForm();
      onRefresh();
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan pertandingan");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMatch = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus pertandingan ini?")) {
      return;
    }

    try {
      const matchToDelete = matches.find((m) => m.id === id);
      if (matchToDelete) {
        const matchPlayerGoals = matchToDelete.player_goals || {};
        const matchPlayerYellow = matchToDelete.player_yellow_cards || {};
        const matchPlayerRed = matchToDelete.player_red_cards || {};
        
        const uniquePlayerIds = Array.from(new Set([
          ...Object.keys(matchPlayerGoals),
          ...Object.keys(matchPlayerYellow),
          ...Object.keys(matchPlayerRed)
        ]));

        const revertUpdates = uniquePlayerIds.map(async (pIdStr) => {
          if (pIdStr.startsWith("own_")) return;
          const playerId = Number(pIdStr);
          const originalPlayer = players.find((p) => p.id === playerId);
          if (originalPlayer) {
            const matchG = Number(matchPlayerGoals[pIdStr] || 0);
            const matchY = Number(matchPlayerYellow[pIdStr] || 0);
            const matchR = Number(matchPlayerRed[pIdStr] || 0);
            
            await updatePlayer(playerId, {
              goals: Math.max(0, originalPlayer.goals - matchG),
              yellow_cards: Math.max(0, (originalPlayer.yellow_cards || 0) - matchY),
              red_cards: Math.max(0, (originalPlayer.red_cards || 0) - matchR),
            });
          }
        });
      await Promise.all(revertUpdates);

      // If a finished match is deleted, any served suspensions in this match are now unserved:
      // restore card accumulation back to players
      if (matchToDelete.status === "finished") {
        const teamPlayers = players.filter(
          (p) => p.team_id === matchToDelete.home_team_id || p.team_id === matchToDelete.away_team_id
        );
        const restoreDeletedPromises = teamPlayers.map(async (player) => {
          const suspension = getPlayerSuspensionStatus(
            player.id,
            player.team_id,
            matchToDelete.id,
            matches
          );
          if (suspension.isSuspended) {
            const currentYellow = player.yellow_cards || 0;
            const currentRed = player.red_cards || 0;
            if (suspension.reason === "red_card") {
              await updatePlayer(player.id, { red_cards: currentRed + 1 });
            } else if (suspension.reason === "yellow_accumulation") {
              await updatePlayer(player.id, { yellow_cards: currentYellow + 2 });
            }
          }
        });
        await Promise.all(restoreDeletedPromises);
      }
    }

      await deleteMatch(id);
      onRefresh();
    } catch (err: any) {
      alert("Gagal menghapus pertandingan: " + err.message);
    }
  };

  const teamOptions = teams.map((t) => ({
    value: String(t.id),
    label: `${t.name} (${t.group_name})`,
  }));

  const roundOptions = [
    { value: "Penyisihan", label: "Penyisihan / Fase Grup" },
    { value: "Perempat Final", label: "Perempat Final" },
    { value: "Semi Final", label: "Semi Final" },
    { value: "Perebutan Juara 3", label: "Perebutan Juara 3" },
    { value: "Final", label: "Final" },
  ];

  const statusOptions = [
    { value: "scheduled", label: "Mendatang / Terjadwal" },
    { value: "ongoing", label: "Berlangsung (LIVE)" },
    { value: "finished", label: "Selesai" },
  ];

  const groupOptions = [
    { value: "Grup A", label: "Grup A" },
    { value: "Grup B", label: "Grup B" },
    { value: "Grup C", label: "Grup C" },
    { value: "Grup D", label: "Grup D" },
    { value: "Sistem Gugur", label: "Sistem Gugur / Knockout" },
  ];

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex justify-between items-center bg-zinc-900/40 p-3 sm:p-4 border border-zinc-800 rounded-2xl gap-2">
        <span className="text-[10px] xs:text-xs sm:text-sm font-semibold text-zinc-300 whitespace-nowrap shrink-0">
          Jumlah Pertandingan:{" "}
          <strong className="text-emerald-400 font-extrabold">
            {matches.length}
          </strong>
        </span>
        {!showForm && teams.length >= 2 && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowForm(true)}
            className="text-[10px] xs:text-xs sm:text-xs px-2 xs:px-3 py-1 xs:py-1.5 whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah Jadwal
          </Button>
        )}
        {teams.length < 2 && (
          <span className="text-xs text-rose-450 font-semibold bg-rose-500/10 px-3 py-1.5 rounded-xl border border-rose-500/20">
            Daftarkan minimal 2 tim terlebih dahulu sebelum menjadwalkan
            pertandingan.
          </span>
        )}
      </div>

      {/* Form Dialog/Card */}
      {showForm && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-2xl relative">
          <button
            onClick={resetForm}
            className="absolute top-4 right-4 text-zinc-550 hover:text-zinc-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <h3 className="text-base font-bold text-zinc-150 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-500" />
            {editingMatch ? "Edit Pertandingan" : "Buat Jadwal Baru"}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/25 text-rose-400 rounded-xl text-xs font-semibold">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Tim 1" required>
                <Select
                  value={homeTeamId}
                  onChange={(e) => setHomeTeamId(e.target.value)}
                  options={teamOptions}
                  placeholder="-- Pilih Tim 1 --"
                />
              </FormField>

              <FormField label="Tim 2" required>
                <Select
                  value={awayTeamId}
                  onChange={(e) => setAwayTeamId(e.target.value)}
                  options={teamOptions}
                  placeholder="-- Pilih Tim 2 --"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField label="Status Pertandingan">
                <Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  options={statusOptions}
                />
              </FormField>

              {status !== "scheduled" && (
                <>
                  <FormField label="Skor Tim 1">
                    <Input
                      type="number"
                      min="0"
                      value={homeScore}
                      onChange={(e) => setHomeScore(e.target.value)}
                      placeholder="Skor Tim 1"
                    />
                  </FormField>

                  <FormField label="Skor Tim 2">
                    <Input
                      type="number"
                      min="0"
                      value={awayScore}
                      onChange={(e) => setAwayScore(e.target.value)}
                      placeholder="Skor Tim 2"
                    />
                  </FormField>
                </>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField label="Tanggal & Waktu Pertandingan" required>
                <Input
                  type="datetime-local"
                  value={matchDate}
                  onChange={(e) => setMatchDate(e.target.value)}
                />
              </FormField>

              <FormField label="Babak">
                <Select
                  value={round}
                  onChange={(e) => setRound(e.target.value as any)}
                  options={roundOptions}
                />
              </FormField>

              <FormField label="Grup / Kategori">
                <Select
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  options={groupOptions}
                />
              </FormField>
            </div>

            {/* Goalscorers Management Section */}
            {(homeTeamId || awayTeamId) && (
              <div className="border-t border-zinc-850 pt-4 mt-2 space-y-4">
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-500" />
                  Pencetak Gol & Statistik Pemain (Total Gol)
                </h4>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Team 1 Players */}
                  <div className="bg-zinc-950/40 p-4 border border-zinc-850 rounded-2xl space-y-3">
                    <h5 className="text-xs font-bold text-zinc-350 border-b border-zinc-850/60 pb-1.5 uppercase truncate">
                      {teams.find((t) => String(t.id) === homeTeamId)?.name ||
                        "Tim 1"}
                    </h5>

                    {players.filter((p) => p.team_id === Number(homeTeamId))
                      .length === 0 ? (
                      <p className="text-xs text-zinc-550 italic">
                        Belum ada pemain terdaftar di tim ini.
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                        {players
                          .filter((p) => p.team_id === Number(homeTeamId))
                          .map((player) => {
                            const suspension = getPlayerSuspensionStatus(
                              player.id,
                              player.team_id,
                              editingMatch?.id || 0,
                              matches
                            );
                            return (
                              <div
                                key={player.id}
                                className="flex flex-col py-2.5 border-b border-zinc-900/60 last:border-0 gap-2"
                              >
                                <span className={`text-xs font-semibold flex items-center gap-1.5 min-w-0 ${
                                  suspension.isSuspended ? "text-zinc-650 line-through opacity-60" : "text-zinc-355"
                                }`} title={player.name}>
                                  <span className="truncate">{player.name}</span>
                                  {suspension.isSuspended && (
                                    <span className="text-[7px] font-black text-rose-500 bg-rose-500/10 px-1 py-0.5 rounded border border-rose-500/20 shrink-0">
                                      🚫 SANKSI
                                    </span>
                                  )}
                                </span>
                                <div className="grid grid-cols-4 gap-2 w-full sm:flex sm:items-center sm:justify-start sm:gap-4 sm:w-auto shrink-0 bg-zinc-950/40 sm:bg-transparent p-2 sm:p-0 rounded-xl border border-zinc-850 sm:border-0">
                                  {/* Goals Input */}
                                  <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 bg-zinc-900/30 sm:bg-transparent p-1.5 sm:p-0 rounded-lg border border-zinc-850 sm:border-0 w-full sm:w-auto">
                                    <span className="h-4 flex items-center justify-center text-[8px] sm:text-[10px] text-zinc-500 font-extrabold uppercase select-none tracking-wider text-center">Gol</span>
                                    <div className="flex items-center justify-center gap-1.5 w-full">
                                      <button
                                        type="button"
                                        disabled={suspension.isSuspended}
                                        onClick={() => adjustGoal(player.id, -1)}
                                        className="w-5 h-5 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-750 active:scale-95 transition-all text-xs font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
                                      >
                                        -
                                      </button>
                                      <span className="w-4 text-center text-xs font-bold text-zinc-200">
                                        {playerGoals[player.id] || 0}
                                      </span>
                                      <button
                                        type="button"
                                        disabled={suspension.isSuspended}
                                        onClick={() => adjustGoal(player.id, 1)}
                                        className="w-5 h-5 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-750 active:scale-95 transition-all text-xs font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
                                      >
                                        +
                                      </button>
                                    </div>
                                  </div>

                                  {/* Own Goal Input */}
                                  <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 bg-zinc-900/30 sm:bg-transparent p-1.5 sm:p-0 rounded-lg border border-zinc-850 sm:border-0 w-full sm:w-auto">
                                    <span className="h-4 flex items-center justify-center text-[8px] sm:text-[10px] text-rose-500 font-extrabold uppercase select-none tracking-wider text-center gap-0.5">
                                      OG
                                    </span>
                                    <div className="flex items-center justify-center gap-1.5 w-full">
                                      <button
                                        type="button"
                                        disabled={suspension.isSuspended}
                                        onClick={() => adjustOwnGoal(player.id, -1)}
                                        className="w-5 h-5 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-750 active:scale-95 transition-all text-xs font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
                                      >
                                        -
                                      </button>
                                      <span className="w-4 text-center text-xs font-bold text-zinc-200">
                                        {playerOwnGoals[player.id] || 0}
                                      </span>
                                      <button
                                        type="button"
                                        disabled={suspension.isSuspended}
                                        onClick={() => adjustOwnGoal(player.id, 1)}
                                        className="w-5 h-5 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-750 active:scale-95 transition-all text-xs font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
                                      >
                                        +
                                      </button>
                                    </div>
                                  </div>

                                  {/* Yellow Card Input */}
                                  <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 bg-zinc-900/30 sm:bg-transparent p-1.5 sm:p-0 rounded-lg border border-zinc-850 sm:border-0 w-full sm:w-auto">
                                    <span className="h-4 flex items-center justify-center text-[8px] sm:text-[10px] text-yellow-500 font-extrabold uppercase select-none tracking-wider text-center gap-0.5">
                                      <span className="w-1.5 h-2 bg-yellow-400 rounded-[1px] inline-block shrink-0" />
                                      Kuning
                                    </span>
                                    <div className="flex items-center justify-center gap-1.5 w-full">
                                      <button
                                        type="button"
                                        disabled={suspension.isSuspended}
                                        onClick={() => adjustYellowCard(player.id, -1)}
                                        className="w-5 h-5 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-750 active:scale-95 transition-all text-xs font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
                                      >
                                        -
                                      </button>
                                      <span className="w-4 text-center text-xs font-bold text-zinc-200">
                                        {playerYellowCards[player.id] || 0}
                                      </span>
                                      <button
                                        type="button"
                                        disabled={suspension.isSuspended}
                                        onClick={() => adjustYellowCard(player.id, 1)}
                                        className="w-5 h-5 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-455 hover:text-white hover:bg-zinc-750 active:scale-95 transition-all text-xs font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
                                      >
                                        +
                                      </button>
                                    </div>
                                  </div>

                                  {/* Red Card Input */}
                                  <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 bg-zinc-900/30 sm:bg-transparent p-1.5 sm:p-0 rounded-lg border border-zinc-850 sm:border-0 w-full sm:w-auto">
                                    <span className="h-4 flex items-center justify-center text-[8px] sm:text-[10px] text-rose-500 font-extrabold uppercase select-none tracking-wider text-center gap-0.5">
                                      <span className="w-1.5 h-2 bg-red-500 rounded-[1px] inline-block shrink-0" />
                                      Merah
                                    </span>
                                    <div className="flex items-center justify-center gap-1.5 w-full">
                                      <button
                                        type="button"
                                        disabled={suspension.isSuspended}
                                        onClick={() => adjustRedCard(player.id, -1)}
                                        className="w-5 h-5 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-750 active:scale-95 transition-all text-xs font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
                                      >
                                        -
                                      </button>
                                      <span className="w-4 text-center text-xs font-bold text-zinc-200">
                                        {playerRedCards[player.id] || 0}
                                      </span>
                                      <button
                                        type="button"
                                        disabled={suspension.isSuspended}
                                        onClick={() => adjustRedCard(player.id, 1)}
                                        className="w-5 h-5 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-750 active:scale-95 transition-all text-xs font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
                                      >
                                        +
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>

                  {/* Team 2 Players */}
                  <div className="bg-zinc-950/40 p-4 border border-zinc-850 rounded-2xl space-y-3">
                    <h5 className="text-xs font-bold text-zinc-350 border-b border-zinc-850/60 pb-1.5 uppercase truncate">
                      {teams.find((t) => String(t.id) === awayTeamId)?.name ||
                        "Tim 2"}
                    </h5>

                    {players.filter((p) => p.team_id === Number(awayTeamId))
                      .length === 0 ? (
                      <p className="text-xs text-zinc-550 italic">
                        Belum ada pemain terdaftar di tim ini.
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                        {players
                          .filter((p) => p.team_id === Number(awayTeamId))
                          .map((player) => {
                            const suspension = getPlayerSuspensionStatus(
                              player.id,
                              player.team_id,
                              editingMatch?.id || 0,
                              matches
                            );
                            return (
                              <div
                                key={player.id}
                                className="flex flex-col py-2.5 border-b border-zinc-900/60 last:border-0 gap-2"
                              >
                                <span className={`text-xs font-semibold flex items-center gap-1.5 min-w-0 ${
                                  suspension.isSuspended ? "text-zinc-650 line-through opacity-60" : "text-zinc-355"
                                }`} title={player.name}>
                                  <span className="truncate">{player.name}</span>
                                  {suspension.isSuspended && (
                                    <span className="text-[7px] font-black text-rose-500 bg-rose-500/10 px-1 py-0.5 rounded border border-rose-500/20 shrink-0">
                                      🚫 SANKSI
                                    </span>
                                  )}
                                </span>
                                <div className="grid grid-cols-4 gap-2 w-full sm:flex sm:items-center sm:justify-start sm:gap-4 sm:w-auto shrink-0 bg-zinc-955/40 sm:bg-transparent p-2 sm:p-0 rounded-xl border border-zinc-850 sm:border-0">
                                  {/* Goals Input */}
                                  <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 bg-zinc-900/30 sm:bg-transparent p-1.5 sm:p-0 rounded-lg border border-zinc-850 sm:border-0 w-full sm:w-auto">
                                    <span className="h-4 flex items-center justify-center text-[8px] sm:text-[10px] text-zinc-500 font-extrabold uppercase select-none tracking-wider text-center">Gol</span>
                                    <div className="flex items-center justify-center gap-1.5 w-full">
                                      <button
                                        type="button"
                                        disabled={suspension.isSuspended}
                                        onClick={() => adjustGoal(player.id, -1)}
                                        className="w-5 h-5 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-750 active:scale-95 transition-all text-xs font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
                                      >
                                        -
                                      </button>
                                      <span className="w-4 text-center text-xs font-bold text-zinc-200">
                                        {playerGoals[player.id] || 0}
                                      </span>
                                      <button
                                        type="button"
                                        disabled={suspension.isSuspended}
                                        onClick={() => adjustGoal(player.id, 1)}
                                        className="w-5 h-5 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-750 active:scale-95 transition-all text-xs font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
                                      >
                                        +
                                      </button>
                                    </div>
                                  </div>

                                  {/* Own Goal Input */}
                                  <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 bg-zinc-900/30 sm:bg-transparent p-1.5 sm:p-0 rounded-lg border border-zinc-850 sm:border-0 w-full sm:w-auto">
                                    <span className="h-4 flex items-center justify-center text-[8px] sm:text-[10px] text-rose-500 font-extrabold uppercase select-none tracking-wider text-center gap-0.5">
                                      OG
                                    </span>
                                    <div className="flex items-center justify-center gap-1.5 w-full">
                                      <button
                                        type="button"
                                        disabled={suspension.isSuspended}
                                        onClick={() => adjustOwnGoal(player.id, -1)}
                                        className="w-5 h-5 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-750 active:scale-95 transition-all text-xs font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
                                      >
                                        -
                                      </button>
                                      <span className="w-4 text-center text-xs font-bold text-zinc-200">
                                        {playerOwnGoals[player.id] || 0}
                                      </span>
                                      <button
                                        type="button"
                                        disabled={suspension.isSuspended}
                                        onClick={() => adjustOwnGoal(player.id, 1)}
                                        className="w-5 h-5 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-750 active:scale-95 transition-all text-xs font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
                                      >
                                        +
                                      </button>
                                    </div>
                                  </div>

                                  {/* Yellow Card Input */}
                                  <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 bg-zinc-900/30 sm:bg-transparent p-1.5 sm:p-0 rounded-lg border border-zinc-850 sm:border-0 w-full sm:w-auto">
                                    <span className="h-4 flex items-center justify-center text-[8px] sm:text-[10px] text-yellow-500 font-extrabold uppercase select-none tracking-wider text-center gap-0.5">
                                      <span className="w-1.5 h-2 bg-yellow-400 rounded-[1px] inline-block shrink-0" />
                                      Kuning
                                    </span>
                                    <div className="flex items-center justify-center gap-1.5 w-full">
                                      <button
                                        type="button"
                                        disabled={suspension.isSuspended}
                                        onClick={() => adjustYellowCard(player.id, -1)}
                                        className="w-5 h-5 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-750 active:scale-95 transition-all text-xs font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
                                      >
                                        -
                                      </button>
                                      <span className="w-4 text-center text-xs font-bold text-zinc-200">
                                        {playerYellowCards[player.id] || 0}
                                      </span>
                                      <button
                                        type="button"
                                        disabled={suspension.isSuspended}
                                        onClick={() => adjustYellowCard(player.id, 1)}
                                        className="w-5 h-5 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-450 hover:text-white hover:bg-zinc-750 active:scale-95 transition-all text-xs font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
                                      >
                                        +
                                      </button>
                                    </div>
                                  </div>

                                  {/* Red Card Input */}
                                  <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 bg-zinc-900/30 sm:bg-transparent p-1.5 sm:p-0 rounded-lg border border-zinc-850 sm:border-0 w-full sm:w-auto">
                                    <span className="h-4 flex items-center justify-center text-[8px] sm:text-[10px] text-rose-500 font-extrabold uppercase select-none tracking-wider text-center gap-0.5">
                                      <span className="w-1.5 h-2 bg-red-500 rounded-[1px] inline-block shrink-0" />
                                      Merah
                                    </span>
                                    <div className="flex items-center justify-center gap-1.5 w-full">
                                      <button
                                        type="button"
                                        disabled={suspension.isSuspended}
                                        onClick={() => adjustRedCard(player.id, -1)}
                                        className="w-5 h-5 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-750 active:scale-95 transition-all text-xs font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
                                      >
                                        -
                                      </button>
                                      <span className="w-4 text-center text-xs font-bold text-zinc-200">
                                        {playerRedCards[player.id] || 0}
                                      </span>
                                      <button
                                        type="button"
                                        disabled={suspension.isSuspended}
                                        onClick={() => adjustRedCard(player.id, 1)}
                                        className="w-5 h-5 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-750 active:scale-95 transition-all text-xs font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
                                      >
                                        +
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2.5 pt-2">
              <Button type="button" variant="secondary" onClick={resetForm}>
                Batal
              </Button>
              <Button type="submit" variant="primary" isLoading={isLoading}>
                {editingMatch ? "Simpan Perubahan" : "Buat Pertandingan"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Render the ScheduleList in Admin Mode to list and trigger Edit/Delete */}
      <div>
        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">
          Daftar Pertandingan (Tekan Edit/Hapus untuk Kelola)
        </h4>
        <ScheduleList
          matches={matches}
          players={players}
          isAdmin={true}
          onEdit={handleEdit}
          onDelete={handleDeleteMatch}
        />
      </div>
    </div>
  );
};
