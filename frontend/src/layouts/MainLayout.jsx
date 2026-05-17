import { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, CheckSquare, Briefcase, LogOut, Users, ChevronDown, Bell, Settings, PieChart, Layers } from 'lucide-react';
import clsx from 'clsx';
import NotificationCenter from '../components/NotificationCenter';

const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  let navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Projects', path: '/projects', icon: Briefcase },
    { name: 'Tasks', path: '/tasks', icon: CheckSquare },
  ];

  if (user?.role === 'Admin') {
    navItems = [
      { name: 'Projects Oversight', path: '/admin', icon: Briefcase },
    ];
  } else if (user?.role === 'Manager') {
    navItems = [
      { name: 'Dashboard', path: '/', icon: LayoutDashboard },
      { name: 'Projects & Team', path: '/projects', icon: Briefcase },
      { name: 'Tasks', path: '/tasks', icon: CheckSquare },
    ];
  }

  return (
    <div className="min-h-screen bg-white flex flex-col selection:bg-indigo-100 selection:text-indigo-900">
      {/* Clean Navbar with Normal Text */}
      <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm shadow-gray-100/20">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <Link to={user?.role === 'Admin' ? '/admin' : '/'} className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-md shadow-amber-500/20 text-slate-950">
                <Layers className="w-4 h-4 font-black" />
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900">
                ProjectFlow
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={clsx(
                      "px-4 py-2 text-sm font-bold transition-all rounded-full",
                      isActive 
                        ? "text-amber-600 bg-amber-50/80 border border-amber-200/50 shadow-2xs" 
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                    )}
                  >
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <NotificationCenter />
            
            <div className="h-6 w-px bg-gray-100 mx-1" />

            {/* Profile Dropdown / User Details Popover */}
            <div className="relative">
              <button 
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-3 p-1.5 rounded-full hover:bg-gray-50 transition-all focus:outline-none cursor-pointer border border-transparent hover:border-gray-100"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 text-amber-400 border border-amber-500/30 flex items-center justify-center text-xs font-bold shadow-sm">
                  {user?.full_name?.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-gray-900 leading-tight">{user?.full_name}</p>
                  <p className="text-[10px] text-gray-400 font-bold leading-tight">{user?.role}</p>
                </div>
                <ChevronDown className={clsx("w-4 h-4 text-gray-400 transition-transform", showUserDropdown && "rotate-180")} />
              </button>

              <AnimatePresence>
                {showUserDropdown && (
                  <>
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.98 }}
                      className="absolute right-0 mt-3 w-80 bg-white border border-gray-100 rounded-[2rem] shadow-2xl p-6 overflow-hidden z-50 space-y-6"
                    >
                      {/* Gradient Header Banner */}
                      <div className="h-24 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 rounded-2xl relative mb-8 shadow-inner border border-amber-500/20">
                        <div className="absolute -bottom-6 left-6 w-16 h-16 rounded-full bg-slate-800 p-1.5 shadow-xl flex items-center justify-center text-2xl font-black text-amber-400 border border-amber-500/30">
                          {user?.full_name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="absolute bottom-3 right-4 px-3 py-1 bg-amber-500 text-slate-900 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md">
                          {user?.role}
                        </span>
                      </div>

                      {/* User Info */}
                      <div className="space-y-1 px-1">
                        <h4 className="text-lg font-black text-gray-900 tracking-tight">{user?.full_name}</h4>
                        <p className="text-xs font-bold text-gray-400">{user?.email}</p>
                      </div>

                      {/* Bento Details Grid */}
                      <div className="bg-gray-50/80 rounded-2xl p-4 space-y-3 border border-gray-100/80">
                        <div className="flex items-center justify-between text-xs">
                           <span className="font-bold text-gray-400 uppercase tracking-wider text-[10px]">Status</span>
                           <span className="flex items-center gap-1.5 text-emerald-600 font-black">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Active • Verified
                           </span>
                        </div>
                        <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-100/60">
                           <span className="font-bold text-gray-400 uppercase tracking-wider text-[10px]">Organization</span>
                           <span className="font-bold text-gray-700">ProjectFlow Global</span>
                        </div>
                        <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-100/60">
                           <span className="font-bold text-gray-400 uppercase tracking-wider text-[10px]">Access Tier</span>
                           <span className="font-black text-amber-600">
                              {user?.role === 'Admin' ? 'Executive Oversight' : user?.role === 'Manager' ? 'Portfolio Management' : 'General Access'}
                           </span>
                        </div>
                        <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-100/60">
                           <span className="font-bold text-gray-400 uppercase tracking-wider text-[10px]">Member Since</span>
                           <span className="font-bold text-gray-700">Oct 2026</span>
                        </div>
                      </div>

                      {/* Switch Account / Logout */}
                      <div className="pt-2 border-t border-gray-100 px-1">
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center justify-center gap-2 py-3 bg-gray-50 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-xl transition-all font-bold text-xs group cursor-pointer border border-gray-100/80 hover:border-red-100"
                        >
                          <LogOut className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                          Switch Account / Logout
                        </button>
                      </div>
                    </motion.div>
                    <div className="fixed inset-0 z-[40]" onClick={() => setShowUserDropdown(false)} />
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
};

export default MainLayout;
