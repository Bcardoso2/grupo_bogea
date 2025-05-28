 
// server/src/controllers/documentController.js
const Document = require('../models/Document');
const Tag = require('../models/Tag');
const { success, error, created, notFound } = require('../utils/responseHelper');
const asyncHandler = require('../utils/asyncHandler');
const path = require('path');

exports.getDocuments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, category, client_id, status } = req.query;
  
  const filters = {
    page: parseInt(page),
    limit: parseInt(limit),
    search,
    category,
    client_id,
    status
  };
  
  const documents = await Document.findAll(filters);
  const total = await Document.count(filters);
  
  success(res, {
    documents,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

exports.getDocument = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const document = await Document.findById(id);
  
  if (!document) {
    return notFound(res, 'Documento não encontrado');
  }
  
  success(res, document);
});

exports.uploadDocument = asyncHandler(async (req, res) => {
  const { title, description, category, client_id, status = 'active' } = req.body;
  const file = req.file;
  
  if (!file) {
    return error(res, 'Nenhum arquivo foi enviado', 400);
  }
  
  const document = await Document.create({
    title,
    description,
    file_path: `uploads/documents/${file.filename}`,
    file_type: file.mimetype,
    file_size: file.size,
    category,
    client_id: client_id || null,
    status,
    uploaded_by: req.user.id
  });
  
  created(res, document, 'Documento enviado com sucesso');
});

exports.updateDocument = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, category, client_id, status } = req.body;
  
  const existingDocument = await Document.findById(id);
  if (!existingDocument) {
    return notFound(res, 'Documento não encontrado');
  }
  
  const updatedDocument = await Document.update(id, {
    title,
    description,
    category,
    client_id,
    status
  });
  
  success(res, updatedDocument, 'Documento atualizado com sucesso');
});

exports.deleteDocument = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const document = await Document.findById(id);
  if (!document) {
    return notFound(res, 'Documento não encontrado');
  }
  
  await Document.delete(id);
  
  success(res, null, 'Documento excluído com sucesso');
});

exports.downloadDocument = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const document = await Document.findById(id);
  
  if (!document) {
    return notFound(res, 'Documento não encontrado');
  }
  
  const filePath = path.join(__dirname, '../..', document.file_path);
  
  res.download(filePath, document.title, (err) => {
    if (err) {
      return error(res, 'Erro ao fazer download do arquivo', 500);
    }
  });
});