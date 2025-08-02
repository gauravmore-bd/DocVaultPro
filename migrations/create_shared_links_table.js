exports.up = function(knex) {
    return knex.schema.createTable('shared_links', function(table) {
        table.increments('id').primary();
        table.integer('document_id').unsigned().notNullable()
            .references('id').inTable('documents')
            .onDelete('CASCADE');
        table.uuid('link_id').notNullable().unique();
        table.dateTime('expires_at');
        table.boolean('can_download').defaultTo(false);
        table.timestamps(true, true);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('shared_links');
};