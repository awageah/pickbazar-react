import * as yup from 'yup';

export const productValidationSchema = yup.object().shape({
  name: yup.string().required('form:error-name-required'),
  price: yup
    .number()
    .typeError('form:error-price-must-number')
    .min(0, 'form:error-price-must-positive')
    .required('form:error-price-required'),
  sale_price: yup
    .number()
    .transform((v) => (isNaN(v) ? undefined : v))
    .lessThan(yup.ref('price'), 'Sale price must be less than the regular price')
    .min(0, 'form:error-sale-price-must-positive')
    .nullable()
    .optional(),
  quantity: yup
    .number()
    .typeError('form:error-quantity-must-number')
    .min(0, 'form:error-quantity-must-positive')
    .integer('form:error-quantity-must-integer')
    .required('form:error-quantity-required'),
  sku: yup.string().nullable().optional(),
  unit: yup.string().required('form:error-unit-required'),
  status: yup.string().nullable().required('form:error-status-required'),
  description: yup.string().optional(),
});
