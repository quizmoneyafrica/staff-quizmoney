import Joi from 'joi';

export const referralSettingsSchema = Joi.object({
  rewardPerReferral: Joi.string().pattern(/^\d+$/).required().messages({
    'string.empty': 'Reward per referral is required.',
    'string.pattern.base': 'Must be a whole number.',
  }),
  monthlyLeaderboardRewards: Joi.string().pattern(/^\d+$/).required().messages({
    'string.empty': 'Monthly leaderboard rewards is required.',
    'string.pattern.base': 'Must be a whole number.',
  }),
  referralExpiryPolicy: Joi.string()
    .valid('15 days', '30 days', '60 days', '90 days', 'No expiry')
    .required()
    .messages({
      'string.empty': 'Referral expiry policy is required.',
      'any.only': 'Please select a valid expiry policy.',
    }),
  enableReferrals: Joi.boolean().required(),
});

export interface ReferralSettingsFormData {
  rewardPerReferral: string;
  monthlyLeaderboardRewards: string;
  referralExpiryPolicy: string;
  enableReferrals: boolean;
}

export const validateReferralSettings = (data: ReferralSettingsFormData) => {
  const { error, value } = referralSettingsSchema.validate(data, {
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

export const prepareReferralSettingsData = (
  formData: ReferralSettingsFormData,
) => {
  return {
    rewardPerReferral: Number(formData.rewardPerReferral),
    monthlyLeaderboardRewards: Number(formData.monthlyLeaderboardRewards),
    referralExpiryPolicy: formData.referralExpiryPolicy,
    enableReferrals: formData.enableReferrals,
  };
};
