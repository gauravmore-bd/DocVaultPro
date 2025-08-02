exports.up = function(knex) {
    return knex.schema.createTable('document_versions', function(table) {
        table.increments('id').primary();
        table.integer('document_id').unsigned().notNullable()
            .references('id').inTable('documents')
            .onDelete('CASCADE');
        table.integer('version_number').notNullable();
        table.string('file_url').notNullable();
        table.integer('updated_by').unsigned()
            .references('id').inTable('users');
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('restored_at');
        table.integer('restored_by').unsigned()
            .references('id').inTable('users');
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('document_versions');
};