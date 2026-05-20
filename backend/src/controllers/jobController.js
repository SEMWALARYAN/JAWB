const Job = require('../models/Job');

exports.createJob = async (req, res) => {
  try {
    const { title, companyName, description, salaryRange, employmentType } = req.body;
    
    // In a real app, req.user._id comes from auth middleware. We pass it in body for MVP.
    const recruiter = req.body.recruiterId; 

    const job = await Job.create({
      recruiter,
      title,
      companyName,
      description,
      salaryRange,
      employmentType: employmentType || 'Full-time'
    });

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getJobs = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 }).lean();
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRecruiterJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ recruiter: req.params.recruiterId }).sort({ createdAt: -1 }).lean();
    const Application = require('../models/Application');
    
    for (let job of jobs) {
      job.applications = await Application.find({ job: job._id })
        .populate('applicant', 'name email skills')
        .sort({ createdAt: -1 })
        .lean();
    }
    
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
