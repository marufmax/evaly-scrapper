try {
  const environment = "development";
  const config = require("./knexfile.js")[environment];
  module.exports = require("knex")(config);
} catch (error) {
  console.log(` ✘ Could not connect - ${error}`);
  process.exit(1);
}
