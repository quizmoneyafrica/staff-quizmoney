import Joi from 'joi';

export interface ProductFormData {
  name: string;
  price: string;
  quantity: string;
  category: string;
  description: string;
}

export interface ProductSubmitData {
  name: string;
  price: number;
  quantity: number;
  category?: string;
  description?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const productValidationSchema = Joi.object({
  name: Joi.string().trim().min(2).required().messages({
    'string.empty': 'Product name is required',
    'string.min': 'Product name must be at least 2 characters',
    'any.required': 'Product name is required',
  }),

  price: Joi.string()
    .trim()
    .required()
    .custom((value, helpers) => {
      const priceNum = parseFloat(value);
      if (isNaN(priceNum) || priceNum <= 0) {
        return helpers.error('number.positive');
      }
      return value;
    })
    .messages({
      'string.empty': 'Product price is required',
      'any.required': 'Product price is required',
      'number.positive': 'Price must be a positive number',
    }),

  quantity: Joi.string()
    .trim()
    .required()
    .custom((value, helpers) => {
      const quantityNum = parseInt(value);
      if (isNaN(quantityNum) || quantityNum < 0) {
        return helpers.error('number.nonNegative');
      }
      return value;
    })
    .messages({
      'string.empty': 'Product quantity is required',
      'any.required': 'Product quantity is required',
      'number.nonNegative': 'Quantity must be a non-negative number',
    }),

  category: Joi.string().trim().allow('').optional(),

  description: Joi.string().trim().allow('').optional(),
});

export const validateProductForm = (
  data: ProductFormData,
): ValidationResult => {
  const { error } = productValidationSchema.validate(data, {
    abortEarly: false,
    allowUnknown: false,
  });

  if (!error) {
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

export const prepareProductData = (
  formData: ProductFormData,
): ProductSubmitData => {
  return {
    name: formData.name.trim(),
    price: parseFloat(formData.price),
    quantity: parseInt(formData.quantity),
    category: formData.category || 'general',
    description: formData.description.trim(),
  };
};
