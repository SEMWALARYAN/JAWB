const express = require('express');
const { createJob, getJobs, getRecruiterJobs } = require('../controllers/jobController');
const router = express.Router();

router.post('/', createJob);
router.get('/', getJobs);
router.get('/recruiter/:recruiterId', getRecruiterJobs);

module.exports = router;
