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
      icon: Trophy,
    },
    {
      id: "schedule",
      label: "Jadwal & Hasil",
      icon: Calendar,
    },
    {
      id: "topscore",
      label: "Top Score",
      icon: Award,
    },
    {
      id: "players",
      label: "Daftar Pemain",
      icon: Users,
    },
  ] as const;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Tab Buttons bar */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-1">
          <div className="flex gap-1 sm:gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-3 text-xs sm:text-sm font-bold tracking-wide uppercase border-b-2 transition-all cursor-pointer ${
                    isActive
                      ? "border-emerald-500 text-emerald-450"
                      : "border-transparent text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${isActive ? "text-emerald-500" : "text-zinc-600"}`}
                  />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Quick Refresh trigger */}
          <button
            onClick={handleRefresh}
            disabled={loading || refreshing}
            className="p-2 hover:bg-zinc-900 rounded-xl border border-zinc-900 hover:border-zinc-800 transition-colors text-zinc-500 hover:text-zinc-200 cursor-pointer disabled:opacity-50"
            title="Muat ulang data"
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? "animate-spin text-emerald-500" : ""}`}
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
