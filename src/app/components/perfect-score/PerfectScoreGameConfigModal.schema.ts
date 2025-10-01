import Joi from 'joi';

export const gameConfigSchema = Joi.object({
  minimumStake: Joi.number().min(0).required().messages({
    'number.base': 'Minimum stake must be a number',
    'number.min': 'Minimum stake must be 0 or greater',
    'any.required': 'Minimum stake is required',
  }),
  maximumStake: Joi.number()
    .min(Joi.ref('minimumStake'))
    .greater(Joi.ref('minimumStake'))
    .required()
    .messages({
      'number.base': 'Maximum stake must be a number',
      'number.min': 'Maximum stake cannot be less than minimum stake',
      'number.greater': 'Maximum stake must be greater than minimum stake',
      'any.required': 'Maximum stake is required',
    }),
  maxRespin: Joi.number().integer().min(0).max(1073741824).required().messages({
    'number.base': 'Max respin must be a number',
    'number.integer': 'Max respin must be an integer',
    'number.min': 'Max respin must be 0 or greater',
    'number.max': 'Max respin must be less than or equal to 1073741824',
    'any.required': 'Max respin is required',
  }),
  defaultSpin: Joi.number()
    .integer()
    .min(0)
    .max(1073741824)
    .required()
    .messages({
      'number.base': 'Default spin must be a number',
      'number.integer': 'Default spin must be an integer',
      'number.min': 'Default spin must be 0 or greater',
      'any.required': 'Default spin is required',
    }),
  enableSpin: Joi.boolean().required().messages({
    'boolean.base': 'Enable spin must be a boolean',
    'any.required': 'Enable spin is required',
  }),
  spinAmount: Joi.number().min(0).required().messages({
    'number.base': 'Spin amount must be a number',
    'number.min': 'Spin amount must be 0 or greater',
    'any.required': 'Spin amount is required',
  }),
  stakeMultiplier: Joi.number().min(0).required().messages({
    'number.base': 'Stake multiplier must be a number',
    'number.min': 'Stake multiplier must be 0 or greater',
    'any.required': 'Stake multiplier is required',
  }),
  weightProbabilities: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().required().messages({
          'string.empty': 'ID is required',
          'any.required': 'ID is required',
        }),
        chance: Joi.number().min(0).max(1).required().messages({
          'number.base': 'Chance (probability) must be a number',
          'number.min': 'Chance must be 0 or greater',
          'number.max': 'Chance must be 1 or less (probability range: 0-1)',
          'any.required': 'Chance is required',
        }),
        questions: Joi.number()
          .integer()
          .min(1)
          .max(1073741824)
          .required()
          .messages({
            'number.base': 'Questions must be a number',
            'number.integer': 'Questions must be a whole number (no decimals)',
            'number.min': 'Questions must be 1 or greater',
            'number.max': 'Questions must be less than or equal to 1073741824',
            'any.required': 'Questions is required',
          }),
        weight: Joi.string()
          .valid('FIVE', 'TEN', 'TWENTY', 'FIFTY', 'HUNDRED', 'RESPIN', 'SEVEN')
          .required()
          .messages({
            'string.empty': 'Weight is required',
            'any.only':
              'Weight must be one of FIVE, TEN, TWENTY, FIFTY, HUNDRED, RESPIN, or SEVEN',
            'any.required': 'Weight is required',
          }),
        status: Joi.string().valid('ACTIVE', 'INACTIVE').required().messages({
          'string.empty': 'Status is required',
          'any.only': 'Status must be either ACTIVE or INACTIVE',
          'any.required': 'Status is required',
        }),
      }),
    )
    .required()
    .min(1)
    .messages({
      'array.base': 'Weight probabilities must be an array',
      'array.min': 'At least one weight probability is required',
      'any.required': 'Weight probabilities are required',
    }),
});

export interface GameConfigFormData {
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
    weight:
      | 'FIVE'
      | 'TEN'
      | 'TWENTY'
      | 'FIFTY'
      | 'HUNDRED'
      | 'RESPIN'
      | 'SEVEN';
    status: 'ACTIVE' | 'INACTIVE';
  }>;
}

export const validateGameConfig = (
  data: Omit<GameConfigFormData, 'weightProbabilities'> & {
    weightProbabilities: Array<{
      id: string;
      chance: number | string;
      questions: number | string;
      weight:
        | 'FIVE'
        | 'TEN'
        | 'TWENTY'
        | 'FIFTY'
        | 'HUNDRED'
        | 'RESPIN'
        | 'SEVEN';
      status: 'ACTIVE' | 'INACTIVE';
    }>;
  },
) => {
  const { error, value } = gameConfigSchema.validate(data, {
    abortEarly: false,
    convert: true,
  });

  if (!error) {
    return {
      isValid: true as const,
      errors: {},
      data: value as GameConfigFormData,
    };
  }

  const errors: Record<string, string> = {};

  error.details.forEach((detail) => {
    const path = detail.path.join('.');
    if (path) {
      errors[path] = detail.message;
    } else if (detail.path.length === 1) {
      errors[detail.path[0] as string] = detail.message;
    }
  });

  return {
    isValid: false as const,
    errors,
    data: undefined,
  };
};

export const prepareGameConfigData = (formData: GameConfigFormData) => {
  return {
    minimumStake: formData.minimumStake,
    maximumStake: formData.maximumStake,
    maxRespin: formData.maxRespin,
    defaultSpin: formData.defaultSpin,
    enableSpin: formData.enableSpin,
    spinAmount: formData.spinAmount,
    stakeMultiplier: formData.stakeMultiplier,
    weightProbabilities: formData.weightProbabilities.map((wp) => ({
      ...wp,
      chance: wp.chance,
      questions: wp.questions,
    })),
  };
};
