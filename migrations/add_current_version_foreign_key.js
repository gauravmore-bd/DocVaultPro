exports.up = function(knex) {
    return knex.schema.alterTable('documents', function(table) {
        table.foreign('current_version_id')
            .references('id').inTable('document_versions')
            .onDelete('SET NULL');
    });
};

exports.down = function(knex) {
    return knex.schema.alterTable('documents', function(table) {
        table.dropForeign('current_version_id');
    });
};