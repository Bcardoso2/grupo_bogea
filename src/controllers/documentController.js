// server/src/controllers/documentController.js
const path = require('path');
const Document = require('../models/Document');
const Tag = require('../models/Tag'); // caso use tags
const { success, error, created, notFound } = require('../utils/responseHelper');
const asyncHandler = require('../utils/asyncHandler');
const cloudinaryService = require('../services/cloudinaryService');

// Obter lista de documentos com filtros e paginação
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

// Obter documento por ID
exports.getDocument = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const document = await Document.findById(id);

  if (!document) {
    return notFound(res, 'Documento não encontrado');
  }

  success(res, document);
});

// Upload de documento para o Cloudinary
exports.uploadDocument = asyncHandler(async (req, res) => {
  try {
    const { title, description, category, client_id, status = 'active' } = req.body;
    const file = req.file;

    if (!file) {
      console.error('❌ Nenhum arquivo enviado');
      return error(res, 'Nenhum arquivo foi enviado', 400);
    }

    console.log('📤 Iniciando upload para Cloudinary...');

    const uploadResult = await cloudinaryService.uploadFile(file.buffer, file.originalname);

    console.log('✅ Upload completo:', uploadResult);

    const document = await Document.create({
      title,
      description,
      file_url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
      file_type: uploadResult.resource_type,
      file_size: file.size,
      category,
      client_id: client_id || null,
      status,
      uploaded_by: req.user.id
    });

    console.log('📁 Documento salvo:', document);

    created(res, document, 'Documento enviado com sucesso');
  } catch (err) {
    console.error('❌ Erro no uploadDocument:', err);
    return error(res, 'Erro ao enviar documento', 500);
  }
});

// Atualizar documento
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

// Deletar documento e remover do Cloudinary
exports.deleteDocument = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const document = await Document.findById(id);
  if (!document) {
    return notFound(res, 'Documento não encontrado');
  }

  // Remove do Cloudinary
  if (document.public_id) {
    await cloudinaryService.deleteFile(document.public_id);
  }

  // Remove do banco de dados
  await Document.delete(id);

  success(res, null, 'Documento excluído com sucesso');
});

// Fazer download ou redirecionar para o Cloudinary
exports.downloadDocument = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const document = await Document.findById(id);

  if (!document) {
    return notFound(res, 'Documento não encontrado');
  }

  // Redireciona para a URL do Cloudinary (ou faz download se desejar)
  res.redirect(document.file_url);
});
