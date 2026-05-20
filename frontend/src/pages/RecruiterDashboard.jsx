import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import axios from 'axios';
import { Users, Briefcase, PlusCircle, Calendar, MessageSquare, ChevronDown, LayoutGrid, FileText, CheckCircle, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function RecruiterDashboard() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [showNewJobModal, setShowNewJobModal] = useState(false);
  const [newJob, setNewJob] = useState({ title: '', description: '', requirements: '', companyName: '', location: '', employmentType: 'Full-time', salaryRange: { min: '', max: '' } });
  const [user, setUser] = useState(null);
  const [activeJobId, setActiveJobId] = useState(null);

  const [activeChat, setActiveChat] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  
  const [scheduleInterview, setScheduleInterview] = useState(null);
  const [interviewData, setInterviewData] = useState({ date: '', time: '', link: '' });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo || userInfo.role !== 'recruiter') {
      navigate('/login');
      return;
    }
    setUser(userInfo);
    fetchJobs(userInfo._id);
  }, [navigate]);

  const fetchJobs = async (recruiterId) => {
    try {
      const { data } = await axios.get(`${API_URL}/jobs/recruiter/${recruiterId}`);
      setJobs(data);
    } catch (err) {
      console.error("Error fetching jobs", err);
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/jobs`, { ...newJob, recruiterId: user._id });
      setShowNewJobModal(false);
      setNewJob({ title: '', description: '', requirements: '', companyName: '', location: '', employmentType: 'Full-time', salaryRange: { min: '', max: '' } });
      fetchJobs(user._id);
    } catch (err) {
      alert('Error creating job');
    }
  };

  const updateApplicationStatus = async (appId, status) => {
    try {
      await axios.put(`${API_URL}/applications/${appId}/status`, { status });
      fetchJobs(user._id);
    } catch (err) {
      alert('Error updating status');
    }
  };

  const handleScheduleInterview = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/applications/${scheduleInterview._id}/interview`, interviewData);
      setScheduleInterview(null);
      setInterviewData({ date: '', time: '', link: '' });
      fetchJobs(user._id);
    } catch (err) {
      alert('Failed to schedule interview');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    try {
      const msgData = {
        sender: user._id,
        senderName: user.name,
        text: chatMessage,
        createdAt: new Date().toISOString()
      };
      await axios.post(`${API_URL}/applications/${activeChat._id}/messages`, msgData);
      
      setActiveChat(prev => ({
        ...prev, 
        messages: [...(prev.messages || []), msgData]
      }));
      setChatMessage('');
      fetchJobs(user._id);

    } catch (err) {
      alert('Failed to send message');
    }
  };

  const generateJobDescription = () => {
    if (!newJob.title) return alert("Please enter a job title first");
    
    setNewJob(prev => ({
      ...prev,
      description: "Generating...",
      requirements: "Generating..."
    }));

    setTimeout(() => {
      setNewJob(prev => ({
        ...prev,
        description: `We are looking for a highly skilled ${prev.title} to join our growing team. You will be responsible for building scalable solutions, collaborating with cross-functional teams, and driving technical excellence. The ideal candidate has strong problem-solving skills and a passion for innovation.`,
        requirements: `- 3+ years of experience in similar role\n- Strong proficiency in modern web technologies\n- Experience with agile methodologies\n- Excellent communication skills\n- Bachelor's degree in Computer Science or related field`
      }));
    }, 1500);
  };

  const stats = {
    totalJobs: jobs.length,
    totalApplications: jobs.reduce((acc, job) => acc + (job.applications?.length || 0), 0),
    newApplications: jobs.reduce((acc, job) => acc + (job.applications?.filter(a => a.status === 'Applied').length || 0), 0)
  };

  return (
    <DashboardLayout role="recruiter">
      
      {/* Schedule Interview Modal */}
      {scheduleInterview && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-[#fffdf5] rounded-none w-full max-w-md p-8 shadow-[12px_12px_0_0_rgba(0,0,0,1)] border-3 border-black">
            <h3 className="text-3xl font-black text-black mb-2 tracking-tight uppercase">Schedule Interview</h3>
            <p className="text-sm text-gray-800 mb-6 font-medium">Set up a meeting with <span className="font-bold text-manga-purple underline decoration-2">{scheduleInterview.applicant?.name}</span></p>
            <form onSubmit={handleScheduleInterview} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1">Date</label>
                <input type="date" required className="w-full px-4 py-2.5 bg-white border-2 border-black rounded-none text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-black shadow-[3px_3px_0_0_rgba(0,0,0,1)]" value={interviewData.date} onChange={e => setInterviewData({...interviewData, date: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1">Time</label>
                <input type="time" required className="w-full px-4 py-2.5 bg-white border-2 border-black rounded-none text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-black shadow-[3px_3px_0_0_rgba(0,0,0,1)]" value={interviewData.time} onChange={e => setInterviewData({...interviewData, time: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1">Meeting Link</label>
                <input type="url" placeholder="https://zoom.us/j/..." className="w-full px-4 py-2.5 bg-white border-2 border-black rounded-none text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-black shadow-[3px_3px_0_0_rgba(0,0,0,1)]" value={interviewData.link} onChange={e => setInterviewData({...interviewData, link: e.target.value})} />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setScheduleInterview(null)} className="flex-1 px-4 py-3 bg-manga-pink text-black font-bold uppercase border-2 border-black rounded-none hover:bg-white transition-colors shadow-[4px_4px_0_0_rgba(0,0,0,1)]">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-manga-cyan text-black font-bold uppercase border-2 border-black rounded-none hover:bg-white transition-colors shadow-[4px_4px_0_0_rgba(0,0,0,1)]">Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {activeChat && (
        <div className="fixed inset-y-0 right-0 w-96 glass-panel shadow-[0_0_40px_rgba(0,0,0,0.1)] border-l border-black z-50 flex flex-col transform transition-transform">
          <div className="p-5 border-b-2 border-black border-black flex justify-between items-center bg-white backdrop-blur-sm">
            <div>
              <h3 className="font-bold text-black">{activeChat.applicant?.name}</h3>
              <p className="text-xs font-medium text-gray-700">Applicant Chat</p>
            </div>
            <button onClick={() => setActiveChat(null)} className="text-gray-700 hover:text-black glass-panel hover:bg-gray-100 p-2 rounded-none transition-colors shadow-[4px_4px_0_0_rgba(0,0,0,1)] border border-black">✕</button>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-4 glass-panel">
            {activeChat.messages?.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-60">
                <div className="w-12 h-12 bg-gray-100 rounded-none flex items-center justify-center"><MessageSquare className="text-gray-700" /></div>
                <p className="text-sm font-medium text-gray-700">No messages yet. Send a greeting!</p>
              </div>
            )}
            {activeChat.messages?.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.sender === user._id ? 'items-end' : 'items-start'}`}>
                <div className={`px-4 py-2.5 rounded-none max-w-[85%] text-sm shadow-[4px_4px_0_0_rgba(0,0,0,1)] ${msg.sender === user._id ? 'bg-white text-black rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm border border-black'}`}>
                  {msg.text}
                </div>
                <span className="text-[10px] font-medium text-gray-700 mt-1.5 px-1">{msg.senderName}</span>
              </div>
            ))}
          </div>
          <form onSubmit={sendMessage} className="p-4 border-t border-black bg-white flex gap-2">
            <input type="text" placeholder="Type a message..." className="flex-1 px-4 py-2.5 glass-panel border border-black rounded-none text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all" value={chatMessage} onChange={e => setChatMessage(e.target.value)} />
            <button type="submit" className="bg-white text-black px-5 rounded-none font-medium text-sm hover:bg-indigo-700 transition-colors shadow-[4px_4px_0_0_rgba(0,0,0,1)]">Send</button>
          </form>
        </div>
      )}

      {/* New Job Modal */}
      {showNewJobModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-[#fffdf5] rounded-none w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 shadow-[12px_12px_0_0_rgba(0,0,0,1)] border-3 border-black">
            <div className="flex justify-between items-center mb-6 pb-4 border-b-3 border-black">
              <h3 className="text-3xl font-black text-black uppercase tracking-tight">Post a New Job</h3>
              <button onClick={() => setShowNewJobModal(false)} className="text-black bg-manga-pink hover:bg-white px-3 py-1.5 rounded-none font-bold transition-all border-2 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px]">✕</button>
            </div>
            <form onSubmit={handleCreateJob} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1">Job Title</label>
                  <input type="text" required className="w-full px-4 py-2.5 bg-white border-2 border-black rounded-none text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-black shadow-[3px_3px_0_0_rgba(0,0,0,1)]" value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1">Company Name</label>
                  <input type="text" required className="w-full px-4 py-2.5 bg-white border-2 border-black rounded-none text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-black shadow-[3px_3px_0_0_rgba(0,0,0,1)]" value={newJob.companyName} onChange={e => setNewJob({...newJob, companyName: e.target.value})} />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1">Location</label>
                  <input type="text" required className="w-full px-4 py-2.5 bg-white border-2 border-black rounded-none text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-black shadow-[3px_3px_0_0_rgba(0,0,0,1)]" value={newJob.location} onChange={e => setNewJob({...newJob, location: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1">Employment Type</label>
                  <select className="w-full px-4 py-2.5 bg-white border-2 border-black rounded-none text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-black shadow-[3px_3px_0_0_rgba(0,0,0,1)]" value={newJob.employmentType} onChange={e => setNewJob({...newJob, employmentType: e.target.value})}>
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Contract</option>
                    <option>Internship</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1">Min Salary ($)</label>
                  <input type="number" className="w-full px-4 py-2.5 bg-white border-2 border-black rounded-none text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-black shadow-[3px_3px_0_0_rgba(0,0,0,1)]" value={newJob.salaryRange.min} onChange={e => setNewJob({...newJob, salaryRange: {...newJob.salaryRange, min: e.target.value}})} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1">Max Salary ($)</label>
                  <input type="number" className="w-full px-4 py-2.5 bg-white border-2 border-black rounded-none text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-black shadow-[3px_3px_0_0_rgba(0,0,0,1)]" value={newJob.salaryRange.max} onChange={e => setNewJob({...newJob, salaryRange: {...newJob.salaryRange, max: e.target.value}})} />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-black">Job Description</label>
                  <button type="button" onClick={generateJobDescription} className="text-xs bg-manga-purple/15 text-manga-purple border-2 border-black px-3 py-1 rounded-none font-bold hover:bg-white shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-colors flex items-center gap-1">
                    <span>✨</span> Auto-Generate
                  </button>
                </div>
                <textarea required rows="4" className="w-full px-4 py-2.5 bg-white border-2 border-black rounded-none text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-black shadow-[3px_3px_0_0_rgba(0,0,0,1)]" value={newJob.description} onChange={e => setNewJob({...newJob, description: e.target.value})}></textarea>
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1">Requirements</label>
                <textarea required rows="3" className="w-full px-4 py-2.5 bg-white border-2 border-black rounded-none text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-black shadow-[3px_3px_0_0_rgba(0,0,0,1)]" value={newJob.requirements} onChange={e => setNewJob({...newJob, requirements: e.target.value})}></textarea>
              </div>

              <div className="flex gap-4 pt-6 border-t-2 border-black">
                <button type="button" onClick={() => setShowNewJobModal(false)} className="flex-1 px-4 py-3 bg-manga-pink text-black border-2 border-black font-bold uppercase rounded-none hover:bg-white transition-colors shadow-[4px_4px_0_0_rgba(0,0,0,1)]">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-manga-cyan text-black border-2 border-black font-bold uppercase rounded-none hover:bg-white transition-colors shadow-[4px_4px_0_0_rgba(0,0,0,1)]">Post Job Listing</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-manga-yellow rounded-none p-6 border-3 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] flex items-center gap-4 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0_0_rgba(0,0,0,1)] transition-all group">
          <div className="w-12 h-12 rounded-none bg-black text-white flex items-center justify-center border-2 border-black">
            <Briefcase size={24} />
          </div>
          <div>
            <p className="text-xs font-black text-black/70 uppercase tracking-wider">Active Listings</p>
            <p className="text-3xl font-black text-black">{stats.totalJobs}</p>
          </div>
        </div>
        <div className="bg-manga-cyan rounded-none p-6 border-3 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] flex items-center gap-4 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0_0_rgba(0,0,0,1)] transition-all group">
          <div className="w-12 h-12 rounded-none bg-black text-white flex items-center justify-center border-2 border-black">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs font-black text-black/70 uppercase tracking-wider">Total Candidates</p>
            <p className="text-3xl font-black text-black">{stats.totalApplications}</p>
          </div>
        </div>
        <div className="bg-manga-pink rounded-none p-6 border-3 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] flex items-center gap-4 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0_0_rgba(0,0,0,1)] transition-all group">
          <div className="w-12 h-12 rounded-none bg-black text-white flex items-center justify-center border-2 border-black">
            <LayoutGrid size={24} />
          </div>
          <div>
            <p className="text-xs font-black text-black/70 uppercase tracking-wider">New Apps</p>
            <p className="text-3xl font-black text-black">{stats.newApplications}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-4xl font-black text-black tracking-tight uppercase">Job Postings</h1>
          <p className="text-gray-800 mt-1 text-sm font-bold">Manage listings, analyze candidates, and organize interviews.</p>
        </div>
        <button onClick={() => setShowNewJobModal(true)} className="bg-manga-cyan text-black px-6 py-3 rounded-none font-extrabold uppercase border-3 border-black hover:bg-white hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_0_#000] transition-all flex items-center gap-2 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
          <PlusCircle size={18} /> Post New Job
        </button>
      </div>

      <div className="space-y-4">
        {jobs.length === 0 ? (
          <div className="glass-panel rounded-none shadow-[4px_4px_0_0_rgba(0,0,0,1)] border border-black p-16 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-white rounded-none flex items-center justify-center mb-6 border border-black">
              <Briefcase size={32} className="text-gray-800" />
            </div>
            <h3 className="text-xl font-bold text-black mb-2">No active jobs</h3>
            <p className="text-gray-700 mb-8 max-w-sm">Create your first job posting to start receiving applications from top talent.</p>
            <button onClick={() => setShowNewJobModal(true)} className="bg-white text-black px-6 py-3 rounded-none font-medium hover:bg-indigo-500/200 transition-colors shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
              Create Job Posting
            </button>
          </div>
        ) : jobs.map(job => (
          <div key={job._id} className="glass-panel rounded-none shadow-[4px_4px_0_0_rgba(0,0,0,1)] border border-black overflow-hidden transition-all hover:border-black group">
            <div 
              className="p-6 cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group-hover:bg-gray-100 transition-colors"
              onClick={() => setActiveJobId(activeJobId === job._id ? null : job._id)}
            >
              <div>
                <h3 className="text-xl font-bold text-black">{job.title}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-700 font-medium">
                  <span className="flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded-none"><Users size={14}/> {job.applications?.length || 0} Candidates</span>
                  <span className="flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded-none"><Briefcase size={14}/> {job.employmentType}</span>
                  <span className="flex items-center gap-1 text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-none font-semibold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 bg-emerald-500/200 rounded-none"></span> Active
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-lg font-bold text-black">{job.applications?.filter(a => a.status === 'Applied').length || 0}</p>
                  <p className="text-xs text-gray-700 font-medium">New Apps</p>
                </div>
                <div className={`w-8 h-8 rounded-none flex items-center justify-center transition-colors ${activeJobId === job._id ? 'bg-indigo-500/20 text-black' : 'bg-gray-100 text-gray-700 group-hover:bg-gray-200 group-hover:text-gray-800'}`}>
                  <ChevronDown size={18} className={`transition-transform duration-200 ${activeJobId === job._id ? 'rotate-180' : ''}`} />
                </div>
              </div>
            </div>
            
            {activeJobId === job._id && (
              <div className="border-t border-black bg-white p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-black">Pipeline</h4>
                </div>
                
                {job.applications?.length === 0 ? (
                  <div className="glass-panel rounded-none border border-dashed border-black p-8 text-center">
                    <p className="text-sm text-gray-700 font-medium">No candidates have applied yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {job.applications?.map(app => (
                      <div key={app._id} className="bg-white p-5 rounded-none border-3 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] flex flex-col md:flex-row justify-between items-start md:items-center gap-5 hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all">
                        <div className="flex gap-4 items-center">
                          <div className="w-12 h-12 rounded-none bg-manga-yellow text-black flex items-center justify-center font-black text-xl border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                            {app.applicant?.name?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="font-black text-black text-lg leading-tight">{app.applicant?.name}</p>
                            <p className="text-xs text-gray-800 font-bold">{app.applicant?.email}</p>
                            {app.applicant?.skills && app.applicant.skills.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {app.applicant.skills.map((skill, index) => (
                                  <span key={index} className="text-[10px] bg-manga-purple/10 text-manga-purple font-black border border-manga-purple/30 px-2 py-0.5 rounded-none uppercase">{skill}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
                          {(app.resumeUrl || app.coverLetter) && (
                            <a href={`${API_URL.replace('/api', '')}${app.resumeUrl || app.coverLetter}`} target="_blank" rel="noreferrer" className="text-xs bg-manga-cyan hover:bg-white text-black border-2 border-black px-4 py-2.5 rounded-none font-black uppercase shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000] transition-all flex items-center gap-1.5 hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_0_#000]">
                              <ExternalLink size={14}/> Resume
                            </a>
                          )}
                          <button onClick={() => setActiveChat({...app, job: job._id})} className="text-xs bg-manga-yellow hover:bg-white text-black border-2 border-black px-4 py-2.5 rounded-none font-black uppercase shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000] transition-all flex items-center gap-1.5 hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_0_#000]">
                            <MessageSquare size={14}/> Chat
                          </button>

                          <div className="h-6 w-px bg-black mx-1 hidden md:block"></div>

                          <div className="flex items-center gap-2">
                            <select 
                              value={app.status} 
                              onChange={(e) => updateApplicationStatus(app._id, e.target.value)}
                              className={`text-xs font-black uppercase px-3 py-2.5 rounded-none border-2 border-black focus:outline-none shadow-[4px_4px_0_0_rgba(0,0,0,1)] cursor-pointer appearance-none pr-8 bg-no-repeat bg-[right_0.5rem_center] bg-[length:1em_1em] ${
                                app.status === 'Applied' ? 'bg-manga-cyan text-black' :
                                app.status === 'Shortlisted' ? 'bg-manga-yellow text-black' :
                                app.status === 'Interview Scheduled' ? 'bg-manga-orange text-white' :
                                app.status === 'Hired' ? 'bg-manga-green text-black' :
                                'bg-manga-pink text-white'
                              }`}
                            >
                              <option value="Applied">Applied</option>
                              <option value="Shortlisted">Shortlisted</option>
                              <option value="Interview Scheduled">Interview</option>
                              <option value="Hired">Hired</option>
                              <option value="Rejected">Rejected</option>
                            </select>
                            
                            {app.status === 'Shortlisted' && (
                              <button onClick={() => setScheduleInterview(app)} className="text-xs bg-white text-black border-2 border-black px-4 py-2.5 rounded-none font-black uppercase hover:bg-manga-purple hover:text-white shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] flex items-center gap-1.5 hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all">
                                <Calendar size={14}/> Schedule
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

    </DashboardLayout>
  );
}
