import React, { useState, useEffect } from "react";
import type { Match } from "../molecules/MatchCard";
import { StandingRow } from "../../utils/standings";
import { Trophy, Calendar, HelpCircle, ChevronDown, ShieldCheck, AlertCircle, Download } from "lucide-react";
import { downloadKnockoutBracketImage, downloadQualifiedTeamsImage } from "../../utils/imageGenerator";

interface KnockoutBracketProps {
  standings: Record<string, StandingRow[]>;
  matches: Match[];
  loading?: boolean;
}

interface BracketTeam {
  id: number | null;
  name: string;
  logoUrl?: string;
  placeholder: boolean;
}

interface BracketMatch {
  id: string;
  round: string;
  teamHome: BracketTeam;
  teamAway: BracketTeam;
  dbMatch?: Match;
}

export const KnockoutBracket: React.FC<KnockoutBracketProps> = ({
  standings,
  matches,
  loading = false,
}) => {
  const [hoveredTeamId, setHoveredTeamId] = useState<number | null>(null);
  const [mobileStage, setMobileStage] = useState<"qf" | "sf" | "finals">("qf");
  const [isDesktop, setIsDesktop] = useState(false);
  const [isOpenMode, setIsOpenMode] = useState(false);
  const [viewMode, setViewMode] = useState<"bracket" | "list">("bracket");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleResize = () => {
        setIsDesktop(window.innerWidth >= 640);
      };
      handleResize();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-4 animate-pulse">
        <div className="h-5 w-48 bg-zinc-800 rounded mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-zinc-900/40 rounded-2xl p-4 border border-zinc-800 space-y-4">
              <div className="h-4 bg-zinc-800 rounded w-24 mb-2" />
              {[1, 2].map((j) => (
                <div key={j} className="h-24 bg-zinc-800/40 rounded-xl" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  const groupA = standings["Grup A"] || [];
  const groupB = standings["Grup B"] || [];

  // Helper to determine if a team is mathematically guaranteed to finish in the top 4 of their group
  const isGuaranteedToQualify = (group: StandingRow[], teamId: number | null) => {
    if (teamId === null) return false;
    const team = group.find((t) => t.teamId === teamId);
    if (!team) return false;

    // Each team plays exactly 5 matches in the group stage (round robin of 6 teams).
    // Calculate the maximum possible points each other team can get
    const otherMaxPoints = group
      .filter((t) => t.teamId !== teamId)
      .map((t) => {
        const remainingMatches = Math.max(0, 5 - t.played);
        return t.points + remainingMatches * 3;
      });

    // Sort in descending order
    otherMaxPoints.sort((a, b) => b - a);

    // m4 is the 4th highest maximum possible points among other teams (index 3 in 0-indexed array)
    const m4 = otherMaxPoints[3] ?? 0;

    // If the team's current points are strictly greater than the 4th highest max points of others,
    // they are mathematically guaranteed to finish in the top 4 (cannot be overtaken to finish 5th or 6th).
    return team.points > m4;
  };

  const getTeamAtPosition = (group: StandingRow[], index: number, placeholder: string) => {
    if (group && group[index]) {
      const teamId = group[index].teamId;
      if (isGuaranteedToQualify(group, teamId)) {
        return {
          id: teamId,
          name: group[index].name,
          logoUrl: group[index].logoUrl,
          placeholder: false,
        };
      }
    }
    return {
      id: null,
      name: placeholder,
      logoUrl: undefined,
      placeholder: true,
    };
  };

  // Qualified Teams from Group A & B
  const a1 = getTeamAtPosition(groupA, 0, "Juara Grup A");
  const a2 = getTeamAtPosition(groupA, 1, "Runner-up Grup A");
  const a3 = getTeamAtPosition(groupA, 2, "Peringkat 3 Grup A");
  const a4 = getTeamAtPosition(groupA, 3, "Peringkat 4 Grup A");

  const b1 = getTeamAtPosition(groupB, 0, "Juara Grup B");
  const b2 = getTeamAtPosition(groupB, 1, "Runner-up Grup B");
  const b3 = getTeamAtPosition(groupB, 2, "Peringkat 3 Grup B");
  const b4 = getTeamAtPosition(groupB, 3, "Peringkat 4 Grup B");

  // 1. Quarterfinals
  const qfMatches: BracketMatch[] = [
    { id: "qf1", round: "Perempat Final", teamHome: a1, teamAway: b4 },
    { id: "qf2", round: "Perempat Final", teamHome: b2, teamAway: a3 },
    { id: "qf3", round: "Perempat Final", teamHome: b1, teamAway: a4 },
    { id: "qf4", round: "Perempat Final", teamHome: a2, teamAway: b3 },
  ];

  // Map Perempat Final matches from DB
  qfMatches.forEach((qf) => {
    let m = matches.find(
      (m) =>
        m.round === "Perempat Final" &&
        ((qf.teamHome.id && (m.home_team_id === qf.teamHome.id || m.away_team_id === qf.teamHome.id)) ||
         (qf.teamAway.id && (m.home_team_id === qf.teamAway.id || m.away_team_id === qf.teamAway.id)))
    );

    if (m) {
      qf.dbMatch = m;
      qf.teamHome = {
        id: m.home_team_id,
        name: m.teams_home?.name || `Tim ${m.home_team_id}`,
        logoUrl: m.teams_home?.logo_url,
        placeholder: false,
      };
      qf.teamAway = {
        id: m.away_team_id,
        name: m.teams_away?.name || `Tim ${m.away_team_id}`,
        logoUrl: m.teams_away?.logo_url,
        placeholder: false,
      };
    }
  });

  const getWinner = (bracketMatch: BracketMatch, defaultName: string) => {
    const m = bracketMatch.dbMatch;
    if (m && m.status === "finished" && m.home_score !== null && m.away_score !== null) {
      if (m.home_score > m.away_score) {
        return {
          id: m.home_team_id,
          name: m.teams_home?.name || `Tim ${m.home_team_id}`,
          logoUrl: m.teams_home?.logo_url,
          placeholder: false,
        };
      } else if (m.away_score > m.home_score) {
        return {
          id: m.away_team_id,
          name: m.teams_away?.name || `Tim ${m.away_team_id}`,
          logoUrl: m.teams_away?.logo_url,
          placeholder: false,
        };
      }
    }
    return {
      id: null,
      name: defaultName,
      logoUrl: undefined,
      placeholder: true,
    };
  };

  const getLoser = (bracketMatch: BracketMatch, defaultName: string) => {
    const m = bracketMatch.dbMatch;
    if (m && m.status === "finished" && m.home_score !== null && m.away_score !== null) {
      if (m.home_score < m.away_score) {
        return {
          id: m.home_team_id,
          name: m.teams_home?.name || `Tim ${m.home_team_id}`,
          logoUrl: m.teams_home?.logo_url,
          placeholder: false,
        };
      } else if (m.away_score < m.home_score) {
        return {
          id: m.away_team_id,
          name: m.teams_away?.name || `Tim ${m.away_team_id}`,
          logoUrl: m.teams_away?.logo_url,
          placeholder: false,
        };
      }
    }
    return {
      id: null,
      name: defaultName,
      logoUrl: undefined,
      placeholder: true,
    };
  };

  // 2. Semifinals
  const sf1Home = getWinner(qfMatches[0], "Pemenang QF 1");
  const sf1Away = getWinner(qfMatches[1], "Pemenang QF 2");
  const sf2Home = getWinner(qfMatches[2], "Pemenang QF 3");
  const sf2Away = getWinner(qfMatches[3], "Pemenang QF 4");

  const sfMatches: BracketMatch[] = [
    { id: "sf1", round: "Semi Final", teamHome: sf1Home, teamAway: sf1Away },
    { id: "sf2", round: "Semi Final", teamHome: sf2Home, teamAway: sf2Away },
  ];

  sfMatches.forEach((sf) => {
    let m = matches.find(
      (m) =>
        m.round === "Semi Final" &&
        ((sf.teamHome.id && (m.home_team_id === sf.teamHome.id || m.away_team_id === sf.teamHome.id)) ||
         (sf.teamAway.id && (m.home_team_id === sf.teamAway.id || m.away_team_id === sf.teamAway.id)))
    );

    if (m) {
      sf.dbMatch = m;
      sf.teamHome = {
        id: m.home_team_id,
        name: m.teams_home?.name || `Tim ${m.home_team_id}`,
        logoUrl: m.teams_home?.logo_url,
        placeholder: false,
      };
      sf.teamAway = {
        id: m.away_team_id,
        name: m.teams_away?.name || `Tim ${m.away_team_id}`,
        logoUrl: m.teams_away?.logo_url,
        placeholder: false,
      };
    }
  });

  // 3. Finals
  const finalHome = getWinner(sfMatches[0], "Pemenang SF 1");
  const finalAway = getWinner(sfMatches[1], "Pemenang SF 2");

  const thirdHome = getLoser(sfMatches[0], "Kalah SF 1");
  const thirdAway = getLoser(sfMatches[1], "Kalah SF 2");

  const finalMatch: BracketMatch = { id: "final", round: "Final", teamHome: finalHome, teamAway: finalAway };
  const thirdMatch: BracketMatch = { id: "third", round: "Perebutan Juara 3", teamHome: thirdHome, teamAway: thirdAway };

  const finalPairs = [finalMatch, thirdMatch];

  finalPairs.forEach((fp) => {
    let m = matches.find(
      (m) =>
        m.round === fp.round &&
        ((fp.teamHome.id && (m.home_team_id === fp.teamHome.id || m.away_team_id === fp.teamHome.id)) ||
         (fp.teamAway.id && (m.home_team_id === fp.teamAway.id || m.away_team_id === fp.teamAway.id)))
    );

    if (m) {
      fp.dbMatch = m;
      fp.teamHome = {
        id: m.home_team_id,
        name: m.teams_home?.name || `Tim ${m.home_team_id}`,
        logoUrl: m.teams_home?.logo_url,
        placeholder: false,
      };
      fp.teamAway = {
        id: m.away_team_id,
        name: m.teams_away?.name || `Tim ${m.away_team_id}`,
        logoUrl: m.teams_away?.logo_url,
        placeholder: false,
      };
    }
  });

  const renderTeamEmblem = (team: BracketTeam) => {
    if (!team.placeholder && team.logoUrl) {
      return (
        <img
          src={team.logoUrl}
          alt={team.name}
          className="w-5 h-5 object-contain rounded-full bg-zinc-800 p-0.5"
        />
      );
    }
    const initials = team.placeholder
      ? "?"
      : team.name
          .split(" ")
          .map((w) => w[0])
          .join("")
          .substring(0, 2)
          .toUpperCase();

    return (
      <div className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-[8px] text-zinc-500 flex-shrink-0">
        {initials}
      </div>
    );
  };

  const renderMatchCard = (bMatch: BracketMatch) => {
    const dbm = bMatch.dbMatch;
    const isFinished = dbm?.status === "finished";
    const isOngoing = dbm?.status === "ongoing";
    const homeScore = dbm?.home_score;
    const awayScore = dbm?.away_score;

    const isHomeHovered = bMatch.teamHome.id !== null && hoveredTeamId === bMatch.teamHome.id;
    const isAwayHovered = bMatch.teamAway.id !== null && hoveredTeamId === bMatch.teamAway.id;

    const isHomeWinner = isFinished && typeof homeScore === "number" && typeof awayScore === "number" && homeScore > awayScore;
    const isAwayWinner = isFinished && typeof homeScore === "number" && typeof awayScore === "number" && awayScore > homeScore;

    return (
      <div
        className={`bg-zinc-950/80 border rounded-xl overflow-hidden transition-all duration-300 w-[190px] sm:w-[210px] shrink-0 shadow-lg ${
          isOngoing
            ? "border-rose-500/50 ring-1 ring-rose-500/20 animate-pulse"
            : isHomeHovered || isAwayHovered
            ? "border-emerald-500 shadow-emerald-950/20 scale-[1.03]"
            : "border-zinc-800/80 hover:border-zinc-700"
        }`}
      >
        {/* Match Card Header */}
        <div className="bg-zinc-900/60 px-3 py-1 border-b border-zinc-850 flex items-center justify-between text-[8px] sm:text-[9px] font-bold text-zinc-500">
          <span className="uppercase tracking-wider">
            {bMatch.round === "Perebutan Juara 3" ? "Juara 3" : bMatch.round}
          </span>
          {dbm ? (
            isOngoing ? (
              <span className="text-rose-500 font-extrabold animate-pulse">LIVE</span>
            ) : isFinished ? (
              <span className="text-zinc-550">SELESAI</span>
            ) : (
              <span className="text-emerald-500">
                {new Date(dbm.match_date).toLocaleDateString("id-ID", {
                  weekday: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )
          ) : (
            <span className="text-zinc-650 italic font-normal flex items-center gap-0.5">
              <HelpCircle className="w-2.5 h-2.5" /> Proyeksi
            </span>
          )}
        </div>

        {/* Team Nodes */}
        <div className="p-2 space-y-1 bg-zinc-950/40">
          {/* Home Team Row */}
          <div
            className={`flex items-center justify-between p-1.5 rounded-md transition-all cursor-pointer ${
              isHomeHovered ? "bg-emerald-500/10 text-white" : "hover:bg-zinc-900/40"
            }`}
            onMouseEnter={() => bMatch.teamHome.id && setHoveredTeamId(bMatch.teamHome.id)}
            onMouseLeave={() => setHoveredTeamId(null)}
          >
            <div className="flex items-center gap-2 min-w-0">
              {renderTeamEmblem(bMatch.teamHome)}
              <span
                className={`text-[11px] font-bold truncate ${
                  bMatch.teamHome.placeholder
                    ? "text-zinc-600 italic font-medium"
                    : isHomeWinner
                    ? "text-emerald-400"
                    : isFinished
                    ? "text-zinc-500"
                    : "text-zinc-200"
                }`}
              >
                {bMatch.teamHome.name}
              </span>
            </div>
            {dbm && (isFinished || isOngoing) && (
              <span
                className={`text-[11px] font-extrabold px-1.5 py-0.5 rounded ${
                  isHomeWinner ? "bg-emerald-500/20 text-emerald-400" : "text-zinc-500"
                }`}
              >
                {homeScore ?? 0}
              </span>
            )}
          </div>

          {/* Separation Divider */}
          <div className="h-[1px] bg-zinc-900/60" />

          {/* Away Team Row */}
          <div
            className={`flex items-center justify-between p-1.5 rounded-md transition-all cursor-pointer ${
              isAwayHovered ? "bg-emerald-500/10 text-white" : "hover:bg-zinc-900/40"
            }`}
            onMouseEnter={() => bMatch.teamAway.id && setHoveredTeamId(bMatch.teamAway.id)}
            onMouseLeave={() => setHoveredTeamId(null)}
          >
            <div className="flex items-center gap-2 min-w-0">
              {renderTeamEmblem(bMatch.teamAway)}
              <span
                className={`text-[11px] font-bold truncate ${
                  bMatch.teamAway.placeholder
                    ? "text-zinc-600 italic font-medium"
                    : isAwayWinner
                    ? "text-emerald-400"
                    : isFinished
                    ? "text-zinc-500"
                    : "text-zinc-200"
                }`}
              >
                {bMatch.teamAway.name}
              </span>
            </div>
            {dbm && (isFinished || isOngoing) && (
              <span
                className={`text-[11px] font-extrabold px-1.5 py-0.5 rounded ${
                  isAwayWinner ? "bg-emerald-500/20 text-emerald-400" : "text-zinc-500"
                }`}
              >
                {awayScore ?? 0}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderQualifiedTeamsList = () => {
    const renderGroupTeams = (groupName: string, groupData: StandingRow[]) => {
      return (
        <div className="bg-zinc-900/30 border border-zinc-900 rounded-2xl p-4 space-y-4">
          <h3 className="text-sm font-extrabold uppercase tracking-widest text-emerald-450 border-b border-zinc-850 pb-2 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-emerald-505" />
            {groupName}
          </h3>
          <div className="space-y-3">
            {[0, 1, 2, 3].map((rankIndex) => {
              const team = groupData[rankIndex];
              const guaranteed = team ? isGuaranteedToQualify(groupData, team.teamId) : false;

              if (team && guaranteed) {
                return (
                  <div 
                    key={team.teamId}
                    className="flex items-center justify-between p-3 bg-zinc-950/60 border border-zinc-850 rounded-xl hover:border-zinc-800 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-5 h-5 flex items-center justify-center bg-zinc-900 border border-zinc-850 rounded-md text-[10px] font-black text-zinc-450 shrink-0">
                        {rankIndex + 1}
                      </span>
                      {team.logoUrl ? (
                        <img src={team.logoUrl} alt={team.name} className="w-6 h-6 object-contain shrink-0" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[10px] font-black text-zinc-550 shrink-0">
                          {team.name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <span className="text-xs font-bold text-zinc-205 truncate">{team.name}</span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[10px] text-zinc-500 font-bold bg-zinc-900/80 px-2 py-1 rounded border border-zinc-855">
                        {team.points} Pts
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Lolos
                      </span>
                    </div>
                  </div>
                );
              } else {
                return (
                  <div 
                    key={`empty-${rankIndex}`}
                    className="flex items-center justify-between p-3 bg-zinc-950/20 border border-zinc-900/60 border-dashed rounded-xl opacity-60"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-5 h-5 flex items-center justify-center bg-zinc-900/50 border border-zinc-850 rounded-md text-[10px] font-black text-zinc-650 shrink-0">
                        {rankIndex + 1}
                      </span>
                      <div className="w-6 h-6 rounded-full bg-zinc-900/50 border border-zinc-850 flex items-center justify-center text-[10px] font-black text-zinc-700 shrink-0">
                        ?
                      </div>
                      <span className="text-xs font-medium text-zinc-500 italic">Peringkat {rankIndex + 1} ({groupName})</span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-extrabold bg-zinc-900/50 text-zinc-550 border border-zinc-850 uppercase tracking-wider">
                        Menunggu
                      </span>
                    </div>
                  </div>
                );
              }
            })}
          </div>
        </div>
      );
    };

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderGroupTeams("Grup A", groupA)}
        {renderGroupTeams("Grup B", groupB)}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header bar containing Banner and Dropdown */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Informative Header Banner */}
        <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-md flex items-start gap-3 grow">
          <Trophy className="w-5 h-5 text-emerald-450 shrink-0 mt-0.5" />
          <div className="text-xs text-zinc-400 space-y-1">
            <h4 className="font-extrabold text-zinc-200 uppercase tracking-wide">
              Bagan Fase Gugur (Sistem Silang)
            </h4>
            <p>
              Format mempertemukan tim secara silang antar grup: Juara Grup vs Peringkat 4 Grup Lain,
              dan Runner-up vs Peringkat 3 Grup Lain.
            </p>
          </div>
        </div>

        {/* Action Buttons (Dropdown & Download) */}
        <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
          {/* Dropdown Selector */}
          <div className="relative">
            <button
              onClick={() => setIsOpenMode(!isOpenMode)}
              className="flex items-center justify-between gap-2 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 rounded-xl text-xs font-bold text-zinc-200 transition-all cursor-pointer shadow-lg w-48"
            >
              <span>{viewMode === "bracket" ? "🌳 MODE BAGAN" : "📋 TIM YANG LOLOS"}</span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-450 transition-transform duration-200" style={{ transform: isOpenMode ? "rotate(180deg)" : "rotate(0deg)" }} />
            </button>
            
            {isOpenMode && (
              <>
                {/* Overlay to close when clicking outside */}
                <div className="fixed inset-0 z-40" onClick={() => setIsOpenMode(false)} />
                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl z-50 p-1.5 space-y-1">
                  <button
                    onClick={() => {
                      setViewMode("bracket");
                      setIsOpenMode(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                      viewMode === "bracket"
                        ? "bg-emerald-500/10 text-emerald-450 font-black"
                        : "text-zinc-400 hover:bg-zinc-850 hover:text-zinc-200"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" style={{ opacity: viewMode === "bracket" ? 1 : 0 }} />
                    🌳 Bagan Fase Gugur
                  </button>
                  <button
                    onClick={() => {
                      setViewMode("list");
                      setIsOpenMode(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                      viewMode === "list"
                        ? "bg-emerald-500/10 text-emerald-450 font-black"
                        : "text-zinc-450 hover:bg-zinc-850 hover:text-zinc-200"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" style={{ opacity: viewMode === "list" ? 1 : 0 }} />
                    📋 Daftar Tim Lolos
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Download Poster Button */}
          <button
            onClick={() => {
              if (viewMode === "bracket") {
                downloadKnockoutBracketImage(qfMatches, sfMatches, finalMatch, thirdMatch);
              } else {
                downloadQualifiedTeamsImage(groupA, groupB);
              }
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 border border-emerald-400/20 hover:border-emerald-500/25 rounded-xl text-xs font-extrabold text-zinc-950 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-emerald-500/10 shadow-emerald-500/10"
          >
            <Download className="w-3.5 h-3.5 text-zinc-950" />
            <span>UNDUH POSTER</span>
          </button>
        </div>
      </div>

      {viewMode === "list" ? (
        renderQualifiedTeamsList()
      ) : (
        <>
          {groupA.length === 0 && groupB.length === 0 && (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 text-yellow-550 rounded-xl text-xs font-bold text-center">
              Klasemen penyisihan grup belum memiliki data. Bagan di bawah menampilkan tim proyeksi (TBD). Anda dapat mengisi jadwal & hasil grup terlebih dahulu.
            </div>
          )}

          {/* Mobile Selector (tabs) */}
          <div 
            className="p-1 bg-zinc-950 border border-zinc-850 rounded-xl"
            style={{ display: isDesktop ? "none" : "flex" }}
          >
            <button
              onClick={() => setMobileStage("qf")}
              className={`flex-1 py-2 text-[10px] uppercase font-bold rounded-lg transition-all ${
                mobileStage === "qf" ? "bg-zinc-800 text-white" : "text-zinc-550"
              }`}
            >
              Perempat
            </button>
            <button
              onClick={() => setMobileStage("sf")}
              className={`flex-1 py-2 text-[10px] uppercase font-bold rounded-lg transition-all ${
                mobileStage === "sf" ? "bg-zinc-800 text-white" : "text-zinc-550"
              }`}
            >
              Semifinal
            </button>
            <button
              onClick={() => setMobileStage("finals")}
              className={`flex-1 py-2 text-[10px] uppercase font-bold rounded-lg transition-all ${
                mobileStage === "finals" ? "bg-zinc-800 text-white" : "text-zinc-550"
              }`}
            >
              Final
            </button>
          </div>

          {/* Desktop Visual Bracket Tree */}
          <div 
            className="w-full max-w-5xl mx-auto py-8"
            style={{ 
              display: isDesktop ? "flex" : "none",
              flexDirection: "row",
              flexWrap: "nowrap",
              alignItems: "center",
              justifyContent: "center",
              gap: "0px"
            }}
          >
            {/* COLUMN 1: QUARTERFINALS & SEMIFINALS (Connected Tree) */}
            <div className="flex flex-col justify-between relative shrink-0 w-fit" style={{ height: "540px" }}>
              {/* Top Half: QF1 + QF2 -> SF1 */}
              <div className="flex items-center gap-0">
                <div className="flex flex-col justify-between py-2 relative shrink-0 w-fit" style={{ height: "240px" }}>
                  <div className="flex items-center justify-end w-full">
                    {renderMatchCard(qfMatches[0])}
                    <div className="w-6 h-[2px] bg-zinc-800/80" />
                  </div>
                  <div className="flex items-center justify-end w-full">
                    {renderMatchCard(qfMatches[1])}
                    <div className="w-6 h-[2px] bg-zinc-800/80" />
                  </div>
                  <div className="absolute right-0 w-[2px] bg-zinc-800/80" style={{ top: "50px", bottom: "50px" }} />
                </div>
                <div className="w-6 h-[2px] bg-zinc-800/80 shrink-0" />
                <div className="flex items-center">
                  {renderMatchCard(sfMatches[0])}
                  <div className="w-6 h-[2px] bg-zinc-800/80" />
                </div>
              </div>

              {/* Bottom Half: QF3 + QF4 -> SF2 */}
              <div className="flex items-center gap-0">
                <div className="flex flex-col justify-between py-2 relative shrink-0 w-fit" style={{ height: "240px" }}>
                  <div className="flex items-center justify-end w-full">
                    {renderMatchCard(qfMatches[2])}
                    <div className="w-6 h-[2px] bg-zinc-800/80" />
                  </div>
                  <div className="flex items-center justify-end w-full">
                    {renderMatchCard(qfMatches[3])}
                    <div className="w-6 h-[2px] bg-zinc-800/80" />
                  </div>
                  <div className="absolute right-0 w-[2px] bg-zinc-800/80" style={{ top: "50px", bottom: "50px" }} />
                </div>
                <div className="w-6 h-[2px] bg-zinc-800/80 shrink-0" />
                <div className="flex items-center">
                  {renderMatchCard(sfMatches[1])}
                  <div className="w-6 h-[2px] bg-zinc-800/80" />
                </div>
              </div>

              <div className="absolute right-0 w-[2px] bg-zinc-800/80" style={{ top: "125px", bottom: "125px" }} />
            </div>

            <div className="w-12 h-[2px] bg-zinc-800/80 shrink-0" />

            {/* COLUMN 2: GRAND FINAL & THIRD PLACE PLAYOFF (Absolutely Positioned) */}
            <div className="relative shrink-0" style={{ height: "540px", width: "210px" }}>
              <div 
                className="absolute left-0 w-full border border-emerald-500/20 bg-emerald-950/5 p-1 rounded-2xl shadow-xl shrink-0"
                style={{ top: "50%", transform: "translateY(-50%)" }}
              >
                <div className="bg-emerald-500/10 text-emerald-450 text-[8px] tracking-wider uppercase font-black py-0.5 rounded-t-xl text-center">
                  🏆 GRAND FINAL 🏆
                </div>
                {renderMatchCard(finalMatch)}
              </div>

              <div 
                className="absolute left-0 w-full border border-zinc-800 bg-zinc-900/10 p-1 rounded-2xl shrink-0"
                style={{ bottom: "24px" }}
              >
                <div className="text-zinc-450 text-[8px] tracking-wider uppercase font-bold py-0.5 rounded-t-xl text-center">
                  🥉 PEREBUTAN JUARA 3 🥉
                </div>
                {renderMatchCard(thirdMatch)}
              </div>
            </div>
          </div>

          {/* Mobile Bracket View (Shown only on small screens) */}
          <div 
            className="space-y-4"
            style={{ display: isDesktop ? "none" : "block" }}
          >
            {mobileStage === "qf" && (
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 pb-1.5 border-b border-zinc-800 mb-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-3 bg-emerald-500 rounded" />
                  Perempat Final
                </h3>
                <div className="flex flex-col gap-3 items-center">
                  {qfMatches.map((m) => (
                    <div key={m.id} className="w-full flex justify-center">{renderMatchCard(m)}</div>
                  ))}
                </div>
              </div>
            )}

            {mobileStage === "sf" && (
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 pb-1.5 border-b border-zinc-800 mb-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-3 bg-emerald-500 rounded" />
                  Semifinal
                </h3>
                <div className="flex flex-col gap-3 items-center">
                  {sfMatches.map((m) => (
                    <div key={m.id} className="w-full flex justify-center">{renderMatchCard(m)}</div>
                  ))}
                </div>
              </div>
            )}

            {mobileStage === "finals" && (
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 pb-1.5 border-b border-zinc-800 mb-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-3 bg-emerald-500 rounded" />
                  Final & Perebutan Juara 3
                </h3>
                <div className="flex flex-col gap-4 items-center">
                  <div className="border border-emerald-500/20 rounded-2xl p-1 bg-emerald-950/5 w-full flex flex-col items-center">
                    <div className="bg-emerald-500/10 text-emerald-400 text-[8px] uppercase font-black tracking-widest text-center py-0.5 rounded-t-xl w-full max-w-[240px] sm:max-w-[280px]">
                      GRAND FINAL
                    </div>
                    {renderMatchCard(finalMatch)}
                  </div>
                  
                  <div className="border border-zinc-800 rounded-2xl p-1 bg-zinc-900/10 w-full flex flex-col items-center">
                    <div className="text-zinc-550 text-[8px] uppercase font-bold tracking-wider text-center py-0.5 rounded-t-xl w-full max-w-[240px] sm:max-w-[280px]">
                      Perebutan Juara 3
                    </div>
                    {renderMatchCard(thirdMatch)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
