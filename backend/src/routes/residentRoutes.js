const express = require('express');
const router = express.Router();
const residentController = require('../controllers/residentController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

// Protect all routes
router.use(verifyToken);

// CRUD Residents
router.post('/', residentController.createResident);
router.get('/', residentController.getAllResidents);
router.get('/:id', residentController.getResidentById);
router.put('/:id', residentController.updateResident);
router.delete('/:id', requireAdmin, residentController.deleteResident); // Only admin can delete?

// Special Actions
router.post('/temporary-residence', residentController.registerTemporaryResidence);
router.get('/list/temporary-residence', residentController.getTemporaryResidents);
router.post('/temporary-absence', residentController.registerTemporaryAbsence);
router.get('/list/temporary-absence', residentController.getTemporaryAbsences);
router.delete('/temporary-absence/:id', residentController.deleteTemporaryAbsence);
router.post('/:id/death', residentController.declareDeath);
router.get('/expiring/temporary', residentController.getExpiringTemporaryResidents);

module.exports = router;