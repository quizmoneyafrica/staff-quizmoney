export interface PerfectScoreGameConfig {
  subType: 'PERFECT_SCORE';
  minimumStake: number;
  maximumStake: number;
  maxRespin: number;
  defaultSpin: number;
  enableSpin: boolean;
  spinAmount: number;
  stakeMultiplier: number;
  weightProbabilities: Array<{
    id: string;
    chance: number;
    questions: number;
    weight: string;
    status: string;
  }>;
}

export interface PerfectScoreGame {
  gameId: string;
  name: string;
  description: string;
  type: 'PERFECT_SCORE';
  config: PerfectScoreGameConfig;
}

export interface UpdatePerfectScoreGamePayload {
  gameId: string;
  type: 'PERFECT_SCORE';
  costPerSpin: number;
  maximumSpinPerUser: number;
  respinFeatureEnabled: boolean;
  minimumStake: number;
  maximumStake: number;
}
