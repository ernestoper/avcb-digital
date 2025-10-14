// Dados de exemplo para testar o dashboard
import { db, generateId, generateCertificateNumber } from './database';

export const seedDatabase = () => {
  const now = new Date();
  
  const sampleData = [
    {
      id: generateId(),
      cnpj: '12.345.678/0001-90',
      razao_social: 'Restaurante Sabor Nordestino LTDA',
      nome_fantasia: 'Sabor Nordestino',
      cnae_fiscal: '5611201',
      cnae_fiscal_descricao: 'Restaurantes e similares',
      endereco: {
        logradouro: 'Rua da Aurora',
        numero: '123',
        bairro: 'Boa Vista',
        municipio: 'Recife',
        uf: 'PE',
        cep: '50050-000',
      },
      analise: {
        riskLevel: 'low' as const,
        riskScore: 2,
        riskLevelLegal: 'Risco I (Baixo)',
        answers: [
          {
            questionId: 'area_total',
            questionText: 'Qual a área total construída?',
            answer: 150,
            answerText: '150 m²',
          },
        ],
      },
      certificado: {
        numero: generateCertificateNumber('DDLCB'),
        dataEmissao: now.toISOString(),
        validade: new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()).toISOString(),
        tipo: 'DDLCB' as const,
      },
      status: 'aprovado' as const,
      dataAnalise: now.toISOString(),
    },
    {
      id: generateId(),
      cnpj: '98.765.432/0001-10',
      razao_social: 'Comércio de Ferragens Silva & Cia',
      cnae_fiscal: '4744005',
      cnae_fiscal_descricao: 'Comércio varejista de ferragens',
      endereco: {
        logradouro: 'Av. Conde da Boa Vista',
        numero: '456',
        bairro: 'Boa Vista',
        municipio: 'Recife',
        uf: 'PE',
        cep: '50060-000',
      },
      analise: {
        riskLevel: 'medium' as const,
        riskScore: 5,
        riskLevelLegal: 'Risco II (Médio)',
        answers: [],
      },
      status: 'pendente' as const,
      dataAnalise: new Date(now.getTime() - 86400000).toISOString(), // 1 dia atrás
    },
    {
      id: generateId(),
      cnpj: '11.222.333/0001-44',
      razao_social: 'Hospital São José LTDA',
      cnae_fiscal: '8610101',
      cnae_fiscal_descricao: 'Atividades de atendimento hospitalar',
      endereco: {
        logradouro: 'Rua do Hospício',
        numero: '789',
        bairro: 'Boa Vista',
        municipio: 'Recife',
        uf: 'PE',
        cep: '50050-100',
      },
      analise: {
        riskLevel: 'high' as const,
        riskScore: 10,
        riskLevelLegal: 'Risco III (Alto)',
        answers: [],
      },
      status: 'pendente' as const,
      dataAnalise: new Date(now.getTime() - 172800000).toISOString(), // 2 dias atrás
    },
    {
      id: generateId(),
      cnpj: '55.666.777/0001-88',
      razao_social: 'Padaria Pão Quente LTDA',
      nome_fantasia: 'Pão Quente',
      cnae_fiscal: '4711301',
      cnae_fiscal_descricao: 'Comércio varejista de mercadorias em geral',
      endereco: {
        logradouro: 'Rua Imperial',
        numero: '321',
        bairro: 'São José',
        municipio: 'Recife',
        uf: 'PE',
        cep: '50020-000',
      },
      analise: {
        riskLevel: 'low' as const,
        riskScore: 1,
        riskLevelLegal: 'Risco I (Baixo)',
        answers: [],
      },
      certificado: {
        numero: generateCertificateNumber('DDLCB'),
        dataEmissao: new Date(now.getTime() - 259200000).toISOString(), // 3 dias atrás
        validade: new Date(now.getFullYear() + 1, now.getMonth(), now.getDate() - 3).toISOString(),
        tipo: 'DDLCB' as const,
      },
      status: 'aprovado' as const,
      dataAnalise: new Date(now.getTime() - 259200000).toISOString(),
    },
  ];

  sampleData.forEach(data => db.save(data));
  
  return sampleData.length;
};

// Limpar banco de dados
export const clearDatabase = () => {
  localStorage.removeItem('avcb_analyses');
};
