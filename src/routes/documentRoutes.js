const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/authMiddleware');
const hasPermission = require('../middlewares/hasPermission');
const upload = require('../utils/multer');
const documentController = require('../controllers/documentController');

// 📂 Upload a new document (owner only after creation)
router.post(
    '/upload',
    verifyToken,
    upload.single('file'),
    documentController.uploadDocument
);

// 📜 Get all documents uploaded by the logged-in user
router.get('/my', verifyToken, documentController.getUserDocuments);

// 📥 Download original document (requires at least view permission)
router.get(
    '/download/:id',
    verifyToken,
    hasPermission('view'),
    documentController.downloadDocument
);

// 👀 View document inline (requires at least view permission)
router.get(
    '/view/:id',
    verifyToken,
    hasPermission('view'),
    documentController.viewDocument
);

// ✏️ Upload a new version of the document (requires edit permission)
router.post(
    '/:id/version',
    verifyToken,
    hasPermission('edit'),
    upload.single('file'),
    documentController.uploadNewVersion
);

// 🗂 Get all versions of a document (requires at least view permission)
router.get(
    '/:id/versions',
    verifyToken,
    hasPermission('view'),
    documentController.getDocumentVersions
);

// 📥 Download a specific version (check handled in controller or require view)
router.get(
    '/version/:versionId/download',
    verifyToken,
    documentController.downloadVersion // Permission checked inside controller
);

// ♻️ Restore a specific version (requires edit permission)
router.post(
  '/version/:versionId/restore',
  verifyToken,
  hasPermission('edit'),
  documentController.restoreVersion
);


// 🤝 Share document with another user (requires edit permission)
router.post(
    '/:id/share',
    verifyToken,
    hasPermission('edit'),
    documentController.shareDocument
);

// 📄 Get documents shared with the logged-in user
router.get(
    '/shared/with-me',
    verifyToken,
    documentController.getSharedDocuments
);

module.exports = router;
