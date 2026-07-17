import type { Match } from "../components/molecules/MatchCard";

export interface SuspensionStatus {
  isSuspended: boolean;
  reason: "yellow_accumulation" | "red_card" | null;
}

/**
 * Calculates if a player is suspended for a specific match based on past matches card history.
 * 
 * Rules:
 * 1. Accumulating 2 yellow cards across matches causes a 1-match suspension in the next match.
 * 2. Receiving a red card causes a 1-match suspension in the next match.
 * 3. Serving a suspension resets the card accumulation for that type.
 */
export function getPlayerSuspensionStatus(
  playerId: number,
  teamId: number,
  currentMatchId: number,
  allMatches: Match[]
): SuspensionStatus {
  if (!currentMatchId || !allMatches || allMatches.length === 0) {
    return { isSuspended: false, reason: null };
  }

  // 1. Get all matches involving this team
  const teamMatches = allMatches.filter(
    (m) => m.home_team_id === teamId || m.away_team_id === teamId
  );

  // 2. Sort matches chronologically by match_date
  teamMatches.sort(
    (a, b) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime()
  );

  // 3. Find the index of the current match (if not found/new match, evaluate up to the end of history)
  const currentMatchIndex = teamMatches.findIndex((m) => m.id === currentMatchId);
  const endIndex = currentMatchIndex === -1 ? teamMatches.length : currentMatchIndex;

  // 4. Track player state chronologically
  let accumulatedYellows = 0;
  let nextMatchSuspended: "yellow_accumulation" | "red_card" | null = null;

  for (let i = 0; i < endIndex; i++) {
    const match = teamMatches[i];
    
    // If the player had a pending suspension for this match, they serve it here
    if (nextMatchSuspended) {
      // Suspension served! Reset card stats for the next cycle
      accumulatedYellows = 0;
      nextMatchSuspended = null;
      continue; // They were suspended, so they couldn't have played or received cards in this match
    }

    // Process cards received in this match
    const yellowCount = Number(match.player_yellow_cards?.[String(playerId)] || 0);
    const redCount = Number(match.player_red_cards?.[String(playerId)] || 0);

    if (redCount > 0) {
      nextMatchSuspended = "red_card";
    } else if (yellowCount > 0) {
      accumulatedYellows += yellowCount;
      if (accumulatedYellows >= 2) {
        nextMatchSuspended = "yellow_accumulation";
      }
    }
  }

  // 5. Return status for the current match
  if (nextMatchSuspended) {
    return { isSuspended: true, reason: nextMatchSuspended };
  }

  return { isSuspended: false, reason: null };
}
