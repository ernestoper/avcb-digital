// Banco de dados - suporta localStorage e API REST
import { api, useAPI } from './api';

export interface CompanyAnalysis {
  id: string;
  cnpj: string;
  razao_social: string;
  nome_fantasia?: string;
  cnae_fiscal: string;
  cnae_fiscal_descricao: string;
  endereco: {
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    municipio: string;
    uf: string;
    cep: string;
  };
  analise: {
    riskLevel: 'low' | 'medium' | 'high';
    riskScore: number;
    riskLevelLegal: string;
    answers: Array<{
      questionId: string;
      questionText: string;
      answer: any;
      answerText: string;
    }>;
  };
  certificado?: {
    numero: string;
    dataEmissao: string;
    validade: string;
    tipo: 'DDLCB' | 'AR' | 'AVCB';
  };
  status: 'pendente' | 'aprovado' | 'reprovado';
  dataAnalise: string;
  observacoes?: string;
}

const DB_KEY = 'avcb_analyses';

// Funções localStorage (fallback)
const localDB = {
  save: (analysis: CompanyAnalysis): void => {
    const analyses = localDB.getAll();
    const existingIndex = analyses.findIndex(a => a.id === analysis.id);
    
    if (existingIndex >= 0) {
      analyses[existingIndex] = analysis;
    } else {
      analyses.push(analysis);
    }
    
    localStorage.setItem(DB_KEY, JSON.stringify(analyses));
  },

  getAll: (): CompanyAnalysis[] => {
    const data = localStorage.getItem(DB_KEY);
    return data ? JSON.parse(data) : [];
  },

  getById: (id: string): CompanyAnalysis | null => {
    const analyses = localDB.getAll();
    return analyses.find(a => a.id === id) || null;
  },

  getByCNPJ: (cnpj: string): CompanyAnalysis[] => {
    const analyses = localDB.getAll();
    return analyses.filter(a => a.cnpj === cnpj);
  },

  delete: (id: string): void => {
    const analyses = localDB.getAll();
    const filtered = analyses.filter(a => a.id !== id);
    localStorage.setItem(DB_KEY, JSON.stringify(filtered));
  },

  getStats: () => {
    const analyses = localDB.getAll();
    const total = analyses.length;
    const aprovados = analyses.filter(a => a.status === 'aprovado').length;
    const pendentes = analyses.filter(a => a.status === 'pendente').length;
    const reprovados = analyses.filter(a => a.status === 'reprovado').length;
    
    const porRisco = {
      baixo: analyses.filter(a => a.analise.riskLevel === 'low').length,
      medio: analyses.filter(a => a.analise.riskLevel === 'medium').length,
      alto: analyses.filter(a => a.analise.riskLevel === 'high').length,
    };

    const porTipo = {
      DDLCB: analyses.filter(a => a.certificado?.tipo === 'DDLCB').length,
      AR: analyses.filter(a => a.certificado?.tipo === 'AR').length,
      AVCB: analyses.filter(a => a.certificado?.tipo === 'AVCB').length,
    };

    return {
      total,
      aprovados,
      pendentes,
      reprovados,
      porRisco,
      porTipo,
    };
  },
};

// Exportar db que usa API ou localStorage
export const db = {
  save: async (analysis: CompanyAnalysis): Promise<void> => {
    if (useAPI()) {
      const { id, ...data } = analysis;
      await api.save(data as any);
    } else {
      localDB.save(analysis);
    }
  },

  getAll: async (): Promise<CompanyAnalysis[]> => {
    if (useAPI()) {
      return await api.getAll();
    }
    return localDB.getAll();
  },

  getById: async (id: string): Promise<CompanyAnalysis | null> => {
    if (useAPI()) {
      try {
        return await api.getById(id);
      } catch {
        return null;
      }
    }
    return localDB.getById(id);
  },

  getByCNPJ: async (cnpj: string): Promise<CompanyAnalysis[]> => {
    if (useAPI()) {
      return await api.getByCNPJ(cnpj);
    }
    return localDB.getByCNPJ(cnpj);
  },

  delete: async (id: string): Promise<void> => {
    if (useAPI()) {
      await api.delete(id);
    } else {
      localDB.delete(id);
    }
  },

  getStats: async () => {
    if (useAPI()) {
      return await api.getStats();
    }
    return localDB.getStats();
  },
};

// Gerar ID único
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Gerar número de certificado
export const generateCertificateNumber = (tipo: string): string => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return `${tipo}-${year}-${random}`;
};
