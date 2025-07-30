const express = require('express');
const router = express.Router();
const verifyJWT = require('../middleware/verifyJWT');
const { upload, uploadToGCS } = require('../middleware/uploadGCS');
const merchController = require('../controllers/merchController');

// Role check middleware (admin/core/executive/coordinator/operations_head)
const allowedRoles = ['admin', 'core', 'executive', 'coordinator', 'operations_head', 'festival head', 'operational head'];
function requireAdminOrCore(req, res, next) {
    if (allowedRoles.includes(req.user?.role)) return next();
    return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
}

// ... existing code ...
router.post('/order', verifyJWT, merchController.createMerchOrder);
router.post('/order/verify', verifyJWT, merchController.verifyMerchOrderPayment);
// ... existing code ...
// ... existing code ...
router.get('/admin/stock', verifyJWT, requireAdminOrCore, merchController.getAllMerchStock);
router.get('/admin/orders', verifyJWT, requireAdminOrCore, merchController.getAllMerchOrders);
router.get('/admin/sales-summary', verifyJWT, requireAdminOrCore, merchController.getMerchSalesSummary);
// ... existing code ...

// Create merch (with image upload)
router.post('/', verifyJWT, requireAdminOrCore, upload.single('image'), uploadToGCS, (req, res, next) => {
    if (req.file?.cloudStoragePublicUrl) req.body.imageUrl = req.file.cloudStoragePublicUrl;
    merchController.createMerch(req, res, next);
});

// Get all merch (public or admin/core)
router.get('/', verifyJWT, merchController.getAllMerch);

// Update merch (with optional image upload)
router.patch('/:id', verifyJWT, requireAdminOrCore, upload.single('image'), uploadToGCS, (req, res, next) => {
    if (req.file?.cloudStoragePublicUrl) req.body.imageUrl = req.file.cloudStoragePublicUrl;
    merchController.updateMerch(req, res, next);
});

// Delete merch
router.delete('/:id', verifyJWT, requireAdminOrCore, merchController.deleteMerch);

module.exports = router; 