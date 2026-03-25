// Simple validation middleware (no external dependency like Zod needed)
// Validates request body fields against rules

const validate = (rules) => (req, res, next) => {
  const errors = [];

  for (const [field, rule] of Object.entries(rules)) {
    const value = req.body[field];

    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field} is required`);
      continue;
    }

    if (value !== undefined && value !== null) {
      if (rule.type === 'string' && typeof value !== 'string') {
        errors.push(`${field} must be a string`);
      }
      if (rule.type === 'number' && typeof value !== 'number') {
        errors.push(`${field} must be a number`);
      }
      if (rule.type === 'array' && !Array.isArray(value)) {
        errors.push(`${field} must be an array`);
      }
      if (rule.type === 'boolean' && typeof value !== 'boolean') {
        errors.push(`${field} must be a boolean`);
      }
      if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
        errors.push(`${field} must be at least ${rule.minLength} characters`);
      }
      if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
        errors.push(`${field} must be at most ${rule.maxLength} characters`);
      }
      if (rule.min && typeof value === 'number' && value < rule.min) {
        errors.push(`${field} must be at least ${rule.min}`);
      }
      if (rule.enum && !rule.enum.includes(value)) {
        errors.push(`${field} must be one of: ${rule.enum.join(', ')}`);
      }
      if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
        errors.push(`${field} format is invalid`);
      }
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  next();
};

module.exports = { validate };
