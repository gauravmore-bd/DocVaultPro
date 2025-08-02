exports.up = function(knex) {
    return knex.schema.createTable('documents', function(table) {
        table.increments('id').primary();
        table.string('title').notNullable();
        table.text('description');
        table.string('file_url').notNullable();
        table.integer('user_id').unsigned().notNullable()
            .references('id').inTable('users')
            .onDelete('CASCADE');
        table.integer('current_version_id').unsigned();
        table.boolean('is_public').defaultTo(false);
        table.timestamps(true, true);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('documents');
};