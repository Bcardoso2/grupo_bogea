// ===== 3. SERVIÇO CLOUDINARY (services/cloudinaryService.js) =====
const cloudinary = require('../config/cloudinary');
const path = require('path');

const logger = require('../utils/logger');

class CloudinaryService {
  // Fazer upload de um arquivo
  async uploadFile(fileBuffer, originalName, options = {}) {
    try {
      const defaultOptions = {
        folder: 'uploads/documents',
        resource_type: 'auto', // auto-detecta o tipo de arquivo
        public_id: this.generateFileName(originalName),
        ...options
      };

      return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          defaultOptions,
          (error, result) => {
            if (error) {
              logger.error('Erro no upload Cloudinary:', error);
              reject(error);
            } else {
              resolve(result);
            }
          }
        ).end(fileBuffer);
      });
    } catch (error) {
      logger.error('Erro no serviço Cloudinary:', error);
      throw error;
    }
  }

  // Deletar arquivo
  async deleteFile(publicId, resourceType = 'auto') {
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType
      });
      
      logger.info(`Arquivo deletado do Cloudinary: ${publicId}`);
      return result;
    } catch (error) {
      logger.error(`Erro ao deletar arquivo ${publicId}:`, error);
      throw error;
    }
  }

  // Gerar transformações de imagem
  getImageTransformations(publicId, transformations) {
    return cloudinary.url(publicId, transformations);
  }

  // Obter informações do arquivo
  async getFileInfo(publicId) {
    try {
      const result = await cloudinary.api.resource(publicId);
      return result;
    } catch (error) {
      logger.error(`Erro ao obter info do arquivo ${publicId}:`, error);
      throw error;
    }
  }

  // Listar arquivos por pasta
  async listFiles(folder = 'uploads/documents', maxResults = 50) {
    try {
      const result = await cloudinary.api.resources({
        type: 'upload',
        prefix: folder,
        max_results: maxResults
      });
      return result;
    } catch (error) {
      logger.error(`Erro ao listar arquivos da pasta ${folder}:`, error);
      throw error;
    }
  }

  // Obter estatísticas de uso
  async getUsageStats() {
    try {
      const result = await cloudinary.api.usage();
      return result;
    } catch (error) {
      logger.error('Erro ao obter estatísticas:', error);
      throw error;
    }
  }

  // Gerar nome único para arquivo
  generateFileName(originalName) {
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1E9);
    const extension = path.extname(originalName);
    const baseName = path.basename(originalName, extension);
    const sanitizedName = baseName.replace(/[^a-zA-Z0-9]/g, '_');
    
    return `${sanitizedName}_${timestamp}_${random}`;
  }

  // Gerar URLs otimizadas para diferentes dispositivos
  getResponsiveUrls(publicId) {
    return {
      thumbnail: cloudinary.url(publicId, {
        width: 150,
        height: 150,
        crop: 'fill',
        quality: 'auto',
        format: 'auto'
      }),
      small: cloudinary.url(publicId, {
        width: 400,
        quality: 'auto',
        format: 'auto'
      }),
      medium: cloudinary.url(publicId, {
        width: 800,
        quality: 'auto',
        format: 'auto'
      }),
      large: cloudinary.url(publicId, {
        width: 1200,
        quality: 'auto',
        format: 'auto'
      }),
      original: cloudinary.url(publicId)
    };
  }
}

module.exports = new CloudinaryService();