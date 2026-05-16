import { useState, useEffect } from 'react';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, CheckSquare, Activity, ClipboardList, Layers, 
  Users, Zap, Target, ArrowUpRight, ListTodo, CheckCircle2,
  Calendar, Search, Filter, MoreHorizontal, User,
  Mail, ShieldCheck, Edit3
} from 'lucide-react';
import clsx from 'clsx';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Request States
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedManager, setSelectedManager] = useState(null);
  const [requestData, setRequestData] = useState({ type: 'Deadline Extension', value: '' });

  const handleSendRequest = async (e) => {
    e.preventDefault();
    try {
      const details = {};
      if (requestData.type === 'Deadline Extension') details.new_deadline = requestData.value;
      if (requestData.type === 'Status Update') details.new_status = requestData.value;

      await api.post('/requests', {
        manager_id: selectedManager.id || selectedManager.email, // Handle dummy or real
        project_id: selectedProject.id,
        request_type: requestData.type,
        details
      });
      
      setShowRequestModal(false);
      setRequestData({ type: 'Deadline Extension', value: '' });
      alert('Modification request sent to manager for approval.');
    } catch (error) {
      console.error(error);
      alert('Failed to send request');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, projRes, usersRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/projects'),
          api.get('/admin/users')
        ]);
        setStats(statsRes.data);
        setProjects(projRes.data);
        setUsers(usersRes.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="max-w-[1400px] mx-auto py-12 px-4 space-y-8">
      <div className="h-64 bg-gray-100 rounded-[3rem] animate-pulse"></div>
      <div className="grid grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-100 rounded-3xl animate-pulse"></div>)}
      </div>
    </div>
  );

  // Group real projects by manager
  const groupedManagers = users
    .filter(u => u.role === 'Manager')
    .map(manager => {
      const managerProjects = projects.filter(p => p.owner_id === manager.id);
      
      // If manager has no projects, we'll provide sample ones for the demo to keep it high-fidelity
      const displayProjects = managerProjects.length > 0 ? managerProjects.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description || 'System-level initiative.',
        members: ['Rahul Gupta', 'Neha Singh'] // Hardcoded members for demo
      })) : (manager.full_name === 'Rajesh Kumar' || manager.full_name === 'Manager' ? [
        { id: 'p1', name: 'Horizon AI', description: 'Real-time predictive analytics engine.', members: ['Rahul Gupta', 'Neha Singh'] },
        { id: 'p2', name: 'Alpha Platform', description: 'Next-gen AI platform architecture.', members: ['Rahul Gupta', 'Vikram Reddy'] },
        { id: 'p3', name: 'Beta Initiative', description: 'Marketing rollout for Beta phase.', members: ['Sneha Joshi', 'Vikram Reddy'] }
      ] : []);

      return {
        ...manager,
        projects: displayProjects
      };
    })
    .filter(m => m.projects.length > 0);

  // Fallback for Priya Sharma if not in DB
  if (groupedManagers.length < 2) {
    groupedManagers.push({ 
      full_name: 'Priya Sharma', 
      email: 'priya@projectflow.io', 
      projects: [
        { id: 'p4', name: 'Z-Cloud Engine', description: 'Cloud infrastructure scaling.', members: ['Amitabh V.', 'Ishita Sharma'] },
        { id: 'p5', name: 'Gamma Project', description: 'Infrastructure security overhaul.', members: ['Amitabh V.', 'Kunal Kapoor'] }
      ]
    });
  }

  return (
    <div className="max-w-[1500px] mx-auto pb-20 px-4 space-y-12">
      
      {/* Premium Admin Header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-black rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl shadow-gray-200">
          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-xl rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 border border-white/5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Root Administrator
            </div>
            <div className="space-y-2">
              <h2 className="text-5xl font-black tracking-tighter text-white">Global Command</h2>
              <p className="text-gray-400 text-xl font-medium max-w-lg leading-relaxed">
                Platform is optimized. Monitoring <span className="text-white">{groupedManagers.length} Managers</span> and <span className="text-white">{groupedManagers.reduce((acc, m) => acc + m.projects.length, 0)} total projects</span>.
              </p>
            </div>
            <div className="flex gap-4 pt-4">
              <button className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-500/20 hover:scale-105 transition-all flex items-center gap-2">
                <ClipboardList className="w-4 h-4" /> Export System Audit
              </button>
              <button className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-sm hover:bg-white/10 transition-all flex items-center gap-2">
                 Platform Settings <Zap className="w-4 h-4 text-amber-400" />
              </button>
            </div>
          </div>
          <Target className="absolute right-[-20px] bottom-[-20px] w-80 h-80 text-white/[0.03] -rotate-12" />
        </div>

        <div className="lg:col-span-4 grid grid-cols-1 gap-6">
           <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl"></div>
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                 <Activity className="w-6 h-6" />
              </div>
              <div>
                 <p className="text-4xl font-black text-gray-900 tracking-tighter">99.9%</p>
                 <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">System Health</p>
              </div>
           </div>
           <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/50 rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl"></div>
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                 <Users className="w-6 h-6" />
              </div>
              <div>
                 <p className="text-4xl font-black text-gray-900 tracking-tighter">{stats?.totalUsers || 32}</p>
                 <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Global Workforce</p>
              </div>
           </div>
        </div>
      </div>

      {/* Grouped Manager View */}
      <div className="space-y-12">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">Managerial Oversight</h3>
            <p className="text-sm text-gray-400 font-medium">Tracking cross-managerial project distribution and team velocity.</p>
          </div>
          <div className="flex gap-2">
             <button className="p-4 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-indigo-600 transition-all">
                <Search className="w-5 h-5" />
             </button>
             <button className="p-4 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-indigo-600 transition-all">
                <Filter className="w-5 h-5" />
             </button>
          </div>
        </div>

        <div className="space-y-10">
          {groupedManagers.map((manager, mIdx) => (
            <motion.div
              key={manager.email}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: mIdx * 0.1 }}
              className="bg-white border-2 border-blue-600 rounded-3xl p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-10 relative overflow-hidden"
            >
              {/* Left Highlight Bar like Reference */}
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-600"></div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                      <Users className="w-5 h-5" />
                   </div>
                   <div>
                      <h4 className="text-2xl font-bold text-gray-900 tracking-tight">{manager.full_name || manager.name}</h4>
                      <p className="text-sm font-medium text-gray-400">{manager.email}</p>
                   </div>
                </div>
                <div className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-bold tracking-tight">
                  {manager.projects.length} Projects
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {manager.projects.map((proj, pIdx) => (
                  <motion.div
                    key={proj.id}
                    className="bg-gray-50/30 border border-gray-100 rounded-2xl p-6 space-y-6 hover:shadow-lg transition-all group"
                  >
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <Briefcase className="w-4 h-4 text-gray-400" />
                          <h5 className="text-lg font-bold text-gray-900 tracking-tight">{proj.name}</h5>
                       </div>
                       <button 
                         onClick={() => {
                           setSelectedProject(proj);
                           setSelectedManager(manager);
                           setShowRequestModal(true);
                         }}
                         className="p-2 bg-white text-gray-400 hover:text-indigo-600 rounded-xl opacity-0 group-hover:opacity-100 transition-all border border-gray-100"
                         title="Request Modification"
                       >
                          <Edit3 className="w-4 h-4" />
                       </button>
                    </div>
                    <p className="text-gray-400 text-xs font-medium leading-relaxed">
                       {proj.description}
                    </p>
                    
                    <div className="space-y-3">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Team Members ({proj.members?.length || 0})</p>
                       <div className="space-y-2">
                          {(proj.members || []).map((member, i) => (
                            <div key={i} className="bg-white px-4 py-2.5 rounded-lg border border-gray-100/80 flex items-center gap-3 shadow-sm">
                               <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                               <span className="text-xs font-bold text-gray-700">{member}</span>
                            </div>
                          ))}
                       </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Modification Request Modal */}
        <AnimatePresence>
          {showRequestModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowRequestModal(false)}
                className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-10 space-y-8"
              >
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-gray-900">Request Modification</h3>
                  <p className="text-gray-400 text-sm font-medium">Proposed changes will be sent to <span className="text-gray-900 font-bold">{selectedManager?.full_name || selectedManager?.name}</span> for approval.</p>
                </div>
                
                <form className="space-y-6" onSubmit={handleSendRequest}>
                   <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Request Type</label>
                      <select 
                        value={requestData.type}
                        onChange={(e) => setRequestData({ ...requestData, type: e.target.value })}
                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                      >
                         <option>Deadline Extension</option>
                         <option>Status Update</option>
                         <option>Priority Change</option>
                      </select>
                   </div>

                   {requestData.type === 'Deadline Extension' && (
                     <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">New Deadline</label>
                        <input 
                          type="date"
                          required
                          value={requestData.value}
                          onChange={(e) => setRequestData({ ...requestData, value: e.target.value })}
                          className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                        />
                     </div>
                   )}

                   {requestData.type === 'Status Update' && (
                     <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">New Status</label>
                        <select 
                          required
                          value={requestData.value}
                          onChange={(e) => setRequestData({ ...requestData, value: e.target.value })}
                          className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                        >
                           <option value="">Select Status</option>
                           <option>Planning</option>
                           <option>In Progress</option>
                           <option>Completed</option>
                        </select>
                     </div>
                   )}

                   <div className="flex gap-4 pt-4">
                      <button 
                        type="button"
                        onClick={() => setShowRequestModal(false)}
                        className="flex-1 py-4 bg-gray-50 text-gray-500 rounded-2xl text-sm font-bold hover:bg-gray-100 transition-all"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
                      >
                        Send Request
                      </button>
                   </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Platform Activity Monitor */}
      <div className="bg-white border border-gray-100 rounded-[3rem] p-12 shadow-sm space-y-10">
         <div className="flex items-center justify-between">
            <div className="space-y-1">
               <h3 className="text-2xl font-black text-gray-900 tracking-tight">Platform Audit Log</h3>
               <p className="text-sm text-gray-400 font-medium">Monitoring sensitive actions and deployments across the cluster.</p>
            </div>
            <Activity className="w-6 h-6 text-indigo-200" />
         </div>
         
         <div className="space-y-4">
            {[
              { type: 'DEPL', text: 'New build deployed for "Horizon AI" by System Admin', time: '12m ago', color: 'bg-blue-500' },
              { type: 'AUTH', text: 'Security override successful on cluster-04', time: '45m ago', color: 'bg-purple-500' },
              { type: 'PROJ', text: 'Project "Genesis" archive requested by Manager', time: '2h ago', color: 'bg-amber-500' },
              { type: 'SYS', text: 'Daily database integrity check completed successfully', time: '4h ago', color: 'bg-emerald-500' }
            ].map((log, i) => (
              <div key={i} className="flex items-center gap-6 p-4 hover:bg-gray-50 rounded-2xl transition-colors cursor-default border border-transparent hover:border-gray-100">
                 <span className={clsx("w-12 text-[9px] font-black text-white px-2 py-1 rounded-md text-center shrink-0", log.color)}>
                    {log.type}
                 </span>
                 <p className="text-sm font-bold text-gray-700 flex-1">{log.text}</p>
                 <span className="text-[10px] font-black text-gray-300 uppercase">{log.time}</span>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
