# 🚀 Guia Completo: Deploy na AWS

## Arquitetura Recomendada

```
Frontend (React)          Backend (API)              Banco de Dados
    ↓                         ↓                           ↓
AWS S3 + CloudFront  →  AWS Lambda + API Gateway  →  AWS RDS PostgreSQL
   (Hospedagem)           (Serverless API)          (Banco de Dados)
```

---

## 📋 Passo 1: Criar Banco de Dados RDS (PostgreSQL)

### 1.1 Acessar AWS Console
```
1. Acesse: https://console.aws.amazon.com/
2. Faça login na sua conta
3. Região: Escolha "us-east-1" (N. Virginia) ou "sa-east-1" (São Paulo)
```

### 1.2 Criar RDS PostgreSQL

**No Console AWS:**
```
1. Vá em "RDS" (busque no topo)
2. Clique em "Create database"
3. Configurações:

   ✅ Engine: PostgreSQL
   ✅ Version: PostgreSQL 15.x (mais recente)
   ✅ Templates: Free tier (para começar)
   
   ✅ DB instance identifier: avcb-database
   ✅ Master username: postgres
   ✅ Master password: [CRIE UMA SENHA FORTE]
   
   ✅ DB instance class: db.t3.micro (Free tier)
   ✅ Storage: 20 GB (Free tier)
   ✅ Storage autoscaling: Desabilitado
   
   ✅ VPC: Default VPC
   ✅ Public access: Yes (para desenvolvimento)
   ✅ VPC security group: Create new
      - Nome: avcb-db-sg
   
   ✅ Database name: avcb_db
   ✅ Port: 5432
   
4. Clique em "Create database"
5. Aguarde 5-10 minutos
```

### 1.3 Configurar Security Group

**Permitir acesso ao banco:**
```
1. Vá em "EC2" → "Security Groups"
2. Encontre "avcb-db-sg"
3. Clique em "Edit inbound rules"
4. Adicione regra:
   - Type: PostgreSQL
   - Port: 5432
   - Source: 0.0.0.0/0 (para desenvolvimento)
   - Description: Allow PostgreSQL access
5. Save rules
```

### 1.4 Anotar Endpoint

```
1. Volte para RDS → Databases
2. Clique em "avcb-database"
3. Copie o "Endpoint" (ex: avcb-database.xxxxx.us-east-1.rds.amazonaws.com)
4. Guarde para usar depois
```

---

## 📋 Passo 2: Criar Schema do Banco

### 2.1 Conectar ao Banco

**Opção A: Usando DBeaver (Recomendado)**
```
1. Baixe: https://dbeaver.io/download/
2. Instale e abra
3. New Connection → PostgreSQL
4. Configure:
   - Host: [SEU-ENDPOINT-RDS]
   - Port: 5432
   - Database: avcb_db
   - Username: postgres
   - Password: [SUA-SENHA]
5. Test Connection → Finish
```

**Opção B: Usando psql (Terminal)**
```bash
psql -h [SEU-ENDPOINT-RDS] -U postgres -d avcb_db
# Digite a senha quando solicitado
```

### 2.2 Criar Tabelas

Execute este SQL:

```sql
-- Tabela de empresas
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cnpj VARCHAR(18) UNIQUE NOT NULL,
    razao_social VARCHAR(255) NOT NULL,
    nome_fantasia VARCHAR(255),
    cnae_fiscal VARCHAR(10) NOT NULL,
    cnae_fiscal_descricao TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de endereços
CREATE TABLE addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    logradouro VARCHAR(255) NOT NULL,
    numero VARCHAR(20) NOT NULL,
    complemento VARCHAR(100),
    bairro VARCHAR(100) NOT NULL,
    municipio VARCHAR(100) NOT NULL,
    uf VARCHAR(2) NOT NULL,
    cep VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de análises
CREATE TABLE analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    risk_level VARCHAR(10) NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
    risk_score INTEGER NOT NULL,
    risk_level_legal VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pendente', 'aprovado', 'reprovado')),
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de respostas
CREATE TABLE answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID REFERENCES analyses(id) ON DELETE CASCADE,
    question_id VARCHAR(50) NOT NULL,
    question_text TEXT NOT NULL,
    answer JSONB NOT NULL,
    answer_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de certificados
CREATE TABLE certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID REFERENCES analyses(id) ON DELETE CASCADE,
    numero VARCHAR(50) UNIQUE NOT NULL,
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('DDLCB', 'AR', 'AVCB')),
    data_emissao TIMESTAMP NOT NULL,
    validade TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX idx_companies_cnpj ON companies(cnpj);
CREATE INDEX idx_analyses_company ON analyses(company_id);
CREATE INDEX idx_analyses_status ON analyses(status);
CREATE INDEX idx_certificates_numero ON certificates(numero);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analyses_updated_at BEFORE UPDATE ON analyses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 📋 Passo 3: Criar Backend API

### Opção A: AWS Lambda + API Gateway (Serverless)

Vou criar os arquivos do backend:

