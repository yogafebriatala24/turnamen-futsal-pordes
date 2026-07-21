import React, { useState, useMemo } from "react";
import { Player, createPlayer, createPlayersBulk, updatePlayer, deletePlayer } from "../../services/db";
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
  const [namesInput, setNamesInput] = useState("");
  const [teamId, setTeamId] = useState<string>("");
  const [goals, setGoals] = useState<number>(0);
  const [yellowCards, setYellowCards] = useState<number>(0);
  const [redCards, setRedCards] = useState<number>(0);
  const [error, setError] = useState("");

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState("all");
  const [selectedCardFilter, setSelectedCardFilter] = useState("all");

  const filterTeamOptions = useMemo(() => {
    return [
      { value: "all", label: "Semua Tim" },
      ...teams.map((t) => ({ value: String(t.id), label: `${t.name} (${t.group_name})` })),
    ];
  }, [teams]);

  const filterCardOptions = [
    { value: "all", label: "Semua Pemain" },
    { value: "any", label: "Punya Kartu" },
    { value: "yellow", label: "Punya Kartu Kuning" },
    { value: "red", label: "Punya Kartu Merah" },
  ];

  const filteredPlayers = useMemo(() => {
    return players.filter((player) => {
      const matchesName = player.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTeam =
        selectedTeamId === "all" ||
        String(player.team_id) === selectedTeamId;
      const matchesCard =
        selectedCardFilter === "all" ||
        (selectedCardFilter === "any" && ((player.yellow_cards || 0) > 0 || (player.red_cards || 0) > 0)) ||
        (selectedCardFilter === "yellow" && (player.yellow_cards || 0) > 0) ||
        (selectedCardFilter === "red" && (player.red_cards || 0) > 0);
      return matchesName && matchesTeam && matchesCard;
    });
  }, [players, searchQuery, selectedTeamId, selectedCardFilter]);

  const resetForm = () => {
    setName("");
    setNamesInput("");
    setTeamId("");
    setGoals(0);
    setYellowCards(0);
    setRedCards(0);
    setEditingPlayer(null);
    setShowForm(false);
    setError("");
  };

  const handleEdit = (player: Player) => {
    setEditingPlayer(player);
    setName(player.name);
    setTeamId(String(player.team_id));
    setGoals(player.goals);
    setYellowCards(player.yellow_cards || 0);
    setRedCards(player.red_cards || 0);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamId) {
      setError("Tim harus dipilih");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      if (editingPlayer) {
        if (!name.trim()) {
          setError("Nama pemain harus diisi");
          setIsLoading(false);
          return;
        }
        const payload = {
          name: name.trim(),
          team_id: Number(teamId),
          goals: Number(goals),
          yellow_cards: Number(yellowCards),
          red_cards: Number(redCards),
        };
        await updatePlayer(editingPlayer.id, payload);
      } else {
        if (!namesInput.trim()) {
          setError("Nama-nama pemain harus diisi");
          setIsLoading(false);
          return;
        }
        const rawNames = namesInput.split(/[,\n;]+/);
        const playerNames = rawNames
          .map((n) => n.trim())
          .filter((n) => n.length > 0);

        if (playerNames.length === 0) {
          setError("Nama-nama pemain tidak valid");
          setIsLoading(false);
          return;
        }

        const payloads = playerNames.map((pName) => ({
          name: pName,
          team_id: Number(teamId),
          goals: Number(goals),
          yellow_cards: Number(yellowCards),
          red_cards: Number(redCards),
        }));

        await createPlayersBulk(payloads);
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
      <div className="flex justify-between items-center bg-zinc-900/40 p-3 sm:p-4 border border-zinc-800 rounded-2xl gap-2">
        <span className="text-[10px] xs:text-xs sm:text-sm font-semibold text-zinc-300 whitespace-nowrap shrink-0">
          Jumlah Pemain Terdaftar: <strong className="text-emerald-400 font-extrabold">{players.length}</strong>
        </span>
        {!showForm && teams.length > 0 && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowForm(true)}
            className="text-[10px] xs:text-xs sm:text-xs px-2 xs:px-3 py-1 xs:py-1.5 whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
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

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {editingPlayer ? (
                <>
                  <FormField label="Nama Pemain" required className="md:col-span-2">
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

                  <div className="md:col-span-1 grid grid-cols-2 gap-2">
                    <FormField label="K. Kuning" required>
                      <Input
                        type="number"
                        min="0"
                        value={yellowCards}
                        onChange={(e) => setYellowCards(Number(e.target.value))}
                      />
                    </FormField>
                    <FormField label="K. Merah" required>
                      <Input
                        type="number"
                        min="0"
                        value={redCards}
                        onChange={(e) => setRedCards(Number(e.target.value))}
                      />
                    </FormField>
                  </div>
                </>
              ) : (
                <>
                  <FormField label="Nama-nama Pemain (Pisahkan dengan koma atau baris baru)" required className="md:col-span-5">
                    <textarea
                      value={namesInput}
                      onChange={(e) => setNamesInput(e.target.value)}
                      placeholder="Contoh:&#10;Andi Wijaya&#10;Budi Santoso, Candra Kirana&#10;Dedi Kurniawan"
                      rows={4}
                      className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl text-zinc-100 placeholder-zinc-550 text-sm transition-all duration-200 outline-none focus:ring-4"
                      autoFocus
                    />
                  </FormField>

                  <FormField label="Asal Tim" required className="md:col-span-2">
                    <Select
                      value={teamId}
                      onChange={(e) => setTeamId(e.target.value)}
                      options={teamOptions}
                      placeholder="-- Pilih Tim untuk Pemain-Pemain Ini --"
                    />
                  </FormField>

                  <FormField label="Gol Awal" required className="md:col-span-1">
                    <Input
                      type="number"
                      min="0"
                      value={goals}
                      onChange={(e) => setGoals(Number(e.target.value))}
                    />
                  </FormField>

                  <div className="md:col-span-2 grid grid-cols-2 gap-2">
                    <FormField label="K. Kuning Awal" required>
                      <Input
                        type="number"
                        min="0"
                        value={yellowCards}
                        onChange={(e) => setYellowCards(Number(e.target.value))}
                      />
                    </FormField>
                    <FormField label="K. Merah Awal" required>
                      <Input
                        type="number"
                        min="0"
                        value={redCards}
                        onChange={(e) => setRedCards(Number(e.target.value))}
                      />
                    </FormField>
                  </div>
                </>
              )}
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

      {/* Search & Filter Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-zinc-900/40 p-4 border border-zinc-800 rounded-2xl">
        <div className="sm:col-span-2">
          <label className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider block mb-1.5">
            Cari Nama Pemain
          </label>
          <Input
            type="text"
            placeholder="Cari nama pemain..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div>
          <label className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider block mb-1.5">
            Filter Tim
          </label>
          <Select
            value={selectedTeamId}
            onChange={(e) => setSelectedTeamId(e.target.value)}
            options={filterTeamOptions}
            placeholder="Pilih Tim"
          />
        </div>
        <div>
          <label className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider block mb-1.5">
            Filter Kartu
          </label>
          <Select
            value={selectedCardFilter}
            onChange={(e) => setSelectedCardFilter(e.target.value)}
            options={filterCardOptions}
            placeholder="Pilih Kartu"
          />
        </div>
      </div>

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
              {filteredPlayers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 px-4 text-center text-zinc-550">
                    {players.length === 0 ? "Belum ada data pemain terdaftar." : "Pemain tidak ditemukan dengan filter ini."}
                  </td>
                </tr>
              ) : (
                filteredPlayers.map((player, index) => (
                  <tr key={player.id} className="hover:bg-zinc-800/15">
                    <td className="py-3.5 px-4 text-center text-zinc-500 font-semibold">
                      {index + 1}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-zinc-200">
                      <div className="flex items-center gap-2">
                        <span className="truncate">{player.name}</span>
                        <div className="flex gap-1 shrink-0">
                          {player.yellow_cards > 0 && (
                            <div
                              className="w-2.5 h-3.5 bg-yellow-400 border border-yellow-500/20 rounded-[2px] shadow-sm flex items-center justify-center text-[8px] font-black text-yellow-950 select-none"
                              title={`${player.yellow_cards} Kartu Kuning`}
                            >
                              {player.yellow_cards}
                            </div>
                          )}
                          {player.red_cards > 0 && (
                            <div
                              className="w-2.5 h-3.5 bg-red-500 border border-red-600/20 rounded-[2px] shadow-sm flex items-center justify-center text-[8px] font-black text-white select-none"
                              title={`${player.red_cards} Kartu Merah`}
                            >
                              {player.red_cards}
                            </div>
                          )}
                        </div>
                      </div>
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
