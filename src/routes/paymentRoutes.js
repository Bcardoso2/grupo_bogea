// routes/paymentRoutes.js
const express = require('express');
const PaymentController = require('../controllers/paymentController');
const { authenticateToken } = require('../middleware/auth');
const { logger } = require('../utils/logger');

const router = express.Router();

// Middleware de log
router.use((req, res, next) => {
    logger.debug('Payment route:', {
        method: req.method,
        url: req.url,
        userId: req.user?.userId,
        ip: req.ip
    });
    next();
});

// Criar preferência de pagamento (protegida)
router.post('/create-preference', 
    authenticateToken,
    PaymentController.createPreference
);

// Webhook do Mercado Pago (pública)
router.post('/webhook', 
    PaymentController.handleWebhook
);

// Verificar status do pagamento (protegida)
router.get('/status/:paymentId', 
    authenticateToken,
    PaymentController.checkPaymentStatus
);

// Métodos de pagamento disponíveis (pública)
router.get('/methods', 
    PaymentController.getPaymentMethods
);

module.exports = router;