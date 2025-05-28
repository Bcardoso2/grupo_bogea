 
// server/src/middleware/validation.middleware.js
const { validationError } = require('../utils/responseHelper');

const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property], { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return validationError(res, errors);
    }
    
    next();
  };
};

module.exports = { validate };