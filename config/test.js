const options = {
  host: "localhost",
  port: 3030,
  public: "../public/",
  mode: "origin",
  paginate: {
    default: 10,
    max: 200,
  },
  nats: {
    servers: ["0.0.0.0:24222"],
    user: "test-user",
    pass: "testpass",
  },
  ts: true,
  // for caching - regional_db instance
  mongodb: "mongodb://127.0.0.1:27019/testdb",
  // global db for handling global data
  appdb: "mongodb://127.0.0.1:27019/testdb",
  authentication: {
    entity: "user",
    service: "users",
    secret: "Un50hTN7GgRdM6EvAm7h/Pb5JkA=",
    authStrategies: ["jwt", "local", "rapidApi"],
    apiKey: {
      allowedKeys: ["test-secret"],
      header: "x-ocular-token",
    },
    rapidApi: {
      allowedKeys: ["test-secret"],
      header: "x-rapidapi-proxy-secret",
    },
    jwtOptions: {
      header: {
        typ: "access",
      },
      audience: "https://test.com",
      issuer: "test",
      algorithm: "HS256",
      expiresIn: "1h",
    },
    local: {
      usernameField: "email",
      passwordField: "password",
    },
  },
};

module.exports = options;
