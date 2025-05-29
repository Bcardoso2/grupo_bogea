// ===== 4. CONTROLLER ATUALIZADO (controllers/uploadController.js) =====
const cloudinaryService = require('../services/cloudinaryService');
const logger = require('../utils/logger');

class UploadController {
  // Upload único
  async uploadSingle(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Nenhum arquivo foi enviado'
        });
      }

      // Upload para Cloudinary
      const result = await cloudinaryService.uploadFile(
        req.file.buffer,
        req.file.originalname
      );

      // Preparar resposta
      const fileInfo = {
        originalName: req.file.originalname,
        publicId: result.public_id,
        url: result.secure_url,
        size: result.bytes,
        format: result.format,
        resourceType: result.resource_type,
        uploadedAt: new Date(result.created_at)
      };

      // Se for imagem, adicionar URLs responsivas
      if (result.resource_type === 'image') {
        fileInfo.responsiveUrls = cloudinaryService.getResponsiveUrls(result.public_id);
      }

      res.json({
        success: true,
        message: 'Arquivo enviado com sucesso',
        file: fileInfo
      });

    } catch (error) {
      logger.error('Erro no upload:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Upload múltiplo
  async uploadMultiple(req, res) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Nenhum arquivo foi enviado'
        });
      }

      const uploadPromises = req.files.map(file => 
        cloudinaryService.uploadFile(file.buffer, file.originalname)
      );

      const results = await Promise.allSettled(uploadPromises);
      
      const uploadedFiles = [];
      const errors = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const cloudinaryResult = result.value;
          const fileInfo = {
            originalName: req.files[index].originalname,
            publicId: cloudinaryResult.public_id,
            url: cloudinaryResult.secure_url,
            size: cloudinaryResult.bytes,
            format: cloudinaryResult.format,
            resourceType: cloudinaryResult.resource_type,
            uploadedAt: new Date(cloudinaryResult.created_at)
          };

          if (cloudinaryResult.resource_type === 'image') {
            fileInfo.responsiveUrls = cloudinaryService.getResponsiveUrls(cloudinaryResult.public_id);
          }

          uploadedFiles.push(fileInfo);
        } else {
          errors.push({
            file: req.files[index].originalname,
            error: result.reason.message
          });
        }
      });

      res.json({
        success: uploadedFiles.length > 0,
        message: `${uploadedFiles.length} arquivo(s) enviado(s) com sucesso`,
        files: uploadedFiles,
        errors: errors.length > 0 ? errors : undefined
      });

    } catch (error) {
      logger.error('Erro no upload múltiplo:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Deletar arquivo
  async deleteFile(req, res) {
    try {
      const { publicId } = req.params;
      const { resourceType = 'auto' } = req.query;
      
      const result = await cloudinaryService.deleteFile(publicId, resourceType);
      
      if (result.result === 'ok') {
        res.json({
          success: true,
          message: 'Arquivo deletado com sucesso'
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Arquivo não encontrado'
        });
      }
    } catch (error) {
      logger.error('Erro ao deletar arquivo:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Obter informações do arquivo
  async getFileInfo(req, res) {
    try {
      const { publicId } = req.params;
      
      const fileInfo = await cloudinaryService.getFileInfo(publicId);
      
      res.json({
        success: true,
        file: fileInfo
      });
    } catch (error) {
      if (error.http_code === 404) {
        res.status(404).json({
          success: false,
          message: 'Arquivo não encontrado'
        });
      } else {
        logger.error('Erro ao obter informações do arquivo:', error);
        res.status(500).json({
          success: false,
          message: 'Erro interno do servidor'
        });
      }
    }
  }

  // Listar arquivos
  async listFiles(req, res) {
    try {
      const { folder = 'uploads/documents', limit = 50 } = req.query;
      
      const result = await cloudinaryService.listFiles(folder, parseInt(limit));
      
      res.json({
        success: true,
        files: result.resources,
        totalCount: result.total_count,
        nextCursor: result.next_cursor
      });
    } catch (error) {
      logger.error('Erro ao listar arquivos:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Obter estatísticas de uso
  async getUsageStats(req, res) {
    try {
      const stats = await cloudinaryService.getUsageStats();
      
      res.json({
        success: true,
        stats: {
          bandwidth: {
            used: stats.bandwidth.usage,
            limit: stats.bandwidth.limit,
            percentage: ((stats.bandwidth.usage / stats.bandwidth.limit) * 100).toFixed(2)
          },
          storage: {
            used: stats.storage.usage,
            limit: stats.storage.limit,
            percentage: ((stats.storage.usage / stats.storage.limit) * 100).toFixed(2)
          },
          requests: {
            used: stats.requests.usage,
            limit: stats.requests.limit,
            percentage: ((stats.requests.usage / stats.requests.limit) * 100).toFixed(2)
          }
        }
      });
    } catch (error) {
      logger.error('Erro ao obter estatísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Transformar imagem (redimensionar, otimizar, etc.)
  async transformImage(req, res) {
    try {
      const { publicId } = req.params;
      const { 
        width, 
        height, 
        crop = 'fill', 
        quality = 'auto', 
        format = 'auto' 
      } = req.query;

      const transformedUrl = cloudinary.url(publicId, {
        width: width ? parseInt(width) : undefined,
        height: height ? parseInt(height) : undefined,
        crop,
        quality,
        format
      });

      res.json({
        success: true,
        originalUrl: cloudinary.url(publicId),
        transformedUrl
      });
    } catch (error) {
      logger.error('Erro ao transformar imagem:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = new UploadController();