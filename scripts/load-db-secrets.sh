#!/bin/bash

# Script para buscar credenciais do banco no AWS Secrets Manager
SECRET_NAME="bia-app/database"
REGION="us-east-1"

echo "Buscando credenciais do banco..."

# Buscar o secret
SECRET_VALUE=$(aws secretsmanager get-secret-value \
    --secret-id $SECRET_NAME \
    --region $REGION \
    --query SecretString \
    --output text)

if [ $? -eq 0 ]; then
    # Extrair valores usando jq
    export DB_USER=$(echo $SECRET_VALUE | jq -r '.username')
    export DB_PASSWORD=$(echo $SECRET_VALUE | jq -r '.password')
    export DB_HOST=$(echo $SECRET_VALUE | jq -r '.host')
    export DB_PORT=$(echo $SECRET_VALUE | jq -r '.port')
    export DB_NAME=$(echo $SECRET_VALUE | jq -r '.dbname')
    
    echo "Credenciais carregadas com sucesso!"
    echo "DB_HOST: $DB_HOST"
    echo "DB_PORT: $DB_PORT"
    echo "DB_NAME: $DB_NAME"
    echo "DB_USER: $DB_USER"
else
    echo "Erro ao buscar credenciais do banco!"
    exit 1
fi
