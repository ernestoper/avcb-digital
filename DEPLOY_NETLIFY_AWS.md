# 🚀 Deploy POC: Netlify + AWS DynamoDB

## Arquitetura Simples

```
Frontend React     →     Netlify Functions     →     AWS DynamoDB
(Hospedado Netlify)      (Serverless API)           (Banco AWS)
```

**Por que essa solução?**
- ✅ Frontend no Netlify (grátis, deploy automático)
- ✅ API serverless no Netlify (sem servidor para gerenciar)
- ✅ Banco DynamoDB na AWS (NoSQL, escalável)
- ✅ Tudo no free tier
- ✅ Deploy em 15 minutos

---

## 📋 PARTE 1: Criar DynamoDB na AWS (5 min)

### 1.1 Acessar AWS Console
```
1. https://console.aws.amazon.com/
2. Login
3. Região: us-east-1 (N. Virginia)
```

### 1.2 Criar Tabela DynamoDB

```
1. Busque "DynamoDB"
2. "Create table"
3. Configure:
   
   Table name: avcb-analyses
   Partition key: id (String)
   
   Settings: Default settings
   Capacity: On-demand
   
4. "Create table"
5. Aguarde 1 minuto ✅
```

### 1.3 Criar Usuário IAM (Acesso ao DynamoDB)

```
1. Busque "IAM"
2. "Users" → "Create user"
3. User name: bombeiro-dynamodb-user
4. "Next"
5. "Attach policies directly"
6. Busque e selecione: "AmazonDynamoDBFullAccess"
7. "Next" → "Create user"
8. Clique no usuário criado
9. "Security credentials" → "Create access key"
10. Use case: "Application running outside AWS"
11. "Next" → "Create access key"
12. ⚠️ COPIE E GUARDE:
    - Access key ID: AKIAXXXXXXXX
    - Secret access key: xxxxxxxxxx
```

---

## 📋 PARTE 2: Configurar Netlify Functions (10 min)

### 2.1 Instalar Dependências

```bash
npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb netlify-cli
```

### 2.2 Arquivos Criados ✅

Os seguintes arquivos foram criados:
- `netlify.toml` - Configuração do Netlify
- `netlify/functions/analyses.js` - API serverless
- `.env.example` - Exemplo de variáveis de ambiente

---

## 📋 PARTE 3: Deploy no Netlify (5 min)

### 3.1 Criar Conta no Netlify

```
1. Acesse: https://app.netlify.com/signup
2. Faça login com GitHub
```

### 3.2 Preparar Projeto

```bash
# Criar arquivo .env.local
cp .env.example .env.local

# Editar .env.local
VITE_USE_API=true
```

### 3.3 Fazer Push para GitHub

```bash
# Inicializar git (se ainda não fez)
git init
git add .
git commit -m "Initial commit - Sistema AVCB"

# Criar repositório no GitHub
# https://github.com/new

# Adicionar remote e push
git remote add origin https://github.com/SEU-USUARIO/avcb-digital.git
git branch -M main
git push -u origin main
```

### 3.4 Deploy no Netlify

```
1. No Netlify Dashboard: "Add new site" → "Import an existing project"
2. Escolha "GitHub"
3. Autorize o Netlify
4. Selecione o repositório "avcb-digital"
5. Configure:
   
   Build command: npm run build
   Publish directory: dist
   
6. "Show advanced" → "New variable"
   
   Adicione as variáveis de ambiente:
   
   AWS_REGION = us-east-1
   AWS_ACCESS_KEY_ID = [SUA ACCESS KEY DA AWS]
   AWS_SECRET_ACCESS_KEY = [SUA SECRET KEY DA AWS]
   
7. "Deploy site"
8. Aguarde 2-3 minutos ✅
```

### 3.5 Testar

```
1. Clique no link gerado (ex: https://seu-site.netlify.app)
2. Teste o sistema
3. Verifique o DynamoDB na AWS para ver os dados salvos
```

---

## 📋 PARTE 4: Testar Localmente (Opcional)

### 4.1 Instalar Netlify CLI

```bash
npm install -g netlify-cli
```

### 4.2 Configurar Variáveis Locais

Crie `.env` na raiz:
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=sua_access_key
AWS_SECRET_ACCESS_KEY=sua_secret_key
```

### 4.3 Rodar Localmente

```bash
# Rodar com Netlify Dev (simula ambiente de produção)
netlify dev

# Acesse: http://localhost:8888
```

---

## 🎯 Resumo - O que você tem agora

### ✅ Infraestrutura
- **Frontend**: Hospedado no Netlify (grátis)
- **API**: Netlify Functions (serverless, grátis)
- **Banco**: DynamoDB na AWS (free tier)

### ✅ Funcionalidades
- Consulta de CNPJ
- Questionário com navegação
- Classificação de risco
- Geração de certificados
- Dashboard com estatísticas
- Tudo salvo no DynamoDB

### ✅ Custos (Free Tier)
- **Netlify**: 
  - 100 GB bandwidth/mês
  - 300 minutos build/mês
  - Ilimitado sites
  
- **AWS DynamoDB**:
  - 25 GB armazenamento
  - 25 unidades de leitura/escrita
  - Suficiente para milhares de análises

### ✅ URLs
- **Frontend**: https://seu-site.netlify.app
- **API**: https://seu-site.netlify.app/api/analyses

---

## 🔧 Comandos Úteis

```bash
# Deploy manual
netlify deploy --prod

# Ver logs
netlify functions:log analyses

# Testar função localmente
netlify functions:invoke analyses

# Ver status
netlify status
```

---

## 🐛 Troubleshooting

### Erro: "Access Denied" no DynamoDB
```
Solução: Verifique se as credenciais AWS estão corretas nas 
variáveis de ambiente do Netlify
```

### Erro: "Function not found"
```
Solução: Certifique-se que o arquivo está em netlify/functions/
e que o netlify.toml está configurado corretamente
```

### Dados não aparecem no Dashboard
```
Solução: 
1. Verifique se VITE_USE_API=true no .env.local
2. Faça rebuild do site no Netlify
3. Limpe o cache do navegador
```

---

## 🚀 Próximos Passos

### Melhorias Rápidas
1. **Domínio customizado**: Configure no Netlify (Settings → Domain)
2. **HTTPS**: Automático no Netlify
3. **CI/CD**: Já configurado (push = deploy automático)

### Melhorias Futuras
1. Autenticação (Netlify Identity)
2. Backup do DynamoDB
3. Monitoramento (AWS CloudWatch)
4. CDN para certificados (S3)

---

## ✨ Pronto!

Seu sistema está no ar! 🎉

- Frontend: Netlify
- Banco: AWS DynamoDB
- Deploy automático
- Grátis (free tier)

**Teste agora:** https://seu-site.netlify.app

