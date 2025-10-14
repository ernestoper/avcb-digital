# Sistema AVCB Digital - CBMPE

Sistema completo de análise de risco e emissão de certificados AVCB (Auto de Vistoria do Corpo de Bombeiros).

## ✨ Funcionalidades Implementadas

### 1. Análise de Risco
- ✅ Consulta automática de CNPJ via BrasilAPI
- ✅ Questionário interativo com 7 perguntas
- ✅ **Navegação bidirecional** (voltar/avançar entre perguntas)
- ✅ Classificação automática de risco (Baixo, Médio, Alto)
- ✅ Base legal: Decreto 58.545/2025 e NT 1.01/2024

### 2. Geração de Certificados
- ✅ **DDLCB** (Risco Baixo) - gerado automaticamente
- ✅ **AR** (Risco Médio) - pendente de vistoria
- ✅ **AVCB** (Risco Alto) - requer projeto técnico
- ✅ Certificado em PDF para impressão
- ✅ Número único de certificado
- ✅ Validade de 1 ano

### 3. Banco de Dados
- ✅ Armazenamento local (localStorage)
- ✅ Estrutura pronta para migração para API REST
- ✅ Funções CRUD completas
- ✅ Histórico de análises

### 4. Dashboard Interativo
- ✅ **Estatísticas em tempo real**
  - Total de análises
  - Aprovados/Pendentes/Reprovados
  - Distribuição por nível de risco
  - Certificados emitidos por tipo

- ✅ **Gráficos e visualizações**
  - Distribuição por risco (Baixo/Médio/Alto)
  - Certificados por tipo (DDLCB/AR/AVCB)
  - Percentuais calculados automaticamente

- ✅ **Filtros**
  - Todas as análises
  - Apenas aprovadas
  - Apenas pendentes
  - Apenas reprovadas

- ✅ **Ações**
  - Baixar certificado PDF
  - Excluir análise
  - Visualizar detalhes

## 🚀 Como Usar

### Fluxo Completo

1. **Página Inicial** (`/`)
   - Digite o CNPJ da empresa
   - Sistema consulta dados automaticamente

2. **Confirmação de Dados**
   - Verifique as informações da empresa
   - Clique em "Iniciar Análise de Risco"

3. **Questionário**
   - Responda 7 perguntas sobre a edificação
   - Use "Voltar" para revisar respostas anteriores
   - Clique em "Finalizar" na última pergunta

4. **Relatório de Análise**
   - Veja a classificação de risco
   - Clique em "Salvar Análise e Gerar Certificado"
   - Se aprovado, baixe o certificado PDF

5. **Dashboard** (`/dashboard`)
   - Veja todas as análises realizadas
   - Acompanhe estatísticas
   - Baixe certificados salvos

## 📁 Estrutura de Arquivos

```
src/
├── components/
│   ├── CNPJForm.tsx           # Formulário de consulta CNPJ
│   ├── CompanyInfo.tsx        # Exibição de dados da empresa
│   └── RiskAnalysis.tsx       # Questionário e análise de risco
├── pages/
│   ├── Index.tsx              # Página inicial
│   ├── Dashboard.tsx          # Dashboard interativo
│   └── NotFound.tsx           # Página 404
├── lib/
│   ├── database.ts            # Funções de banco de dados
│   ├── certificate.ts         # Geração de certificados PDF
│   └── utils.ts               # Utilitários
└── App.tsx                    # Rotas da aplicação
```

## 🔧 Tecnologias

- **React** + TypeScript
- **React Router** - Navegação
- **Tailwind CSS** - Estilização
- **shadcn/ui** - Componentes UI
- **BrasilAPI** - Consulta de CNPJ
- **localStorage** - Armazenamento local

## 📊 Estrutura de Dados

```typescript
interface CompanyAnalysis {
  id: string;
  cnpj: string;
  razao_social: string;
  cnae_fiscal: string;
  endereco: {...};
  analise: {
    riskLevel: 'low' | 'medium' | 'high';
    riskScore: number;
    riskLevelLegal: string;
    answers: Answer[];
  };
  certificado?: {
    numero: string;
    dataEmissao: string;
    validade: string;
    tipo: 'DDLCB' | 'AR' | 'AVCB';
  };
  status: 'pendente' | 'aprovado' | 'reprovado';
  dataAnalise: string;
}
```

## 🔄 Migração para API REST

O sistema está preparado para migração. Basta substituir as funções em `src/lib/database.ts`:

```typescript
// Exemplo de migração
export const db = {
  save: async (analysis: CompanyAnalysis) => {
    const response = await fetch('/api/analyses', {
      method: 'POST',
      body: JSON.stringify(analysis),
    });
    return response.json();
  },
  
  getAll: async () => {
    const response = await fetch('/api/analyses');
    return response.json();
  },
  
  // ... outras funções
};
```

## 📝 Próximas Melhorias

- [ ] Autenticação de usuários
- [ ] Backend com Node.js/Express
- [ ] Banco de dados PostgreSQL/MongoDB
- [ ] Upload de documentos (plantas, ART, etc)
- [ ] Notificações por email
- [ ] Agendamento de vistorias
- [ ] Histórico de alterações
- [ ] Exportação de relatórios Excel
- [ ] Integração com sistema do CBMPE

## 📄 Base Legal

- Decreto Estadual Nº 52.005/2021
- Decreto Nº 58.545/2025
- Norma Técnica NT 1.01/2024 - COSCIP/CBMPE
- NBRs aplicáveis (12693, 10898, 13434, etc)

## 🎯 Status do Projeto

✅ **Funcional e pronto para uso**
- Sistema completo de análise
- Geração de certificados
- Dashboard interativo
- Navegação entre perguntas implementada
- Armazenamento local funcionando

🔄 **Próximos passos**
- Implementar backend
- Adicionar autenticação
- Conectar com banco de dados real
