import Joi from 'joi';

// Option schema
const optionSchema = Joi.object({
  id: Joi.string().required(),
  text: Joi.string().trim().min(1).max(200).required().messages({
    'string.empty': 'Option text cannot be empty',
    'string.min': 'Option text is required',
    'string.max': 'Option text cannot exceed 200 characters',
    'any.required': 'Option text is required',
  }),
});

// Question schema
const questionSchema = Joi.object({
  id: Joi.string().required(),
  question: Joi.string().trim().min(10).max(500).required().messages({
    'string.empty': 'Question cannot be empty',
    'string.min': 'Question must be at least 10 characters long',
    'string.max': 'Question cannot exceed 500 characters',
    'any.required': 'Question is required',
  }),
  options: Joi.array().items(optionSchema).min(4).max(6).required().messages({
    'array.min': 'Each question must have at least 4 options',
    'array.max': 'Each question can have at most 6 options',
    'any.required': 'Options are required',
  }),
  correctOptionIndex: Joi.number()
    .integer()
    .min(0)
    .required()
    .messages({
      'number.base': 'Please select a correct option',
      'number.min': 'Please select a correct option',
      'any.required': 'Please select a correct option',
    })
    .custom((value, helpers) => {
      const question = helpers.state.ancestors[0];
      if (question && question.options && value >= question.options.length) {
        return helpers.error('correctOption.invalid');
      }
      return value;
    })
    .messages({
      'correctOption.invalid': 'Selected correct option is invalid',
    }),
  isExpanded: Joi.boolean().default(false),
});

// Game details schema
const gameDetailsSchema = Joi.object({
  name: Joi.string().trim().min(3).max(100).required().messages({
    'string.empty': 'Game name is required',
    'string.min': 'Game name must be at least 3 characters long',
    'string.max': 'Game name cannot exceed 100 characters',
    'any.required': 'Game name is required',
  }),
  gameDescription: Joi.string().trim().max(500).allow('').optional().messages({
    'string.max': 'Game description cannot exceed 500 characters',
  }),
  entryFee: Joi.number().integer().min(100).max(100000).required().messages({
    'number.base': 'Entry fee must be a valid number',
    'number.integer': 'Entry fee must be a whole number',
    'number.min': 'Entry fee must be at least ₦100',
    'number.max': 'Entry fee cannot exceed ₦100,000',
    'any.required': 'Entry fee is required',
  }),
  gamePrize: Joi.number().integer().min(500).max(1000000).required().messages({
    'number.base': 'Game prize must be a valid number',
    'number.integer': 'Game prize must be a whole number',
    'number.min': 'Game prize must be at least ₦500',
    'number.max': 'Game prize cannot exceed ₦1,000,000',
    'any.required': 'Game prize is required',
  }),
  numOfShare: Joi.number().integer().min(1).max(100).required().messages({
    'number.base': 'Number of shares must be a valid number',
    'number.integer': 'Number of shares must be a whole number',
    'number.min': 'Number of shares must be at least 1',
    'number.max': 'Number of shares cannot exceed 100',
    'any.required': 'Number of shares is required',
  }),
  startDate: Joi.object({
    iso: Joi.string().isoDate().required().messages({
      'string.isoDate': 'Please select a valid start date and time',
      'any.required': 'Start date and time is required',
    }),
  })
    .required()
    .messages({
      'any.required': 'Start date and time is required',
    }),
  videoAds: Joi.object({
    name: Joi.string().required(),
    url: Joi.string().required(),
  }).optional(),
  music: Joi.object({
    name: Joi.string().required(),
    url: Joi.string().required(),
  }).optional(),
});

// Questions form schema
export const questionsFormSchema = Joi.object({
  questions: Joi.array()
    .items(questionSchema)
    .min(1)
    .max(10)
    .required()
    .messages({
      'array.min': 'Please add at least one question',
      'array.max': 'You can add at most 10 questions',
      'any.required': 'Questions are required',
    }),
});

// Combined game creation schema
export const gameCreationSchema = Joi.object({
  gameDetails: gameDetailsSchema.required(),
  questions: Joi.array()
    .items(questionSchema)
    .min(1)
    .max(10)
    .required()
    .messages({
      'array.min': 'Please add at least one question',
      'array.max': 'You can add at most 10 questions',
      'any.required': 'Questions are required',
    }),
});

// Additional validation schema for the datetime input
export const datetimeValidationSchema = Joi.string()
  .required()
  .custom((value, helpers) => {
    const selectedDate = new Date(value);
    const now = new Date();

    if (selectedDate <= now) {
      return helpers.error('datetime.future');
    }

    // Check if the date is more than 1 year in the future
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

    if (selectedDate > oneYearFromNow) {
      return helpers.error('datetime.tooFar');
    }

    return value;
  })
  .messages({
    'datetime.future': 'Start date and time must be in the future',
    'datetime.tooFar': 'Start date cannot be more than 1 year in the future',
    'any.required': 'Start date and time is required',
  });

export { gameDetailsSchema, questionSchema, optionSchema };
