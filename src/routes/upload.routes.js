// ===== 5. ROTAS ATUALIZADAS (routes/uploadRoutes.js) =====
const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { upload } = require('../middleware/upload.middleware');

// Upload único
router.post('/single', 
  upload.single('file'), 
  uploadController.uploadSingle
);

// Upload múltiplo
router.post('/multiple', 
  upload.array('files', 10), 
  uploadController.uploadMultiple
);

// Deletar arquivo
router.delete('/file/:publicId', uploadController.deleteFile);

// Informações do arquivo
router.get('/file/:publicId', uploadController.getFileInfo);

// Listar arquivos
router.get('/files', uploadController.listFiles);

// Estatísticas de uso
router.get('/stats', uploadController.getUsageStats);

// Transformar imagem
router.get('/transform/:publicId', uploadController.transformImage);

// Middleware de tratamento de erros
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Arquivo muito grande (máximo 50MB)'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Muitos arquivos (máximo 10)'
      });
    }
  }
  
  res.status(400).json({
    success: false,
    message: error.message || 'Erro no upload'
  });
});

module.exports = router;
