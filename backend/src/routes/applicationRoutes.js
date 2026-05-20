const express = require('express');
const { applyForJob, getJobApplicants, getApplicantApplications, updateApplicationStatus, scheduleInterview, addMessage } = require('../controllers/applicationController');
const upload = require('../middlewares/uploadMiddleware');
const router = express.Router();

router.post('/apply', upload.single('resume'), applyForJob);
router.get('/job/:jobId', getJobApplicants);
router.get('/applicant/:applicantId', getApplicantApplications);
router.put('/:id/status', updateApplicationStatus);
router.put('/:id/interview', scheduleInterview);
router.post('/:id/messages', addMessage);

module.exports = router;
