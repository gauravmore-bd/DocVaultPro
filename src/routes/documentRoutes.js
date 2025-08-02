const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/authMiddleware');
const hasPermission = require('../middlewares/hasPermission');
const upload = require('../utils/multer');
const documentController = require('../controllers/documentController');

// Upload a new document
router.post(
    '/upload',
    verifyToken,
    upload.single('file'),
    documentController.uploadDocument
);

// Get all documents uploaded by the logged-in user
router.get('/my', verifyToken, documentController.getUserDocuments);

// Download original document (owner or shared user)
router.get('/download/:id', verifyToken, hasPermission, documentController.downloadDocument);

// View document inline (owner or shared user)
router.get('/view/:id', verifyToken, hasPermission, documentController.viewDocument);

// Upload a new version of the document (owner only)
router.post(
    '/:id/version',
    verifyToken,
    hasPermission,
    upload.single('file'),
    documentController.uploadNewVersion
);

// Get all versions of a document (owner or shared user)
router.get('/:id/versions', verifyToken, hasPermission, documentController.getDocumentVersions);

// ✅ Secure version routes by resolving permission inside controller (not here)
router.get(
    '/version/:versionId/download',
    verifyToken,
    documentController.downloadVersion
);

router.post(
    '/:id/restore/:versionId',
    verifyToken,
    documentController.restoreVersion
);

// Share document with another user (owner only)
router.post(
    '/:id/share',
    verifyToken,
    hasPermission,
    documentController.shareDocument
);

// Get documents shared *with* the user
router.get('/shared/with-me', verifyToken, documentController.getSharedDocuments);

module.exports = router;
