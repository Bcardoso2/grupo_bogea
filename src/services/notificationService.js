 
// server/src/services/notificationService.js
const { pool } = require('../config/database');
const emailService = require('./emailService');
const logger = require('../utils/logger');

class NotificationService {
  async checkExpiringContracts() {
    try {
      const [contracts] = await pool.execute(`
        SELECT c.*, cl.name as client_name, u.email as responsible_email, u.name as responsible_name
        FROM contracts c
        LEFT JOIN clients cl ON c.client_id = cl.id
        LEFT JOIN users u ON c.responsible_id = u.id
        WHERE c.end_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
        AND c.status = 'active'
        AND u.email IS NOT NULL
      `);
      
      for (const contract of contracts) {
        await emailService.sendContractExpirationAlert(contract, {
          name: contract.responsible_name,
          email: contract.responsible_email
        });
      }
      
      logger.info(`Verificação de contratos: ${contracts.length} alertas enviados`);
      return contracts.length;
    } catch (error) {
      logger.error('Erro ao verificar contratos vencendo:', error);
      return 0;
    }
  }

  async checkOverdueTasks() {
    try {
      const [tasks] = await pool.execute(`
        SELECT t.*, u.email as assigned_email, u.name as assigned_name, p.name as project_name
        FROM project_tasks t
        LEFT JOIN users u ON t.assigned_to = u.id
        LEFT JOIN projects p ON t.project_id = p.id
        WHERE t.due_date < CURDATE()
        AND t.status != 'completed'
        AND u.email IS NOT NULL
      `);
      
      for (const task of tasks) {
        // Aqui você pode implementar notificação para tarefas em atraso
        logger.info(`Tarefa em atraso: ${task.title} - ${task.assigned_name}`);
      }
      
      return tasks.length;
    } catch (error) {
      logger.error('Erro ao verificar tarefas em atraso:', error);
      return 0;
    }
  }

  async sendDailyDigest() {
    try {
      // Implementar digest diário com resumo de atividades
      logger.info('Digest diário enviado');
    } catch (error) {
      logger.error('Erro ao enviar digest diário:', error);
    }
  }
}

module.exports = new NotificationService();