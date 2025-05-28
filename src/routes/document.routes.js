 
// server/src/routes/document.routes.js
const express = require('express');
const router = express.Router();
const {
  getDocuments,
  getDocument,
  uploadDocument,
  updateDocument,
  deleteDocument,
  downloadDocument
} = require('../controllers/documentController');
const { authMiddleware } = require('../middleware/auth.middleware');
const { uploadSingle } = require('../middleware/upload.middleware');
const { validate } = require('../middleware/validation.middleware');
const { uploadDocumentValidator, updateDocumentValidator } = require('../validators/documentValidator');

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

router.get('/', getDocuments);
router.get('/:id', getDocument);
router.post('/', uploadSingle('file'), validate(uploadDocumentValidator), uploadDocument);
router.put('/:id', validate(updateDocumentValidator), updateDocument);
router.delete('/:id', deleteDocument);
router.get('/:id/download', downloadDocument);

module.exports = router;