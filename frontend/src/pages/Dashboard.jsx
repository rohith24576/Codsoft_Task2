import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, ListTodo, Layers, CheckCircle2, ChevronRight, Activity, 
  Users, Trash2, Clock, Target, ArrowUpRight, Search, 
  MoreVertical, UserPlus, Zap, Bell, Calendar
} from 'lucide-react';
import clsx from 'clsx';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (user?.role === 'Admin') {
    return <Navigate to="/admin" replace />;
  }

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSyncOverlay, setShowSyncOverlay] = useState(false);
  const [notification, setNotification] = useState(null); // { type: 'success' | 'error' | 'info', message: '' }
  const [projectData, setProjectData] = useState({ name: '', description: '', deadline: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live states for demo
  const [requests, setRequests] = useState([
    { id: 1, name: 'Arjun Mehra', email: 'arjun@projectflow.io', role: 'UI Designer' },
    { id: 2, name: 'Sanya Malhotra', email: 'sanya@projectflow.io', role: 'React Developer' }
  ]);
  const [allUsers, setAllUsers] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [selectedManageProject, setSelectedManageProject] = useState('');
  const [selectedAddUser, setSelectedAddUser] = useState('');
  const [selectedAddRole, setSelectedAddRole] = useState('Member');
  const [isManagingMember, setIsManagingMember] = useState(false);

  const isManager = user?.role === 'Manager';
  const canManage = user?.role === 'Admin' || isManager;

  const showNotify = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchData = async () => {
    try {
      const [tasksRes, projectsRes, usersRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/projects'),
        api.get('/projects/users')
      ]);
      setTasks(tasksRes.data);
      setProjects(projectsRes.data);
      setAllUsers(usersRes.data);

      const membersMap = new Map();
      const colors = ['bg-amber-500', 'bg-emerald-500', 'bg-purple-500', 'bg-blue-500', 'bg-rose-500'];
      
      projectsRes.data.forEach(p => {
        if (Array.isArray(p.team_members)) {
          p.team_members.forEach((tm, idx) => {
            if (tm.email !== user?.email) {
              if (!membersMap.has(tm.email)) {
                membersMap.set(tm.email, {
                  id: tm.id,
                  name: tm.full_name || tm.email.split('@')[0],
                  email: tm.email,
                  role: tm.role || 'Member',
                  status: 'Online',
                  color: colors[idx % colors.length],
                  projects: [p.name]
                });
              } else {
                const existing = membersMap.get(tm.email);
                if (!existing.projects.includes(p.name)) {
                  existing.projects.push(p.name);
                }
              }
            }
          });
        }
      });
      setTeamMembers(Array.from(membersMap.values()));
    } catch (error) {
      console.error('Error fetching dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedManageProject || !selectedAddUser) return showNotify('error', 'Please select both a project and a user');
    setIsManagingMember(true);
    try {
      await api.post('/projects/members', {
        project_id: selectedManageProject,
        user_id: selectedAddUser,
        role: selectedAddRole
      });
      showNotify('success', 'Team member added successfully!');
      setSelectedAddUser('');
      fetchData();
    } catch (error) {
      showNotify('error', 'Failed to add member: ' + error.message);
    } finally {
      setIsManagingMember(false);
    }
  };

  const handleRemoveMember = async (projectId, userId) => {
    try {
      await api.delete(`/projects/members/${projectId}/${userId}`);
      showNotify('success', 'Team member removed successfully');
      fetchData();
    } catch (error) {
      showNotify('error', 'Failed to remove member');
    }
  };


  // Real admin requests
  const [adminRequests, setAdminRequests] = useState([]);

  const fetchAdminRequests = async () => {
    try {
      const res = await api.get('/requests/manager');
      setAdminRequests(res.data.filter(r => r.status === 'Pending'));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
    if (isManager) fetchAdminRequests();
  }, [isManager]);

  const handleAdminRequest = async (id, status) => {
    try {
      await api.patch(`/requests/${id}/handle`, { status });
      setAdminRequests(prev => prev.filter(r => r.id !== id));
      showNotify(status === 'Approved' ? 'success' : 'info', `Request ${status.toLowerCase()} successfully.`);
      fetchData(); // Refresh projects to see changes
    } catch (error) {
      showNotify('error', 'Failed to handle request');
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!projectData.name) return showNotify('error', 'Please enter a project name');
    
    setIsSubmitting(true);
    try {
      await api.post('/projects', projectData);
      setShowCreateModal(false);
      setProjectData({ name: '', description: '', deadline: '' });
      fetchData();
      showNotify('success', 'Project initialized successfully!');
    } catch (error) {
      showNotify('error', 'Failed to create project: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = async (id) => {
    try {
      await api.delete(`/projects/${id}`);
      setProjects(projects.filter(p => p.id !== id));
      showNotify('success', 'Project removed from system');
    } catch (error) {
      showNotify('error', 'Failed to delete project');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
      </div>
    </div>
  );

  if (isManager) {
    const completedTasks = tasks.filter(t => t.status === 'Done').length;
    const totalTasks = tasks.length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const displayProjects = projects.length || 3;
    const displayTasks = totalTasks || 5;
    const displayCompleted = completedTasks || 3;
    const displayProgress = progress || 60;

    const dummyProjectNames = ["Horizon AI Integration", "Stealth Mode Redesign", "Project Genesis", "Z-Cloud Engine"];

    return (
      <div className="max-w-[1400px] mx-auto space-y-8 pb-20 px-4">
        {/* Modern Bento Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-gradient-to-br from-indigo-700 to-indigo-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider">
                <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
                Live Performance
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                Welcome, <span className="text-indigo-200">{user?.full_name?.split(' ')[0]}</span>.
              </h2>
              <p className="text-indigo-100/80 text-lg font-medium max-w-xl leading-relaxed">
                Your projects are currently at <span className="text-white font-bold">{displayProgress}% completion</span>. 
                You have {displayTasks - displayCompleted} pending tasks to review today.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-3 bg-white text-indigo-900 rounded-2xl font-bold text-sm shadow-xl hover:scale-105 transition-all active:scale-95 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> New Project
                </button>
                <button 
                  onClick={() => navigate('/tasks')}
                  className="px-6 py-3 bg-indigo-500/30 backdrop-blur-md text-white border border-white/20 rounded-2xl font-bold text-sm hover:bg-indigo-500/40 transition-all flex items-center gap-2"
                >
                   View Reports <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            {/* Abstract Background Element */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl"></div>
            <Target className="absolute right-12 bottom-12 w-48 h-48 text-white/5 -rotate-12" />
          </div>

          <div className="lg:col-span-4 grid grid-cols-2 gap-4">
            <div onClick={() => navigate('/projects')} className="cursor-pointer bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between group hover:shadow-xl hover:-translate-y-1 transition-all">
               <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                  <Layers className="w-6 h-6" />
               </div>
               <div>
                  <p className="text-3xl font-black text-gray-900 tracking-tight">{displayProjects}</p>
                  <p className="text-sm font-bold text-gray-400">Total Projects</p>
               </div>
            </div>
            <div onClick={() => navigate('/tasks')} className="cursor-pointer bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between group hover:shadow-xl hover:-translate-y-1 transition-all">
               <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                  <ListTodo className="w-6 h-6" />
               </div>
               <div>
                  <p className="text-3xl font-black text-gray-900 tracking-tight">{displayTasks}</p>
                  <p className="text-sm font-bold text-gray-400">Total Tasks</p>
               </div>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between group hover:shadow-xl hover:-translate-y-1 transition-all">
               <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                  <CheckCircle2 className="w-6 h-6" />
               </div>
               <div>
                  <p className="text-3xl font-black text-gray-900 tracking-tight">{displayCompleted}</p>
                  <p className="text-sm font-bold text-gray-400">Completed</p>
               </div>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between group hover:shadow-xl hover:-translate-y-1 transition-all">
               <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                  <Activity className="w-6 h-6" />
               </div>
               <div>
                  <p className="text-3xl font-black text-gray-900 tracking-tight">{displayProgress}%</p>
                  <p className="text-sm font-bold text-gray-400">Overall Progress</p>
               </div>
            </div>
          </div>
        </div>

        {/* Team Members Section Moved to Top */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-gray-900">My Team Members</h3>
            <span className="bg-indigo-50 text-indigo-600 text-xs font-bold px-2 py-1 rounded-lg">{teamMembers.length}</span>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar">
            <AnimatePresence>
              {teamMembers.map((member, i) => (
                <motion.div 
                  layout
                  key={member.email} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="min-w-[240px] bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col items-center text-center group hover:shadow-md transition-all shrink-0"
                >
                  <div className="w-14 h-14 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl font-bold mb-4 shadow-lg group-hover:scale-105 transition-transform">
                    {member.name.charAt(0)}
                  </div>
                  <h5 className="font-bold text-gray-900">{member.name}</h5>
                  <p className="text-[10px] text-gray-400 font-medium mb-4">{member.email}</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {(member.projects || []).slice(0, 2).map(p => (
                      <span key={p} className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                        {p}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Main Feed */}
          <div className="xl:col-span-8 space-y-8">
            {/* Active Projects Scroll */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-xl font-bold text-gray-900">Live Projects</h3>
                <button onClick={() => navigate('/projects')} className="text-sm font-bold text-indigo-600 hover:underline">View All</button>
              </div>
              <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar">
                {projects.length === 0 ? (
                  dummyProjectNames.map((name, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="min-w-[320px] bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/50 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-indigo-200/50 transition-colors"></div>
                      
                      <div className="flex justify-between mb-6">
                        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
                          <Layers className="w-5 h-5 text-indigo-600" />
                        </div>
                        <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-amber-100 h-fit">Initializing</span>
                      </div>

                      <h4 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">
                        {name}
                      </h4>
                      <p className="text-xs text-gray-400 font-medium mb-6 line-clamp-1">Sample project for system validation.</p>
                      
                      <div className="space-y-4">
                        <div className="flex justify-between items-end">
                          <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Setup Progress</p>
                          <p className="text-xs font-bold text-gray-900">{20 + (i * 15)}%</p>
                        </div>
                        <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${20 + (i * 15)}%` }}
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                          />
                        </div>
                        <div className="flex justify-between pt-2">
                           <div className="flex -space-x-2">
                              {[1, 2, 3].map(j => (
                                <div key={j} className="w-6 h-6 rounded-full border-2 border-white bg-indigo-100 flex items-center justify-center text-[8px] font-bold text-indigo-600">
                                  {String.fromCharCode(64 + j + i)}
                                </div>
                              ))}
                           </div>
                           <div className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Pre-Sync
                           </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  projects.map((project, idx) => {
                    const projTasks = tasks.filter(t => t.project_id === project.id);
                    const done = projTasks.filter(t => t.status === 'Done').length;
                    const projProgress = projTasks.length > 0 ? Math.round((done / projTasks.length) * 100) : 0;
                    
                    return (
                      <motion.div
                        key={project.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="min-w-[320px] bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group"
                      >
                        <div className="flex justify-between mb-6">
                          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
                            <Layers className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div className="flex gap-1">
                            <button 
                              onClick={() => handleDeleteProject(project.id)}
                              className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-xl">
                              <MoreVertical className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                        <h4 
                          onClick={() => navigate(`/projects`)}
                          className="text-lg font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors cursor-pointer"
                        >
                          {project.name}
                        </h4>
                        <p className="text-xs text-gray-400 font-medium mb-6 line-clamp-1">{project.description}</p>
                        
                        <div className="space-y-4">
                          <div className="flex justify-between items-end">
                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Progress</p>
                            <p className="text-xs font-bold text-gray-900">{projProgress}%</p>
                          </div>
                          <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${projProgress}%` }}
                              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                            />
                          </div>
                          <div className="flex justify-between pt-2">
                             <div className="flex -space-x-2">
                                {[1, 2, 3].map(i => (
                                  <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-indigo-100 flex items-center justify-center text-[8px] font-bold text-indigo-600">
                                    {String.fromCharCode(64 + i)}
                                  </div>
                                ))}
                             </div>
                             <div className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(project.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                             </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })
                )}
              </div>
            </div>

            {/* Join Requests & Activity Bento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                   <div className="flex items-center justify-between">
                     <h3 className="text-lg font-bold text-gray-900">Admin Requests</h3>
                     <span className="bg-amber-50 text-amber-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">{adminRequests.length} Pending</span>
                   </div>
                   <div className="space-y-4">
                     {adminRequests.length === 0 ? (
                       <div className="p-8 text-center space-y-2">
                          <Clock className="w-8 h-8 text-gray-100 mx-auto" />
                          <p className="text-xs font-bold text-gray-400">No pending approvals</p>
                       </div>
                     ) : (
                       adminRequests.map((req, i) => (
                         <motion.div 
                           layout
                           key={req.id} 
                           initial={{ opacity: 0, x: -10 }}
                           animate={{ opacity: 1, x: 0 }}
                           exit={{ opacity: 0, scale: 0.9 }}
                           className="p-5 bg-gray-50/50 rounded-2xl hover:bg-gray-50 transition-colors border border-gray-100/50 space-y-4"
                         >
                           <div className="flex items-center justify-between">
                             <div className="flex items-center gap-3">
                               <div className="w-10 h-10 bg-white text-indigo-600 rounded-xl flex items-center justify-center font-bold shadow-sm">
                                 <Zap className="w-5 h-5" />
                               </div>
                               <div>
                                 <p className="text-sm font-bold text-gray-900">{req.request_type}</p>
                                 <p className="text-[10px] text-gray-400 font-medium">Project: {req.project_name}</p>
                               </div>
                             </div>
                             <div className="flex gap-2">
                                <button 
                                  onClick={() => handleAdminRequest(req.id, 'Approved')}
                                  className="w-8 h-8 bg-emerald-500 text-white rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                                >
                                   <CheckCircle2 className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleAdminRequest(req.id, 'Rejected')}
                                  className="w-8 h-8 bg-white text-rose-500 rounded-lg flex items-center justify-center hover:bg-rose-50 transition-all border border-rose-100 shadow-sm"
                                >
                                   <Trash2 className="w-4 h-4" />
                                </button>
                             </div>
                           </div>
                           <div className="p-3 bg-white rounded-xl border border-gray-100">
                              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Proposed Change</p>
                              <p className="text-xs font-bold text-gray-700">
                                {req.request_type === 'Deadline Extension' ? `New Deadline: ${new Date(req.details.new_deadline).toLocaleDateString()}` : 
                                 req.request_type === 'Status Update' ? `Set Status to: ${req.details.new_status}` : 'Modification requested.'}
                              </p>
                           </div>
                        </motion.div>
                       ))
                     )}
                   </div>
                </div>

               <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                  <h3 className="text-lg font-bold text-gray-900">System Activity</h3>
                  <div className="space-y-6 relative before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-px before:bg-gray-100">
                    {[
                      { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50', text: 'Alex completed "API Integration"', time: '2m ago' },
                      { icon: Plus, color: 'text-indigo-500', bg: 'bg-indigo-50', text: 'New project "Z-Cloud" created', time: '1h ago' },
                      { icon: ListTodo, color: 'text-purple-500', bg: 'bg-purple-50', text: '3 tasks assigned to Rohan', time: '5h ago' }
                    ].map((act, i) => (
                      <div key={i} className="flex gap-4 relative z-10">
                        <div className={clsx("w-5 h-5 rounded-full flex items-center justify-center shrink-0 shadow-sm", act.bg)}>
                          <act.icon className={clsx("w-3 h-3", act.color)} />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-gray-800">{act.text}</p>
                          <p className="text-[10px] text-gray-400 font-medium">{act.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-4 space-y-8">
              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">Team Force</h3>
                  <button 
                    onClick={() => { if (projects.length > 0) setSelectedManageProject(projects[0].id); setShowMemberModal(true); }}
                    className="p-2 bg-gray-50 text-gray-400 rounded-xl hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                  >
                     <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-6">
                  <AnimatePresence mode="popLayout">
                    {teamMembers.map((member, i) => (
                      <motion.div 
                        layout
                        key={member.email} 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 -mx-4 px-4 py-2 rounded-2xl transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="w-12 h-12 bg-indigo-50 text-indigo-700 rounded-2xl flex items-center justify-center font-black text-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className={clsx("absolute -bottom-1 -right-1 w-3.5 h-3.5 border-2 border-white rounded-full", member.color)}></div>
                          </div>
                          <div>
                            <p className="text-sm font-black text-gray-900">{member.name}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{member.role}</p>
                          </div>
                        </div>
                        <button className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-indigo-600 transition-all">
                           <ChevronRight className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                <div className="space-y-3">
                  <button 
                    onClick={() => { if (projects.length > 0) setSelectedManageProject(projects[0].id); setShowMemberModal(true); }}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Users className="w-4 h-4" /> Manage Team Members
                  </button>
                  <button 
                    onClick={() => setShowSyncOverlay(true)}
                    className="w-full py-4 bg-gray-900 text-white rounded-2xl text-sm font-bold shadow-xl shadow-gray-200 hover:bg-black transition-all active:scale-95"
                  >
                     Schedule Team Sync
                  </button>
                </div>
             </div>

             {/* Quick Actions Bento */}
             <div className="bg-indigo-50/50 p-8 rounded-[2.5rem] border border-indigo-100 space-y-4">
                <h4 className="text-sm font-black text-indigo-900 uppercase tracking-widest flex items-center gap-2">
                  <Zap className="w-4 h-4 fill-indigo-900" />
                  Quick Actions
                </h4>
                <div className="grid grid-cols-2 gap-3">
                   <button 
                     onClick={() => showNotify('info', 'Broadcasting updates to all members...')}
                     className="p-4 bg-white rounded-2xl shadow-sm border border-indigo-100 hover:shadow-md transition-all flex flex-col items-center gap-2"
                   >
                      <Bell className="w-5 h-5 text-indigo-600" />
                      <span className="text-[10px] font-bold text-gray-600">Broadcast</span>
                   </button>
                   <button 
                     onClick={() => showNotify('info', 'Setting upcoming project deadlines...')}
                     className="p-4 bg-white rounded-2xl shadow-sm border border-indigo-100 hover:shadow-md transition-all flex flex-col items-center gap-2"
                   >
                      <Calendar className="w-5 h-5 text-indigo-600" />
                      <span className="text-[10px] font-bold text-gray-600">Deadline</span>
                   </button>
                </div>
             </div>
          </div>
        </div>

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
               {notification.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
               {notification.type === 'error' && <Zap className="w-5 h-5" />}
               {notification.type === 'info' && <Bell className="w-5 h-5" />}
               <p className="text-sm font-bold">{notification.message}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sync Overlay */}
        <AnimatePresence>
          {showSyncOverlay && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowSyncOverlay(false)}
                className="absolute inset-0 bg-indigo-900/40 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                className="relative bg-white w-full max-w-sm rounded-[3rem] shadow-2xl overflow-hidden p-10 text-center space-y-6"
              >
                 <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Clock className="w-10 h-10 text-indigo-600 animate-pulse" />
                 </div>
                 <h3 className="text-2xl font-black text-gray-900">Sync Scheduled</h3>
                 <p className="text-gray-500 text-sm font-medium leading-relaxed">
                   Great! A team-wide meeting has been successfully booked for tomorrow at **10:00 AM**.
                 </p>
                 <div className="p-4 bg-indigo-50 rounded-2xl flex items-center gap-3 text-left">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                    <div>
                      <p className="text-[10px] font-black text-indigo-900 uppercase tracking-widest">Date</p>
                      <p className="text-xs font-bold text-gray-700">Oct 24, 2026</p>
                    </div>
                 </div>
                 <button 
                   onClick={() => setShowSyncOverlay(false)}
                   className="w-full py-4 bg-gray-900 text-white rounded-2xl text-sm font-bold shadow-lg hover:bg-black transition-all"
                 >
                   Got it, Thanks!
                 </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>



        {/* New Project Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => !isSubmitting && setShowCreateModal(false)}
                className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-10 space-y-8"
              >
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-gray-900">Initialize Project</h3>
                  <p className="text-gray-400 text-sm font-medium">Set the foundation for your next big initiative.</p>
                </div>
                <form className="space-y-6" onSubmit={handleCreateProject}>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Project Name</label>
                    <input 
                      autoFocus
                      required
                      type="text" 
                      value={projectData.name}
                      onChange={(e) => setProjectData({ ...projectData, name: e.target.value })}
                      placeholder="e.g. Operation Quantum"
                      className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Objective</label>
                    <textarea 
                      rows={3}
                      value={projectData.description}
                      onChange={(e) => setProjectData({ ...projectData, description: e.target.value })}
                      placeholder="What are we achieving?"
                      className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none resize-none" 
                    ></textarea>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Deadline</label>
                    <input 
                      type="date"
                      value={projectData.deadline}
                      onChange={(e) => setProjectData({ ...projectData, deadline: e.target.value })}
                      className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none" 
                    />
                  </div>
                  <div className="flex gap-4 pt-4">
                     <button 
                       type="button"
                       disabled={isSubmitting}
                       onClick={() => setShowCreateModal(false)}
                       className="flex-1 py-4 bg-gray-50 text-gray-500 rounded-2xl text-sm font-bold hover:bg-gray-100 transition-all disabled:opacity-50"
                     >
                       Cancel
                     </button>
                     <button 
                       type="submit"
                       disabled={isSubmitting}
                       className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
                     >
                       {isSubmitting ? 'Creating...' : 'Create Project'}
                     </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        {/* Manage Team Members Modal */}
        <AnimatePresence>
          {showMemberModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => !isManagingMember && setShowMemberModal(false)}
                className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl p-10 space-y-8 max-h-[90vh] overflow-y-auto no-scrollbar"
              >
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-gray-900">Manage Team Members</h3>
                  <p className="text-gray-400 text-sm font-medium">Assign organization members to projects or adjust team roles.</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Select Project</label>
                    <select 
                      value={selectedManageProject}
                      onChange={(e) => setSelectedManageProject(e.target.value)}
                      className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                    >
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Current Members List */}
                  <div className="space-y-3">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Current Members</label>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                      {(() => {
                        const currentProj = projects.find(p => p.id === selectedManageProject);
                        const members = currentProj?.team_members || [];
                        if (members.length === 0) return <p className="text-sm text-gray-400 italic p-4 bg-gray-50 rounded-2xl text-center">No team members assigned yet.</p>;
                        return members.map(tm => (
                          <div key={tm.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center font-bold text-sm">
                                {tm.full_name ? tm.full_name.charAt(0) : tm.email.charAt(0)}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-gray-900">{tm.full_name || tm.email.split('@')[0]}</p>
                                <p className="text-[10px] text-gray-400 font-medium">{tm.email} • <span className="font-bold text-indigo-600">{tm.role}</span></p>
                              </div>
                            </div>
                            {tm.email !== user?.email && (
                              <button 
                                onClick={() => handleRemoveMember(selectedManageProject, tm.id)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                title="Remove Member"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ));
                      })()}
                    </div>
                  </div>

                  {/* Add New Member Form */}
                  <form onSubmit={handleAddMember} className="space-y-4 pt-6 border-t border-gray-100">
                    <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">Assign New Member</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Organization User</label>
                        <select 
                          required
                          value={selectedAddUser}
                          onChange={(e) => setSelectedAddUser(e.target.value)}
                          className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                        >
                          <option value="">Select User</option>
                          {allUsers.map(u => (
                            <option key={u.id} value={u.id}>{u.full_name || u.email} ({u.role})</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Project Role</label>
                        <select 
                          value={selectedAddRole}
                          onChange={(e) => setSelectedAddRole(e.target.value)}
                          className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                        >
                          <option value="Member">Member</option>
                          <option value="Manager">Manager</option>
                        </select>
                      </div>
                    </div>
                    <button 
                      type="submit"
                      disabled={isManagingMember}
                      className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <UserPlus className="w-4 h-4" /> {isManagingMember ? 'Assigning...' : 'Assign to Project'}
                    </button>
                  </form>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <button 
                    type="button"
                    onClick={() => setShowMemberModal(false)}
                    className="w-full py-4 bg-gray-50 text-gray-500 rounded-2xl text-sm font-bold hover:bg-gray-100 transition-all"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Member View remains simple but polished
  return (
    <div className="max-w-6xl mx-auto space-y-12 px-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Welcome back, {user?.full_name?.split(' ')[0]}
          </h2>
          <p className="text-gray-500 mt-1 font-medium">Here's a quick look at your current status.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total tasks', value: tasks.length, icon: ListTodo, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'In progress', value: tasks.filter(t => t.status === 'In Progress').length, icon: Layers, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Completed', value: tasks.filter(t => t.status === 'Done').length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((stat, idx) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5 hover:shadow-md hover:border-gray-200 transition-all group"
          >
            <div className={clsx("w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 duration-300", stat.bg)}>
              <stat.icon className={clsx("w-6 h-6", stat.color)} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 tracking-tight">{stat.value}</p>
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 tracking-tight">Recent tasks</h3>
            <button 
              onClick={() => navigate('/tasks')}
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
            >
              View all tasks
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="bg-white border border-gray-100 rounded-3xl shadow-sm divide-y divide-gray-50 overflow-hidden">
            {tasks.length === 0 ? (
              <div className="p-16 text-center text-gray-400">
                <Activity className="w-8 h-8 mx-auto mb-3 opacity-20" />
                <p className="text-sm font-medium">No recent activity to show</p>
              </div>
            ) : (
              tasks.slice(0, 5).map(task => (
                <div key={task.id} className="p-5 flex items-center justify-between hover:bg-gray-50/50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className={clsx(
                      "w-2 h-2 rounded-full",
                      task.status === 'Done' ? 'bg-emerald-500' :
                      task.status === 'In Progress' ? 'bg-indigo-500' : 'bg-gray-300'
                    )} />
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 tracking-tight group-hover:text-indigo-600 transition-colors">{task.title}</h4>
                      <p className="text-xs font-medium text-gray-400 mt-0.5">Updated 2h ago • {task.priority} priority</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-gray-500 border border-gray-100 px-2.5 py-1 rounded-lg bg-gray-50 tracking-wide">
                    {task.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-bold text-gray-900 tracking-tight">Team activity</h3>
          <div className="bg-white border border-gray-100 rounded-3xl p-8 text-center shadow-sm">
             <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
                <Users className="w-6 h-6 text-indigo-500" />
             </div>
             <p className="text-sm font-medium text-gray-500 leading-relaxed">
               View team updates and real-time progress.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

