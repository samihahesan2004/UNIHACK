import { DBProfile } from "./types";

/**
 * Jaccard similarity between two string arrays.
 * Returns 0–1.
 */
function jaccard(a: string[], b: string[]): number {
  if (a.length === 0 && b.length === 0) return 0;
  const setA = new Set(a);
  const setB = new Set(b);
  const intersection = [...setA].filter((x) => setB.has(x)).length;
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Score compatibility between two users (0–100).
 *
 * Weights:
 *  - interests        35pts  (most important for event matching)
 *  - weekend_style    20pts  (lifestyle compatibility)
 *  - music_taste      15pts  (vibe compatibility)
 *  - trying_to_meet   15pts  (social goal alignment)
 *  - social_energy    10pts  (energy level match)
 *  - event_vibe        5pts  (text exact match bonus)
 */
export function scoreUsers(a: DBProfile, b: DBProfile): number {
  let score = 0;

  // Interests (35pts)
  score += jaccard(a.interests, b.interests) * 35;

  // Weekend style (20pts)
  score += jaccard(a.weekend_style, b.weekend_style) * 20;

  // Music taste (15pts)
  score += jaccard(a.music_taste, b.music_taste) * 15;

  // Trying to meet (15pts)
  score += jaccard(a.trying_to_meet, b.trying_to_meet) * 15;

  // Social energy closeness (10pts) — closer = better
  const energyDiff = Math.abs((a.social_energy ?? 3) - (b.social_energy ?? 3));
  score += Math.max(0, 10 - energyDiff * 2.5);

  // Preferred event vibe exact match bonus (5pts)
  if (
    a.preferred_event_vibe &&
    b.preferred_event_vibe &&
    a.preferred_event_vibe.toLowerCase() === b.preferred_event_vibe.toLowerCase()
  ) {
    score += 5;
  }

  return Math.round(score);
}

/**
 * Build a score matrix for all pairs.
 * Key: `${idA}__${idB}` (always smaller id first)
 */
export function buildScoreMatrix(users: DBProfile[]): Map<string, number> {
  const matrix = new Map<string, number>();
  for (let i = 0; i < users.length; i++) {
    for (let j = i + 1; j < users.length; j++) {
      const score = scoreUsers(users[i], users[j]);
      const key = [users[i].id, users[j].id].sort().join("__");
      matrix.set(key, score);
    }
  }
  return matrix;
}

export function getPairScore(
  matrix: Map<string, number>,
  idA: string,
  idB: string
): number {
  const key = [idA, idB].sort().join("__");
  return matrix.get(key) ?? 0;
}
