# 🏠 MOVAI CRM - Plataforma Inteligente de Gestão Imobiliária

Sistema completo de CRM imobiliário com frontend público, painel administrativo e API backend.

---

## 📋 Requisitos do Sistema

- **Node.js** versão 18 ou superior → [Download](https://nodejs.org/)
- **NPM** (incluído com o Node.js)
- **Navegador moderno** (Chrome, Edge, Firefox)
- **Sistema operacional**: Windows 10/11, macOS ou Linux

---

## 🚀 Instalação Rápida (Passo a Passo)

### 1. Extraia o arquivo ZIP

Extraia o arquivo `MOVAI_CRM_COMPLETO.zip` em uma pasta de sua preferência (ex: `C:\Projetos\MOVAI`).

### 2. Abra o terminal na pasta do projeto

No Windows:
- Abra a pasta extraída no **Explorador de Arquivos**
- Clique com o botão direito → **"Abrir no Terminal"** (ou Shift + clique direito → "Abrir PowerShell aqui")

Ou no **VS Code**:
- Abra a pasta no VS Code (File → Open Folder)
- Use o terminal integrado (Ctrl + `)

### 3. Instale as dependências do backend

```bash
cd backend
npm install
```

### 4. Inicialize o banco de dados com dados de exemplo

```bash
npm run seed
```

### 5. Inicie o servidor backend

```bash
npm run dev
```

O servidor vai iniciar em: **http://localhost:3001**

### 6. Abra o frontend no navegador

Abra o arquivo `frontend/pages/index.html` diretamente no navegador:
- Clique duas vezes no arquivo, **OU**
- No VS Code, instale a extensão **Live Server** e clique em "Go Live"

> **💡 Dica**: Para melhor experiência, use a extensão **Live Server** no VS Code. Ela serve os arquivos HTML automaticamente com reload automático.

---

## 🔑 Credenciais de Acesso (Painel Admin)

| Usuário | Email | Senha | Perfil |
|---------|-------|-------|--------|
| Admin MOVAI | admin@movai.com.br | 123456 | Administrador |
| Carlos Silva | carlos@movai.com.br | 123456 | Corretor |
| Ana Oliveira | ana@movai.com.br | 123456 | Corretora |
| Maria Viewer | maria@movai.com.br | 123456 | Visualizador |

---

## 📁 Estrutura do Projeto

```
MOVAI/
├── backend/                    # API do servidor (Node.js + Express)
│   ├── config/                 # Configurações (banco, JWT)
│   ├── controllers/            # Lógica de negócio
│   ├── database/               # Inicialização e seed do banco SQLite
│   ├── middleware/              # Auth, upload, validação, erros
│   ├── models/                 # Modelos de dados
│   ├── routes/                 # Rotas da API
│   ├── uploads/properties/     # Imagens dos imóveis
│   ├── server.js               # Arquivo principal do servidor
│   ├── package.json            # Dependências do Node.js
│   └── .env                    # Variáveis de ambiente
├── frontend/                   # Interface pública do site
│   ├── assets/images/          # Imagens estáticas
│   ├── css/                    # Estilos CSS
│   │   ├── global.css          # Estilos globais
│   │   ├── home.css            # Estilos da homepage
│   │   └── imovel.css          # Estilos da página de detalhes
│   ├── js/                     # Scripts JavaScript
│   │   ├── api.js              # Cliente da API
│   │   ├── main.js             # Funcionalidades interativas
│   │   ├── chatbot.js          # Chatbot
│   │   └── agendamento.js      # Agendamento de visitas
│   └── pages/                  # Páginas HTML
│       ├── index.html          # Homepage
│       ├── imovel.html         # Detalhes do imóvel
│       ├── agendamento.html    # Agendamento
│       ├── cadasatro.html      # Cadastro
│       └── login.html          # Login
└── README.md                   # Este arquivo
```

---

## 🔧 API Endpoints Principais

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /api/health | Status do servidor |
| POST | /api/auth/login | Login |
| POST | /api/auth/register | Cadastro |
| GET | /api/properties | Listar imóveis |
| GET | /api/properties/:id | Detalhes do imóvel |
| GET | /api/leads | Listar leads |
| POST | /api/leads | Criar lead |
| GET | /api/appointments | Listar agendamentos |
| POST | /api/appointments/public | Agendar visita (público) |
| GET | /api/dashboard/stats | Estatísticas |
| GET | /api/dashboard/charts | Dados para gráficos |

---

## 🖼️ Imagens dos Imóveis

As imagens dos imóveis ficam em `backend/uploads/properties/`. O backend serve automaticamente esses arquivos via a rota `/uploads/properties/`.

Para adicionar novas imagens:
1. Coloque os arquivos `.jpg`, `.png` ou `.webp` na pasta `backend/uploads/properties/`
2. No painel admin, ao criar/editar um imóvel, faça upload das imagens

---

## ❓ Resolução de Problemas

### "Erro de conexão" no frontend
- Verifique se o backend está rodando (`npm run dev` na pasta `backend/`)
- Confirme que está na porta 3001: acesse http://localhost:3001/api/health

### Imagens não aparecem
- Verifique se o backend está rodando (as imagens são servidas pelo servidor)
- Confira se a pasta `backend/uploads/properties/` contém os arquivos de imagem
- Execute `npm run seed` para recriar o banco com as referências corretas

### Porta 3001 em uso
- No Windows: `netstat -ano | findstr :3001` para encontrar o processo
- Feche o processo ou altere a porta no arquivo `backend/.env` (variável `PORT`)

### Banco de dados corrompido
- Delete o arquivo `backend/database/movai.db`
- Execute novamente: `npm run seed`

### Erro "MODULE_NOT_FOUND"
- Execute `npm install` novamente na pasta `backend/`

---

## 🛠️ Comandos Úteis

```bash
# Na pasta backend/
npm run dev          # Inicia em modo desenvolvimento (auto-reload)
npm start            # Inicia em modo produção
npm run seed         # Recria o banco com dados de exemplo
npm run init-db      # Apenas inicializa as tabelas (sem dados)
```

---

## 📞 Tecnologias Utilizadas

- **Backend**: Node.js, Express.js, SQLite (better-sqlite3), JWT
- **Frontend**: HTML5, CSS3 (Variáveis CSS), JavaScript Vanilla
- **Segurança**: bcryptjs, helmet, express-rate-limit, JWT
- **Upload**: multer (imagens de imóveis)

---

**© 2026 MOVAI — Todos os direitos reservados.**
