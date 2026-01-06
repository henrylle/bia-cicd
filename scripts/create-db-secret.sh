#!/bin/bash

# Criar secret para o banco de dados
aws secretsmanager create-secret \
    --name "bia-app/database" \
    --description "Database credentials for BIA application" \
    --secret-string '{
        "username": "postgres",
        "password": "your-secure-password-here",
        "engine": "postgres",
        "host": "your-rds-endpoint.region.rds.amazonaws.com",
        "port": 5432,
        "dbname": "bia_db"
    }' \
    --region us-east-1

echo "Secret created successfully!"
