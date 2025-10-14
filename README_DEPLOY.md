# 🚀 Sistema AVCB Digital - Deploy Completo

## ✅ O que foi implementado

### Frontend (React + TypeScript)
- ✅ Consulta de CNPJ automática
- ✅ Questionário com navegação bidirecional
- ✅ Classificação de risco automática
- ✅ Geração de certificados PDF
- ✅ Dashboard interativo com estatísticas
- ✅ Suporte a localStorage E API

### Backend (Netlify Functions)
- ✅ API REST serverless
- ✅ Integração com DynamoDB
- ✅ CRUD completo
- ✅ Estatísticas em tempo real

### Banco de Dados (AWS DynamoDB)
- ✅ Tabela configurada
- ✅ NoSQL escalável
- ✅ Free tier generoso

---

## 📁 Arquivos Criados para Deploy

```
✅ netlify.toml                    # Configuração Netlify
✅ netlify/functions/analyses.js   # API serverless
✅ .env.example                    # Exemplo de variáveis
✅ src/lib/api.ts                  # Cliente API
✅ src/lib/database.ts             # Suporte API + localStorage
```

---

## 🎯 Guias de Deploy

### 1. **DEPLOY_RAPIDO.md** ⚡
   - **3 passos simples**
   - **15 minutos total**
   - Ideal para começar agora

### 2. **DEPLOY_NETLIFY_AWS.md** 📚
   - Guia completo e detalhado
   - Troubleshooting
   - Comandos úteis

### 3. **AWS_SETUP_GUIDE.md** 🔧
   - Configuração AWS detalhada
   - Opções de backend
   - Para referência futura

---

## ⚡ Deploy Rápido (Resumo)

### Passo 1: AWS DynamoDB
```
1. AWS Console → DynamoDB
2. Create table: "avcb-analyses"
3. IAM → Create user com DynamoDBFullAccess
4. Copiar Access Key + Secret Key
```

### Passo 2: GitHub
```bash
git init
git add .
git commit -m "Deploy"
git remote add origin https://github.com/SEU-USER/avcb.git
git push -u origin main
```

### Passo 3: Netlify
```
1. app.netlify.com → Import from GitHub
2. Adicionar variáveis:
   - AWS_REGION=us-east-1
   - AWS_ACCESS_KEY_ID=xxx
   - AWS_SECRET_ACCESS_KEY=xxx
3. Deploy!
```

---

## 🧪 Testar Localmente

### Com Netlify Dev (Recomendado)
```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Criar .env na raiz
cat > .env << EOF
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=sua_key
AWS_SECRET_ACCESS_KEY=sua_secret
EOF

# Rodar
netlify dev

# Acesse: http://localhost:8888
```

### Sem Netlify (localStorage)
```bash
# Criar .env.local
cat > .env.local << EOF
VITE_USE_API=false
EOF

# Rodar
npm run dev

# Acesse: http://localhost:8081
```

---

## 🔄 Modo de Operação

O sistema detecta automaticamente o ambiente:

### Produção (Netlify)
```
Frontend → Netlify Functions → DynamoDB
```

### Desenvolvimento Local
```
Frontend → Netlify Dev → DynamoDB
```

### Desenvolvimento Offline
```
Frontend → localStorage (sem API)
```

Controlado pela variável: `VITE_USE_API`

---

## 📊 Estrutura do DynamoDB

### Tabela: avcb-analyses

```json
{
  "id": "string (PK)",
  "cnpj": "string",
  "razao_social": "string",
  "nome_fantasia": "string",
  "cnae_fiscal": "string",
  "cnae_fiscal_descricao": "string",
  "endereco": {
    "logradouro": "string",
    "numero": "string",
    "bairro": "string",
    "municipio": "string",
    "uf": "string",
    "cep": "string"
  },
  "analise": {
    "riskLevel": "low|medium|high",
    "riskScore": "number",
    "riskLevelLegal": "string",
    "answers": []
  },
  "certificado": {
    "numero": "string",
    "tipo": "DDLCB|AR|AVCB",
    "dataEmissao": "ISO date",
    "validade": "ISO date"
  },
  "status": "pendente|aprovado|reprovado",
  "dataAnalise": "ISO date",
  "createdAt": "ISO date"
}
```

---

## 💰 Custos (Free Tier)

### Netlify
- ✅ 100 GB bandwidth/mês
- ✅ 300 minutos build/mês
- ✅ 125k function invocations/mês
- ✅ Sites ilimitados

### AWS DynamoDB
- ✅ 25 GB armazenamento
- ✅ 25 unidades leitura/escrita
- ✅ ~200 milhões de requisições/mês

**Total: R$ 0,00** para POC e uso inicial! 🎉

---

## 🔐 Segurança

### Variáveis de Ambiente
- ✅ Credenciais AWS nunca no código
- ✅ Configuradas no Netlify
- ✅ Não commitadas no Git

### CORS
- ✅ Configurado nas Functions
- ✅ Aceita qualquer origem (ajuste para produção)

### IAM
- ✅ Usuário específico (bombeiro-dynamodb-user)
- ✅ Apenas permissões DynamoDB
- ✅ Sem acesso a outros recursos AWS

---

## 🐛 Troubleshooting

### Erro: "Access Denied"
```
Problema: Credenciais AWS incorretas
Solução: Verifique variáveis no Netlify
```

### Erro: "Function not found"
```
Problema: Netlify não encontra a função
Solução: Verifique netlify.toml e pasta netlify/functions/
```

### Dados não aparecem
```
Problema: VITE_USE_API não configurado
Solução: Adicione VITE_USE_API=true no .env.local e rebuild
```

### Build falha no Netlify
```
Problema: Dependências faltando
Solução: npm install e commit package.json atualizado
```

---

## 📈 Próximos Passos

### Melhorias Imediatas
1. ✅ Domínio customizado (Netlify Settings)
2. ✅ Monitoramento (Netlify Analytics)
3. ✅ Backup DynamoDB (AWS Backup)

### Melhorias Futuras
1. Autenticação (Netlify Identity)
2. Upload de documentos (S3)
3. Notificações (AWS SES)
4. Relatórios avançados
5. Integração com sistema CBMPE

---

## 📞 Suporte

### Documentação
- Netlify: https://docs.netlify.com
- DynamoDB: https://docs.aws.amazon.com/dynamodb
- Netlify Functions: https://docs.netlify.com/functions

### Logs
```bash
# Ver logs das functions
netlify functions:log analyses

# Ver logs de build
netlify logs
```

---

## ✨ Pronto!

Seu sistema está completo e pronto para deploy! 🚀

**Escolha um guia:**
- ⚡ Rápido: `DEPLOY_RAPIDO.md`
- 📚 Completo: `DEPLOY_NETLIFY_AWS.md`

**Boa sorte com sua POC!** 🎯
