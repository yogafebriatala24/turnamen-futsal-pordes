"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../libs/supabase";
import { MainLayout } from "../../components/templates/MainLayout";
import { AdminTeamManager } from "../../components/organisms/AdminTeamManager";
import { AdminPlayerManager } from "../../components/organisms/AdminPlayerManager";
import { AdminMatchManager } from "../../components/organisms/AdminMatchManager";
import { getTeams, getPlayers, getMatches, Player } from "../../services/db";
import { Match } from "../../components/molecules/MatchCard";
import { Team } from "../../utils/standings";
import { Button } from "../../components/atoms/Button";
import { Spinner } from "../../components/atoms/Spinner";
import { Shield, LogOut, Users, Calendar, Trophy, RefreshCw } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<"teams" | "players" | "matches">("teams");

  // Synchronize activeSubTab state with URL hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === "#tim") {
        setActiveSubTab("teams");
      } else if (hash === "#pemain") {
        setActiveSubTab("players");
      } else if (hash === "#pertandingan") {
        setActiveSubTab("matches");
      } else {
        setActiveSubTab("teams");
      }
    };

    const timer = setTimeout(handleHashChange, 100);
    window.addEventListener("hashchange", handleHashChange);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  // Data states
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Authenticate user session
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      } else {
        setIsAuthenticated(true);
        fetchData();
      }
    };
    checkUser();
  }, [router]);

  const fetchData = async () => {
    try {
      setLoadingData(true);
      const [fetchedTeams, fetchedPlayers, fetchedMatches] = await Promise.all([
        getTeams(),
        getPlayers(),
        getMatches(),
      ]);
      setTeams(fetchedTeams);
      setPlayers(fetchedPlayers);
      setMatches(fetchedMatches);
    } catch (err) {
      console.error("Gagal memuat data dashboard:", err);
    } finally {
      setLoadingData(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleSignOut = async () => {
    if (!confirm("Apakah Anda yakin ingin keluar?")) return;
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (isAuthenticated === null || (loadingData && teams.length === 0)) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center">
        <Spinner size="lg" />
        <span className="text-sm font-semibold text-zinc-550 mt-4 tracking-wide uppercase">
          Memeriksa Otoritas Admin...
        </span>
      </div>
    );
  }

  const subTabs = [
    { id: "teams", label: "Kelola Tim", icon: Trophy },
    { id: "players", label: "Kelola Pemain", hash: "pemain", icon: Users },
    { id: "matches", label: "Kelola Pertandingan", hash: "pertandingan", icon: Calendar },
  ] as const;

  const handleTabClick = (tabId: "teams" | "players" | "matches") => {
    if (tabId === "teams") {
      window.history.pushState({}, document.title, window.location.pathname + window.location.search);
      setActiveSubTab("teams");
    } else {
      const tab = subTabs.find((t) => t.id === tabId);
      if (tab && "hash" in tab) {
        window.location.hash = tab.hash;
      }
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Dashboard Title & Actions header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-900/40 p-5 border border-zinc-800 rounded-3xl backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-450 border border-emerald-500/20">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white uppercase">
                Panel Administrator
              </h2>
              <p className="text-[10px] text-zinc-500 font-semibold tracking-wider uppercase mt-0.5">
                Karang Taruna RW 03 Futsal Cup
              </p>
            </div>
          </div>

          <div className="flex gap-2.5 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex-1 sm:flex-initial"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
              Segarkan
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleSignOut}
              className="flex-1 sm:flex-initial"
            >
              <LogOut className="w-3.5 h-3.5" />
              Keluar
            </Button>
          </div>
        </div>

        {/* Dashboard Tab Links */}
        <div className="flex border-b border-zinc-850 gap-2 overflow-x-auto pb-0.5 animate-fade-in">
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-extrabold uppercase border-b-2 tracking-wide transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "border-emerald-500 text-emerald-400"
                    : "border-transparent text-zinc-550 hover:text-zinc-350"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-emerald-500" : "text-zinc-650"}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Sub-tab Managers */}
        <div className="min-h-[300px]">
          {loadingData ? (
            <div className="py-20">
              <Spinner size="md" />
            </div>
          ) : (
            <>
              {activeSubTab === "teams" && (
                <AdminTeamManager teams={teams} onRefresh={fetchData} />
              )}
              {activeSubTab === "players" && (
                <AdminPlayerManager players={players} teams={teams} onRefresh={fetchData} />
              )}
              {activeSubTab === "matches" && (
                <AdminMatchManager matches={matches} teams={teams} players={players} onRefresh={fetchData} />
              )}
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
