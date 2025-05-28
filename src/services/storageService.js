 
// server/src/services/storageService.js
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

class StorageService {
  constructor() {
    this.uploadsDir = path.join(__dirname, '../../uploads');
    this.documentsDir = path.join(this.uploadsDir, 'documents');
    this.tempDir = path.join(this.uploadsDir, 'temp');
    
    this.ensureDirectoriesExist();
  }

  ensureDirectoriesExist() {
    [this.uploadsDir, this.documentsDir, this.tempDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        logger.info(`Diretório criado: ${dir}`);
      }
    });
  }

  getFileInfo(filePath) {
    try {
      const fullPath = path.join(__dirname, '../..', filePath);
      const stats = fs.statSync(fullPath);
      
      return {
        exists: true,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        path: fullPath
      };
    } catch (error) {
      return { exists: false };
    }
  }

  deleteFile(filePath) {
    try {
      const fullPath = path.join(__dirname, '../..', filePath);
      
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        logger.info(`Arquivo deletado: ${filePath}`);
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error(`Erro ao deletar arquivo ${filePath}:`, error);
      throw error;
    }
  }

  moveFile(sourcePath, destinationPath) {
    try {
      const fullSourcePath = path.join(__dirname, '../..', sourcePath);
      const fullDestinationPath = path.join(__dirname, '../..', destinationPath);
      
      // Criar diretório de destino se não existir
      const destinationDir = path.dirname(fullDestinationPath);
      if (!fs.existsSync(destinationDir)) {
        fs.mkdirSync(destinationDir, { recursive: true });
      }
      
      fs.renameSync(fullSourcePath, fullDestinationPath);
      logger.info(`Arquivo movido de ${sourcePath} para ${destinationPath}`);
      
      return destinationPath;
    } catch (error) {
      logger.error(`Erro ao mover arquivo de ${sourcePath} para ${destinationPath}:`, error);
      throw error;
    }
  }

  getDirectorySize(dirPath) {
    try {
      const fullPath = path.join(__dirname, '../..', dirPath);
      let totalSize = 0;
      
      const files = fs.readdirSync(fullPath);
      
      files.forEach(file => {
        const filePath = path.join(fullPath, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isFile()) {
          totalSize += stats.size;
        } else if (stats.isDirectory()) {
          totalSize += this.getDirectorySize(path.join(dirPath, file));
        }
      });
      
      return totalSize;
    } catch (error) {
      logger.error(`Erro ao calcular tamanho do diretório ${dirPath}:`, error);
      return 0;
    }
  }

  cleanupTempFiles(maxAge = 24 * 60 * 60 * 1000) { // 24 horas
    try {
      const files = fs.readdirSync(this.tempDir);
      const now = Date.now();
      let deletedCount = 0;
      
      files.forEach(file => {
        const filePath = path.join(this.tempDir, file);
        const stats = fs.statSync(filePath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          fs.unlinkSync(filePath);
          deletedCount++;
        }
      });
      
      if (deletedCount > 0) {
        logger.info(`Limpeza de arquivos temporários: ${deletedCount} arquivos deletados`);
      }
      
      return deletedCount;
    } catch (error) {
      logger.error('Erro na limpeza de arquivos temporários:', error);
      return 0;
    }
  }

  getStorageStats() {
    try {
      return {
        totalSize: this.getDirectorySize('uploads'),
        documentsSize: this.getDirectorySize('uploads/documents'),
        tempSize: this.getDirectorySize('uploads/temp'),
        documentsCount: fs.readdirSync(this.documentsDir).length,
        tempCount: fs.readdirSync(this.tempDir).length
      };
    } catch (error) {
      logger.error('Erro ao obter estatísticas de armazenamento:', error);
      return null;
    }
  }
}

module.exports = new StorageService();