const { z } = require('zod');

const workerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  nationality: z.string().trim().min(1, 'Nationality is required'),
  passport_no: z.string().trim().min(1, 'Passport number is required'),
  residence_card_no: z.string().trim().min(1, 'Residence card number is required'),
  visa_type: z.string().trim().min(1, 'Visa type is required'),
  visa_expiry_date: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Visa expiry date must be YYYY-MM-DD'),
});

module.exports = { workerSchema };
