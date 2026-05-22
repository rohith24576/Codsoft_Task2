import { useState, useEffect } from 'react';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, Layers, 
  Users, Zap, Calendar, Search, ShieldCheck,
  Clock, ChevronRight, X, Send, CheckCircle2 as CheckIcon, Zap as ZapIcon, Bell
} from 'lucide-react';
import clsx from 'clsx';
import CustomSelect from '../components/CustomSelect';

const AdminDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All'); // 'All', 'Completed', 'In Progress', 'Planning'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [adminMessage, setAdminMessage] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState('All');
  const [isSendingDirective, setIsSendingDirective] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotify = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSendDirective = async (e) => {
    e.preventDefault();
    if (!adminMessage.trim()) return showNotify('error', 'Please enter a message directive');
    setIsSendingDirective(true);
    try {
      const recipients = selectedRecipient === 'All' 
        ? (selectedProject?.team_members || [])
        : [{ id: selectedRecipient }];

      if (recipients.length === 0) {
        showNotify('error', 'No assigned team members to notify');
        setIsSendingDirective(false);
        return;
      }

      await Promise.all(recipients.map(user => 
        api.post('/notifications', {
          user_id: user.id,
          title: `Admin Directive: ${selectedProject?.name}`,
          message: adminMessage.trim(),
          type: 'Request'
        })
      ));

      showNotify('success', 'Admin directive successfully dispatched to team members!');
      setAdminMessage('');
    } catch (error) {
      showNotify('error', error.response?.data?.message || 'Failed to dispatch directive');
    } finally {
      setIsSendingDirective(false);
    }
  };

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const { data } = await api.get('/projects');
        setProjects(data);
      } catch (error) {
        console.error('Failed to fetch admin projects', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  if (loading) return (
    <div className="max-w-[1400px] mx-auto py-12 px-4 space-y-8">
      <div className="h-64 bg-gray-100 rounded-[3rem] animate-pulse"></div>
      <div className="grid grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-100 rounded-3xl animate-pulse"></div>)}
      </div>
    </div>
  );

  // Filter projects based on selected status tab and search query
  const filteredProjects = projects.filter(p => {
    const matchesTab = filter === 'All' || p.status === filter;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  // Calculate overview counts
  const completedCount = projects.filter(p => p.status === 'Completed').length;
  const inProgressCount = projects.filter(p => p.status === 'In Progress').length;
  const planningCount = projects.filter(p => p.status === 'Planning').length;

  return (
    <div className="max-w-[1500px] mx-auto pb-20 px-4 space-y-12">
      
      {/* Premium Executive Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
        <div className="relative z-10 space-y-6 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-xl rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300 border border-white/10">
            <ShieldCheck className="w-3.5 h-3.5" />
            Executive Portal
          </div>
          <div className="space-y-2">
            <h2 className="text-5xl font-black tracking-tighter text-white">Projects Oversight</h2>
            <p className="text-gray-300 text-lg font-medium leading-relaxed">
              Welcome, Administrator. You have full read-only oversight across all <span className="text-white font-bold">{projects.length} strategic initiatives</span> and active team member allocations.
            </p>
          </div>
          
          {/* Quick Metrics Pill */}
          <div className="flex flex-wrap gap-4 pt-2">
            <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-indigo-400 animate-pulse"></div>
              <span className="text-sm font-bold text-gray-200">{inProgressCount} In Progress</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
              <span className="text-sm font-bold text-gray-200">{completedCount} Completed</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-amber-400"></div>
              <span className="text-sm font-bold text-gray-200">{planningCount} Planning</span>
            </div>
          </div>
        </div>
        {/* Abstract Background Accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2"></div>
        <Layers className="absolute right-[-20px] bottom-[-20px] w-80 h-80 text-white/[0.03] -rotate-12" />
      </div>

      {/* Interactive Controls & Status Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { label: 'All', count: projects.length, color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
            { label: 'In Progress', count: inProgressCount, color: 'bg-blue-50 text-blue-600 border-blue-100' },
            { label: 'Completed', count: completedCount, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
            { label: 'Planning', count: planningCount, color: 'bg-amber-50 text-amber-600 border-amber-100' }
          ].map(tab => (
            <button
              key={tab.label}
              onClick={() => setFilter(tab.label)}
              className={clsx(
                "px-6 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 border cursor-pointer",
                filter === tab.label 
                  ? tab.color + ' shadow-md scale-105 ring-2 ring-indigo-500/20' 
                  : 'bg-gray-50/50 text-gray-500 border-gray-100 hover:bg-gray-50'
              )}
            >
              {tab.label}
              <span className="px-2 py-0.5 rounded-lg bg-white/80 text-xs font-black shadow-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[300px]">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by name or objective..."
            className="w-full bg-gray-50/80 border border-gray-100 rounded-2xl pl-12 pr-6 py-3.5 text-sm font-bold text-gray-800 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
          />
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredProjects.length === 0 ? (
          <div className="col-span-full py-20 text-center space-y-4 bg-white rounded-[3rem] border border-gray-100 shadow-sm">
             <Briefcase className="w-12 h-12 text-gray-300 mx-auto" />
             <h3 className="text-xl font-bold text-gray-700">No Projects Found</h3>
             <p className="text-sm text-gray-400 max-w-sm mx-auto">No initiatives match your current filter or search criteria. Try selecting a different tab.</p>
          </div>
        ) : (
          filteredProjects.map((project, idx) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => setSelectedProject(project)}
              className="group bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all flex flex-col justify-between cursor-pointer relative overflow-hidden"
            >
              {/* Top Accent Bar */}
              <div className={clsx(
                "absolute top-0 left-0 right-0 h-1.5 transition-all group-hover:h-2",
                project.status === 'Completed' ? 'bg-emerald-500' :
                project.status === 'In Progress' ? 'bg-indigo-600' : 'bg-amber-500'
              )}></div>

              <div className="space-y-6 pt-2">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 bg-gray-50 text-gray-700 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                     <Briefcase className="w-5 h-5" />
                  </div>
                  <span className={clsx(
                    "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-2xs",
                    project.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                    project.status === 'In Progress' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                    'bg-amber-50 text-amber-600 border-amber-100'
                  )}>
                    {project.status || 'Active'}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{project.name}</h3>
                  <p className="text-gray-400 text-xs font-medium leading-relaxed line-clamp-2">{project.description}</p>
                </div>

                {/* Team Members Summary Pill */}
                <div className="flex items-center gap-2 p-3 bg-gray-50/80 rounded-2xl border border-gray-100/80">
                   <Users className="w-4 h-4 text-indigo-500 shrink-0" />
                   <div className="flex-1 min-w-0">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Assigned Force</p>
                     <p className="text-xs font-bold text-gray-700 truncate">
                       {Array.isArray(project.team_members) && project.team_members.length > 0 
                         ? project.team_members.map(tm => tm.full_name || tm.email.split('@')[0]).join(', ') 
                         : 'No team members assigned'}
                     </p>
                   </div>
                   <span className="px-2 py-1 bg-white text-indigo-600 rounded-xl text-xs font-black shadow-2xs border border-gray-100">
                     {Array.isArray(project.team_members) ? project.team_members.length : 0}
                   </span>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-gray-50 flex justify-between items-center">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  Due {new Date(project.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform">
                   Inspect <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Comprehensive Project Details Modal */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProject(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl p-10 space-y-8 max-h-[90vh] overflow-y-auto no-scrollbar border border-gray-100"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between pb-6 border-b border-gray-100">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className={clsx(
                      "px-3 py-1 rounded-xl text-xs font-black uppercase tracking-widest border shadow-2xs",
                      selectedProject.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      selectedProject.status === 'In Progress' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                      'bg-amber-50 text-amber-600 border-amber-100'
                    )}>
                      {selectedProject.status || 'Active'}
                    </span>
                    <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Created {new Date(selectedProject.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-3xl font-black text-gray-900 tracking-tight">{selectedProject.name}</h3>
                </div>
                <button 
                  onClick={() => setSelectedProject(null)}
                  className="p-3 bg-gray-50 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-2xl transition-all cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Project Objective */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Project Objective & Scope</h4>
                <div className="p-6 bg-gray-50/80 rounded-3xl border border-gray-100 leading-relaxed text-sm font-medium text-gray-700">
                  {selectedProject.description || 'No objective specified.'}
                </div>
              </div>

              {/* Project Metadata Bento */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100/80 flex items-center gap-4">
                  <div className="w-12 h-12 bg-white text-indigo-600 rounded-2xl flex items-center justify-center font-bold shadow-sm">
                     <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-indigo-900 uppercase tracking-widest">Target Deadline</p>
                    <p className="text-sm font-bold text-gray-800">
                      {new Date(selectedProject.deadline).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="p-6 bg-purple-50/50 rounded-3xl border border-purple-100/80 flex items-center gap-4">
                  <div className="w-12 h-12 bg-white text-purple-600 rounded-2xl flex items-center justify-center font-bold shadow-sm">
                     <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-purple-900 uppercase tracking-widest">Team Size</p>
                    <p className="text-sm font-bold text-gray-800">
                      {Array.isArray(selectedProject.team_members) ? selectedProject.team_members.length : 0} Active Allocations
                    </p>
                  </div>
                </div>
              </div>

              {/* Assigned Team Members */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">Assigned Team Members</h4>
                  <span className="text-xs font-bold text-gray-400">Read-Only Oversight</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-64 overflow-y-auto pr-2">
                  {Array.isArray(selectedProject.team_members) && selectedProject.team_members.length > 0 ? (
                    selectedProject.team_members.map((tm, i) => (
                      <div key={tm.id || i} className="p-4 bg-white rounded-2xl border border-gray-200/80 shadow-xs flex items-center gap-4 hover:border-indigo-200 transition-colors">
                        <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl flex items-center justify-center font-black text-sm shadow-md">
                          {tm.full_name ? tm.full_name.charAt(0) : tm.email.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-bold text-gray-900 truncate">{tm.full_name || tm.email.split('@')[0]}</p>
                            <span className={clsx(
                              "px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider shrink-0 border",
                              tm.role === 'Manager' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                            )}>
                              {tm.role}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-400 font-medium truncate mt-0.5">{tm.email}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full p-8 bg-gray-50 rounded-3xl text-center border border-gray-100">
                      <p className="text-sm text-gray-400 italic font-medium">No team members currently assigned to this project.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Dispatch Admin Directive Form */}
              <div className="space-y-4 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                    <Send className="w-4 h-4 text-indigo-600" /> Dispatch Admin Directive
                  </h4>
                  <span className="text-xs font-bold text-gray-400">Direct Communication</span>
                </div>

                <form onSubmit={handleSendDirective} className="space-y-4 bg-indigo-50/30 p-6 rounded-3xl border border-indigo-100/60 shadow-inner">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <CustomSelect 
                        label="Select Recipient(s)"
                        value={selectedRecipient}
                        onChange={setSelectedRecipient}
                        options={[
                          { value: 'All', label: 'All Assigned Team Members', badge: 'Broadcast' },
                          ...(Array.isArray(selectedProject.team_members) ? selectedProject.team_members.map(tm => ({
                            value: tm.id,
                            label: tm.full_name || tm.email.split('@')[0],
                            sublabel: tm.role,
                            badge: tm.role
                          })) : [])
                        ]}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-indigo-900 uppercase tracking-widest ml-1">Directive Message</label>
                    <textarea 
                      required
                      rows={3}
                      value={adminMessage}
                      onChange={(e) => setAdminMessage(e.target.value)}
                      placeholder="Enter directive instructions, feedback, or required changes..."
                      className="w-full bg-white border border-indigo-100 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none resize-none shadow-sm"
                    ></textarea>
                  </div>

                  <button 
                    type="submit"
                    disabled={isSendingDirective}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-bold shadow-xl shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" /> {isSendingDirective ? 'Dispatching Directive...' : 'Send Directive to Team'}
                  </button>
                </form>
              </div>

              {/* Modal Footer */}
              <div className="pt-6 border-t border-gray-100 flex justify-end">
                <button 
                  type="button"
                  onClick={() => setSelectedProject(null)}
                  className="px-8 py-4 bg-slate-900 hover:bg-black text-white rounded-2xl text-sm font-bold shadow-xl shadow-slate-900/10 transition-all active:scale-95 cursor-pointer"
                >
                  Close Oversight View
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={clsx(
              "fixed bottom-8 left-1/2 z-[200] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border backdrop-blur-md min-w-[300px]",
              notification.type === 'success' ? 'bg-emerald-500/90 border-emerald-400 text-white' :
              notification.type === 'error' ? 'bg-red-500/90 border-red-400 text-white' :
              'bg-indigo-600/90 border-indigo-500 text-white'
            )}
          >
             {notification.type === 'success' && <CheckIcon className="w-5 h-5" />}
             {notification.type === 'error' && <ZapIcon className="w-5 h-5" />}
             {notification.type === 'info' && <Bell className="w-5 h-5" />}
             <p className="text-sm font-bold">{notification.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AdminDashboard;
