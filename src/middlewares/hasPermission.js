const db = require('../db/knex');

function hasPermission(requiredPermission) {
  return async function (req, res, next) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized: User not authenticated' });
      }

      let documentId = req.params?.id || req.body?.documentId || req.query?.documentId;

      // Resolve documentId from versionId if needed
      if (!documentId && req.params?.versionId) {
        const version = await db('document_versions').where({ id: req.params.versionId }).first();
        if (!version) {
          return res.status(404).json({ message: 'Document version not found' });
        }
        documentId = version.document_id;
        req.params.id = documentId; // Inject for downstream use
      }

      if (!documentId) {
        return res.status(400).json({ message: 'Document ID is required' });
      }

      const document = await db('documents').where({ id: documentId }).first();
      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }

      // Determine permission level
      if (document.user_id === userId) {
        req.permission = 'owner';
        return next();
      }

      // Check shared permissions
      const sharedEntry = await db('document_shares')
        .where({ document_id: documentId, shared_with: userId })
        .first();

      if (!sharedEntry) {
        return res.status(403).json({ message: 'Permission denied: Not shared with you' });
      }
      req.permission = sharedEntry.permission; // 'view' or 'edit'

      // Check if permission satisfies requirement
      if (requiredPermission) {
        if (
          requiredPermission === 'view' &&
          ['view', 'edit'].includes(sharedEntry.permission)
        ) {
          return next();
        }
        if (requiredPermission === 'edit' && sharedEntry.permission === 'edit') {
          return next();
        }
        return res.status(403).json({ message: `Requires ${requiredPermission} permission` });
      }

      next();

    } catch (error) {
      return res.status(500).json({ message: 'Server error while checking permissions' });
    }
  };
}

module.exports = hasPermission;
