 
// server/src/middleware/upload.middleware.js
const { uploadDocument } = require('../config/multer');
const { error } = require('../utils/responseHelper');

const uploadSingle = (fieldName = 'file') => {
  return (req, res, next) => {
    const upload = uploadDocument.single(fieldName);
    
    upload(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return error(res, 'Arquivo excede o tamanho máximo de 10MB', 400);
        }
        return error(res, err.message, 400);
      }
      
      if (!req.file) {
        return error(res, 'Nenhum arquivo foi enviado', 400);
      }
      
      next();
    });
  };
};

const uploadMultiple = (fieldName = 'files', maxCount = 5) => {
  return (req, res, next) => {
    const upload = uploadDocument.array(fieldName, maxCount);
    
    upload(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return error(res, 'Um ou mais arquivos excedem o tamanho máximo', 400);
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return error(res, `Número máximo de arquivos excedido (máximo ${maxCount})`, 400);
        }
        return error(res, err.message, 400);
      }
      
      if (!req.files || req.files.length === 0) {
        return error(res, 'Nenhum arquivo foi enviado', 400);
      }
      
      next();
    });
  };
};

module.exports = { uploadSingle, uploadMultiple };