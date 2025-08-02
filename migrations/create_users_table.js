exports.up = function(knex) {
    return knex.schema.createTable('users', function(table) {
        table.increments('id').primary();
        table.string('name', 100).notNullable();
        table.string('email', 150).notNullable().unique();
        table.string('password', 255); // Nullable if using OAuth
        table.string('oauth_provider', 50);
        table.string('oauth_id', 255);
        table.enu('role', ['admin', 'user']).defaultTo('user');
        table.timestamps(true, true);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('users');
};