import Joi from 'joi';

const optionSchema = Joi.string().min(1).required().messages({
  'string.empty': 'Option text cannot be empty.',
  'string.min': 'Option text cannot be empty.',
});

export const questionSchema = Joi.object({
  question: Joi.string().min(5).required().messages({
    'string.empty': 'Question text cannot be empty.',
    'string.min': 'Question must be at least 5 characters long.',
  }),
  options: Joi.array().items(optionSchema).min(4).max(6).required().messages({
    'array.min': 'Each question must have at least 4 options.',
    'array.max': 'Each question can have at most 6 options.',
  }),
  correctAnswer: Joi.string().required().messages({
    'any.required': 'A correct answer must be selected.',
  }),
  id: Joi.string().required(),
  number: Joi.string().required(),
  originalOptions: Joi.array()
    .items(
      Joi.object({
        option: Joi.string(),
        optionId: Joi.string().optional(),
      }),
    )
    .optional(),
  optionIds: Joi.any().optional(),
}).custom((value, helpers) => {
  if (!value.options.includes(value.correctAnswer)) {
    return helpers.error('any.custom', {
      message: 'The correct answer must be one of the provided options.',
    });
  }
  return value;
});

export const gameSchema = Joi.object({
  name: Joi.string().min(3).required().messages({
    'string.empty': 'Game name is required.',
    'string.min': 'Game name must be at least 3 characters long.',
  }),
  entryFee: Joi.number().min(0).required().messages({
    'number.base': 'Entry fee must be a number.',
    'number.min': 'Entry fee cannot be negative.',
  }),
  gamePrize: Joi.number().min(500).required().messages({
    'number.base': 'Game prize must be a number.',
    'number.min': 'Game prize must be at least 500.',
  }),
  coinPrize: Joi.number().min(50).required().messages({
    'number.base': 'Coin prize must be a number.',
    'number.min': 'Coin prize must be at least 50.',
  }),
  questions: Joi.array().items(questionSchema).min(0).required().messages({
    'array.min': 'At least one question is required.',
  }),
});
