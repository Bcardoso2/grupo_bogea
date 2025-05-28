 
// server/src/services/emailService.js
const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendEmail({ to, subject, html, text }) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html,
        text
      };

      const result = await this.transporter.sendMail(mailOptions);
      logger.info(`Email enviado para ${to}:`, result.messageId);
      return result;
    } catch (error) {
      logger.error('Erro ao enviar email:', error);
      throw error;
    }
  }

  async sendWelcomeEmail(user) {
    const subject = 'Bem-vindo ao Sistema Grupo Bogea!';
    const html = `
      <h2>Olá ${user.name}!</h2>
      <p>Seja bem-vindo ao Sistema de Gerenciamento de Documentos do Grupo Bogea.</p>
      <p>Seu acesso foi criado com sucesso. Você já pode fazer login no sistema.</p>
      <p><strong>Email:</strong> ${user.email}</p>
      <p>Atenciosamente,<br>Equipe Grupo Bogea</p>
    `;

    return this.sendEmail({
      to: user.email,
      subject,
      html,
      text: `Olá ${user.name}! Seja bem-vindo ao Sistema Grupo Bogea. Seu acesso foi criado com sucesso.`
    });
  }

  async sendContractExpirationAlert(contract, user) {
    const subject = `Contrato próximo do vencimento: ${contract.title}`;
    const html = `
      <h2>Alerta de Vencimento de Contrato</h2>
      <p>Olá ${user.name},</p>
      <p>O contrato <strong>${contract.title}</strong> está próximo do vencimento.</p>
      <p><strong>Cliente:</strong> ${contract.client_name}</p>
      <p><strong>Data de Vencimento:</strong> ${new Date(contract.end_date).toLocaleDateString('pt-BR')}</p>
      <p>Acesse o sistema para mais detalhes.</p>
      <p>Atenciosamente,<br>Sistema Grupo Bogea</p>
    `;

    return this.sendEmail({
      to: user.email,
      subject,
      html
    });
  }

  async sendTaskAssignmentNotification(task, user) {
    const subject = `Nova tarefa atribuída: ${task.title}`;
    const html = `
      <h2>Nova Tarefa Atribuída</h2>
      <p>Olá ${user.name},</p>
      <p>Uma nova tarefa foi atribuída a você:</p>
      <p><strong>Tarefa:</strong> ${task.title}</p>
      <p><strong>Projeto:</strong> ${task.project_name}</p>
      <p><strong>Prioridade:</strong> ${task.priority}</p>
      ${task.due_date ? `<p><strong>Prazo:</strong> ${new Date(task.due_date).toLocaleDateString('pt-BR')}</p>` : ''}
      <p>Acesse o sistema para mais detalhes.</p>
      <p>Atenciosamente,<br>Sistema Grupo Bogea</p>
    `;

    return this.sendEmail({
      to: user.email,
      subject,
      html
    });
  }
}

module.exports = new EmailService();