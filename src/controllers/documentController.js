const db = require('../db/knex');
const path = require('path');
const fs = require('fs');
const { getVersionById } = require('../models/documentModels');

// Upload a document
exports.uploadDocument = async (req, res) => {
    try {
        const userId = req.user.id;

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { filename, originalname, mimetype, size } = req.file;

        const [documentId] = await db('documents').insert({
            user_id: userId,
            title: originalname,
            description: null,
            stored_name: filename,
            original_name: originalname,
            mime_type: mimetype,
            size_in_bytes: size
        });

        const [versionId] = await db('document_versions').insert({
            document_id: documentId,
            file_url: filename,
            version_number: 1,
            original_name: originalname,
            mime_type: mimetype,
            size_in_bytes: size,
            updated_by: userId
        });

        await db('documents')
            .where({ id: documentId })
            .update({ current_version_id: versionId });

        res.status(201).json({
            message: 'Document uploaded successfully',
            documentId,
            versionId
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to upload document' });
    }
};

// View document inline
exports.viewDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const document = await db('documents').where({ id }).first();

        if (!document) {
            return res.status(404).json({ message: 'Document not found.' });
        }

        const filePath = path.join(process.cwd(), 'uploads', document.stored_name);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'File not found on server.' });
        }

        res.setHeader('Content-Type', document.mime_type);
        res.setHeader('Content-Disposition', 'inline');
        fs.createReadStream(filePath).pipe(res);
    } catch (err) {
        res.status(500).json({ message: 'Error viewing document.' });
    }
};

// Download document
exports.downloadDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const document = await db('documents').where({ id }).first();

        if (!document) {
            return res.status(404).json({ message: 'Document not found.' });
        }

        const filePath = path.join(process.cwd(), 'uploads', document.stored_name);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'File not found on server.' });
        }

        res.download(filePath, document.original_name);
    } catch (err) {
        res.status(500).json({ message: 'Error downloading document.' });
    }
};

// Upload a new version
exports.uploadNewVersion = async (req, res) => {
    try {
        const userId = req.user.id;
        const documentId = req.params.id;

        const document = await db('documents').where({ id: documentId }).first();
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const lastVersion = await db('document_versions')
            .where({ document_id: documentId })
            .orderBy('version_number', 'desc')
            .first();

        const newVersionNumber = lastVersion ? lastVersion.version_number + 1 : 1;

        const { filename, originalname, mimetype, size } = req.file;

        const [versionId] = await db('document_versions').insert({
            document_id: documentId,
            file_url: filename,
            original_name: originalname,
            mime_type: mimetype,
            size_in_bytes: size,
            version_number: newVersionNumber,
            updated_by: userId
        });

        await db('documents')
            .where({ id: documentId })
            .update({
                current_version_id: versionId,
                stored_name: filename,
                original_name: originalname,
                mime_type: mimetype,
                size_in_bytes: size,
                updated_at: new Date()
            });

        res.status(201).json({ message: 'New version uploaded', versionId });
    } catch (error) {
        res.status(500).json({ message: 'Failed to upload new version' });
    }
};

// Get all versions of a document
exports.getDocumentVersions = async (req, res) => {
    try {
        const { id: docId } = req.params;
        const versions = await db('document_versions')
            .where({ document_id: docId })
            .orderBy('created_at', 'desc');

        res.json(versions);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching versions.' });
    }
};

// Download a version
exports.downloadVersion = async (req, res) => {
    const { versionId } = req.params;

    try {
        const version = await getVersionById(versionId);
        if (!version) return res.status(404).json({ message: 'Version not found' });

        const filename = version.file_url;
        if (!filename) {
            return res.status(500).json({ message: 'Version file path missing' });
        }

        const filePath = path.join(__dirname, '..', '..', 'uploads', filename);
        const originalName = version.original_name || `version-${versionId}`;

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'File not found on server' });
        }

        return res.download(filePath, originalName);
    } catch (err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Restore a version as current
exports.restoreVersion = async (req, res) => {
    const { versionId } = req.params;

    try {
        const version = await getVersionById(versionId);
        if (!version) return res.status(404).json({ message: 'Version not found' });

        if (req.permission !== 'owner') {
            return res.status(403).json({ message: 'Only the owner can restore versions' });
        }

        await db('documents')
            .where({ id: version.document_id })
            .update({
                stored_name: version.file_url,
                original_name: version.original_name,
                mime_type: version.mime_type,
                size_in_bytes: version.size_in_bytes,
                current_version_id: version.id,
                updated_at: new Date()
            });

        await db('document_versions')
            .where({ id: version.id })
            .update({
                restored_at: new Date(),
                restored_by: req.user.id
            });

        return res.status(200).json({ message: 'Version restored successfully' });
    } catch (err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Share a document
exports.shareDocument = async (req, res) => {
    try {
        const { id: documentId } = req.params;
        const { targetUserId } = req.body;

        const exists = await db('shared_documents')
            .where({ document_id: documentId, shared_with: targetUserId })
            .first();

        if (exists) {
            return res.status(400).json({ message: 'Document already shared.' });
        }

        await db('shared_documents').insert({
            document_id: documentId,
            shared_with: targetUserId,
        });

        res.status(201).json({ message: 'Document shared.' });
    } catch (err) {
        res.status(500).json({ message: 'Error sharing document.' });
    }
};

// Get documents shared with current user
exports.getSharedDocuments = async (req, res) => {
    try {
        const userId = req.user.id;

        const documents = await db('shared_documents as sd')
            .join('documents as d', 'sd.document_id', 'd.id')
            .where('sd.shared_with', userId)
            .select('d.*');

        res.json(documents);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching shared documents.' });
    }
};

// Get documents uploaded by user
exports.getUserDocuments = async (req, res) => {
    try {
        const userId = req.user.id;
        const docs = await db('documents').where({ user_id: userId });
        res.json(docs);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching your documents.' });
    }
};
