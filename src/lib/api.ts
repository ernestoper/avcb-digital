// API Client para integração com Netlify Functions + DynamoDB
import { CompanyAnalysis } from './database';

// Em produção usa Netlify Functions, em dev usa localhost
// Quando roda com netlify dev, usa caminho relativo
const API_URL = import.meta.env.VITE_API_URL || '';

export const api = {
  // Buscar todas as análises
  getAll: async (): Promise<CompanyAnalysis[]> => {
    const response = await fetch(`${API_URL}/api/analyses`);
    if (!response.ok) throw new Error('Erro ao buscar análises');
    return response.json();
  },

  // Buscar análise por ID
  getById: async (id: string): Promise<CompanyAnalysis> => {
    const response = await fetch(`${API_URL}/api/analyses/${id}`);
    if (!response.ok) throw new Error('Análise não encontrada');
    return response.json();
  },

  // Buscar por CNPJ
  getByCNPJ: async (cnpj: string): Promise<CompanyAnalysis[]> => {
    const response = await fetch(`${API_URL}/api/analyses?cnpj=${cnpj}`);
    if (!response.ok) throw new Error('Erro ao buscar análises');
    return response.json();
  },

  // Criar nova análise
  save: async (analysis: Omit<CompanyAnalysis, 'id'>): Promise<{ id: string }> => {
    try {
      console.log('📤 Salvando análise:', analysis);
      console.log('🌐 URL:', `${API_URL}/api/analyses`);
      
      const response = await fetch(`${API_URL}/api/analyses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analysis),
      });
      
      console.log('📥 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro da API:', errorText);
        throw new Error(`Erro ao salvar análise: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('✅ Análise salva:', result);
      return result;
    } catch (error) {
      console.error('❌ Erro completo:', error);
      throw error;
    }
  },

  // Deletar análise
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/api/analyses/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) throw new Error('Erro ao deletar análise');
  },

  // Buscar estatísticas
  getStats: async () => {
    const response = await fetch(`${API_URL}/api/analyses/stats`);
    if (!response.ok) throw new Error('Erro ao buscar estatísticas');
    return response.json();
  },
};

// Verificar se deve usar API ou localStorage
export const useAPI = () => {
  return import.meta.env.VITE_USE_API === 'true';
};
