exports.up = function(knex) {
    return knex.schema.createTable('audit_logs', function(table) {
        table.increments('id').primary();
        table.integer('user_id').unsigned()
            .references('id').inTable('users');
        table.string('action').notNullable();
        table.integer('document_id').unsigned()
            .references('id').inTable('documents')
            .onDelete('SET NULL');
        table.timestamp('timestamp').defaultTo(knex.fn.now());
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('audit_logs');
};