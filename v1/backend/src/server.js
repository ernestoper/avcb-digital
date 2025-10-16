const express = require('express');
const cors = require('cors');
require('dotenv').config();

const analysesRoutes = require('./routes/analyses');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8081',
  credentials: true,
}));
app.use(express.json());

// Rotas
app.use('/api/analyses', analysesRoutes);

// Rota de health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API AVCB funcionando' });
});

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    message: 'API Sistema AVCB Digital - CBMPE',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      analyses: '/api/analyses',
      stats: '/api/analyses/api/stats',
    },
  });
});

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo deu errado!' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
});

module.exports = app;
