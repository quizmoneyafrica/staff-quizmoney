'use client';

export interface GameConfigFormData {
  baseMoves: string;
  maxMovePurchase: string;
  costPerExtraMove: string;
  stakeMultiplier: string;
  numberOfCards: string;
}

export interface FormErrors {
  baseMoves?: string;
  maxMovePurchase?: string;
  costPerExtraMove?: string;
  stakeMultiplier?: string;
  numberOfCards?: string;
}

export const validateGameConfig = (
  data: GameConfigFormData,
): { isValid: boolean; errors: FormErrors } => {
  const errors: FormErrors = {};

  if (
    !data.baseMoves ||
    isNaN(Number(data.baseMoves)) ||
    Number(data.baseMoves) <= 0
  ) {
    errors.baseMoves = 'Base moves must be a positive number.';
  }

  if (
    !data.maxMovePurchase ||
    isNaN(Number(data.maxMovePurchase)) ||
    Number(data.maxMovePurchase) < 0
  ) {
    errors.maxMovePurchase = 'Max move purchase must be a non-negative number.';
  }

  if (
    !data.costPerExtraMove ||
    isNaN(Number(data.costPerExtraMove)) ||
    Number(data.costPerExtraMove) < 0
  ) {
    errors.costPerExtraMove =
      'Cost per extra move must be a non-negative number.';
  }

  if (
    !data.stakeMultiplier ||
    !/^[xX]\s*\d+(\.\d+)?$/.test(data.stakeMultiplier)
  ) {
    errors.stakeMultiplier =
      'Stake multiplier must be in the format "X #", e.g., X 3.';
  }

  if (
    !data.numberOfCards ||
    isNaN(Number(data.numberOfCards)) ||
    Number(data.numberOfCards) <= 0 ||
    Number(data.numberOfCards) % 2 !== 0
  ) {
    errors.numberOfCards = 'Number of cards must be a positive, even number.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const prepareGameConfigData = (data: GameConfigFormData) => {
  return {
    baseMoves: Number(data.baseMoves),
    maxMovePurchase: Number(data.maxMovePurchase),
    costPerExtraMove: Number(data.costPerExtraMove),
    stakeMultiplier: Number(data.stakeMultiplier.replace(/[xX]\s*/, '')),
    numberOfCards: Number(data.numberOfCards),
  };
};
