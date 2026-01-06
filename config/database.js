<<<<<<< HEAD
module.exports = {
  development: {
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_NAME || "bia_dev",
    host: process.env.DB_HOST || "127.0.0.1",
    port: process.env.DB_PORT || 5433,
    dialect: "postgres",
    dialectOptions: isLocalConnection() ? {} : getRemoteDialectOptions(),
  },
  test: {
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_NAME || "bia_test",
    host: process.env.DB_HOST || "127.0.0.1",
    port: process.env.DB_PORT || 5433,
    dialect: "postgres",
    dialectOptions: isLocalConnection() ? {} : getRemoteDialectOptions(),
  },
  production: {
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_NAME || "bia",
    host: process.env.DB_HOST || "127.0.0.1",
    port: process.env.DB_PORT || 5433,
    dialect: "postgres",
    dialectOptions: isLocalConnection() ? {} : getRemoteDialectOptions(),
  }
};
=======
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
>>>>>>> pr-cicd

function isLocalConnection() {
  // Lógica para determinar se a conexão é local
  return (
    process.env.DB_HOST === undefined ||
    process.env.DB_HOST === "database" ||
    process.env.DB_HOST === "127.0.0.1" ||
    process.env.DB_HOST === "localhost"
  );
}

function getRemoteDialectOptions() {
  // Configurações específicas para conexões remotas (útil a partir do pg 15)
  return {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  };
}
