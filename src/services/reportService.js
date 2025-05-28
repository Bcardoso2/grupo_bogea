 
// server/src/services/reportService.js
const { pool } = require('../config/database');
const { formatCurrency, formatDate } = require('../utils/helpers');
const logger = require('../utils/logger');

class ReportService {
  async getClientReport(clientId, startDate, endDate) {
    try {
      const [client] = await pool.execute('SELECT * FROM clients WHERE id = ?', [clientId]);
      
      if (!client.length) {
        throw new Error('Cliente não encontrado');
      }
      
      const [documents] = await pool.execute(`
        SELECT * FROM documents 
        WHERE client_id = ? 
        AND created_at BETWEEN ? AND ?
        ORDER BY created_at DESC
      `, [clientId, startDate, endDate]);
      
      const [contracts] = await pool.execute(`
        SELECT * FROM contracts 
        WHERE client_id = ? 
        AND created_at BETWEEN ? AND ?
        ORDER BY start_date DESC
      `, [clientId, startDate, endDate]);
      
      const [projects] = await pool.execute(`
        SELECT * FROM projects 
        WHERE client_id = ? 
        AND created_at BETWEEN ? AND ?
        ORDER BY created_at DESC
      `, [clientId, startDate, endDate]);
      
      return {
        client: client[0],
        period: { startDate, endDate },
        summary: {
          documentsCount: documents.length,
          contractsCount: contracts.length,
          projectsCount: projects.length,
          totalContractValue: contracts.reduce((sum, contract) => sum + (contract.value || 0), 0)
        },
        documents,
        contracts,
        projects
      };
    } catch (error) {
      logger.error('Erro ao gerar relatório do cliente:', error);
      throw error;
    }
  }

  async getContractsReport(startDate, endDate) {
    try {
      const [contracts] = await pool.execute(`
        SELECT c.*, cl.name as client_name, u.name as responsible_name
        FROM contracts c
        LEFT JOIN clients cl ON c.client_id = cl.id
        LEFT JOIN users u ON c.responsible_id = u.id
        WHERE c.created_at BETWEEN ? AND ?
        ORDER BY c.start_date DESC
      `, [startDate, endDate]);
      
      const [statusStats] = await pool.execute(`
        SELECT status, COUNT(*) as count, SUM(value) as total_value
        FROM contracts
        WHERE created_at BETWEEN ? AND ?
        GROUP BY status
      `, [startDate, endDate]);
      
      const totalValue = contracts.reduce((sum, contract) => sum + (contract.value || 0), 0);
      
      return {
        period: { startDate, endDate },
        summary: {
          totalContracts: contracts.length,
          totalValue,
          averageValue: contracts.length > 0 ? totalValue / contracts.length : 0
        },
        statusStats,
        contracts
      };
    } catch (error) {
      logger.error('Erro ao gerar relatório de contratos:', error);
      throw error;
    }
  }

  async getProjectsReport(startDate, endDate) {
    try {
      const [projects] = await pool.execute(`
        SELECT p.*, c.name as client_name, u.name as manager_name
        FROM projects p
        LEFT JOIN clients c ON p.client_id = c.id
        LEFT JOIN users u ON p.manager_id = u.id
        WHERE p.created_at BETWEEN ? AND ?
        ORDER BY p.created_at DESC
      `, [startDate, endDate]);
      
      const [statusStats] = await pool.execute(`
        SELECT status, COUNT(*) as count, AVG(progress) as avg_progress
        FROM projects
        WHERE created_at BETWEEN ? AND ?
        GROUP BY status
      `, [startDate, endDate]);
      
      const averageProgress = projects.reduce((sum, project) => sum + project.progress, 0) / projects.length || 0;
      
      return {
        period: { startDate, endDate },
        summary: {
          totalProjects: projects.length,
          averageProgress: Math.round(averageProgress),
          completedProjects: projects.filter(p => p.status === 'completed').length
        },
        statusStats,
        projects
      };
    } catch (error) {
      logger.error('Erro ao gerar relatório de projetos:', error);
      throw error;
    }
  }

  async getDocumentsReport(startDate, endDate) {
    try {
      const [documents] = await pool.execute(`
        SELECT d.*, c.name as client_name, u.name as uploaded_by_name
        FROM documents d
        LEFT JOIN clients c ON d.client_id = c.id
        LEFT JOIN users u ON d.uploaded_by = u.id
        WHERE d.created_at BETWEEN ? AND ?
        ORDER BY d.created_at DESC
      `, [startDate, endDate]);
      
      const [categoryStats] = await pool.execute(`
        SELECT category, COUNT(*) as count, SUM(file_size) as total_size
        FROM documents
        WHERE created_at BETWEEN ? AND ?
        GROUP BY category
      `, [startDate, endDate]);
      
      const totalSize = documents.reduce((sum, doc) => sum + doc.file_size, 0);
      
      return {
        period: { startDate, endDate },
        summary: {
          totalDocuments: documents.length,
          totalSize,
          averageSize: documents.length > 0 ? totalSize / documents.length : 0
        },
        categoryStats,
        documents
      };
    } catch (error) {
      logger.error('Erro ao gerar relatório de documentos:', error);
      throw error;
    }
  }
}

module.exports = new ReportService();