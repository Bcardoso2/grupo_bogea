require('dotenv').config();
const createApp = require('./app');
const { testConnection } = require('./src/config/database');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const startServer = async () => {
  try {
    logger.info('🟡 Iniciando servidor...');

    // 1. Testar conexão com o banco de dados
    logger.info('🔍 Testando conexão com o banco de dados...');
    const dbConnected = await testConnection();
    logger.info('✅ Conexão respondida');

    if (!dbConnected) {
      logger.error('❌ Falha na conexão com o banco de dados');
      process.exit(1);
    }

    // 2. Criar app Express
    logger.info('🔧 Criando aplicação Express...');
    const app = createApp();
    logger.info('✅ Express App criado');

    // 3. Iniciar servidor
    logger.info(`🚀 Iniciando escuta na porta ${PORT}...`);
    const server = app.listen(PORT, () => {
      logger.info(`🎉 Servidor rodando!`);
      logger.info(`🌐 http://localhost:${PORT}`);
      logger.info(`📚 Documentação: http://localhost:${PORT}/api`);
      console.log(`\n🎉 Sistema Grupo Bogea rodando na porta ${PORT}`);
    });

    // Verificação simples de vida
    setTimeout(() => {
      console.log('⏱️ 5 segundos se passaram, servidor ainda está ativo ✅');
    }, 5000);

    // 4. Graceful shutdown
    const gracefulShutdown = (signal) => {
      logger.warn(`⚠️ Recebido sinal ${signal}. Encerrando servidor...`);

      server.close(() => {
        logger.info('✅ Servidor HTTP encerrado com sucesso.');
        process.exit(0);
      });

      // Força encerramento se travar
      setTimeout(() => {
        logger.error('⏱️ Tempo excedido. Encerrando à força.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // 5. Erros não tratados
    process.on('uncaughtException', (error) => {
      logger.error('💥 Erro não capturado (uncaughtException):', error);
      gracefulShutdown('uncaughtException');
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('💥 Promessa rejeitada sem tratamento:', { reason, promise });
      gracefulShutdown('unhandledRejection');
    });

  } catch (error) {
    logger.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

// Iniciar servidor apenas se este for o arquivo principal
if (require.main === module) {
  startServer();
}

module.exports = { startServer };
