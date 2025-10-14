# ⚡ Deploy Rápido - 3 Passos (15 minutos)

## 🎯 Solução: Netlify + AWS DynamoDB

**Frontend no Netlify + Banco na AWS = POC Perfeita!**

---

## 📋 PASSO 1: AWS DynamoDB (5 min)

### 1. Criar Tabela
```
1. https://console.aws.amazon.com/ → Login
2. Busque "DynamoDB"
3. "Create table"
   - Table name: avcb-analyses
   - Partition key: id (String)
   - Settings: Default
   - Capacity: On-demand
4. "Create table" ✅
```

### 2. Criar Credenciais
```
1. Busque "IAM"
2. "Users" → "Create user"
   - Name: bombeiro-dynamodb-user
3. "Attach policies" → Selecione "AmazonDynamoDBFullAccess"
4. "Create user"
5. Clique no usuário → "Security credentials"
6. "Create access key" → "Application outside AWS"
7. ⚠️ COPIE E GUARDE:
   - Access key ID: AKIAXXXXXXXX
   - Secret key: xxxxxxxxxx
```

---

## 📋 PASSO 2: Preparar Código (2 min)

### 1. Criar .env.local
```bash
# Na raiz do projeto
cat > .env.local << EOF
VITE_USE_API=true
EOF
```

### 2. Commit e Push
```bash
# Se ainda não tem git
git init
git add .
git commit -m "Sistema AVCB - Deploy"

# Criar repo no GitHub: https://github.com/new
# Depois:
git remote add origin https://github.com/SEU-USUARIO/avcb-digital.git
git push -u origin main
```

---

## 📋 PASSO 3: Deploy Netlify (8 min)

### 1. Criar Conta
```
1. https://app.netlify.com/signup
2. Login com GitHub
```

### 2. Importar Projeto
```
1. "Add new site" → "Import an existing project"
2. Escolha "GitHub"
3. Selecione o repositório "avcb-digital"
4. Configure:
   
   Build command: npm run build
   Publish directory: dist
   Functions directory: netlify/functions
```

### 3. Adicionar Variáveis de Ambiente
```
Clique em "Show advanced" → "New variable"

Adicione 3 variáveis:

1. AWS_REGION
   Valor: us-east-1

2. AWS_ACCESS_KEY_ID
   Valor: [Cole sua Access Key da AWS]

3. AWS_SECRET_ACCESS_KEY
   Valor: [Cole sua Secret Key da AWS]
```

### 4. Deploy!
```
1. Clique em "Deploy site"
2. Aguarde 2-3 minutos
3. Clique no link gerado
4. ✅ PRONTO! Seu sistema está no ar!
```

---

## 🎉 Resultado

### Você tem agora:
- ✅ Frontend no ar (Netlify)
- ✅ Banco de dados (AWS DynamoDB)
- ✅ API serverless (Netlify Functions)
- ✅ Deploy automático (push = deploy)
- ✅ HTTPS grátis
- ✅ Tudo no free tier

### URLs:
- **Site**: https://seu-site.netlify.app
- **API**: https://seu-site.netlify.app/api/analyses

---

## 🧪 Testar

1. Acesse seu site
2. Digite um CNPJ
3. Responda o questionário
4. Salve a análise
5. Vá no Dashboard
6. Veja os dados salvos!

**Verificar no DynamoDB:**
1. AWS Console → DynamoDB
2. Tables → avcb-analyses
3. "Explore table items"
4. Veja seus dados! 🎯

---

## 🔄 Atualizar o Site

```bash
# Faça suas alterações
git add .
git commit -m "Atualização"
git push

# Deploy automático em 2 minutos! ✅
```

---

## 💰 Custos

**GRÁTIS** no free tier:
- Netlify: 100 GB/mês
- DynamoDB: 25 GB + milhares de operações
- Suficiente para POC e produção inicial

---

## 🆘 Problemas?

### Site não carrega
```bash
# Ver logs no Netlify
netlify functions:log analyses
```

### Dados não salvam
```
1. Verifique variáveis de ambiente no Netlify
2. Teste credenciais AWS no console
3. Veja logs da função
```

### Erro 403 (Access Denied)
```
Credenciais AWS incorretas ou sem permissão.
Recrie o usuário IAM com AmazonDynamoDBFullAccess
```

---

## ✨ Pronto para Produção!

Seu sistema está:
- ✅ Hospedado
- ✅ Com banco de dados
- ✅ Escalável
- ✅ Seguro (HTTPS)
- ✅ Grátis (free tier)

**Compartilhe o link e teste!** 🚀
