import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { ShieldCheck, KeyRound, User, ArrowRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { user } = await login(email, password);
      if (user.role === 'Admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  const demoAccounts = [
    { 
      role: 'Admin', 
      name: 'Rohith (Admin)',
      email: 'admin@projectflow.io', 
      icon: ShieldCheck,
      desc: 'Full system oversight and manager control'
    },
    { 
      role: 'Manager', 
      name: 'Ramesh Kumar',
      email: 'manager@projectflow.io', 
      icon: KeyRound,
      desc: 'Create projects and assign team tasks'
    },
    { 
      role: 'Manager', 
      name: 'Suresh Sharma',
      email: 'suresh@projectflow.io', 
      icon: KeyRound,
      desc: 'Portfolio management and team alignment'
    },
    { 
      role: 'Member', 
      name: 'Rahul Varma',
      email: 'member@projectflow.io', 
      icon: User,
      desc: 'View tasks and update progress'
    },
    { 
      role: 'Member', 
      name: 'Mukesh Singh',
      email: 'mukesh@projectflow.io', 
      icon: User,
      desc: 'Execute deliverables and log status'
    },
  ];

  const fillCredentials = (accEmail) => {
    setEmail(accEmail);
    setPassword('projectflow123');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white font-sans overflow-hidden">
      {/* Left Side: Demo Credentials */}
      <div className="w-full md:w-1/2 bg-indigo-600 p-8 md:p-16 flex flex-col justify-center relative">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-700 to-indigo-900 opacity-50" />
        
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold text-white mb-4">
              ProjectFlow
            </h1>
            <p className="text-indigo-100 text-lg font-normal max-w-md leading-relaxed mb-12">
              The professional project management workspace. Choose a demo account to get started.
            </p>
          </motion.div>

          <div className="space-y-3 max-w-md">
            <p className="text-indigo-200 text-sm font-semibold mb-4">Select a demo account</p>
            {demoAccounts.map((acc, idx) => (
              <motion.button
                key={acc.email}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.1 }}
                onClick={() => fillCredentials(acc.email)}
                className="w-full group flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white group-hover:scale-105 transition-transform shrink-0">
                    <acc.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white flex items-center gap-2">
                       {acc.name} <span className="text-[10px] px-2 py-0.5 bg-white/20 rounded-full font-bold">{acc.role}</span>
                    </p>
                    <p className="text-xs text-indigo-200/80 mt-0.5">{acc.email}</p>
                    <p className="text-[11px] text-indigo-300 font-medium mt-1 opacity-0 group-hover:opacity-100 transition-opacity line-clamp-1">{acc.desc}</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-indigo-300 opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all shrink-0" />
              </motion.button>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-white/5">
            <p className="text-sm font-medium text-indigo-200">Default password: <span className="text-white font-semibold">projectflow123</span></p>
          </div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full md:w-1/2 flex items-start justify-center p-8 md:p-16 md:pt-40 bg-white">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md w-full"
        >
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-bold text-gray-900">Sign in</h2>
            <p className="text-gray-500 mt-2">Enter your workspace credentials to continue</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-8 text-sm font-medium text-center border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Email address</label>
              <input 
                type="email" 
                required
                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-50 focus:bg-white focus:border-indigo-600 outline-none transition-all text-sm font-medium text-gray-900"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Password</label>
              <input 
                type="password" 
                required
                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-50 focus:bg-white focus:border-indigo-600 outline-none transition-all text-sm font-medium text-gray-900"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <button 
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-base font-semibold py-4 rounded-xl transition-all shadow-lg shadow-indigo-100 active:scale-[0.98]"
            >
              Sign in to Workspace
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-sm font-medium text-gray-500">
              New to the platform? <Link to="/register" className="text-indigo-600 hover:underline font-semibold">Create an account</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
