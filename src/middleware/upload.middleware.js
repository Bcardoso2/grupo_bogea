// ===== 2. MIDDLEWARE DE UPLOAD ATUALIZADO (middlewares/uploadMiddleware.js) =====
const multer = require('multer');
const path = require('path');

// Usar memoryStorage para o Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    // Documentos
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    
    // Imagens
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/bmp',
    
    // Texto
    'text/plain',
    'text/csv',
    'application/json',
    
    // Áudio
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    
    // Vídeo
    'video/mp4',
    'video/quicktime',
    'video/webm',
    
    // Outros
    'application/zip'
  ];

  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de arquivo não permitido: ${file.mimetype} (${fileExtension})`), false);
  }
};



const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB (Cloudinary suporta até 100MB no plano gratuito)
    files: 10 // Até 10 arquivos simultâneos
  },
  fileFilter: fileFilter
});



const uploadSingle = (fieldName) => upload.single(fieldName);

module.exports = { upload, uploadSingle };