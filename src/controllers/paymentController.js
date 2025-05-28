// controllers/paymentController.js
const mercadopago = require('mercadopago');
const { logger } = require('../utils/logger');
const UserService = require('../services/userService');

// Configurar Mercado Pago
mercadopago.configure({
    access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN
});

class PaymentController {
    /**
     * Criar preferência de pagamento
     * POST /api/payment/create-preference
     */
    static async createPreference(req, res) {
        try {
            const { amount, description = 'Adição de saldo - Raspadinha' } = req.body;
            const userId = req.user.userId;

            // Validações
            if (!amount || amount < 10) {
                return res.status(400).json({
                    success: false,
                    message: 'Valor mínimo: R$ 10,00',
                    code: 'INVALID_AMOUNT'
                });
            }

            if (amount > 1000) {
                return res.status(400).json({
                    success: false,
                    message: 'Valor máximo: R$ 1.000,00',
                    code: 'AMOUNT_TOO_HIGH'
                });
            }

            // Buscar usuário
            const user = await UserService.getUserById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuário não encontrado',
                    code: 'USER_NOT_FOUND'
                });
            }

            logger.info('💳 Criando preferência MP:', { userId, amount, userEmail: user.email });

            // Criar preferência do Mercado Pago
            const preference = {
                items: [
                    {
                        title: description,
                        unit_price: parseFloat(amount),
                        quantity: 1,
                        currency_id: 'BRL'
                    }
                ],
                payer: {
                    name: user.name,
                    email: user.email
                },
                payment_methods: {
                    excluded_payment_methods: [],
                    excluded_payment_types: [],
                    installments: 12
                },
                back_urls: {
                    success: `${process.env.FRONTEND_URL}/profile?payment=success`,
                    failure: `${process.env.FRONTEND_URL}/profile?payment=failure`,
                    pending: `${process.env.FRONTEND_URL}/profile?payment=pending`
                },
                auto_return: 'approved',
                external_reference: `${userId}-${Date.now()}`,
                notification_url: `${process.env.BACKEND_URL}/api/payment/webhook`,
                metadata: {
                    user_id: userId,
                    type: 'add_funds'
                }
            };

            const response = await mercadopago.preferences.create(preference);

            logger.info('✅ Preferência MP criada:', {
                preferenceId: response.body.id,
                userId,
                amount
            });

            res.json({
                success: true,
                data: {
                    preferenceId: response.body.id,
                    initPoint: response.body.init_point,
                    sandboxInitPoint: response.body.sandbox_init_point
                },
                message: 'Preferência criada com sucesso'
            });

        } catch (error) {
            logger.error('Erro ao criar preferência MP:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao processar pagamento',
                code: 'PAYMENT_ERROR'
            });
        }
    }

    /**
     * Webhook do Mercado Pago
     * POST /api/payment/webhook
     */
    static async handleWebhook(req, res) {
        try {
            const { type, data } = req.body;

            logger.info('🔔 Webhook MP recebido:', { type, data });

            if (type === 'payment') {
                const paymentId = data.id;
                
                // Buscar detalhes do pagamento
                const payment = await mercadopago.payment.findById(paymentId);
                
                logger.info('💰 Detalhes do pagamento:', {
                    paymentId,
                    status: payment.body.status,
                    externalReference: payment.body.external_reference
                });

                if (payment.body.status === 'approved') {
                    await this.processApprovedPayment(payment.body);
                }
            }

            res.status(200).send('OK');
        } catch (error) {
            logger.error('Erro no webhook MP:', error);
            res.status(500).send('Error');
        }
    }

    /**
     * Processar pagamento aprovado
     */
    static async processApprovedPayment(payment) {
        try {
            const externalReference = payment.external_reference;
            const [userId] = externalReference.split('-');
            const amount = payment.transaction_amount;

            logger.info('✅ Processando pagamento aprovado:', {
                userId: parseInt(userId),
                amount,
                paymentId: payment.id
            });

            // Adicionar saldo ao usuário
            await UserService.addBalance(parseInt(userId), amount);

            // Salvar transação no histórico
            await this.saveTransaction({
                userId: parseInt(userId),
                paymentId: payment.id,
                amount,
                type: 'deposit',
                status: 'completed',
                method: 'mercado_pago',
                externalReference: payment.external_reference
            });

            logger.info('🎉 Saldo adicionado com sucesso:', {
                userId: parseInt(userId),
                amount
            });

        } catch (error) {
            logger.error('Erro ao processar pagamento aprovado:', error);
        }
    }

    /**
     * Salvar transação
     */
    static async saveTransaction(transactionData) {
        try {
            // Aqui você salvaria no banco de dados
            // await Transaction.create(transactionData);
            logger.info('💾 Transação salva:', transactionData);
        } catch (error) {
            logger.error('Erro ao salvar transação:', error);
            throw error;
        }
    }

    /**
     * Verificar status do pagamento
     * GET /api/payment/status/:paymentId
     */
    static async checkPaymentStatus(req, res) {
        try {
            const { paymentId } = req.params;
            const userId = req.user.userId;

            logger.info('🔍 Verificando status do pagamento:', { paymentId, userId });

            const payment = await mercadopago.payment.findById(paymentId);

            res.json({
                success: true,
                data: {
                    status: payment.body.status,
                    statusDetail: payment.body.status_detail,
                    amount: payment.body.transaction_amount
                }
            });

        } catch (error) {
            logger.error('Erro ao verificar status:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao verificar pagamento'
            });
        }
    }

    /**
     * Listar métodos de pagamento disponíveis
     * GET /api/payment/methods
     */
    static async getPaymentMethods(req, res) {
        try {
            const paymentMethods = await mercadopago.payment_methods.listAll();

            res.json({
                success: true,
                data: paymentMethods.body
            });

        } catch (error) {
            logger.error('Erro ao buscar métodos de pagamento:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao carregar métodos de pagamento'
            });
        }
    }
}

module.exports = PaymentController;