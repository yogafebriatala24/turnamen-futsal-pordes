import React, { useState } from "react";
import { Team } from "../../utils/standings";
import { createTeam, updateTeam, deleteTeam } from "../../services/db";
import { Button } from "../atoms/Button";
import { Input } from "../atoms/Input";
import { Select } from "../atoms/Select";
import { FormField } from "../molecules/FormField";
import { Shield, Plus, Edit2, Trash2, X } from "lucide-react";

interface AdminTeamManagerProps {
  teams: Team[];
  onRefresh: () => void;
}

export const AdminTeamManager: React.FC<AdminTeamManagerProps> = ({
  teams,
  onRefresh,
}) => {
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [groupName, setGroupName] = useState("Grup A");
  const [logoUrl, setLogoUrl] = useState("");
  const [error, setError] = useState("");

  const resetForm = () => {
    setName("");
    setGroupName("Grup A");
    setLogoUrl("");
    setEditingTeam(null);
    setShowForm(false);
    setError("");
  };

  const handleEdit = (team: Team) => {
    setEditingTeam(team);
    setName(team.name);
    setGroupName(team.group_name);
    setLogoUrl(team.logo_url || "");
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Nama tim harus diisi");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      if (editingTeam) {
        await updateTeam(editingTeam.id, {
          name: name.trim(),
          group_name: groupName,
          logo_url: logoUrl.trim() || undefined,
        });
      } else {
        await createTeam({
          name: name.trim(),
          group_name: groupName,
          logo_url: logoUrl.trim() || undefined,
        });
      }
      resetForm();
      onRefresh();
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan tim");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (
      !confirm(
        "Apakah Anda yakin ingin menghapus tim ini? Semua pemain dan pertandingan terkait akan terhapus.",
      )
    ) {
      return;
    }

    try {
      await deleteTeam(id);
      onRefresh();
    } catch (err: any) {
      alert("Gagal menghapus tim: " + err.message);
    }
  };

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
          Jumlah Tim Terdaftar:{" "}
          <strong className="text-emerald-400 font-extrabold">
            {teams.length}
          </strong>
        </span>
        {!showForm && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowForm(true)}
            className="text-[10px] xs:text-xs sm:text-xs px-2 xs:px-3 py-1 xs:py-1.5 whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah Tim
          </Button>
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
            <Shield className="w-5 h-5 text-emerald-500" />
            {editingTeam ? "Edit Tim" : "Tambah Tim Baru"}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/25 text-rose-400 rounded-xl text-xs font-semibold">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Nama Tim" required>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: RT 03 F.C."
                  autoFocus
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

            <FormField label="Logo URL (Opsional)">
              <Input
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://example.com/logo.png"
              />
            </FormField>

            <div className="flex justify-end gap-2.5 pt-2">
              <Button type="button" variant="secondary" onClick={resetForm}>
                Batal
              </Button>
              <Button type="submit" variant="primary" isLoading={isLoading}>
                {editingTeam ? "Simpan Perubahan" : "Tambah Tim"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Teams Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {teams.map((team) => (
          <div
            key={team.id}
            className="bg-zinc-900/50 border border-zinc-850 p-4 rounded-2xl flex items-center justify-between hover:border-zinc-800 transition-all duration-200"
          >
            <div className="flex items-center gap-3 min-w-0">
              {team.logo_url ? (
                <img
                  src={team.logo_url}
                  alt={team.name}
                  className="w-10 h-10 object-contain rounded-full bg-zinc-800 p-1"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-zinc-400 text-xs">
                  {team.name.substring(0, 2).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <h4 className="font-bold text-zinc-200 text-sm truncate">
                  {team.name}
                </h4>
                <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded mt-1 inline-block">
                  {team.group_name}
                </span>
              </div>
            </div>

            <div className="flex gap-1.5 shrink-0">
              <button
                onClick={() => handleEdit(team)}
                className="p-2 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 rounded-xl cursor-pointer transition-colors"
                title="Edit"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(team.id)}
                className="p-2 bg-rose-950/40 hover:bg-rose-950/70 border border-rose-900/40 text-rose-350 rounded-xl cursor-pointer transition-colors"
                title="Hapus"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
