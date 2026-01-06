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
