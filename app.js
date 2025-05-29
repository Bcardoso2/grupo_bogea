const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const cors = require('cors'); // ou use o middleware customizado se preferir
const { errorHandler, notFound } = require('./src/middleware/error.middleware');
const logger = require('./src/utils/logger');
const routes = require('./src/routes');

const createApp = () => {
  const app = express();

  // Segurança
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }));

  // CORS
  app.use(cors()); // ou app.use(corsMiddleware);

  // Parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Logging HTTP (exceto em testes)
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined', {
      stream: { write: (message) => logger.info(message.trim()) }
    }));
  }

  // Arquivos estáticos
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  // Rota de saúde
  app.get('/', (req, res) => {
    res.json({
      message: 'API Grupo Bogea - Sistema de Gerenciamento de Documentos',
      version: '1.0.0',
      status: 'online',
      timestamp: new Date().toISOString()
    });
  });

  // Rotas principais
  app.use('/api', routes);

  // Rota 404
  app.use(notFound);

  // Tratamento de erros
  app.use(errorHandler);

  return app;
};

module.exports = createApp;
