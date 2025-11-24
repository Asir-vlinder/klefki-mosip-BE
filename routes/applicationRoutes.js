const express = require('express');
const router = express.Router();
const {
  submitApplication,
  getApplicationById,
  getApplicationsByNationalId,
  getAllApplications,
  updateApplicationStatus,
} = require('../controllers/applicationController');
const { upload, handleUploadError } = require('../middleware/upload');

// Submit new application
router.post(
  '/',
  upload.single('addressProof'),
  handleUploadError,
  submitApplication
);

// Get all applications (Admin)
router.get('/', getAllApplications);

// Get application by applicationId
router.get('/:applicationId', getApplicationById);

// Get applications by nationalId
router.get('/user/:nationalId', getApplicationsByNationalId);

// Update application status (Admin)
router.patch('/:applicationId/status', updateApplicationStatus);

module.exports = router;