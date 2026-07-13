import React from "react";
import { Calendar, Clock, Trophy } from "lucide-react";
import { Badge } from "../atoms/Badge";

export interface Match {
  id: number;
  home_team_id: number;
  away_team_id: number;
  home_score: number | null;
  away_score: number | null;
  match_date: string;
  status: "scheduled" | "ongoing" | "finished";
  group_name: string;
  round: string;
  player_goals?: Record<string, number>;
  teams_home: {
    name: string;
    logo_url?: string;
  };
  teams_away: {
    name: string;
    logo_url?: string;
  };
}

interface MatchCardProps {
  match: Match;
  isAdmin?: boolean;
  onEdit?: (match: Match) => void;
  onDelete?: (id: number) => void;
  onClick?: () => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({
  match,
  isAdmin = false,
  onEdit,
  onDelete,
  onClick,
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ongoing":
        return <Badge variant="danger">LIVE</Badge>;
      case "finished":
        return <Badge variant="info">SELESAI</Badge>;
      default:
        return <Badge variant="warning">MENDATANG</Badge>;
    }
  };

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

  // Helper to render team emblem/initials
  const renderEmblem = (name: string, url?: string) => {
    if (url) {
      return (
        <img
          src={url}
          alt={name}
          className="w-10 h-10 object-contain rounded-full bg-zinc-800 p-1"
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
      <div className="w-10 h-10 rounded-full bg-zinc-850 border border-zinc-750 flex items-center justify-center font-bold text-emerald-405 text-sm tracking-wider">
        {initials}
      </div>
    );
  };

  return (
    <div className="relative overflow-hidden bg-zinc-900/60 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-4 shadow-xl hover:border-zinc-700/60 transition-all duration-300">
      {/* Accent Top Border for Live Matches */}
      {match.status === "ongoing" && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500 animate-pulse" />
      )}

      {/* Header Info */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            {match.round}
          </span>
          <span className="text-zinc-700">•</span>
          <span className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">
            {match.group_name}
          </span>
        </div>
        {getStatusBadge(match.status)}
      </div>

      {/* Teams and Scores row */}
      <div className="grid grid-cols-7 items-center my-2 text-zinc-100">
        {/* Home Team */}
        <div className="col-span-3 flex flex-col items-center text-center gap-1.5">
          {renderEmblem(match.teams_home.name, match.teams_home.logo_url)}
          <span className="text-sm font-semibold tracking-wide truncate max-w-full text-zinc-200">
            {match.teams_home.name}
          </span>
        </div>

        {/* VS / Score */}
        <div className="col-span-1 flex flex-col items-center justify-center">
          {match.status !== "scheduled" ? (
            <div className="flex items-center justify-center gap-1 bg-black/40 px-3 py-1.5 rounded-xl border border-zinc-800">
              <span className="text-base font-extrabold text-white">
                {match.home_score}
              </span>
              <span className="text-xs text-zinc-650 font-medium">:</span>
              <span className="text-base font-extrabold text-white">
                {match.away_score}
              </span>
            </div>
          ) : (
            <div className="text-xs font-bold text-zinc-500 tracking-widest bg-zinc-850 px-2.5 py-1 rounded-lg uppercase">
              VS
            </div>
          )}
        </div>

        {/* Away Team */}
        <div className="col-span-3 flex flex-col items-center text-center gap-1.5">
          {renderEmblem(match.teams_away.name, match.teams_away.logo_url)}
          <span className="text-sm font-semibold tracking-wide truncate max-w-full text-zinc-200">
            {match.teams_away.name}
          </span>
        </div>
      </div>

      {/* Footer Schedule Details */}
      <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-500">
        <div className="flex flex-col gap-1 text-[11px] sm:text-xs">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-zinc-650" />
            <span>{formatDate(match.match_date)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-zinc-650" />
            <span>{formatTime(match.match_date)} WIB</span>
          </div>
        </div>

        {onClick && (
          <button
            onClick={onClick}
            className="px-3.5 py-1.5 bg-zinc-800/60 hover:bg-zinc-850 text-emerald-450 hover:text-emerald-400 text-xs font-bold rounded-xl border border-zinc-800 transition-all cursor-pointer active:scale-95 flex items-center gap-1"
          >
            Detail
          </button>
        )}
      </div>

      {/* Admin Actions overlay/footer */}
      {isAdmin && (
        <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center justify-end gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit && onEdit(match);
            }}
            className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-lg cursor-pointer transition-colors"
          >
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete && onDelete(match.id);
            }}
            className="px-3 py-1 bg-rose-900/40 hover:bg-rose-900/65 text-rose-300 text-xs font-medium rounded-lg cursor-pointer border border-rose-900/45 transition-colors"
          >
            Hapus
          </button>
        </div>
      )}
    </div>
  );
};
