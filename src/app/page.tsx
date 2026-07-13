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
      icon: Calendar,
    },
    {
      id: "topscore",
      label: "Top Score",
      mobileLabel: "Skor",
      icon: Award,
    },
    {
      id: "players",
      label: "Daftar Pemain",
      mobileLabel: "Pemain",
      icon: Users,
    },
  ] as const;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Tab Buttons bar */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5 w-full max-w-full overflow-hidden">
          <div className="flex flex-row flex-nowrap overflow-x-auto whitespace-nowrap gap-1.5 sm:gap-3 flex-grow pr-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
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
            <ScheduleList matches={matches} loading={loading} />
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
