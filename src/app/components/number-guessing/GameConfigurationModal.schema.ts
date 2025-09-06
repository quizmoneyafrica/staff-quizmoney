import Joi from 'joi';

export interface GameConfigFormData {
  costPerTrial: string;
  lowerBound: string;
  upperBound: string;
  range: string;
  baseTrial: string;
  maxTrialPurchase: string;
  stakeMultiplier: string;
}

export interface GameConfigSubmitData {
  costPerTrial: number;
  numberRange: {
    lowerBound: number;
    upperBound: number;
    range: number;
  };
  baseTrial: number;
  maxTrialPurchase: number;
  stakeMultiplier: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const gameConfigValidationSchema = Joi.object({
  costPerTrial: Joi.string()
    .trim()
    .required()
    .custom((value, helpers) => {
      const costNum = parseFloat(value);
      if (isNaN(costNum) || costNum <= 0) {
        return helpers.error('number.positive');
      }
      return value;
    })
    .messages({
      'string.empty': 'Cost per trial is required',
      'any.required': 'Cost per trial is required',
      'number.positive': 'Cost per trial must be a positive number',
    }),

  lowerBound: Joi.string()
    .trim()
    .required()
    .custom((value, helpers) => {
      const boundNum = parseInt(value);
      if (isNaN(boundNum) || boundNum < 0) {
        return helpers.error('number.nonNegative');
      }
      return value;
    })
    .messages({
      'string.empty': 'Lower bound is required',
      'any.required': 'Lower bound is required',
      'number.nonNegative': 'Lower bound must be a non-negative number',
    }),

  upperBound: Joi.string()
    .trim()
    .required()
    .custom((value, helpers) => {
      const boundNum = parseInt(value);
      if (isNaN(boundNum) || boundNum < 0) {
        return helpers.error('number.nonNegative');
      }
      return value;
    })
    .messages({
      'string.empty': 'Upper bound is required',
      'any.required': 'Upper bound is required',
      'number.nonNegative': 'Upper bound must be a non-negative number',
    }),

  baseTrial: Joi.string()
    .trim()
    .required()
    .custom((value, helpers) => {
      const trialNum = parseInt(value);
      if (isNaN(trialNum) || trialNum <= 0) {
        return helpers.error('number.positive');
      }
      return value;
    })
    .messages({
      'string.empty': 'Base trial is required',
      'any.required': 'Base trial is required',
      'number.positive': 'Base trial must be a positive number',
    }),

  maxTrialPurchase: Joi.string()
    .trim()
    .required()
    .custom((value, helpers) => {
      const purchaseNum = parseInt(value);
      if (isNaN(purchaseNum) || purchaseNum <= 0) {
        return helpers.error('number.positive');
      }
      return value;
    })
    .messages({
      'string.empty': 'Max trial purchase is required',
      'any.required': 'Max trial purchase is required',
      'number.positive': 'Max trial purchase must be a positive number',
    }),

  stakeMultiplier: Joi.string()
    .trim()
    .required()
    .custom((value, helpers) => {
      const match = value.match(/X\s*(\d+\.?\d*)/i);
      if (!match) {
        return helpers.error('multiplier.format');
      }
      const multiplierNum = parseFloat(match[1]);
      if (isNaN(multiplierNum) || multiplierNum <= 0) {
        return helpers.error('number.positive');
      }
      return value;
    })
    .messages({
      'string.empty': 'Stake multiplier is required',
      'any.required': 'Stake multiplier is required',
      'multiplier.format': 'Stake multiplier must be in format "X 3"',
      'number.positive': 'Stake multiplier must be a positive number',
    }),
});

export const validateGameConfig = (
  data: GameConfigFormData,
): ValidationResult => {
  const { error } = gameConfigValidationSchema.validate(data, {
    abortEarly: false,
    allowUnknown: false,
  });

  if (!error) {
    const lowerBound = parseInt(data.lowerBound);
    const upperBound = parseInt(data.upperBound);

    if (lowerBound >= upperBound) {
      return {
        isValid: false,
        errors: {
          upperBound: 'Upper bound must be greater than lower bound',
        },
      };
    }

    if (parseInt(data.range) < 0) {
      return {
        isValid: false,
        errors: {
          range: 'Range must be a non-negative number',
        },
      };
    }

    if (parseInt(data.range) > upperBound - lowerBound) {
      return {
        isValid: false,
        errors: {
          range: 'Range cannot be greater than (Upper Bound - Lower Bound)',
        },
      };
    }

    return {
      isValid: true,
      errors: {},
    };
  }

  const errors: Record<string, string> = {};
  error.details.forEach((detail) => {
    const field = detail.path[0] as string;
    errors[field] = detail.message;
  });

  return {
    isValid: false,
    errors,
  };
};

export const prepareGameConfigData = (
  formData: GameConfigFormData,
): GameConfigSubmitData => {
  const multiplierMatch = formData.stakeMultiplier.match(/X\s*(\d+\.?\d*)/i);
  const multiplier = multiplierMatch ? parseFloat(multiplierMatch[1]) : 1;

  return {
    costPerTrial: parseFloat(formData.costPerTrial),
    numberRange: {
      lowerBound: parseInt(formData.lowerBound),
      upperBound: parseInt(formData.upperBound),
      range: parseInt(formData.range),
    },
    baseTrial: parseInt(formData.baseTrial),
    maxTrialPurchase: parseInt(formData.maxTrialPurchase),
    stakeMultiplier: multiplier,
  };
};
