# ⚡ Comandos Rápidos - Copy & Paste

## 🚀 Setup Inicial

```bash
# Instalar dependências (já feito)
npm install

# Criar .env.local para usar API
echo "VITE_USE_API=true" > .env.local

# Testar localmente (sem API)
npm run dev
```

---

## 📦 Git & GitHub

```bash
# Inicializar git
git init
git add .
git commit -m "Sistema AVCB - Deploy inicial"

# Criar repo no GitHub: https://github.com/new
# Nome sugerido: avcb-digital

# Adicionar remote e push
git remote add origin https://github.com/SEU-USUARIO/avcb-digital.git
git branch -M main
git push -u origin main
```

---

## 🌐 Netlify CLI (Desenvolvimento Local)

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login no Netlify
netlify login

# Criar .env na raiz (para Netlify Dev)
cat > .env << 'EOF'
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=sua_access_key_aqui
AWS_SECRET_ACCESS_KEY=sua_secret_key_aqui
EOF

# Rodar com Netlify Dev
netlify dev
# Acesse: http://localhost:8888

# Deploy manual
netlify deploy --prod

# Ver logs
netlify functions:log analyses

# Ver status
netlify status
```

---

## 🔧 AWS CLI (Opcional)

```bash
# Instalar AWS CLI
# macOS: brew install awscli
# Linux: sudo apt install awscli
# Windows: https://aws.amazon.com/cli/

# Configurar
aws configure
# AWS Access Key ID: [sua key]
# AWS Secret Access Key: [sua secret]
# Default region: us-east-1
# Default output format: json

# Listar tabelas DynamoDB
aws dynamodb list-tables

# Ver itens da tabela
aws dynamodb scan --table-name avcb-analyses

# Contar itens
aws dynamodb scan --table-name avcb-analyses --select COUNT
```

---

## 🧪 Testar API Localmente

```bash
# Com Netlify Dev rodando (localhost:8888)

# Listar análises
curl http://localhost:8888/api/analyses

# Estatísticas
curl http://localhost:8888/api/analyses/stats

# Criar análise (exemplo)
curl -X POST http://localhost:8888/api/analyses \
  -H "Content-Type: application/json" \
  -d '{
    "cnpj": "12.345.678/0001-90",
    "razao_social": "Teste LTDA",
    "cnae_fiscal": "5611201",
    "cnae_fiscal_descricao": "Restaurantes",
    "endereco": {
      "logradouro": "Rua Teste",
      "numero": "123",
      "bairro": "Centro",
      "municipio": "Recife",
      "uf": "PE",
      "cep": "50000-000"
    },
    "analise": {
      "riskLevel": "low",
      "riskScore": 2,
      "riskLevelLegal": "Risco I (Baixo)",
      "answers": []
    },
    "status": "aprovado"
  }'
```

---

## 🔄 Atualizar Deploy

```bash
# Fazer alterações no código
# ...

# Commit e push (deploy automático)
git add .
git commit -m "Atualização: descrição das mudanças"
git push

# Netlify faz deploy automático em ~2 minutos
```

---

## 🗑️ Limpar/Reset

```bash
# Limpar node_modules
rm -rf node_modules
npm install

# Limpar build
rm -rf dist

# Limpar cache do Netlify
netlify build --clear-cache

# Deletar tabela DynamoDB (CUIDADO!)
aws dynamodb delete-table --table-name avcb-analyses
```

---

## 📊 Monitoramento

```bash
# Ver logs em tempo real (Netlify)
netlify functions:log analyses --stream

# Ver uso do DynamoDB
aws cloudwatch get-metric-statistics \
  --namespace AWS/DynamoDB \
  --metric-name ConsumedReadCapacityUnits \
  --dimensions Name=TableName,Value=avcb-analyses \
  --start-time 2025-01-01T00:00:00Z \
  --end-time 2025-12-31T23:59:59Z \
  --period 3600 \
  --statistics Sum
```

---

## 🐛 Debug

```bash
# Testar função localmente
netlify functions:invoke analyses --payload '{"httpMethod":"GET","path":""}'

# Ver variáveis de ambiente
netlify env:list

# Adicionar variável
netlify env:set AWS_REGION us-east-1

# Build local
npm run build

# Preview do build
npm run preview
```

---

## 📦 Backup DynamoDB

```bash
# Exportar dados
aws dynamodb scan --table-name avcb-analyses > backup.json

# Importar dados (criar script se necessário)
# Use AWS Data Pipeline ou script Node.js
```

---

## 🔐 Segurança

```bash
# Verificar vulnerabilidades
npm audit

# Corrigir automaticamente
npm audit fix

# Atualizar dependências
npm update

# Verificar outdated
npm outdated
```

---

## 📱 URLs Importantes

```bash
# Netlify Dashboard
https://app.netlify.com

# AWS Console
https://console.aws.amazon.com

# DynamoDB
https://console.aws.amazon.com/dynamodb

# IAM (Usuários)
https://console.aws.amazon.com/iam

# GitHub
https://github.com/SEU-USUARIO/avcb-digital
```

---

## ✅ Checklist Deploy

```
□ Criar tabela DynamoDB
□ Criar usuário IAM com credenciais
□ Push código para GitHub
□ Conectar Netlify ao GitHub
□ Adicionar variáveis de ambiente no Netlify
□ Deploy
□ Testar site
□ Verificar dados no DynamoDB
```

---

## 🎯 Comandos Mais Usados

```bash
# Desenvolvimento
npm run dev                    # Rodar localmente
netlify dev                    # Rodar com functions

# Deploy
git push                       # Deploy automático
netlify deploy --prod          # Deploy manual

# Debug
netlify functions:log analyses # Ver logs
netlify status                 # Ver status

# AWS
aws dynamodb scan --table-name avcb-analyses  # Ver dados
```

---

## 💡 Dicas

1. **Sempre use .env para credenciais locais**
2. **Nunca commite .env no Git**
3. **Use netlify dev para testar functions localmente**
4. **Push para GitHub = deploy automático**
5. **Monitore uso do DynamoDB no AWS Console**

---

## 🆘 Ajuda Rápida

```bash
# Netlify
netlify help
netlify functions:help

# AWS
aws dynamodb help
aws help

# NPM
npm help
```

---

Copie e cole os comandos conforme necessário! 🚀
