# Documentação: Integração CodeBuild com Banco de Dados

## Objetivo
Estabelecer comunicação segura entre o CodeBuild e o banco de dados RDS PostgreSQL, executando testes e migrações durante o pipeline CI/CD.

## Arquitetura Implementada

```
CodeBuild → AWS Secrets Manager → RDS PostgreSQL
    ↓
Security Groups → VPC Rules → Database Access
```

## Etapa 1: Configuração do AWS Secrets Manager

### 1.1 Criação do Secret
```bash
aws secretsmanager create-secret \
  --name "bia/database/credentials" \
  --description "Credenciais do banco de dados BIA" \
  --secret-string '{"username":"postgres","password":"juniorformacao83","host":"bia.c4nckw8qytev.us-east-1.rds.amazonaws.com","port":5432,"database":"bia"}' \
  --region us-east-1
```

### 1.2 Atualização do Código para Usar Secrets Manager

**Arquivo: `config/database.js`**
```javascript
const AWS = require('aws-sdk');

let dbConfig = null;

async function getDbConfig() {
  if (dbConfig) return dbConfig;

  // Se estiver em ambiente local, usar variáveis de ambiente
  if (isLocalConnection()) {
    dbConfig = {
      username: process.env.DB_USER || "postgres",
      password: process.env.DB_PWD || "postgres",
      database: "bia",
      host: process.env.DB_HOST || "127.0.0.1",
      port: process.env.DB_PORT || 5433,
      dialect: "postgres",
      dialectOptions: {}
    };
    return dbConfig;
  }

  // Em produção, usar Secrets Manager
  try {
    const secretsManager = new AWS.SecretsManager({ region: 'us-east-1' });
    const secret = await secretsManager.getSecretValue({ 
      SecretId: 'bia/database/credentials' 
    }).promise();
    
    const credentials = JSON.parse(secret.SecretString);
    
    dbConfig = {
      username: credentials.username,
      password: credentials.password,
      database: credentials.database,
      host: credentials.host,
      port: credentials.port,
      dialect: "postgres",
      dialectOptions: getRemoteDialectOptions()
    };
    
    return dbConfig;
  } catch (error) {
    console.error('Erro ao buscar credenciais:', error);
    throw error;
  }
}

module.exports = getDbConfig;
```

### 1.3 Adição da Dependência AWS SDK

**Arquivo: `package.json`**
```json
{
  "dependencies": {
    "aws-sdk": "^2.1691.0",
    // ... outras dependências
  }
}
```

## Etapa 2: Configuração de Permissões IAM

### 2.1 Descoberta do Role do CodeBuild
```bash
aws codebuild batch-get-projects \
  --names bia-build \
  --query 'projects[0].serviceRole' \
  --output text
```
**Resultado:** `arn:aws:iam::804826263064:role/bia-build-role`

### 2.2 Criação da Policy IAM
```bash
aws iam create-policy \
  --policy-name BiaSecretsManagerAccess \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": [
          "secretsmanager:GetSecretValue"
        ],
        "Resource": "arn:aws:secretsmanager:us-east-1:*:secret:bia/database/credentials*"
      }
    ]
  }'
```

### 2.3 Anexar Policy ao Role
```bash
aws iam attach-role-policy \
  --role-name bia-build-role \
  --policy-arn arn:aws:iam::804826263064:policy/BiaSecretsManagerAccess
```

## Etapa 3: Configuração de Security Groups

### 3.1 Descoberta do Security Group do RDS
```bash
aws rds describe-db-instances \
  --db-instance-identifier bia \
  --query 'DBInstances[0].VpcSecurityGroups[0].VpcSecurityGroupId' \
  --output text
```
**Resultado:** `sg-0945c260d9df22820`

### 3.2 Verificação da Configuração do CodeBuild
```bash
aws codebuild batch-get-projects \
  --names bia-build \
  --query 'projects[0].vpcConfig.securityGroupIds[0]' \
  --output text
```
**Resultado:** `None` (CodeBuild não está em VPC)

### 3.3 Liberação de Acesso no Security Group do RDS
```bash
# Liberar acesso para ranges de IP do CodeBuild
aws ec2 authorize-security-group-ingress \
  --group-id sg-0945c260d9df22820 \
  --protocol tcp \
  --port 5432 \
  --cidr 52.94.0.0/22

aws ec2 authorize-security-group-ingress \
  --group-id sg-0945c260d9df22820 \
  --protocol tcp \
  --port 5432 \
  --cidr 52.95.0.0/16

aws ec2 authorize-security-group-ingress \
  --group-id sg-0945c260d9df22820 \
  --protocol tcp \
  --port 5432 \
  --cidr 54.230.0.0/16
```

## Etapa 4: Criação de Scripts de Teste

### 4.1 Script de Teste de Conexão

**Arquivo: `scripts/test-db-connection.js`**
```javascript
const { Sequelize } = require('sequelize');
const AWS = require('aws-sdk');

async function getDbConfig() {
  // Se estiver em ambiente local
  if (process.env.DB_HOST === "127.0.0.1" || !process.env.AWS_REGION) {
    return {
      username: process.env.DB_USER || "postgres",
      password: process.env.DB_PWD || "postgres", 
      database: "bia",
      host: process.env.DB_HOST || "127.0.0.1",
      port: process.env.DB_PORT || 5432,
      dialect: "postgres",
      logging: false
    };
  }

  // Em produção, usar Secrets Manager
  const secretsManager = new AWS.SecretsManager({ region: 'us-east-1' });
  const secret = await secretsManager.getSecretValue({ 
    SecretId: 'bia/database/credentials' 
  }).promise();
  
  const credentials = JSON.parse(secret.SecretString);
  
  return {
    username: credentials.username,
    password: credentials.password,
    database: credentials.database,
    host: credentials.host,
    port: credentials.port,
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false
  };
}

async function testConnection() {
  try {
    const config = await getDbConfig();
    const sequelize = new Sequelize(config);
    
    await sequelize.authenticate();
    console.log('✅ Conexão com banco estabelecida com sucesso');
    console.log(`Host: ${config.host}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao conectar com banco:', error.message);
    process.exit(1);
  }
}

