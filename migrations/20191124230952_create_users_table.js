exports.up = function(knex) {
  return Promise.all([
    knex.schema.createTable("users", table => {
      table.increments("id").primary();
      table
        .integer("e_id")
        .unsigned()
        .index();
      table.string("first_name");
      table.string("last_name");
      table
        .integer("phone_no")
        .unsigned()
        .index()
        .notNullable();
      table.unique(["phone_no"]);
    })
  ]);
};

exports.down = function(knex) {
  return Promise.all([knex.schema.dropTable("users")]);
};
