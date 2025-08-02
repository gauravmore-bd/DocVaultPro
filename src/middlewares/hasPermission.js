const db = require('../db/knex');
const jwt = require('jsonwebtoken');

module.exports = async function hasPermission(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const documentId =
      req.params.id ||
      req.body.documentId ||
      req.query.documentId;

    if (!documentId) {
      return res.status(400).json({ message: 'Document ID is required' });
    }

    // 🧠 Check if user is the document owner
    const document = await db('documents').where({ id: documentId }).first();
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    if (document.user_id === userId) {
      // User is the owner
      return next();
    }

    // 🔐 Check if document is shared with user
    const sharedEntry = await db('document_shares')
      .where({ document_id: documentId, shared_with: userId })
      .first();

    if (sharedEntry) {
      return next(); // User has shared access
    }

    // ❌ Not allowed
    return res.status(403).json({ message: 'Permission denied' });

  } catch (error) {
    console.error('Error in hasPermission middleware:', error);
    return res.status(500).json({ message: 'Server error while checking permissions' });
  }
};
