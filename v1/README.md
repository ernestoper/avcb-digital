# 🔥 Sistema AVCB Digital - CBMPE

Sistema completo de análise de risco e emissão de certificados AVCB (Auto de Vistoria do Corpo de Bombeiros) para o Corpo de Bombeiros Militar de Pernambuco.

## 🎯 Funcionalidades

- ✅ Consulta automática de CNPJ via BrasilAPI
- ✅ Questionário interativo com navegação bidirecional
- ✅ Classificação automática de risco (Baixo, Médio, Alto)
- ✅ Geração de certificados PDF (DDLCB, AR, AVCB)
- ✅ Dashboard com estatísticas em tempo real
- ✅ Armazenamento em AWS DynamoDB

## 🚀 Tecnologias

- **Frontend**: React + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui
- **API**: Netlify Functions (Serverless)
- **Banco de Dados**: AWS DynamoDB
- **Hospedagem**: Netlify
- **Base Legal**: Decreto 58.545/2025 | NT 1.01/2024 - COSCIP/CBMPE

## 📋 Pré-requisitos

- Node.js 18+
- Conta AWS (para DynamoDB)
- Conta Netlify (para deploy)

## 🛠️ Instalação

```bash
# Clonar repositório
git clone https://github.com/seu-usuario/avcb-digital.git
cd avcb-digital

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
cp .env.example .env.local

# Editar .env com suas credenciais AWS
# Editar .env.local com VITE_USE_API=true
```

## 🧪 Desenvolvimento Local

### Opção 1: Com DynamoDB (Recomendado)

```bash
# Configurar .env com credenciais AWS
# AWS_REGION=us-east-1
# AWS_ACCESS_KEY_ID=sua_key
# AWS_SECRET_ACCESS_KEY=sua_secret

# Configurar .env.local
# VITE_USE_API=true

# Rodar com Netlify Dev
npx netlify dev

# Acesse: http://localhost:8888
```

### Opção 2: Com localStorage (Offline)

```bash
# Configurar .env.local
# VITE_USE_API=false

# Rodar normalmente
npm run dev

# Acesse: http://localhost:8081
```

## 🚀 Deploy

### 1. Criar Tabela DynamoDB na AWS

```
1. AWS Console → DynamoDB
2. Create table
   - Nome: analyses
   - Partition key: id (String)
   - Settings: Default
   - Capacity: On-demand
3. Create table
```

### 2. Criar Usuário IAM

```
1. AWS Console → IAM → Users
2. Create user: bombeiro-dynamodb-user
3. Attach policy: AmazonDynamoDBFullAccess
4. Create access key
5. Copiar Access Key ID e Secret Access Key
```

### 3. Deploy no Netlify

```bash
# Push para GitHub
git push origin main

# No Netlify:
1. Import from GitHub
2. Configure build:
   - Build command: npm run build
   - Publish directory: dist
   - Functions directory: netlify/functions

3. Add environment variables:
   - AWS_REGION=us-east-1
   - AWS_ACCESS_KEY_ID=sua_key
   - AWS_SECRET_ACCESS_KEY=sua_secret

4. Deploy!
```

## 📊 Estrutura do Projeto

```
├── src/
│   ├── components/        # Componentes React
│   │   ├── CNPJForm.tsx
│   │   ├── CompanyInfo.tsx
│   │   └── RiskAnalysis.tsx
│   ├── pages/            # Páginas
│   │   ├── Index.tsx
│   │   └── Dashboard.tsx
│   ├── lib/              # Utilitários
│   │   ├── database.ts   # Integração DB
│   │   ├── api.ts        # Cliente API
│   │   └── certificate.ts # Geração PDF
│   └── assets/           # Imagens
├── netlify/
│   └── functions/        # Serverless Functions
│       └── analyses.js   # API DynamoDB
├── netlify.toml          # Config Netlify
└── package.json
```

## 🔐 Segurança

- ✅ Credenciais AWS apenas em variáveis de ambiente
- ✅ Arquivos `.env` no `.gitignore`
- ✅ HTTPS automático no Netlify
- ✅ CORS configurado nas functions

## 📖 Base Legal

- Decreto Estadual Nº 52.005/2021
- Decreto Nº 58.545/2025
- Norma Técnica NT 1.01/2024 - COSCIP/CBMPE
- NBRs: 12693, 10898, 13434, 13523, 14432, 17240

## 🎯 Classificação de Risco

### Risco I (Baixo)
- Área < 200m² ou ocupação < 50 pessoas
- Certificado: DDLCB (gerado automaticamente)
- Sem necessidade de vistoria presencial

### Risco II (Médio)
- Área 200-930m² ou ocupação 50-100 pessoas
- Certificado: AR (Atestado de Regularidade)
- Requer vistoria técnica

### Risco III (Alto)
- Área > 930m² ou ocupação > 100 pessoas
- Certificado: AVCB (projeto técnico completo)
- Vistoria obrigatória + projeto de engenheiro

## 💰 Custos (Free Tier)

- **Netlify**: 100 GB bandwidth/mês
- **AWS DynamoDB**: 25 GB + milhões de operações
- **Total**: R$ 0,00 para uso inicial

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📝 Licença

Este projeto é desenvolvido para o Corpo de Bombeiros Militar de Pernambuco.

## 📞 Suporte

Para dúvidas ou suporte, consulte a documentação oficial do CBMPE.

---

**Desenvolvido para auxiliar na análise de conformidade com as normas de segurança contra incêndio e pânico do CBMPE.**
