 
// server/src/controllers/contractController.js
const Contract = require('../models/Contract');
const { success, error, created, notFound } = require('../utils/responseHelper');
const asyncHandler = require('../utils/asyncHandler');
const { generateContractNumber } = require('../utils/helpers');

exports.getContracts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, status, client_id, responsible_id } = req.query;
  
  const filters = {
    page: parseInt(page),
    limit: parseInt(limit),
    search,
    status,
    client_id,
    responsible_id
  };
  
  const contracts = await Contract.findAll(filters);
  const total = await Contract.count(filters);
  
  success(res, {
    contracts,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

exports.getContract = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const contract = await Contract.findById(id);
  
  if (!contract) {
    return notFound(res, 'Contrato não encontrado');
  }
  
  success(res, contract);
});

exports.createContract = asyncHandler(async (req, res) => {
  const { title, client_id, start_date, end_date, value, status = 'draft', document_id, description, responsible_id } = req.body;
  
  const contract = await Contract.create({
    title,
    contract_number: generateContractNumber(),
    client_id,
    start_date,
    end_date,
    value,
    status,
    document_id,
    description,
    responsible_id
  });
  
  created(res, contract, 'Contrato criado com sucesso');
});

exports.updateContract = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, contract_number, start_date, end_date, value, status, document_id, description, responsible_id } = req.body;
  
  const existingContract = await Contract.findById(id);
  if (!existingContract) {
    return notFound(res, 'Contrato não encontrado');
  }
  
  const updatedContract = await Contract.update(id, {
    title,
    contract_number,
    start_date,
    end_date,
    value,
    status,
    document_id,
    description,
    responsible_id
  });
  
  success(res, updatedContract, 'Contrato atualizado com sucesso');
});

exports.deleteContract = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const contract = await Contract.findById(id);
  if (!contract) {
    return notFound(res, 'Contrato não encontrado');
  }
  
  await Contract.delete(id);
  
  success(res, null, 'Contrato excluído com sucesso');
});

exports.getExpiringContracts = asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;
  
  const contracts = await Contract.getExpiringContracts(parseInt(days));
  
  success(res, contracts, `Contratos vencendo em ${days} dias`);
});