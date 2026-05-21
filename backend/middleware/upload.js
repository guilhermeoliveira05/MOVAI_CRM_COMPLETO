/**
 * Middleware de upload de arquivos com Multer
 * Configurado para upload de imagens de imóveis
 */
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Garantir que o diretório de uploads existe
const uploadDir = path.join(__dirname, '..', 'uploads', 'properties');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuração do storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `property-${uniqueSuffix}${ext}`);
  },
});

// Filtro de tipos de arquivo
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não permitido. Apenas JPEG, PNG e WebP são aceitos.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
    files: 10, // máximo 10 arquivos por vez
  },
});

module.exports = upload;
