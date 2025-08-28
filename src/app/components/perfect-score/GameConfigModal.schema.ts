import Joi from 'joi';

export const gameConfigSchema = Joi.object({
  costPerSpin: Joi.string().pattern(/^\d+$/).required().messages({
    'string.empty': 'Cost per spin is required.',
    'string.pattern.base': 'Must be a whole number.',
  }),
  maximumSpinPerUser: Joi.string().pattern(/^\d+$/).required().messages({
    'string.empty': 'Maximum spin is required.',
    'string.pattern.base': 'Must be a whole number.',
  }),
  respinFeatureEnabled: Joi.boolean().required(),
});

export interface GameConfigFormData {
  costPerSpin: string;
  maximumSpinPerUser: string;
  respinFeatureEnabled: boolean;
}

export const validateGameConfig = (data: GameConfigFormData) => {
  const { error, value } = gameConfigSchema.validate(data, {
    abortEarly: false,
  });
  if (!error) {
    return {
      isValid: true,
      errors: {},
      data: value,
    };
  }
  const errors: Record<string, string> = {};
  error.details.forEach((detail) => {
    if (detail.path.length > 0) {
      errors[detail.path[0] as string] = detail.message;
    }
  });
  return {
    isValid: false,
    errors,
    data: undefined,
  };
};

export const prepareGameConfigData = (formData: GameConfigFormData) => {
  return {
    costPerSpin: Number(formData.costPerSpin),
    maximumSpinPerUser: Number(formData.maximumSpinPerUser),
    respinFeatureEnabled: formData.respinFeatureEnabled,
  };
};
