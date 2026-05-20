import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  LogOut,
  Bell
} from 'lucide-react';

const SidebarItem = ({ icon: Icon, text, active, onClick }) => (
  <div onClick={onClick} className={`flex items-center gap-3 px-4 py-3 rounded-none cursor-pointer border-2 transition-all duration-150 ${active ? 'bg-manga-yellow border-black text-black font-extrabold shadow-[3px_3px_0_0_rgba(0,0,0,1)] translate-x-[-1px] translate-y-[-1px]' : 'bg-white hover:bg-manga-cyan/10 border-transparent text-gray-800 hover:text-black font-bold'}`}>
    <Icon size={18} className="text-black" />
    <span className="text-sm uppercase tracking-wide">{text}</span>
  </div>
);

export default function DashboardLayout({ children, role = 'recruiter' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/');
    window.location.reload();
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div className="min-h-screen flex bg-[#fffdf9] text-black font-sans selection:bg-manga-yellow selection:text-black">
      
      {/* Sidebar */}
      <aside className="w-64 bg-[#fffdf5] border-r-3 border-black fixed h-full flex flex-col z-20">
        <div className="h-16 flex items-center px-6 border-b-3 border-black bg-manga-yellow">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-none flex items-center justify-center text-white text-sm font-black shadow-[3px_3px_0_0_rgba(255,255,255,1)] border border-white font-comic">J</div>
            <span className="text-2xl font-comic font-black tracking-widest text-black uppercase mt-0.5">JAWB</span>
          </Link>
        </div>
        
        <div className="px-4 py-6 space-y-6 flex-1 overflow-y-auto">
          <div>
            <div className="text-xs font-black text-black/70 uppercase tracking-wider mb-3 px-2">Workspace</div>
            <div className="space-y-2">
              <SidebarItem icon={LayoutDashboard} text="Overview" active={true} />
            </div>
          </div>
        </div>

        <div className="mt-auto p-4 border-t-3 border-black bg-[#fffefb]">
          <div className="flex items-center gap-3 px-3 py-2 mb-3 border-2 border-black bg-white shadow-[3px_3px_0_0_#000] p-2">
            <div className="w-9 h-9 rounded-none bg-manga-pink text-white flex items-center justify-center font-black text-sm border-2 border-black">
              {getInitials(user?.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-black truncate leading-tight">{user?.name || 'Loading...'}</p>
              <p className="text-[10px] text-gray-700 font-bold uppercase tracking-wider">{user?.role || role}</p>
            </div>
          </div>
          <SidebarItem icon={LogOut} text="Log out" onClick={handleLogout} />
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-16 px-8 flex items-center justify-between bg-white border-b-3 border-black sticky top-0 z-10 shadow-[0_4px_0_0_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-800">
            <span className="bg-manga-cyan text-black px-2 py-0.5 border border-black font-black">{user?.role || role}</span>
            <span className="text-black font-black">/</span>
            <span className="text-black font-black">Overview</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-black hover:bg-manga-yellow rounded-none border border-transparent hover:border-black transition-all">
              <Bell size={20} />
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8 flex-1 max-w-6xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
