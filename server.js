 
require('dotenv').config();
const createApp = require('./app');
const { testConnection } = require('./src/config/database');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const startServer = async () => {
  try {
    // Testar conexão com o banco de dados
    logger.info('Testando conexão com o banco de dados...');
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      logger.error('Falha na conexão com o banco de dados');
      process.exit(1);
    }
    
    // Criar aplicação Express
    const app = createApp();
    
    // Iniciar servidor
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Servidor iniciado com sucesso!`);
      logger.info(`📍 Ambiente: ${NODE_ENV}`);
      logger.info(`🌐 URL: http://localhost:${PORT}`);
      logger.info(`📚 API Docs: http://localhost:${PORT}/api`);
      console.log(`\n🎉 Sistema Grupo Bogea rodando na porta ${PORT}`);
    });
    
    // Graceful shutdown
    const gracefulShutdown = (signal) => {
      logger.info(`Recebido sinal ${signal}. Encerrando servidor...`);
      
      server.close(() => {
        logger.info('Servidor HTTP encerrado.');
        process.exit(0);
      });
      
      // Forçar encerramento após 10 segundos
      setTimeout(() => {
        logger.error('Forçando encerramento do servidor.');
        process.exit(1);
      }, 10000);
    };
    
    // Listeners para sinais de encerramento
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    // Listener para erros não capturados
    process.on('uncaughtException', (error) => {
      logger.error('Erro não capturado:', error);
      process.exit(1);
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Promise rejeitada não tratada:', { reason, promise });
      process.exit(1);
    });
    
  } catch (error) {
    logger.error('Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

// Iniciar servidor apenas se este arquivo for executado diretamente
if (require.main === module) {
  startServer();
}

module.exports = { startServer };