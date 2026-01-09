const express = require('express');
const router = express.Router();
const companiesController = require('../controllers/companies.controller');
const auth = require('../middleware/auth.middleware');
const isSuperAdmin = require('../middleware/superadmin.middleware');

// All routes require Auth + SuperAdmin
router.use(auth);
router.use(isSuperAdmin);

router.get('/', companiesController.getCompanies);
router.post('/', companiesController.createCompany);
router.put('/:id/status', companiesController.toggleStatus);

module.exports = router;
