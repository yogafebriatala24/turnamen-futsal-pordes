"use client";

import React, { useState, useEffect } from "react";
import { MainLayout } from "../components/templates/MainLayout";
import { StandingsTable } from "../components/organisms/StandingsTable";
import { TopScoreList } from "../components/organisms/TopScoreList";
import { ScheduleList } from "../components/organisms/ScheduleList";
import { PlayerList } from "../components/organisms/PlayerList";
import { getTeams, getPlayers, getMatches, Player } from "../services/db";
import { Match } from "../components/molecules/MatchCard";
import { Team, calculateStandings, StandingRow } from "../utils/standings";
import { Trophy, Calendar, Award, RefreshCw, Users } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<
    "standings" | "topscore" | "schedule" | "players"
  >("standings");

  // Synchronize activeTab state with URL hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === "#jadwal") {
        setActiveTab("schedule");
      } else if (hash === "#topscore") {
        setActiveTab("topscore");
      } else if (hash === "#pemain") {
        setActiveTab("players");
      } else {
        setActiveTab("standings");
      }
    };

    // Run with a small delay to ensure Next.js router has completed hydration
    const timer = setTimeout(handleHashChange, 100);

    window.addEventListener("hashchange", handleHashChange);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [fetchedTeams, fetchedPlayers, fetchedMatches] = await Promise.all([
        getTeams(),
        getPlayers(),
        getMatches(),
      ]);

      setTeams(fetchedTeams);
      setPlayers(fetchedPlayers);
      setMatches(fetchedMatches);
    } catch (error) {
      console.error("Failed to load tournament data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTabClick = (tabId: "standings" | "topscore" | "schedule" | "players") => {
    if (tabId === "standings") {
      // Clear hash cleanly
      window.history.pushState("", document.title, window.location.pathname + window.location.search);
      setActiveTab("standings");
    } else {
      const tab = tabs.find((t) => t.id === tabId);
      if (tab && "hash" in tab) {
        window.location.hash = tab.hash;
      }
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Compute standings from loaded teams and matches
  const standings = React.useMemo(() => {
    return calculateStandings(teams, matches);
  }, [teams, matches]);

  const tabs = [
    {
      id: "standings",
      label: "Klasemen",
      mobileLabel: "Klasemen",
      icon: Trophy,
    },
    {
      id: "schedule",
      label: "Jadwal & Hasil",
      mobileLabel: "Jadwal",
      hash: "jadwal",
      icon: Calendar,
    },
    {
      id: "topscore",
      label: "Top Score",
      mobileLabel: "Skor",
      hash: "topscore",
      icon: Award,
    },
    {
      id: "players",
      label: "Daftar Pemain",
      mobileLabel: "Pemain",
      hash: "pemain",
      icon: Users,
    },
  ] as const;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Quick Info Bar (Live & Upcoming Matches) */}
        {(() => {
          const liveMatches = matches.filter((m) => m.status === "ongoing");
          const upcomingMatches = matches
            .filter((m) => m.status === "scheduled")
            .sort((a, b) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime());
          const nearestMatch = upcomingMatches[0];

          if (liveMatches.length === 0 && !nearestMatch) return null;

          const getTeamName = (id: number) => teams.find((t) => t.id === id)?.name || `Tim ${id}`;

          return (
            <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between p-3 bg-zinc-900/30 border border-zinc-900 rounded-2xl text-[10px] sm:text-xs">
              {/* Left side: Live Matches status */}
              {liveMatches.length > 0 ? (
                <div className="flex items-center gap-2 text-rose-400 font-bold bg-rose-500/5 px-2.5 py-1.5 rounded-xl border border-rose-500/10">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  </span>
                  <span className="uppercase tracking-wider font-extrabold text-[9px]">LIVE:</span>
                  <span className="text-zinc-250 truncate">
                    {liveMatches
                      .map(
                        (m) =>
                          `${getTeamName(m.home_team_id)} ${m.home_score ?? 0} - ${m.away_score ?? 0} ${getTeamName(m.away_team_id)}`
                      )
                      .join(" | ")}
                  </span>
                </div>
              ) : (
                <div />
              )}

              {/* Right side: Nearest Match info */}
              {nearestMatch && (
                <div className="flex items-center gap-2 text-emerald-400 font-semibold bg-emerald-500/5 px-2.5 py-1.5 rounded-xl border border-emerald-500/10 sm:self-center">
                  <span className="uppercase tracking-wider font-extrabold text-[9px] text-emerald-500">Laga Terdekat:</span>
                  <span className="text-zinc-300">
                    {getTeamName(nearestMatch.home_team_id)} vs {getTeamName(nearestMatch.away_team_id)}
                  </span>
                  <span className="text-zinc-500 text-[9px] font-medium border-l border-zinc-800 pl-2">
                    {new Date(nearestMatch.match_date).toLocaleDateString("id-ID", {
                      weekday: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })} WIB
                  </span>
                </div>
              )}
            </div>
          );
        })()}

        {/* Tab Buttons bar */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5 w-full max-w-full overflow-hidden">
          <div className="flex flex-row flex-nowrap overflow-x-auto whitespace-nowrap gap-1.5 sm:gap-3 flex-grow pr-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm font-bold tracking-wide uppercase border-b-2 transition-all cursor-pointer ${
                    isActive
                      ? "border-emerald-500 text-emerald-450"
                      : "border-transparent text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? "text-emerald-500" : "text-zinc-650"}`}
                  />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Refresh trigger */}
          <button
            onClick={handleRefresh}
            disabled={loading || refreshing}
            className="flex-shrink-0 p-1.5 sm:p-2 hover:bg-zinc-900 rounded-xl border border-zinc-900 hover:border-zinc-800 transition-colors text-zinc-500 hover:text-zinc-200 cursor-pointer disabled:opacity-50 ml-2"
            title="Muat ulang data"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${refreshing ? "animate-spin text-emerald-500" : ""}`}
            />
          </button>
        </div>

        {/* Tab Contents */}
        <div className="mt-4 min-h-[400px]">
          {activeTab === "standings" && (
            <StandingsTable standings={standings} loading={loading} />
          )}

          {activeTab === "schedule" && (
            <ScheduleList matches={matches} players={players} loading={loading} />
          )}

          {activeTab === "topscore" && (
            <TopScoreList players={players} loading={loading} />
          )}

          {activeTab === "players" && (
            <PlayerList players={players} teams={teams} loading={loading} />
          )}
        </div>
      </div>
    </MainLayout>
  );
}
