const express = require('express');
const router = express.Router();
const { applyToJob, getSeekerApplications, getJobApplications, updateApplicationStatus } = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('seeker'), applyToJob);
router.get('/seeker', protect, authorize('seeker'), getSeekerApplications);
router.get('/job/:jobId', protect, authorize('employer'), getJobApplications);
router.put('/:id/status', protect, authorize('employer'), updateApplicationStatus);

module.exports = router;
