const express = require('express');
const router = express.Router();
const pool = require('../db');
const { v4: uuidv4 } = require('uuid');

// GET /api/analyses - Listar todas as análises
router.get('/', async (req, res) => {
  try {
    const { status, risk_level } = req.query;
    
    let query = `
      SELECT 
        a.id,
        a.risk_level,
        a.risk_score,
        a.risk_level_legal,
        a.status,
        a.observacoes,
        a.created_at as data_analise,
        c.cnpj,
        c.razao_social,
        c.nome_fantasia,
        c.cnae_fiscal,
        c.cnae_fiscal_descricao,
        addr.logradouro,
        addr.numero,
        addr.complemento,
        addr.bairro,
        addr.municipio,
        addr.uf,
        addr.cep,
        cert.numero as cert_numero,
        cert.tipo as cert_tipo,
        cert.data_emissao as cert_data_emissao,
        cert.validade as cert_validade
      FROM analyses a
      JOIN companies c ON a.company_id = c.id
      LEFT JOIN addresses addr ON c.id = addr.company_id
      LEFT JOIN certificates cert ON a.id = cert.analysis_id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 1;
    
    if (status) {
      query += ` AND a.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }
    
    if (risk_level) {
      query += ` AND a.risk_level = $${paramCount}`;
      params.push(risk_level);
      paramCount++;
    }
    
    query += ' ORDER BY a.created_at DESC';
    
    const result = await pool.query(query, params);
    
    // Buscar respostas para cada análise
    const analyses = await Promise.all(result.rows.map(async (row) => {
      const answersResult = await pool.query(
        'SELECT * FROM answers WHERE analysis_id = $1 ORDER BY created_at',
        [row.id]
      );
      
      return {
        id: row.id,
        cnpj: row.cnpj,
        razao_social: row.razao_social,
        nome_fantasia: row.nome_fantasia,
        cnae_fiscal: row.cnae_fiscal,
        cnae_fiscal_descricao: row.cnae_fiscal_descricao,
        endereco: {
          logradouro: row.logradouro,
          numero: row.numero,
          complemento: row.complemento,
          bairro: row.bairro,
          municipio: row.municipio,
          uf: row.uf,
          cep: row.cep,
        },
        analise: {
          riskLevel: row.risk_level,
          riskScore: row.risk_score,
          riskLevelLegal: row.risk_level_legal,
          answers: answersResult.rows.map(a => ({
            questionId: a.question_id,
            questionText: a.question_text,
            answer: a.answer,
            answerText: a.answer_text,
          })),
        },
        certificado: row.cert_numero ? {
          numero: row.cert_numero,
          tipo: row.cert_tipo,
          dataEmissao: row.cert_data_emissao,
          validade: row.cert_validade,
        } : null,
        status: row.status,
        dataAnalise: row.data_analise,
        observacoes: row.observacoes,
      };
    }));
    
    res.json(analyses);
  } catch (error) {
    console.error('Erro ao buscar análises:', error);
    res.status(500).json({ error: 'Erro ao buscar análises' });
  }
});

// GET /api/analyses/:id - Buscar análise por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT 
        a.*,
        c.*,
        addr.*,
        cert.*
      FROM analyses a
      JOIN companies c ON a.company_id = c.id
      LEFT JOIN addresses addr ON c.id = addr.company_id
      LEFT JOIN certificates cert ON a.id = cert.analysis_id
      WHERE a.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Análise não encontrada' });
    }
    
    const row = result.rows[0];
    
    // Buscar respostas
    const answersResult = await pool.query(
      'SELECT * FROM answers WHERE analysis_id = $1',
      [id]
    );
    
    const analysis = {
      id: row.id,
      cnpj: row.cnpj,
      razao_social: row.razao_social,
      nome_fantasia: row.nome_fantasia,
      cnae_fiscal: row.cnae_fiscal,
      cnae_fiscal_descricao: row.cnae_fiscal_descricao,
      endereco: {
        logradouro: row.logradouro,
        numero: row.numero,
        complemento: row.complemento,
        bairro: row.bairro,
        municipio: row.municipio,
        uf: row.uf,
        cep: row.cep,
      },
      analise: {
        riskLevel: row.risk_level,
        riskScore: row.risk_score,
        riskLevelLegal: row.risk_level_legal,
        answers: answersResult.rows,
      },
      certificado: row.numero ? {
        numero: row.numero,
        tipo: row.tipo,
        dataEmissao: row.data_emissao,
        validade: row.validade,
      } : null,
      status: row.status,
      dataAnalise: row.created_at,
    };
    
    res.json(analysis);
  } catch (error) {
    console.error('Erro ao buscar análise:', error);
    res.status(500).json({ error: 'Erro ao buscar análise' });
  }
});

