exports.up = function(knex) {
    return knex.schema.createTable('document_shares', function(table) {
        table.increments('id').primary();
        table.integer('document_id').unsigned().notNullable()
            .references('id').inTable('documents')
            .onDelete('CASCADE');
        table.integer('shared_with').unsigned().notNullable()
            .references('id').inTable('users')
            .onDelete('CASCADE');
        table.integer('shared_by').unsigned().notNullable()
            .references('id').inTable('users')
            .onDelete('CASCADE');
        table.enu('permission', ['view', 'edit']).notNullable().defaultTo('view');
        table.timestamps(true, true);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('document_shares');
};