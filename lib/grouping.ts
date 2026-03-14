import { DBProfile } from "./types";
import { buildScoreMatrix, getPairScore } from "./scoring";

/**
 * Greedily form groups of `groupSize` people, maximising
 * intra-group average compatibility score.
 */
export function formGroups(users: DBProfile[], groupSize = 4): DBProfile[][] {
  if (users.length === 0) return [];

  const matrix = buildScoreMatrix(users);
  const remaining = [...users];
  const groups: DBProfile[][] = [];

  while (remaining.length > 0) {
    // If not enough people for a full new group, fold into the last group
    if (remaining.length <= Math.floor(groupSize / 2) && groups.length > 0) {
      groups[groups.length - 1].push(...remaining.splice(0));
      break;
    }

    // Start new group with first remaining user
    const group: DBProfile[] = [remaining.splice(0, 1)[0]];

    while (group.length < groupSize && remaining.length > 0) {
      // Find best-fitting candidate (highest avg score with current group members)
      let bestIdx = 0;
      let bestAvg = -1;

      for (let i = 0; i < remaining.length; i++) {
        const candidate = remaining[i];
        const avg =
          group.reduce(
            (sum, member) => sum + getPairScore(matrix, member.id, candidate.id),
            0
          ) / group.length;

        if (avg > bestAvg) {
          bestAvg = avg;
          bestIdx = i;
        }
      }

      group.push(remaining.splice(bestIdx, 1)[0]);
    }

    groups.push(group);
  }

  return groups;
}

/** Average pairwise score within a group (0–100) */
export function groupCompatibilityScore(group: DBProfile[]): number {
  if (group.length < 2) return 0;
  const matrix = buildScoreMatrix(group);
  let total = 0;
  let pairs = 0;
  for (let i = 0; i < group.length; i++) {
    for (let j = i + 1; j < group.length; j++) {
      total += getPairScore(matrix, group[i].id, group[j].id);
      pairs++;
    }
  }
  return Math.round(total / pairs);
}
