#!/bin/bash

CODEBUILD_ROLE_NAME="codebuild-bia-service-role"
POLICY_NAME="CodeBuildSecretsPolicy"

echo "Criando policy para acesso ao Secrets Manager..."

# Criar a policy
aws iam create-policy \
    --policy-name $POLICY_NAME \
    --policy-document file://scripts/codebuild-secrets-policy.json \
    --description "Policy para CodeBuild acessar secrets do banco"

# Obter ARN da policy
POLICY_ARN=$(aws iam list-policies \
    --query "Policies[?PolicyName=='$POLICY_NAME'].Arn" \
    --output text)

echo "Policy ARN: $POLICY_ARN"

# Anexar policy ao role do CodeBuild
aws iam attach-role-policy \
    --role-name $CODEBUILD_ROLE_NAME \
    --policy-arn $POLICY_ARN

echo "Policy anexada ao role do CodeBuild com sucesso!"

# Verificar se o role tem as permissões
echo "Verificando permissões do role..."
aws iam list-attached-role-policies --role-name $CODEBUILD_ROLE_NAME
