const db = require('../db/knex');

// Insert a new version
exports.createVersion = async ({ 
    documentId, 
    storedName, 
    mimeType, 
    sizeInBytes, 
    versionNumber, 
    updatedBy 
}) => {
    const [id] = await db('document_versions').insert({
        document_id: documentId,
        file_url: storedName,        // Stores filename, not actual URL
        stored_name: storedName,     // Optional clarity if added in schema
        mime_type: mimeType,
        size_in_bytes: sizeInBytes,
        version_number: versionNumber,
        updated_by: updatedBy
    });
    return id;
};

// Get latest version number of a document
exports.getLatestVersionNumber = async (documentId) => {
    const result = await db('document_versions')
        .where({ document_id: documentId })
        .max('version_number as max_version')
        .first();

    return result?.max_version || 0;
};

// Update document with latest version info
exports.updateDocumentWithVersion = async ({
    documentId,
    storedName,
    originalName,
    mimeType,
    sizeInBytes,
    currentVersionId
}) => {
    return db('documents')
        .where({ id: documentId })
        .update({
            stored_name: storedName,
            original_name: originalName,
            mime_type: mimeType,
            size_in_bytes: sizeInBytes,
            current_version_id: currentVersionId
        });
};

// Get document by ID
exports.getDocumentById = async (id) => {
    return db('documents').where({ id }).first();
};

// Get all versions of a document
exports.getDocumentVersions = async (documentId) => {
    return db('document_versions')
        .where({ document_id: documentId })
        .orderBy('created_at', 'desc');
};

// Get specific version by version ID
exports.getVersionById = async (versionId) => {
    return db('document_versions').where({ id: versionId }).first().select('*', 'file_url as stored_name');
};

// Restore a specific version and record audit info
exports.restoreVersion = async (documentId, versionData, restoredBy) => {
    await db('documents')
        .where({ id: documentId })
        .update({
            stored_name: versionData.stored_name,
            mime_type: versionData.mime_type,
            size_in_bytes: versionData.size_in_bytes,
            current_version_id: versionData.id
        });

    return db('document_versions')
        .where({ id: versionData.id })
        .update({
            restored_at: new Date(),
            restored_by: restoredBy
        });
};
