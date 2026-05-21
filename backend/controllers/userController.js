/**
 * Controller de Usuários (admin)
 */
const User = require('../models/User');

async function getAll(req, res, next) {
  try {
    const result = User.findAll({
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      role: req.query.role,
      search: req.query.search,
    });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const user = User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { name, email, password, role, phone } = req.body;

    const existing = User.findByEmail(email);
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email já cadastrado' });
    }

    const user = User.create({ name, email, password, role, phone });
    res.status(201).json({ success: true, message: 'Usuário criado', data: user });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const existing = User.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }

    // Se está atualizando email, verificar duplicidade
    if (req.body.email && req.body.email !== existing.email) {
      const emailExists = User.findByEmail(req.body.email);
      if (emailExists) {
        return res.status(409).json({ success: false, message: 'Email já em uso' });
      }
    }

    const user = User.update(req.params.id, req.body);
    res.json({ success: true, message: 'Usuário atualizado', data: user });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const existing = User.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }

    // Impedir que admin delete a si mesmo
    if (parseInt(req.params.id) === req.user.id) {
      return res.status(400).json({ success: false, message: 'Você não pode deletar sua própria conta' });
    }

    User.delete(req.params.id);
    res.json({ success: true, message: 'Usuário desativado' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, create, update, remove };
