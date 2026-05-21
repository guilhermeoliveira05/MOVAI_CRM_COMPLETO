/**
 * Controller de Imóveis
 * CRUD completo + upload de imagens
 */
const Property = require('../models/Property');
const path = require('path');

/**
 * GET /api/properties - Listar imóveis com filtros
 */
async function getAll(req, res, next) {
  try {
    const result = Property.findAll({
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      type: req.query.type,
      status: req.query.status,
      transaction_type: req.query.transaction_type,
      city: req.query.city,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined,
      bedrooms: req.query.bedrooms ? parseInt(req.query.bedrooms) : undefined,
      search: req.query.search,
      agent_id: req.query.agent_id,
      featured: req.query.featured !== undefined ? req.query.featured === 'true' : undefined,
    });

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/properties/:id - Buscar imóvel por ID
 */
async function getById(req, res, next) {
  try {
    const property = Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Imóvel não encontrado' });
    }
    res.json({ success: true, data: property });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/properties - Criar imóvel
 */
async function create(req, res, next) {
  try {
    const property = Property.create({
      ...req.body,
      agent_id: req.body.agent_id || req.user.id,
    });

    res.status(201).json({
      success: true,
      message: 'Imóvel criado com sucesso',
      data: property,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/properties/:id - Atualizar imóvel
 */
async function update(req, res, next) {
  try {
    const existing = Property.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Imóvel não encontrado' });
    }

    const property = Property.update(req.params.id, req.body);
    res.json({
      success: true,
      message: 'Imóvel atualizado com sucesso',
      data: property,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/properties/:id - Deletar imóvel
 */
async function remove(req, res, next) {
  try {
    const existing = Property.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Imóvel não encontrado' });
    }

    Property.delete(req.params.id);
    res.json({ success: true, message: 'Imóvel deletado com sucesso' });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/properties/:id/upload-images - Upload de imagens
 */
async function uploadImages(req, res, next) {
  try {
    const property = Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Imóvel não encontrado' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'Nenhuma imagem enviada' });
    }

    // Adicionar novas imagens às existentes
    const newImages = req.files.map((f) => `/uploads/properties/${f.filename}`);
    const allImages = [...(property.images || []), ...newImages];

    const updated = Property.update(req.params.id, { images: allImages });

    res.json({
      success: true,
      message: `${req.files.length} imagem(ns) enviada(s) com sucesso`,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, create, update, remove, uploadImages };
