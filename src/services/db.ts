import { supabase } from "../libs/supabase";
import { Match } from "../components/molecules/MatchCard";
import { Team } from "../utils/standings";

export interface Player {
  id: number;
  team_id: number;
  name: string;
  goals: number;
  yellow_cards: number;
  red_cards: number;
  created_at?: string;
  teams?: {
    name: string;
    group_name?: string;
  };
}

// ==========================================
// TEAMS SERVICE
// ==========================================
export async function getTeams(): Promise<Team[]> {
  const { data, error } = await supabase
    .from("teams")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching teams:", error);
    throw error;
  }
  return data || [];
}

export async function createTeam(team: Omit<Team, "id">): Promise<Team> {
  const { data, error } = await supabase
    .from("teams")
    .insert([team])
    .select()
    .single();

  if (error) {
    console.error("Error creating team:", error);
    throw error;
  }
  return data;
}

export async function updateTeam(id: number, team: Partial<Omit<Team, "id">>): Promise<Team> {
  const { data, error } = await supabase
    .from("teams")
    .update(team)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating team:", error);
    throw error;
  }
  return data;
}

export async function deleteTeam(id: number): Promise<void> {
  const { error } = await supabase
    .from("teams")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting team:", error);
    throw error;
  }
}

// ==========================================
// PLAYERS / TOP SCORERS SERVICE
// ==========================================
export async function getPlayers(): Promise<Player[]> {
  const { data, error } = await supabase
    .from("players")
    .select("*, teams(name, group_name)")
    .order("goals", { ascending: false })
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching players:", error);
    throw error;
  }
  return (data as any) || [];
}

export async function createPlayer(player: Omit<Player, "id" | "teams">): Promise<Player> {
  const { data, error } = await supabase
    .from("players")
    .insert([player])
    .select()
    .single();

  if (error) {
    console.error("Error creating player:", error);
    throw error;
  }
  return data;
}

export async function createPlayersBulk(
  players: Omit<Player, "id" | "teams">[]
): Promise<Player[]> {
  const { data, error } = await supabase
    .from("players")
    .insert(players)
    .select();

  if (error) {
    console.error("Error creating players in bulk:", error);
    throw error;
  }
  return data || [];
}

export async function updatePlayer(
  id: number,
  player: Partial<Omit<Player, "id" | "teams">>
): Promise<Player> {
  const { data, error } = await supabase
    .from("players")
    .update(player)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating player:", error);
    throw error;
  }
  return data;
}

export async function deletePlayer(id: number): Promise<void> {
  const { error } = await supabase
    .from("players")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting player:", error);
    throw error;
  }
}

// ==========================================
// MATCHES SERVICE
// ==========================================
export async function getMatches(): Promise<Match[]> {
  const { data, error } = await supabase
    .from("matches")
    .select(`
      id,
      home_team_id,
      away_team_id,
      home_score,
      away_score,
      match_date,
      status,
      group_name,
      round,
      teams_home:teams!home_team_id(name, logo_url),
      teams_away:teams!away_team_id(name, logo_url)
    `)
    .order("match_date", { ascending: true });

  if (error) {
    console.error("Error fetching matches:", error);
    throw error;
  }
  return (data as any) || [];
}

export async function createMatch(
  match: Omit<Match, "id" | "teams_home" | "teams_away">
): Promise<Match> {
  const { data, error } = await supabase
    .from("matches")
    .insert([match])
    .select(`
      id,
      home_team_id,
      away_team_id,
      home_score,
      away_score,
      match_date,
      status,
      group_name,
      round,
      teams_home:teams!home_team_id(name, logo_url),
      teams_away:teams!away_team_id(name, logo_url)
    `)
    .single();

  if (error) {
    console.error("Error creating match:", error);
    throw error;
  }
  return data as any;
}

export async function updateMatch(
  id: number,
  match: Partial<Omit<Match, "id" | "teams_home" | "teams_away">>
): Promise<Match> {
  const { data, error } = await supabase
    .from("matches")
    .update(match)
    .eq("id", id)
    .select(`
      id,
      home_team_id,
      away_team_id,
      home_score,
      away_score,
      match_date,
      status,
      group_name,
      round,
      teams_home:teams!home_team_id(name, logo_url),
      teams_away:teams!away_team_id(name, logo_url)
    `)
    .single();

  if (error) {
    console.error("Error updating match:", error);
    throw error;
  }
  return data as any;
}

export async function deleteMatch(id: number): Promise<void> {
  const { error } = await supabase
    .from("matches")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting match:", error);
    throw error;
  }
}
