export type Difficulty = "Easy" | "Medium" | "Hard";

// Matches the shape returned from the database for all games
export interface DBGameResponse {
  name: string;
  slug: string;
  media_url: string;
  challenge_levels: number; // 2 = Easy, Medium; 3 = Easy, Medium, Hard
}

// Matches the shape returned from the database for single game
export interface DBGame {
  id: number;
  name: string;
  slug: string;
  description?: string;
  media_url?: string;
  available_difficulties?: Difficulty[];
  is_active: boolean;
  deleted_at: string | null;
}

export interface GameCard {
  id: number;
  name: string;
  mediaUrl: string;
  availableDifficulties: Difficulty[];
  slug: string;
  description?: string;
}

export const difficultyConfig: Record<
  Difficulty,
  { badge: string; bar: string; dots: number }
> = {
  Easy:   { badge: "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/40", bar: "bg-emerald-400", dots: 1 },
  Medium: { badge: "bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/40",       bar: "bg-amber-400",   dots: 2 },
  Hard:   { badge: "bg-rose-500/20 text-rose-400 ring-1 ring-rose-500/40",          bar: "bg-rose-400",    dots: 3 },
};

// Convert challenge_levels (number) to Difficulty array
// Level 4 = game has AI difficulty modes (Easy/Medium/Hard) + Human vs Human mode (handled in-game)
export const mapChallengeLevelsToDifficulties = (levels: number): Difficulty[] => {
  const difficulties: Difficulty[] = [];
  if (levels >= 1) difficulties.push('Easy');
  if (levels >= 2) difficulties.push('Medium');
  if (levels >= 3 || levels === 4) difficulties.push('Hard');
  return difficulties;
};
