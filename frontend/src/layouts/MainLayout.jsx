import { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, CheckSquare, Briefcase, LogOut, Users, ChevronDown, Bell, Settings, PieChart } from 'lucide-react';
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
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-100">
                <div className="w-4 h-4 bg-white rounded-sm" />
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
                      "px-4 py-2 text-sm font-bold transition-all rounded-lg",
                      isActive 
                        ? "text-indigo-600 bg-indigo-50/50" 
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

            {/* Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-3 p-1 rounded-full hover:bg-gray-50 transition-all focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                  {user?.full_name?.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-gray-900 leading-tight">{user?.full_name}</p>
                  <p className="text-[10px] text-gray-500 font-medium leading-tight">{user?.role}</p>
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
                      className="absolute right-0 mt-3 w-64 bg-white border border-gray-100 rounded-xl shadow-xl shadow-gray-200/40 py-2 overflow-hidden"
                    >
                      <div className="px-5 py-3 border-b border-gray-50 mb-1">
                        <p className="text-sm font-semibold text-gray-900">{user?.full_name}</p>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{user?.email}</p>
                      </div>
                      
                      <div className="px-2">
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign out
                        </button>
                      </div>
                    </motion.div>
                    <div className="fixed inset-0 z-[-1]" onClick={() => setShowUserDropdown(false)} />
                  </>
                )}
              </AnimatePresence>
            </div>

            <div className="h-6 w-px bg-gray-100 mx-1" />

            {/* Sign Out Button */}
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-all group"
              title="Sign out"
            >
              <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
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
