// middlewares/hasPermission.js
const db = require('../db/knex');
const jwt = require('jsonwebtoken');

/**
 * Middleware factory to check document permissions
 * @param {string} requiredPermission - The minimum permission required (view/edit)
 */
function hasPermission(requiredPermission) {
  return async function (req, res, next) {
    try {
      // 1️⃣ Check Authorization Header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
      }

      // 2️⃣ Decode Token
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.userId;

      // 3️⃣ Get Document ID from params, body, or query
      const documentId = req.params.id || req.body.documentId || req.query.documentId;
      if (!documentId) {
        return res.status(400).json({ message: 'Document ID is required' });
      }

      // 4️⃣ Check if Document Exists
      const document = await db('documents').where({ id: documentId }).first();
      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }

      // 5️⃣ Owners always have full access
      if (document.user_id === userId) {
        return next();
      }

      // 6️⃣ Check Shared Permissions
      const sharedEntry = await db('document_shares')
        .where({ document_id: documentId, shared_with: userId })
        .first();

      if (!sharedEntry) {
        return res.status(403).json({ message: 'Permission denied: Not shared with you' });
      }

      // 7️⃣ Permission Logic
      if (requiredPermission) {
        // If route requires "view", both view & edit are allowed
        if (requiredPermission === 'view' && ['view', 'edit'].includes(sharedEntry.permission)) {
          return next();
        }

        // If route requires "edit", only edit is allowed
        if (requiredPermission === 'edit' && sharedEntry.permission === 'edit') {
          return next();
        }

        return res.status(403).json({ message: `Requires ${requiredPermission} permission` });
      }

      // If no specific permission required, any shared access works
      next();

    } catch (error) {
      console.error('Error in hasPermission middleware:', error);
      return res.status(500).json({ message: 'Server error while checking permissions' });
    }
  };
}

module.exports = hasPermission;
