# 🚀 POC Simples - Frontend + DynamoDB (Sem Backend!)

## Solução Mais Simples para POC

```
Frontend React  →  AWS Amplify  →  DynamoDB
(Seu código)      (Hospedagem)     (Banco NoSQL)
```

**Vantagens:**
- ✅ Sem servidor para gerenciar
- ✅ Sem código backend
- ✅ Deploy automático
- ✅ HTTPS grátis
- ✅ Free tier generoso

---

## 📋 Passo 1: Criar DynamoDB (5 minutos)

### 1.1 Acessar AWS Console
```
1. Acesse: https://console.aws.amazon.com/
2. Faça login
3. Região: us-east-1 (N. Virginia) ou sa-east-1 (São Paulo)
```

### 1.2 Criar Tabela DynamoDB

```
1. Busque "DynamoDB" no topo
2. Clique em "Create table"
3. Configure:

   ✅ Table name: avcb-analyses
   ✅ Partition key: id (String)
   ✅ Sort key: (deixe vazio)
   
   ✅ Table settings: Default settings
   ✅ Read/write capacity: On-demand (paga só o que usar)
   
4. Clique em "Create table"
5. Aguarde 1 minuto
```

### 1.3 Criar Índice Secundário (Opcional)

```
1. Clique na tabela "avcb-analyses"
2. Aba "Indexes"
3. "Create index"
   - Partition key: cnpj (String)
   - Index name: cnpj-index
4. Create index
```

---

## 📋 Passo 2: Configurar AWS Amplify (10 minutos)

### 2.1 Instalar Amplify CLI

```bash
# Instalar globalmente
npm install -g @aws-amplify/cli

# Configurar (primeira vez)
amplify configure
```

Siga as instruções:
1. Sign in to AWS Console (abre navegador)
2. Region: us-east-1
3. Username: amplify-user
4. Attach policies: AdministratorAccess-Amplify
5. Access key ID: [copie da AWS]
6. Secret access key: [copie da AWS]
7. Profile name: default

### 2.2 Inicializar Amplify no Projeto

```bash
# Na pasta do seu projeto
cd /caminho/do/projeto

# Inicializar
amplify init
```

Configurações:
```
? Enter a name for the project: avcbdigital
? Initialize the project with the above configuration? Yes
? Select the authentication method: AWS profile
? Please choose the profile you want to use: default
```

### 2.3 Adicionar API (DynamoDB)

```bash
amplify add api
```

Configurações:
```
? Select from one of the below mentioned services: REST
? Provide a friendly name for your resource: avcbapi
? Provide a path: /analyses
? Choose a Lambda source: Create a new Lambda function
? Provide an AWS Lambda function name: avcbFunction
? Choose the runtime: NodeJS
? Choose the function template: CRUD function for DynamoDB
? Choose a DynamoDB data source option: Use DynamoDB table configured in the current Amplify project
? Choose from one of the already configured DynamoDB tables: avcb-analyses
? Do you want to access other resources in this project? No
? Do you want to invoke this function on a recurring schedule? No
? Do you want to configure Lambda layers? No
? Do you want to edit the local lambda function now? No
? Restrict API access? No
? Do you want to add another path? No
```

### 2.4 Deploy

```bash
# Deploy tudo
amplify push

# Aguarde 5-10 minutos
```

---

## 📋 Passo 3: Atualizar Frontend (Mais Simples)

### 3.1 Instalar Dependências

```bash
npm install aws-amplify
```

### 3.2 Criar arquivo de configuração

Crie `.env.local`:
```env
VITE_AWS_REGION=us-east-1
VITE_AWS_API_ENDPOINT=https://xxxxx.execute-api.us-east-1.amazonaws.com/dev
```

### 3.3 Atualizar database.ts (Versão Simples)

Vou criar uma versão simplificada que usa fetch direto:

