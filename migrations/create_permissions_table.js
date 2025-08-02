exports.up = function(knex) {
    return knex.schema.createTable('permissions', function(table) {
        table.increments('id').primary();
        table.integer('document_id').unsigned().notNullable()
            .references('id').inTable('documents')
            .onDelete('CASCADE');
        table.integer('user_id').unsigned().notNullable()
            .references('id').inTable('users')
            .onDelete('CASCADE');
        table.enu('access_level', ['read', 'edit']).notNullable();
        table.timestamps(true, true);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('permissions');
};