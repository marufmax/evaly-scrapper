const path = require("path");
const moment = require("dayjs");

module.exports = {
  development: {
    client: "mysql2",
    useNullAsDefault: true,
    connection: {
      charset: "utf8",
      database: "evaly",
      host: "localhost",
      user: "root",
      password: "root"
    },
    migrations: {
      directory: __dirname + "/migrations"
    },
    seeds: {
      directory: __dirname + "/seeds"
    }
  }
};
