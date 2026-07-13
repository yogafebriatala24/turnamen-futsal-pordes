import React, { useState } from "react";
import { Player, createPlayer, updatePlayer, deletePlayer } from "../../services/db";
import { Team } from "../../utils/standings";
import { Button } from "../atoms/Button";
import { Input } from "../atoms/Input";
import { Select } from "../atoms/Select";
import { FormField } from "../molecules/FormField";
import { User, Plus, Edit2, Trash2, X } from "lucide-react";

interface AdminPlayerManagerProps {
  players: Player[];
  teams: Team[];
  onRefresh: () => void;
}

export const AdminPlayerManager: React.FC<AdminPlayerManagerProps> = ({
  players,
  teams,
  onRefresh,
}) => {
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [teamId, setTeamId] = useState<string>("");
  const [goals, setGoals] = useState<number>(0);
  const [error, setError] = useState("");

  const resetForm = () => {
    setName("");
    setTeamId("");
    setGoals(0);
    setEditingPlayer(null);
    setShowForm(false);
    setError("");
  };

  const handleEdit = (player: Player) => {
    setEditingPlayer(player);
    setName(player.name);
    setTeamId(String(player.team_id));
    setGoals(player.goals);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Nama pemain harus diisi");
      return;
    }
    if (!teamId) {
      setError("Tim harus dipilih");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const payload = {
        name: name.trim(),
        team_id: Number(teamId),
        goals: Number(goals),
      };

      if (editingPlayer) {
        await updatePlayer(editingPlayer.id, payload);
      } else {
        await createPlayer(payload);
      }
      resetForm();
      onRefresh();
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan pemain");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus pemain ini?")) {
      return;
    }

    try {
      await deletePlayer(id);
      onRefresh();
    } catch (err: any) {
      alert("Gagal menghapus pemain: " + err.message);
    }
  };

  const teamOptions = teams.map((t) => ({
    value: String(t.id),
    label: `${t.name} (${t.group_name})`,
  }));

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex justify-between items-center bg-zinc-900/40 p-4 border border-zinc-800 rounded-2xl">
        <span className="text-sm font-semibold text-zinc-300">
          Jumlah Pemain Terdaftar: <strong className="text-emerald-400 font-extrabold">{players.length}</strong>
        </span>
        {!showForm && teams.length > 0 && (
          <Button variant="primary" size="sm" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4" />
            Tambah Pemain
          </Button>
        )}
        {teams.length === 0 && (
          <span className="text-xs text-rose-450 font-semibold bg-rose-500/10 px-3 py-1.5 rounded-xl border border-rose-500/20">
            Daftarkan tim terlebih dahulu sebelum menambahkan pemain.
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
            <User className="w-5 h-5 text-emerald-500" />
            {editingPlayer ? "Edit Data Pemain" : "Tambah Pemain Baru"}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/25 text-rose-400 rounded-xl text-xs font-semibold">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField label="Nama Pemain" required className="md:col-span-1">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Andi Wijaya"
                  autoFocus
                />
              </FormField>

              <FormField label="Asal Tim" required className="md:col-span-1">
                <Select
                  value={teamId}
                  onChange={(e) => setTeamId(e.target.value)}
                  options={teamOptions}
                  placeholder="-- Pilih Tim --"
                />
              </FormField>

              <FormField label="Jumlah Gol" required className="md:col-span-1">
                <Input
                  type="number"
                  min="0"
                  value={goals}
                  onChange={(e) => setGoals(Number(e.target.value))}
                />
              </FormField>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <Button type="button" variant="secondary" onClick={resetForm}>
                Batal
              </Button>
              <Button type="submit" variant="primary" isLoading={isLoading}>
                {editingPlayer ? "Simpan Perubahan" : "Tambah Pemain"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Players List Table / Grid */}
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-[10px] font-bold text-zinc-500 uppercase tracking-wider bg-zinc-950/20">
                <th className="py-3 px-4 w-12 text-center">POS</th>
                <th className="py-3 px-4">NAMA PEMAIN</th>
                <th className="py-3 px-4">TIM</th>
                <th className="py-3 px-4 text-center w-24">GOL</th>
                <th className="py-3 px-4 text-right w-28">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850/50 text-sm text-zinc-300">
              {players.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 px-4 text-center text-zinc-550">
                    Belum ada data pemain terdaftar.
                  </td>
                </tr>
              ) : (
                players.map((player, index) => (
                  <tr key={player.id} className="hover:bg-zinc-800/15">
                    <td className="py-3.5 px-4 text-center text-zinc-500 font-semibold">
                      {index + 1}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-zinc-200">
                      {player.name}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-zinc-400">
                      {player.teams?.name || "Tanpa Tim"}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-lg bg-zinc-850 font-black text-emerald-450 border border-zinc-800 text-xs">
                        {player.goals}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleEdit(player)}
                          className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-350 rounded-lg cursor-pointer transition-colors"
                          title="Edit Goals/Name"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(player.id)}
                          className="p-1.5 bg-rose-950/40 hover:bg-rose-950/75 border border-rose-900/40 text-rose-350 rounded-lg cursor-pointer transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
