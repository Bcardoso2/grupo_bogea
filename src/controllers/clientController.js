 
// server/src/controllers/clientController.js
const Client = require('../models/Client');
const { success, error, created, notFound } = require('../utils/responseHelper');
const asyncHandler = require('../utils/asyncHandler');

exports.getClients = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, status } = req.query;
  
  const filters = {
    page: parseInt(page),
    limit: parseInt(limit),
    search,
    status
  };
  
  const clients = await Client.findAll(filters);
  const total = await Client.count(filters);
  
  success(res, {
    clients,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

exports.getClient = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const client = await Client.findById(id);
  
  if (!client) {
    return notFound(res, 'Cliente não encontrado');
  }
  
  success(res, client);
});

exports.createClient = asyncHandler(async (req, res) => {
  const { name, email, phone, cnpj, address, contact_person, notes } = req.body;
  
  const client = await Client.create({
    name,
    email,
    phone,
    cnpj,
    address,
    contact_person,
    notes,
    created_by: req.user.id
  });
  
  created(res, client, 'Cliente criado com sucesso');
});

exports.updateClient = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, cnpj, address, contact_person, status, notes } = req.body;
  
  const existingClient = await Client.findById(id);
  if (!existingClient) {
    return notFound(res, 'Cliente não encontrado');
  }
  
  const updatedClient = await Client.update(id, {
    name,
    email,
    phone,
    cnpj,
    address,
    contact_person,
    status,
    notes
  });
  
  success(res, updatedClient, 'Cliente atualizado com sucesso');
});

exports.deleteClient = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const client = await Client.findById(id);
  if (!client) {
    return notFound(res, 'Cliente não encontrado');
  }
  
  await Client.delete(id);
  
  success(res, null, 'Cliente excluído com sucesso');
});

exports.getClientDocuments = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const client = await Client.findById(id);
  if (!client) {
    return notFound(res, 'Cliente não encontrado');
  }
  
  const documents = await Client.getDocuments(id);
  
  success(res, documents);
});

exports.getClientContracts = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const client = await Client.findById(id);
  if (!client) {
    return notFound(res, 'Cliente não encontrado');
  }
  
  const contracts = await Client.getContracts(id);
  
  success(res, contracts);
});

exports.getClientProjects = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const client = await Client.findById(id);
  if (!client) {
    return notFound(res, 'Cliente não encontrado');
  }
  
  const projects = await Client.getProjects(id);
  
  success(res, projects);
});
