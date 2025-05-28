 
// server/app.js
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const corsMiddleware = require('./src/middleware/cors.middleware');
const { errorHandler, notFound } = require('./src/middleware/error.middleware');
const logger = require('./src/utils/logger');

// Importar rotas
const routes = require('./src/routes');

const createApp = () => {
  const app = express();

  // Middlewares de segurança
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }));
  
  // CORS
  app.use(corsMiddleware);
  
  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  
  // Logging HTTP
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined', {
      stream: { write: (message) => logger.info(message.trim()) }
    }));
  }
  
  // Servir arquivos estáticos
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
  
  // Rotas da API
  app.use('/api', routes);
  
  // Middleware para rotas não encontradas
  app.use(notFound);
  
  // Middleware de tratamento de erros
  app.use(errorHandler);
  
  return app;
};

module.exports = createApp;
