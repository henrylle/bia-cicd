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
