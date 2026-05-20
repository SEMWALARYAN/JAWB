const Application = require('../models/Application');
const Job = require('../models/Job');

exports.applyForJob = async (req, res) => {
  try {
    const { jobId, applicantId, coverLetter } = req.body;
    let resumeUrl = coverLetter || '';
    
    // If a file was uploaded, construct its URL
    if (req.file) {
      resumeUrl = `/uploads/${req.file.filename}`;
    }

    // Check if already applied
    const existing = await Application.findOne({ job: jobId, applicant: applicantId });
    if (existing) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    const application = await Application.create({
      job: jobId,
      applicant: applicantId,
      coverLetter: resumeUrl, // reusing coverLetter field in schema for the resume link
      resumeUrl: resumeUrl,   // also populating resumeUrl in schema specifically
      status: 'Applied'
    });

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const application = await Application.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.scheduleInterview = async (req, res) => {
  try {
    const interview = req.body; // { date, time, link }
    const application = await Application.findByIdAndUpdate(
      req.params.id, 
      { interview, status: 'Interview Scheduled' }, 
      { new: true }
    );
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addMessage = async (req, res) => {
  try {
    const { sender, senderName, text } = req.body;
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ message: 'Application not found' });
    
    application.messages.push({ sender, senderName, text });
    await application.save();
    
    res.json(application.messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getJobApplicants = async (req, res) => {
  try {
    // Recruiter getting applicants for a specific job
    const applications = await Application.find({ job: req.params.jobId })
      .populate('applicant', 'name email skills experience')
      .sort({ createdAt: -1 });
      
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getApplicantApplications = async (req, res) => {
  try {
    // Applicant getting their own applications
    const applications = await Application.find({ applicant: req.params.applicantId })
      .populate('job', 'title companyName location')
      .sort({ createdAt: -1 });
      
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
