export interface HealthScoreConfig {
  weights: {
    successRate: number;
    quotaUsageMax: number;
    recentBackup: number;
    errorCountMax: number;
    errorMultiplier: number;
  };
  quotaThresholds: {
    limit: number;
    penalty: number;
  }[];
  healthRanges: {
    minScore: number;
    color: string;
    label: string;
  }[];
}

export const DEFAULT_HEALTH_CONFIG: HealthScoreConfig = {
  weights: {
    successRate: 0.4,
    quotaUsageMax: 20,
    recentBackup: 20,
    errorCountMax: 20,
    errorMultiplier: 5,
  },
  quotaThresholds: [
    { limit: 90, penalty: 20 },
    { limit: 80, penalty: 10 },
    { limit: 70, penalty: 5 },
  ],
  healthRanges: [
    { minScore: 90, color: "#10b981", label: "Excelente" },
    { minScore: 75, color: "#3b82f6", label: "Bueno" },
    { minScore: 60, color: "#f59e0b", label: "Regular" },
  ],
};

export function calculateHealthScore(
  successRate: number,
  quotaUsage: number,
  hasRecentBackup: boolean,
  errorCount: number,
  config: HealthScoreConfig = DEFAULT_HEALTH_CONFIG
): number {
  let score = 100;

  // Success rate impact
  score -= (100 - successRate) * config.weights.successRate;

  // Quota usage impact
  const quotaPenalty = config.quotaThresholds.find(t => quotaUsage > t.limit);
  if (quotaPenalty) {
    score -= quotaPenalty.penalty;
  }

  // Recent backup impact
  if (!hasRecentBackup) {
    score -= config.weights.recentBackup;
  }

  // Error count impact
  score -= Math.min(errorCount * config.weights.errorMultiplier, config.weights.errorCountMax);

  return Math.max(0, Math.round(score));
}

export function getHealthScoreColor(
  score: number,
  config: HealthScoreConfig = DEFAULT_HEALTH_CONFIG
): {
  color: string;
  label: string;
} {
  const range = config.healthRanges.find(r => score >= r.minScore);
  if (range) {
    return { color: range.color, label: range.label };
  }
  return { color: "#ef4444", label: "Deficiente" };
}
