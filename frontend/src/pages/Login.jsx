import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState(location.state?.role || 'applicant');
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const parsed = JSON.parse(userInfo);
      navigate(`/${parsed.role}/dashboard`);
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = isLogin ? { email: formData.email, password: formData.password } : { ...formData, role };
      
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      
      const { data } = await axios.post(`${API_URL}${endpoint.replace('/api', '')}`, payload);
      
      if (isLogin && data.role !== role) {
        return setError(`Error: You are trying to log in as a ${role}, but this account is registered as a ${data.role}!`);
      }

      localStorage.setItem('userInfo', JSON.stringify(data));
      
      if (data.role === 'recruiter') {
        navigate('/recruiter/dashboard');
      } else {
        navigate('/applicant/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Is MongoDB running?');
    }
  };

  return (
    <div className="min-h-screen bg-[#fffdf9] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-manga-yellow selection:text-black">
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex justify-center items-center gap-2 mb-6">
          <div className="w-10 h-10 bg-black rounded-none flex items-center justify-center text-white text-base font-black shadow-[3px_3px_0_0_#ffe53b] border border-white font-comic">J</div>
          <span className="font-comic text-4xl font-black tracking-widest uppercase text-black mt-0.5">JAWB</span>
        </Link>
        <h2 className="text-center text-3xl font-black uppercase tracking-tight text-black">
          {isLogin ? 'Sign in to JAWB' : 'Create workspace'}
        </h2>
        <p className="mt-2 text-center text-sm font-bold text-gray-800">
          {isLogin ? 'Or ' : 'Already have an account? '}
          <button onClick={() => setIsLogin(!isLogin)} className="font-black text-black underline decoration-manga-pink decoration-3 hover:text-manga-pink transition-colors">
            {isLogin ? 'create a new account' : 'sign in instead'}
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-[#fffdf5] py-8 px-6 shadow-[8px_8px_0_0_rgba(0,0,0,1)] rounded-none sm:px-10 border-3 border-black">
          
          {error && (
            <div className="mb-6 rounded-none bg-manga-pink/15 p-4 border-2 border-black shadow-[3px_3px_0_0_#000]">
              <div className="text-sm text-black font-black uppercase">{error}</div>
            </div>
          )}

          <div className="flex p-1.5 bg-black border-2 border-black rounded-none mb-6 gap-1">
            <button 
              type="button"
              onClick={() => setRole('applicant')}
              className={`flex-1 py-2 rounded-none text-xs font-black uppercase tracking-wider transition-all ${role === 'applicant' ? 'bg-manga-yellow text-black border border-black shadow-[2px_2px_0_0_#fff]' : 'text-white hover:text-manga-yellow'}`}
            >
              Applicant
            </button>
            <button 
              type="button"
              onClick={() => setRole('recruiter')}
              className={`flex-1 py-2 rounded-none text-xs font-black uppercase tracking-wider transition-all ${role === 'recruiter' ? 'bg-manga-yellow text-black border border-black shadow-[2px_2px_0_0_#fff]' : 'text-white hover:text-manga-yellow'}`}
            >
              Recruiter
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-black">Full Name</label>
                <div className="mt-1">
                  <input 
                    type="text" 
                    required
                    placeholder="Ken Kaneki"
                    className="block w-full rounded-none border-2 border-black px-4 py-2.5 shadow-[3px_3px_0_0_rgba(0,0,0,1)] placeholder-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black sm:text-sm font-semibold bg-white" 
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>
            )}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-black">Email address</label>
              <div className="mt-1">
                <input 
                  type="email" 
                  required
                  placeholder="ken@antecu.net"
                  className="block w-full rounded-none border-2 border-black px-4 py-2.5 shadow-[3px_3px_0_0_rgba(0,0,0,1)] placeholder-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black sm:text-sm font-semibold bg-white" 
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-black">Password</label>
              <div className="mt-1">
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  className="block w-full rounded-none border-2 border-black px-4 py-2.5 shadow-[3px_3px_0_0_rgba(0,0,0,1)] placeholder-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black sm:text-sm font-semibold bg-white" 
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            <div className="pt-3">
              <button type="submit" className="flex w-full justify-center rounded-none border-3 border-black bg-manga-cyan py-3 px-4 text-sm font-black uppercase text-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:bg-white hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_0_#000] focus:outline-none focus:ring-2 focus:ring-black transition-all">
                {isLogin ? 'Sign in' : 'Create account'}
              </button>
            </div>
          </form>
          
        </div>
      </div>
    </div>
  );
}
