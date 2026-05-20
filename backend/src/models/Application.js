const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  resumeUrl: { type: String }, // Can be specific to this application
  coverLetter: { type: String },
  status: {
    type: String,
    enum: ['Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Technical Round', 'HR Round', 'Offered', 'Hired', 'Rejected'],
    default: 'Applied'
  },
  aiAtsScore: { type: Number },
  aiMatchingPercentage: { type: Number },
  interview: {
    date: { type: Date },
    time: { type: String },
    link: { type: String }
  },
  messages: [{
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    senderName: { type: String },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  notes: [{
    recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: String,
    date: { type: Date, default: Date.now }
  }],
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);