// POST /api/analyses - Criar nova análise
router.post('/', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const {
      cnpj,
      razao_social,
      nome_fantasia,
      cnae_fiscal,
      cnae_fiscal_descricao,
      endereco,
      analise,
      certificado,
      status,
      observacoes,
    } = req.body;
    
    // 1. Inserir ou buscar empresa
    let companyResult = await client.query(
      'SELECT id FROM companies WHERE cnpj = $1',
      [cnpj]
    );
    
    let companyId;
    
    if (companyResult.rows.length === 0) {
      // Criar nova empresa
      const insertCompany = await client.query(
        `INSERT INTO companies (cnpj, razao_social, nome_fantasia, cnae_fiscal, cnae_fiscal_descricao)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [cnpj, razao_social, nome_fantasia, cnae_fiscal, cnae_fiscal_descricao]
      );
      companyId = insertCompany.rows[0].id;
      
      // Inserir endereço
      await client.query(
        `INSERT INTO addresses (company_id, logradouro, numero, complemento, bairro, municipio, uf, cep)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [companyId, endereco.logradouro, endereco.numero, endereco.complemento, 
         endereco.bairro, endereco.municipio, endereco.uf, endereco.cep]
      );
    } else {
      companyId = companyResult.rows[0].id;
    }
    
    // 2. Inserir análise
    const analysisResult = await client.query(
      `INSERT INTO analyses (company_id, risk_level, risk_score, risk_level_legal, status, observacoes)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [companyId, analise.riskLevel, analise.riskScore, analise.riskLevelLegal, status, observacoes]
    );
    
    const analysisId = analysisResult.rows[0].id;
    
    // 3. Inserir respostas
    if (analise.answers && analise.answers.length > 0) {
      for (const answer of analise.answers) {
        await client.query(
          `INSERT INTO answers (analysis_id, question_id, question_text, answer, answer_text)
           VALUES ($1, $2, $3, $4, $5)`,
          [analysisId, answer.questionId, answer.questionText, 
           JSON.stringify(answer.answer), answer.answerText]
        );
      }
    }
    
    // 4. Inserir certificado (se houver)
    if (certificado) {
      await client.query(
        `INSERT INTO certificates (analysis_id, numero, tipo, data_emissao, validade)
         VALUES ($1, $2, $3, $4, $5)`,
        [analysisId, certificado.numero, certificado.tipo, 
         certificado.dataEmissao, certificado.validade]
      );
    }
    
    await client.query('COMMIT');
    
    res.status(201).json({
      id: analysisId,
      message: 'Análise criada com sucesso',
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao criar análise:', error);
    res.status(500).json({ error: 'Erro ao criar análise' });
  } finally {
    client.release();
  }
});

// DELETE /api/analyses/:id - Deletar análise
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM analyses WHERE id = $1 RETURNING id',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Análise não encontrada' });
    }
    
    res.json({ message: 'Análise deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar análise:', error);
    res.status(500).json({ error: 'Erro ao deletar análise' });
  }
});

// GET /api/analyses/stats - Estatísticas
router.get('/api/stats', async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'aprovado') as aprovados,
        COUNT(*) FILTER (WHERE status = 'pendente') as pendentes,
        COUNT(*) FILTER (WHERE status = 'reprovado') as reprovados,
        COUNT(*) FILTER (WHERE risk_level = 'low') as risco_baixo,
        COUNT(*) FILTER (WHERE risk_level = 'medium') as risco_medio,
        COUNT(*) FILTER (WHERE risk_level = 'high') as risco_alto
      FROM analyses
    `);
    
    const certStats = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE tipo = 'DDLCB') as ddlcb,
        COUNT(*) FILTER (WHERE tipo = 'AR') as ar,
        COUNT(*) FILTER (WHERE tipo = 'AVCB') as avcb
      FROM certificates
    `);
    
    const row = stats.rows[0];
    const certRow = certStats.rows[0];
    
    res.json({
      total: parseInt(row.total),
      aprovados: parseInt(row.aprovados),
      pendentes: parseInt(row.pendentes),
      reprovados: parseInt(row.reprovados),
      porRisco: {
        baixo: parseInt(row.risco_baixo),
        medio: parseInt(row.risco_medio),
        alto: parseInt(row.risco_alto),
      },
      porTipo: {
        DDLCB: parseInt(certRow.ddlcb),
        AR: parseInt(certRow.ar),
        AVCB: parseInt(certRow.avcb),
      },
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

module.exports = router;