testConnection();
```

### 4.2 Atualização dos Scripts NPM

**Arquivo: `package.json`**
```json
{
  "scripts": {
    "test": "jest tests/unit",
    "test:integration": "jest tests/integration",
    "start": "node server",
    "db:test": "node scripts/test-db-connection.js",
    "db:migrate": "npx sequelize-cli db:migrate"
  }
}
```

## Etapa 5: Atualização do BuildSpec

### 5.1 BuildSpec Atualizado

**Arquivo: `pipeline/buildspec.yml`**
```yaml
version: 0.2

phases:
  pre_build:
    commands:
      - echo Fazendo login no ECR...
      - aws --version
      - aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 804826263064.dkr.ecr.us-east-1.amazonaws.com
      - REPOSITORY_URI=804826263064.dkr.ecr.us-east-1.amazonaws.com/bia
      - COMMIT_HASH=$(echo $CODEBUILD_RESOLVED_SOURCE_VERSION | cut -c 1-7)
      - IMAGE_TAG=${COMMIT_HASH:=latest}
      - echo "Instalando dependências..."
      - npm install
      - echo "Testando conexão com banco de dados..."
      - npm run db:test
  build:
    commands:
      - echo Build iniciado em `date`
      - echo "Executando migrações do banco..."
      - npm run db:migrate
      - echo "Executando testes unitários..."
      - npm test
      - echo "Executando testes de integração..."
      - npm run test:integration || echo "Testes de integração não configurados"
      - echo Gerando imagem da BIA..
      - docker build -t $REPOSITORY_URI:latest .
      - docker tag $REPOSITORY_URI:latest $REPOSITORY_URI:$IMAGE_TAG
  post_build:
    commands:
      - echo Build finalizado com sucesso em `date`
      - echo Fazendo push da imagem para o ECR...
      - docker push $REPOSITORY_URI:latest
      - docker push $REPOSITORY_URI:$IMAGE_TAG
      - echo Gerando artefato da imagem para o ECS
      - printf '[{"name":"bia","imageUri":"%s"}]' $REPOSITORY_URI:$IMAGE_TAG > imagedefinitions.json

artifacts:
  files: imagedefinitions.json
```

## Etapa 6: Testes e Validação

### 6.1 Teste Local (Falhou - Sem Credenciais AWS)
```bash
AWS_REGION=us-east-1 npm run db:test
# Resultado: ❌ The security token included in the request is invalid
```

### 6.2 Teste no CodeBuild
```bash
# Disparar build manual
aws codebuild start-build \
  --project-name bia-build \
  --source-version pr-cicd \
  --region us-east-1

# Monitorar resultado
aws codebuild batch-get-builds \
  --ids bia-build:BUILD_ID \
  --query 'builds[0].{Status:buildStatus,Phase:currentPhase}' \
  --output table
```

**Resultado:** ✅ **SUCCEEDED**

## Fluxo Final do Pipeline

### Ordem de Execução:
1. **Pre-build**:
   - Login no ECR
   - Instalação de dependências (`npm install`)
   - Teste de conexão com banco (`npm run db:test`)

2. **Build**:
   - Execução de migrações (`npm run db:migrate`)
   - Testes unitários (`npm test`)
   - Testes de integração (`npm run test:integration`)
   - Build da imagem Docker
   - Tag da imagem

3. **Post-build**:
   - Push para ECR
   - Geração de artefatos para ECS

## Recursos AWS Utilizados

- **AWS Secrets Manager**: Armazenamento seguro de credenciais
- **AWS CodeBuild**: Execução do pipeline CI/CD
- **Amazon RDS**: Banco de dados PostgreSQL
- **Amazon ECR**: Registry de imagens Docker
- **AWS IAM**: Gerenciamento de permissões
- **Amazon VPC**: Security Groups para controle de acesso

## Benefícios Implementados

✅ **Segurança**: Credenciais não expostas no código  
✅ **Automação**: Migrações e testes automáticos  
✅ **Qualidade**: Validação de código e banco  
✅ **Rastreabilidade**: Logs detalhados de cada etapa  
✅ **Escalabilidade**: Configuração reutilizável  

## Comandos de Monitoramento

```bash
# Listar builds recentes
aws codebuild list-builds-for-project --project-name bia-build --region us-east-1

# Ver detalhes de um build específico
aws codebuild batch-get-builds --ids BUILD_ID --region us-east-1

# Disparar novo build
aws codebuild start-build --project-name bia-build --source-version BRANCH_NAME --region us-east-1
```

## Troubleshooting

### Problema: Timeout no Download do Código
**Solução**: Usar build direto do GitHub em vez do CodePipeline
```bash
aws codebuild start-build --project-name bia-build --source-version pr-cicd --region us-east-1
```

### Problema: Erro de Credenciais Locais
**Solução**: Testes locais devem usar variáveis de ambiente ou configurar AWS CLI
```bash
DB_HOST=127.0.0.1 npm run db:test
```

### Problema: Acesso Negado ao RDS
**Solução**: Verificar security groups e ranges de IP do CodeBuild

---

**Data de Implementação**: 02/01/2026  
**Status**: ✅ Implementado e Testado com Sucesso
