import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import axios from 'axios';
import { Briefcase, MapPin, Building, CheckCircle, Search, FileText, Calendar, DollarSign, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ApplicantDashboard() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [user, setUser] = useState(null);
  
  const [activeTab, setActiveTab] = useState('jobs'); // 'jobs' | 'applications'
  const [searchQuery, setSearchQuery] = useState('');
  const [dismissedNotifs, setDismissedNotifs] = useState(() => JSON.parse(localStorage.getItem('dismissedNotifs')) || []);

  const handleDismissNotif = (key) => {
    const updated = [...dismissedNotifs, key];
    setDismissedNotifs(updated);
    localStorage.setItem('dismissedNotifs', JSON.stringify(updated));
  };

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo || userInfo.role !== 'applicant') {
      navigate('/login');
      return;
    }
    setUser(userInfo);
    fetchData(userInfo);
  }, [navigate]);

  const [selectedJobId, setSelectedJobId] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const [showAppliedGif, setShowAppliedGif] = useState(false);

  const [activeChat, setActiveChat] = useState(null);
  const [chatMessage, setChatMessage] = useState('');

  const fetchData = async (currentUser = user) => {
    if (!currentUser) return;
    try {
      const [jobsRes, appsRes] = await Promise.all([
        axios.get(`${API_URL}/jobs`),
        axios.get(`${API_URL}/applications/applicant/${currentUser._id}`)
      ]);
      setJobs(jobsRes.data);
      setFilteredJobs(jobsRes.data);
      setMyApplications(appsRes.data);

      if (activeChat) {
        const app = appsRes.data.find(a => a._id === activeChat._id);
        if (app) setActiveChat(app);
      }
    } catch (err) {
      console.error("Error fetching data", err);
    }
  };

  useEffect(() => {
    if (searchQuery) {
      setFilteredJobs(jobs.filter(j => 
        j.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        j.companyName.toLowerCase().includes(searchQuery.toLowerCase())
      ));
    } else {
      setFilteredJobs(jobs);
    }
  }, [searchQuery, jobs]);

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
      fetchData();
    } catch (err) {
      alert('Failed to send message');
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!resumeFile && !user.resumeUrl) {
      return alert("Please upload a resume to apply.");
    }

    setIsApplying(true);
    const formData = new FormData();
    formData.append('jobId', selectedJobId);
    formData.append('applicantId', user._id);
    if (resumeFile) {
      formData.append('resume', resumeFile);
    }

    try {
      await axios.post(`${API_URL}/applications/apply`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSelectedJobId(null);
      fetchData();
      setShowAppliedGif(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to apply');
    } finally {
      setIsApplying(false);
    }
  };

  const initiateApply = (jobId) => {
    setSelectedJobId(jobId);
    setResumeFile(null);
  };

  const hasApplied = (jobId) => myApplications.some(app => app.job?._id === jobId);

  return (
    <DashboardLayout role="applicant">
      
      {/* Chat Modal */}
      {activeChat && (
        <div className="fixed inset-y-0 right-0 w-96 glass-panel shadow-[0_0_40px_rgba(0,0,0,0.1)] border-l border-black z-50 flex flex-col transform transition-transform">
          <div className="p-5 border-b-2 border-black border-black flex justify-between items-center bg-white backdrop-blur-sm">
            <div>
              <h3 className="font-bold text-black">{activeChat.job?.companyName}</h3>
              <p className="text-xs font-medium text-gray-700">Recruiter Chat</p>
            </div>
            <button onClick={() => setActiveChat(null)} className="text-gray-700 hover:text-black glass-panel hover:bg-gray-100 p-2 rounded-none transition-colors shadow-[4px_4px_0_0_rgba(0,0,0,1)] border border-black">
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-4 glass-panel">
            {activeChat.messages?.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-60">
                <div className="w-12 h-12 bg-gray-100 rounded-none flex items-center justify-center"><CheckCircle className="text-gray-700" /></div>
                <p className="text-sm font-medium text-gray-700">Say hello to the recruiter!</p>
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
            <input type="text" placeholder="Type a message..." className="flex-1 px-4 py-2.5 glass-panel border border-black rounded-none text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all" value={chatMessage} onChange={e => setChatMessage(e.target.value)} />
            <button type="submit" className="bg-white text-black px-5 rounded-none font-medium text-sm hover:bg-indigo-700 transition-colors shadow-[4px_4px_0_0_rgba(0,0,0,1)]">Send</button>
          </form>
        </div>
      )}

      {/* Upload Resume Modal */}
      {selectedJobId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-[#fffdf5] rounded-none w-full max-w-md p-8 shadow-[12px_12px_0_0_rgba(0,0,0,1)] border-3 border-black">
            <h3 className="text-3xl font-black text-black mb-2 uppercase tracking-tight">Upload Resume</h3>
            <p className="text-sm text-gray-800 mb-6 font-bold">Attach your latest resume to complete this application.</p>
            
            <form onSubmit={handleApply}>
              <div className="border-3 border-dashed border-black bg-white rounded-none p-8 text-center hover:bg-manga-cyan/10 transition-colors cursor-pointer mb-6 relative group">
                <input 
                  type="file" 
                  accept=".pdf,.doc,.docx" 
                  onChange={(e) => setResumeFile(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  required
                />
                <div className="w-12 h-12 bg-manga-yellow rounded-none shadow-[3px_3px_0_0_rgba(0,0,0,1)] border-2 border-black flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <FileText className="text-black" size={24} />
                </div>
                <p className="text-sm font-black text-black">
                  {resumeFile ? resumeFile.name : 'Click or drag file to upload'}
                </p>
                <p className="text-xs text-gray-700 mt-1.5 font-bold">PDF, DOC, DOCX up to 5MB</p>
              </div>

              <div className="flex gap-4">
                <button type="button" onClick={() => setSelectedJobId(null)} className="flex-1 px-4 py-3 bg-manga-pink text-black font-black uppercase border-2 border-black rounded-none hover:bg-white transition-colors shadow-[4px_4px_0_0_rgba(0,0,0,1)]">Cancel</button>
                <button type="submit" disabled={isApplying} className="flex-1 px-4 py-3 bg-manga-cyan text-black font-black uppercase border-2 border-black rounded-none hover:bg-white transition-colors shadow-[4px_4px_0_0_rgba(0,0,0,1)] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2">
                  {isApplying ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Applied Success GIF Modal */}
      {showAppliedGif && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-[#fffdf5] rounded-none w-full max-w-sm p-6 text-center border-4 border-black shadow-[12px_12px_0_0_#000] relative">
            <h3 className="text-3xl font-black text-black uppercase tracking-tight mb-2 font-comic">Application Sent!</h3>
            <p className="text-sm font-bold text-gray-800 mb-4">You have successfully submitted your application!</p>
            
            <div className="border-3 border-black rounded-none overflow-hidden shadow-[4px_4px_0_0_#000] mb-5 bg-white">
              <img 
                src="https://media1.tenor.com/m/DYdCwBejYm8AAAAC/yes-phone.gif" 
                alt="Application Successful Cat" 
                className="w-full h-auto object-cover"
              />
            </div>

            <button 
              onClick={() => setShowAppliedGif(false)}
              className="w-full bg-manga-yellow text-black py-3 border-3 border-black font-black uppercase text-sm shadow-[4px_4px_0_0_#000] hover:bg-white hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0_0_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0_0_#000] transition-all"
            >
              HELL YES! Let's Go!
            </button>
          </div>
        </div>
      )}

      {/* Notifications Banner */}
      {myApplications
        .filter(app => ['Shortlisted', 'Interview Scheduled', 'Hired', 'Rejected'].includes(app.status))
        .filter(app => !dismissedNotifs.includes(`${app._id}-${app.status}`))
        .map(app => {
          let title, msg, img;
          if (app.status === 'Shortlisted') {
            title = "Shortlisted by Recruiter!";
            msg = <>Excellent news! You have been shortlisted for <span className="underline decoration-2 decoration-manga-pink font-black text-black">{app.job?.title}</span> at <span className="font-extrabold text-black">{app.job?.companyName}</span>!</>;
            img = "https://media1.tenor.com/m/PDVHdZ0XYJoAAAAC/cat-shield.gif";
          } else if (app.status === 'Interview Scheduled') {
            title = "Interview Scheduled!";
            msg = <>You have an interview scheduled for <span className="underline decoration-2 decoration-manga-orange font-black text-black">{app.job?.title}</span> at <span className="font-extrabold text-black">{app.job?.companyName}</span>! {app.interview?.date && `Date: ${new Date(app.interview.date).toLocaleDateString()} Time: ${app.interview.time}`}</>;
            img = "https://media1.tenor.com/m/wUv4TBeeuZoAAAAC/cat-huh.gif";
          } else if (app.status === 'Hired') {
            title = "Congratulations! You are Hired!";
            msg = <>The team at <span className="font-extrabold text-black">{app.job?.companyName}</span> is thrilled to welcome you for the <span className="underline decoration-2 decoration-manga-green font-black text-black">{app.job?.title}</span> role!</>;
            img = "https://media1.tenor.com/m/YaCjau306ZYAAAAC/jgmm-cat-meme.gif";
          } else if (app.status === 'Rejected') {
            title = "Application Update";
            msg = <>Unfortunately, your application for <span className="underline decoration-2 decoration-manga-pink font-black text-black">{app.job?.title}</span> at <span className="font-extrabold text-black">{app.job?.companyName}</span> was not successful this time.</>;
            img = "https://media1.tenor.com/m/ZXPCRT8wKXgAAAAC/cat-scuba-cat.gif";
          }

          return (
            <div key={`notif-${app._id}-${app.status}`} className="mb-6 bg-manga-yellow border-3 border-black rounded-none p-5 flex flex-col md:flex-row gap-5 items-center justify-between shadow-[6px_6px_0_0_rgba(0,0,0,1)] relative overflow-hidden bg-[linear-gradient(45deg,#ffe53b_25%,transparent_25%),linear-gradient(-45deg,#ffe53b_25%,transparent_25%)] bg-[size:10px_10px]">
              <div className="absolute inset-0 bg-[#fffdf5]/90 z-0"></div>
              <button 
                onClick={() => handleDismissNotif(`${app._id}-${app.status}`)} 
                className="absolute top-3 right-3 text-black font-black text-xl leading-none hover:text-red-600 z-20 hover:scale-110 transition-transform"
              >
                ✕
              </button>
              <div className="relative z-10 flex flex-col sm:flex-row gap-4 items-center text-center sm:text-left w-full">
                <div className="w-20 h-20 bg-white border-2 border-black rounded-none overflow-hidden shadow-[3px_3px_0_0_#000] flex-shrink-0">
                  <img src={img} alt="Notification" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 pr-6">
                  <span className="bg-black text-white font-black text-[9px] tracking-widest uppercase px-2 py-0.5 border border-black shadow-[2px_2px_0_0_#ffe53b] inline-block mb-1">New Notification</span>
                  <h3 className="text-xl font-black text-black uppercase tracking-tight leading-tight">{title}</h3>
                  <p className="text-sm font-bold text-gray-800 mt-1">{msg}</p>
                </div>
                <div className="flex gap-2 justify-end mt-4 sm:mt-0">
                  <button 
                    onClick={() => setActiveChat(app)}
                    className="px-4 py-2.5 bg-manga-cyan border-2 border-black text-black font-black uppercase text-xs shadow-[3px_3px_0_0_#000] hover:bg-white hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] transition-all"
                  >
                    Chat Recruiter
                  </button>
                </div>
              </div>
            </div>
          );
        })}

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-black tracking-tight">Welcome, {user?.name}</h1>
        <p className="text-gray-700 mt-2 text-lg">Discover your next dream role.</p>
      </div>

      <div className="flex gap-4 border-b-3 border-black mb-8">
        <button 
          onClick={() => setActiveTab('jobs')}
          className={`pb-3 px-6 font-black uppercase text-sm border-t-3 border-x-3 border-black transition-all relative ${activeTab === 'jobs' ? 'bg-manga-yellow text-black translate-y-[3px]' : 'bg-white text-gray-700 hover:bg-manga-cyan/10 hover:text-black'}`}
        >
          Job Openings
        </button>
        <button 
          onClick={() => setActiveTab('applications')}
          className={`pb-3 px-6 font-black uppercase text-sm border-t-3 border-x-3 border-black transition-all relative ${activeTab === 'applications' ? 'bg-manga-yellow text-black translate-y-[3px]' : 'bg-white text-gray-700 hover:bg-manga-cyan/10 hover:text-black'}`}
        >
          My Applications
        </button>
      </div>

      {activeTab === 'jobs' && (
        <div className="space-y-6">
          <div className="relative max-w-xl">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-700" size={18} />
            <input 
              type="text" 
              placeholder="Search by job title or company..." 
              className="w-full pl-10 pr-4 py-3 glass-panel border border-black rounded-none text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {filteredJobs.length === 0 ? (
            <div className="glass-panel rounded-none border border-black p-12 flex flex-col items-center justify-center text-center shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
              <div className="w-16 h-16 bg-white rounded-none flex items-center justify-center mb-4 border border-black">
                <Search size={24} className="text-gray-700" />
              </div>
              <h3 className="text-lg font-semibold text-black">No jobs found</h3>
              <p className="text-gray-700 mt-1">We couldn't find any jobs matching your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {filteredJobs.map(job => (
                <div key={job._id} className="bg-white p-6 border-3 border-black rounded-none hover:shadow-[8px_8px_0_0_rgba(124,77,255,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all flex flex-col group relative overflow-hidden shadow-[4px_4px_0_0_#000]">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-manga-yellow/10 to-transparent opacity-50 rounded-bl-full -z-0"></div>
                  
                  <div className="relative z-10 flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-black text-black text-xl leading-tight group-hover:text-black transition-colors">{job.title}</h3>
                      <p className="text-sm font-extrabold text-black/80 mt-1">{job.companyName}</p>
                    </div>
                    {job.salaryRange?.min && (
                      <span className="bg-manga-green border-2 border-black text-black font-black uppercase text-xs px-3 py-1 rounded-none shadow-[2px_2px_0_0_#000] whitespace-nowrap">
                        ${job.salaryRange.min.toLocaleString()} - ${job.salaryRange.max.toLocaleString()}
                      </span>
                    )}
                  </div>
                  
                  <div className="relative z-10 flex flex-wrap gap-3 mb-5">
                    <div className="flex items-center gap-1.5 text-xs font-black uppercase text-black bg-manga-yellow/15 border-2 border-black px-2.5 py-1 rounded-none">
                      <MapPin size={14} className="text-black" /> {job.location || 'Remote'}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-black uppercase text-black bg-manga-cyan/15 border-2 border-black px-2.5 py-1 rounded-none">
                      <Briefcase size={14} className="text-black" /> {job.employmentType}
                    </div>
                  </div>
                  
                  <div className="relative z-10 flex-1 mb-6">
                    <p className="text-sm text-gray-800 font-semibold leading-relaxed line-clamp-3">{job.description}</p>
                  </div>
                  
                  <div className="relative z-10 pt-4 border-t-2 border-black mt-auto">
                    {hasApplied(job._id) ? (
                      <button disabled className="w-full bg-manga-green/20 text-black border-3 border-black px-4 py-3 rounded-none font-extrabold uppercase flex justify-center items-center gap-2 cursor-not-allowed shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                        <CheckCircle size={16} className="text-black" /> Application Submitted
                      </button>
                    ) : (
                      <button 
                        onClick={() => initiateApply(job._id)} 
                        className="w-full bg-manga-cyan text-black px-4 py-3 rounded-none font-extrabold uppercase border-3 border-black hover:bg-white hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_0_#000] transition-all flex items-center justify-center gap-2 shadow-[3px_3px_0_0_rgba(0,0,0,1)]"
                      >
                        Apply Now <ArrowRight size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'applications' && (
        <div className="bg-white rounded-none shadow-[4px_4px_0_0_rgba(0,0,0,1)] border-3 border-black overflow-hidden">
          <div className="p-6 border-b-3 border-black bg-manga-cyan">
            <h2 className="text-2xl font-black text-black uppercase tracking-tight">Application History</h2>
          </div>
          
          {myApplications.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-white rounded-none flex items-center justify-center mb-4 border-2 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
                <FileText size={24} className="text-black" />
              </div>
              <h3 className="text-xl font-bold text-black uppercase tracking-tight">No applications yet</h3>
              <p className="text-sm text-gray-800 mt-1 font-bold">When you apply for a job, your application timeline will appear here.</p>
            </div>
          ) : (
            <div className="divide-y-3 divide-black bg-[#fffefc]">
              {myApplications.map(app => (
                <div key={app._id} className="p-6 hover:bg-manga-yellow/5 transition-colors">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h4 className="font-black text-black text-xl leading-tight">{app.job?.title}</h4>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-sm font-extrabold text-black flex items-center gap-1.5"><Building size={14} className="text-black"/> {app.job?.companyName}</span>
                        <span className="w-1.5 h-1.5 bg-black"></span>
                        <span className="text-xs text-gray-700 font-bold">Applied {new Date(app.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <span className={`px-4 py-2 border-2 border-black font-black uppercase text-xs shadow-[3px_3px_0_0_rgba(0,0,0,1)] ${
                        app.status === 'Interview Scheduled' ? 'bg-manga-orange text-white' :
                        app.status === 'Hired' ? 'bg-manga-green text-black' :
                        app.status === 'Rejected' ? 'bg-manga-pink text-white' :
                        'bg-manga-cyan text-black'
                      }`}>
                        {app.status}
                      </span>
                      
                      <button onClick={() => setActiveChat(app)} className="text-xs font-black uppercase text-black bg-manga-yellow hover:bg-white border-2 border-black px-4 py-2.5 rounded-none shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] transition-all flex items-center gap-2">
                        Messages 
                        {app.messages?.length > 0 && <span className="bg-black text-white w-5 h-5 flex items-center justify-center rounded-none text-[10px] font-black">{app.messages.length}</span>}
                      </button>
                    </div>
                  </div>
                  
                  {app.status === 'Interview Scheduled' && app.interview && (
                    <div className="mt-5 bg-manga-orange/10 border-2 border-black rounded-none p-5 text-sm flex flex-col sm:flex-row gap-5 shadow-[4px_4px_0_0_rgba(0,0,0,1)] items-center justify-between bg-white">
                      <div className="flex gap-4 items-start">
                        <div className="w-10 h-10 bg-manga-orange text-white border-2 border-black rounded-none flex flex-shrink-0 items-center justify-center shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                          <Calendar size={18} />
                        </div>
                        <div>
                          <p className="font-black text-black uppercase tracking-wide text-base mb-1">Interview Scheduled</p>
                          <p className="text-gray-800 font-extrabold">Date: {new Date(app.interview.date).toLocaleDateString()} at {app.interview.time}</p>
                          {app.interview.link && (
                            <p className="text-black font-extrabold mt-2.5">
                              Meeting Link: <a href={app.interview.link} target="_blank" rel="noreferrer" className="text-black bg-manga-cyan hover:bg-white px-3 py-1.5 rounded-none border-2 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all inline-block ml-2">{app.interview.link}</a>
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Interview Cat GIF */}
                      <div className="w-24 h-24 bg-white border-2 border-black shadow-[3px_3px_0_0_#000] rounded-none overflow-hidden flex-shrink-0 flex items-center justify-center">
                        <img 
                          src="https://media1.tenor.com/m/wUv4TBeeuZoAAAAC/cat-huh.gif" 
                          alt="Interview scheduled meme cat" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}

                  {/* Hired congrats block */}
                  {app.status === 'Hired' && (
                    <div className="mt-5 bg-manga-green/10 border-2 border-black rounded-none p-5 text-sm flex flex-col sm:flex-row gap-5 shadow-[4px_4px_0_0_rgba(0,0,0,1)] items-center justify-between bg-white">
                      <div className="flex gap-4 items-start">
                        <div className="w-10 h-10 bg-manga-green text-black border-2 border-black rounded-none flex flex-shrink-0 items-center justify-center shadow-[2px_2px_0_0_rgba(0,0,0,1)] font-black text-xl">
                          🎉
                        </div>
                        <div>
                          <p className="font-black text-black uppercase tracking-wide text-lg mb-1">CONGRATULATIONS! YOU ARE HIRED!</p>
                          <p className="text-gray-800 font-extrabold">The team is super thrilled to welcome you aboard! Prepare for your new journey! 🎉</p>
                        </div>
                      </div>
                      
                      {/* Hired Cat GIF */}
                      <div className="w-24 h-24 bg-white border-2 border-black shadow-[3px_3px_0_0_#000] rounded-none overflow-hidden flex-shrink-0 flex items-center justify-center">
                        <img 
                          src="https://media1.tenor.com/m/YaCjau306ZYAAAAC/jgmm-cat-meme.gif" 
                          alt="Hired meme cat" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}

                  {/* Rejected supportive block */}
                  {app.status === 'Rejected' && (
                    <div className="mt-5 bg-manga-pink/5 border-2 border-black rounded-none p-5 text-sm flex flex-col sm:flex-row gap-5 shadow-[4px_4px_0_0_rgba(0,0,0,1)] items-center justify-between bg-white">
                      <div className="flex gap-4 items-start">
                        <div className="w-10 h-10 bg-manga-pink text-white border-2 border-black rounded-none flex flex-shrink-0 items-center justify-center shadow-[2px_2px_0_0_rgba(0,0,0,1)] font-black text-xl">
                          ⚓
                        </div>
                        <div>
                          <p className="font-black text-black uppercase tracking-wide text-lg mb-1">On to the Next Adventure!</p>
                          <p className="text-gray-800 font-extrabold">Don't lose heart! The right place is waiting for you. Let's keep exploring! ⚓</p>
                        </div>
                      </div>
                      
                      {/* Rejected Cat GIF */}
                      <div className="w-24 h-24 bg-white border-2 border-black shadow-[3px_3px_0_0_#000] rounded-none overflow-hidden flex-shrink-0 flex items-center justify-center">
                        <img 
                          src="https://media1.tenor.com/m/ZXPCRT8wKXgAAAAC/cat-scuba-cat.gif" 
                          alt="Rejected meme cat" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </DashboardLayout>
  );
}
