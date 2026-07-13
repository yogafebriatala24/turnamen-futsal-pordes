import { Match } from "../components/molecules/MatchCard";

export interface Team {
  id: number;
  name: string;
  group_name: string;
  logo_url?: string;
}

export interface StandingRow {
  teamId: number;
  name: string;
  logoUrl?: string;
  groupName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  isLive?: boolean;
}

export function calculateStandings(teams: Team[], matches: Match[]): Record<string, StandingRow[]> {
  const standingsMap: Record<number, StandingRow> = {};

  // Initialize standings row for each team
  teams.forEach((team) => {
    standingsMap[team.id] = {
      teamId: team.id,
      name: team.name,
      logoUrl: team.logo_url,
      groupName: team.group_name,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
      isLive: false,
    };
  });

  // Calculate stats based on finished and ongoing matches
  matches.forEach((match) => {
    if (match.status !== "finished" && match.status !== "ongoing") return;

    const { home_team_id, away_team_id, home_score, away_score, status } = match;

    const homeRow = standingsMap[home_team_id];
    const awayRow = standingsMap[away_team_id];

    // If teams are missing from team list, skip
    if (!homeRow || !awayRow) return;

    // Toggle live state for the teams currently playing
    if (status === "ongoing") {
      homeRow.isLive = true;
      awayRow.isLive = true;
    }

    // Check if score exists (can be null for scheduled, but ongoing should have scores)
    if (home_score === null || away_score === null) return;

    homeRow.played += 1;
    awayRow.played += 1;

    homeRow.goalsFor += home_score;
    homeRow.goalsAgainst += away_score;

    awayRow.goalsFor += away_score;
    awayRow.goalsAgainst += home_score;

    if (home_score > away_score) {
      homeRow.won += 1;
      homeRow.points += 3;
      awayRow.lost += 1;
    } else if (home_score < away_score) {
      awayRow.won += 1;
      awayRow.points += 3;
      homeRow.lost += 1;
    } else {
      homeRow.drawn += 1;
      homeRow.points += 1;
      awayRow.drawn += 1;
      awayRow.points += 1;
    }
  });

  // Finalize GD and group by group_name
  const groups: Record<string, StandingRow[]> = {};

  Object.values(standingsMap).forEach((row) => {
    row.goalDifference = row.goalsFor - row.goalsAgainst;

    if (!groups[row.groupName]) {
      groups[row.groupName] = [];
    }
    groups[row.groupName].push(row);
  });

  // Sort standings within each group:
  // 1. Points (desc)
  // 2. Goal Difference (desc)
  // 3. Goals For (desc)
  // 4. Alphabetical Name (asc)
  Object.keys(groups).forEach((groupName) => {
    groups[groupName].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
      return a.name.localeCompare(b.name);
    });
  });

  return groups;
}
