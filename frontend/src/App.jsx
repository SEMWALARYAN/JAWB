import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import RecruiterDashboard from './pages/RecruiterDashboard';
import ApplicantDashboard from './pages/ApplicantDashboard';
import Login from './pages/Login';

function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) setUser(JSON.parse(userInfo));
  }, []);

  if (location.pathname.includes('/dashboard')) {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
    navigate('/');
    window.location.reload();
  };

  return (
    <nav className="bg-[#fffdf5] sticky top-0 z-50 border-b-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,0.05)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-none flex items-center justify-center text-white font-black text-sm shadow-[3px_3px_0_0_rgba(255,255,255,1)] border border-white font-comic">J</div>
            <span className="font-comic text-2xl font-black text-black tracking-widest uppercase mt-1">JAWB</span>
          </Link>
          
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-xs text-gray-800 hidden sm:inline-block font-bold uppercase tracking-wide">Welcome back, <span className="font-black text-black">{user.name}</span></span>
                <Link to={`/${user.role}/dashboard`} className="text-sm font-black text-black uppercase hover:text-manga-purple transition-colors">Dashboard</Link>
                <button onClick={handleLogout} className="text-xs font-black uppercase text-black bg-manga-pink border-2 border-black px-4 py-2 rounded-none transition-all shadow-[2px_2px_0_0_#000] hover:bg-white">Log out</button>
              </>
            ) : (
              <Link to="/login" className="text-sm font-black bg-manga-yellow text-black hover:bg-white px-5 py-3 border-2 border-black rounded-none transition-all shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] uppercase tracking-wide">
                Get Started
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#fffdf9] flex flex-col font-sans text-black selection:bg-manga-yellow selection:text-black">
        <Navigation />
        <main className="flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
            <Route path="/applicant/dashboard" element={<ApplicantDashboard />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-20 bg-[#fffdf9] overflow-hidden relative">
      
      {/* Background Interactive Pop Manga Stamps */}
      <motion.div 
        className="absolute top-20 left-10 w-48 bg-white border-4 border-black shadow-[5px_5px_0_0_#000] flex flex-col items-center p-2 text-center cursor-pointer select-none z-20"
        animate={{ rotate: [0, 3, 0, -3, 0] }}
        whileHover={{ scale: 1.05, rotate: 0 }}
        transition={{ 
          rotate: { duration: 6, repeat: Infinity, ease: "easeInOut" },
          hover: { duration: 0.2 }
        }}
      >
        <div className="w-full h-32 border-3 border-black mb-2 overflow-hidden bg-manga-cyan/20 flex items-center justify-center">
            <img src="/Happy.jpg" alt="Happy" className="w-full h-full object-cover" />
        </div>
        <span className="font-comic font-black text-white text-[11px] uppercase tracking-wide leading-tight bg-manga-pink px-2 py-2 border-3 border-black w-full shadow-inner">
          Don’t cry… I’m going to JAWB.<br/>Someone has to earn money for fish…
        </span>
      </motion.div>

      <motion.div 
        className="absolute bottom-20 right-10 w-36 h-36 bg-manga-yellow border-4 border-black shadow-[5px_5px_0_0_#000] flex items-center justify-center p-3 text-center cursor-pointer select-none z-20"
        animate={{ rotate: [0, -5, 0, 5, 0] }}
        whileHover={{ rotate: -360, scale: 1.1, backgroundColor: "#ff2a85" }}
        transition={{ 
          rotate: { duration: 6, repeat: Infinity, ease: "easeInOut" },
          hover: { duration: 0.4 }
        }}
      >
        <span className="font-comic font-black text-black text-sm uppercase tracking-widest leading-none">
          100% GEEK<br/><span className="text-white text-xs border border-black bg-black px-1.5 py-0.5 inline-block mt-1">VIBES ONLY</span>
        </span>
      </motion.div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-none bg-manga-yellow border-2 border-black text-black text-xs font-black uppercase tracking-wider mb-8 shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
        >
          <span className="relative flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-black border border-white"></span>
          </span>
          JAWB Platform is Live
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, type: "spring" }}
          className="text-6xl sm:text-7xl md:text-8xl font-comic font-black text-black tracking-wider leading-none mb-6 uppercase"
        >
          Hire the best. <br className="hidden sm:block" />
          <span className="text-black bg-white px-4 py-1 border-3 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] font-comic">Faster.</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-6 text-xl text-black font-semibold max-w-2xl mx-auto leading-relaxed bg-[#fffdf5] p-5 border-3 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)]"
        >
          The all-in-one recruitment platform designed for modern teams. Source, evaluate, and hire top candidates with a vibrant, intuitive workspace.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-12 flex flex-col sm:flex-row gap-6 justify-center items-center"
        >
          <motion.button 
            whileHover={{ scale: 1.05, x: -2, y: -2, boxShadow: "8px 8px 0px 0px rgba(0,0,0,1)" }}
            whileTap={{ scale: 0.95, x: 2, y: 2, boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)" }}
            onClick={() => navigate('/login', { state: { role: 'recruiter' } })}
            className="w-full sm:w-auto px-8 py-4 bg-manga-cyan text-black rounded-none border-3 border-black text-base font-black uppercase tracking-wider transition-all shadow-[5px_5px_0_0_rgba(0,0,0,1)]"
          >
            I am a Recruiter
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05, x: -2, y: -2, boxShadow: "8px 8px 0px 0px rgba(0,0,0,1)" }}
            whileTap={{ scale: 0.95, x: 2, y: 2, boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)" }}
            onClick={() => navigate('/login', { state: { role: 'applicant' } })}
            className="w-full sm:w-auto px-8 py-4 bg-manga-pink text-white rounded-none border-3 border-black text-base font-black uppercase tracking-wider transition-all shadow-[5px_5px_0_0_rgba(0,0,0,1)]"
          >
            I am an Applicant
          </motion.button>
        </motion.div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.7 }}
        className="mt-24 max-w-6xl w-full mx-auto relative group z-10"
      >
        <div className="absolute -inset-2 bg-black rounded-none translate-x-3 translate-y-3 opacity-100 group-hover:translate-x-4 group-hover:translate-y-4 transition-all"></div>
        <div className="relative rounded-none border-4 border-black bg-[#fffdf5] p-2 sm:p-4 shadow-none">
          <div className="rounded-none border-3 border-black bg-white shadow-inner overflow-hidden aspect-[16/9] flex items-center justify-center bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHBhdGggZD0iTTAgMGgyMHYyMEgwem0xMCAxMGgxMHYxMEgxMHoiIGZpbGw9IiNlNWU1ZTUiIGZpbGwtcnVsZT0iZXZlbm9kZCIvPjwvc3ZnPg==')]">
            {/* Dashboard Mockup animated */}
            <div className="w-full h-full p-8 flex flex-col gap-6 opacity-100 bg-[#fffdf9]/45 backdrop-blur-[2px]">
              <div className="w-full h-12 flex gap-4 border-b-3 border-black pb-4 items-center bg-[#ffe53b] p-3 border-3 shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
                <div className="w-6 h-6 bg-black rounded-none"></div>
                <div className="w-32 h-4 bg-white rounded-none border-2 border-black"></div>
                <div className="w-24 h-4 bg-white rounded-none border-2 border-black ml-auto"></div>
                <div className="w-7 h-7 bg-manga-pink border-2 border-black rounded-none"></div>
              </div>
              <div className="flex gap-6 h-full">
                <div className="w-64 h-full bg-[#fffdf5] rounded-none border-3 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] p-4 flex flex-col gap-3">
                  <div className="w-full h-8 bg-manga-cyan/20 rounded-none border-2 border-black"></div>
                  <div className="w-3/4 h-6 bg-white rounded-none border-2 border-black"></div>
                  <div className="w-5/6 h-6 bg-white rounded-none border-2 border-black"></div>
                </div>
                <div className="flex-1 flex flex-col gap-6">
                  <div className="w-full h-32 bg-white rounded-none border-3 border-black shadow-[5px_5px_0_0_rgba(0,0,0,1)] p-6 flex items-end gap-4 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIi8+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNjY2MiLz4KPC9zdmc+')]">
                    <div className="w-1/4 h-full bg-[#ff2a85] rounded-none border-2 border-black"></div>
                    <div className="w-1/4 h-3/4 bg-[#00e5ff] rounded-none border-2 border-black"></div>
                    <div className="w-1/4 h-1/2 bg-[#ffe53b] rounded-none border-2 border-black"></div>
                    <div className="w-1/4 h-full bg-black rounded-none border-2 border-black"></div>
                  </div>
                  <div className="w-full flex-1 bg-white rounded-none border-3 border-black shadow-[5px_5px_0_0_rgba(0,0,0,1)] p-6 flex flex-col gap-4">
                     <div className="w-1/3 h-6 bg-[#ff9100] border-2 border-black px-2 text-[10px] font-black uppercase">Analytics</div>
                     <div className="w-full h-12 bg-manga-cyan/5 rounded-none border-2 border-black"></div>
                     <div className="w-full h-12 bg-manga-yellow/5 rounded-none border-2 border-black"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default App;
