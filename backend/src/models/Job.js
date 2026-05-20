const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  companyName: { type: String, required: true },
  description: { type: String, required: true },
  industry: { type: String },
  employmentType: { 
    type: String, 
    enum: ['Full-time', 'Part-time', 'Internship', 'Contract'], 
    required: true 
  },
  location: { type: String },
  workplaceType: { 
    type: String, 
    enum: ['Remote', 'Hybrid', 'Onsite'] 
  },
  salaryRange: {
    min: Number,
    max: Number,
    currency: { type: String, default: 'USD' }
  },
  experienceRequired: { type: String },
  requiredSkills: [{ type: String }],
  openings: { type: Number, default: 1 },
  applicationDeadline: { type: Date },
  status: { 
    type: String, 
    enum: ['Active', 'Draft', 'Closed', 'Paused'], 
    default: 'Active' 
  },
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);
