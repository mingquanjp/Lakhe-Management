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
router.delete('/:id', residentController.deleteResident);

// Special Actions
router.post('/temporary-residence', residentController.registerTemporaryResidence);
router.post('/temporary-absence', residentController.registerTemporaryAbsence);
router.delete('/temporary-absence/:id', residentController.deleteTemporaryAbsence);
router.post('/:id/death', residentController.declareDeath);
router.get('/expiring/temporary', residentController.getExpiringTemporaryResidents);
router.get('/list/temporary-residence', residentController.getTemporaryResidents);
router.get('/list/temporary-absence', residentController.getTemporaryAbsences);

module.exports = router;
