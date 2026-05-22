import { useState, useEffect } from 'react';
import api from '../services/api';
import { Layers, Users, Calendar, Trash2, UserPlus, CheckCircle2, Zap, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import clsx from 'clsx';
import CustomSelect from '../components/CustomSelect';

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal & Management States
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [selectedManageProject, setSelectedManageProject] = useState('');
  const [selectedAddUser, setSelectedAddUser] = useState('');
  const [selectedAddRole, setSelectedAddRole] = useState('Member');
  const [isManagingMember, setIsManagingMember] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotify = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchProjects = async () => {
    try {
      const [projRes, usersRes] = await Promise.all([
        api.get('/projects'),
        api.get('/projects/users')
      ]);
      setProjects(projRes.data);
      setAllUsers(usersRes.data);
      if (projRes.data.length > 0) {
        setSelectedManageProject(projRes.data[0].id);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProjects();
  }, []);

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
      showNotify('success', 'Team member assigned successfully!');
      await fetchProjects();
      setSelectedAddUser('');
    } catch (error) {
      showNotify('error', error.response?.data?.message || 'Failed to assign member');
    } finally {
      setIsManagingMember(false);
    }
  };

  const handleRemoveMember = async (projectId, userId) => {
    try {
      await api.delete(`/projects/members/${projectId}/${userId}`);
      showNotify('success', 'Team member removed successfully!');
      await fetchProjects();
    } catch (error) {
      showNotify('error', error.response?.data?.message || 'Failed to remove member');
    }
  };

  if (loading) return (
    <div className="max-w-7xl mx-auto py-12 px-4 space-y-6 animate-pulse">
      <div className="h-12 bg-gray-100 rounded-2xl w-1/4"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => <div key={i} className="h-64 bg-gray-100 rounded-[2.5rem]"></div>)}
      </div>
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto pb-20 px-4 space-y-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
        <div className="relative z-10 space-y-4 max-w-xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-widest text-indigo-300 border border-white/10">
            <Layers className="w-4 h-4" /> Portfolio Management
          </div>
          <h1 className="text-5xl font-black tracking-tight">Active Projects</h1>
          <p className="text-gray-300 text-lg font-normal leading-relaxed">
            Oversee project portfolios, track development timelines, and coordinate active team member allocations.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap gap-4 items-center">
          <button 
            onClick={() => {
              if (projects.length > 0) setSelectedManageProject(projects[0].id);
              setShowMemberModal(true);
            }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-indigo-600/30 transition-all active:scale-95 group cursor-pointer"
          >
            <Users className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Manage Team
          </button>
        </div>

        {/* Abstract Background Accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2"></div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project, idx) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all flex flex-col justify-between relative overflow-hidden"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                   <Layers className="w-6 h-6" />
                </div>
                <button 
                  onClick={() => { setSelectedManageProject(project.id); setShowMemberModal(true); }}
                  className="flex items-center gap-1.5 bg-gray-50 hover:bg-indigo-50 hover:border-indigo-100 px-3 py-1.5 rounded-xl border border-gray-100 transition-colors group/btn cursor-pointer"
                  title="Manage Members"
                >
                   <Users className="w-3.5 h-3.5 text-gray-400 group-hover/btn:text-indigo-600 transition-colors" />
                   <span className="text-xs font-bold text-gray-600 group-hover/btn:text-indigo-600 transition-colors">
                     {Array.isArray(project.team_members) ? project.team_members.length : 0} Members
                   </span>
                </button>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">{project.name}</h3>
              <p className="text-gray-400 text-sm font-medium mb-8 leading-relaxed line-clamp-3">{project.description}</p>
            </div>

            <div className="pt-6 border-t border-gray-50 flex justify-between items-center">
              <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                project.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
                project.status === 'In Progress' ? 'bg-indigo-50 text-indigo-600' :
                'bg-gray-50 text-gray-400'
              }`}>
                {project.status || 'Active'}
              </span>
              <div className="flex items-center gap-1 text-[10px] font-bold text-gray-300">
                <Calendar className="w-3 h-3" />
                {new Date(project.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </div>
            </div>
          </motion.div>
        ))}
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
              'bg-indigo-600/90 border-indigo-50 text-white'
            )}
          >
             {notification.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
             {notification.type === 'error' && <Zap className="w-5 h-5" />}
             {notification.type === 'info' && <Bell className="w-5 h-5" />}
             <p className="text-sm font-bold">{notification.message}</p>
          </motion.div>
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
                <div>
                  <CustomSelect 
                    label="Select Project"
                    value={selectedManageProject}
                    onChange={setSelectedManageProject}
                    options={projects.map(p => ({
                      value: p.id,
                      label: p.name,
                      sublabel: p.status
                    }))}
                    placeholder="Select a Project"
                  />
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
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
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
                    <div>
                      <CustomSelect 
                        label="Organization User"
                        value={selectedAddUser}
                        onChange={setSelectedAddUser}
                        options={allUsers.map(u => ({
                          value: u.id,
                          label: u.full_name || u.email.split('@')[0],
                          sublabel: u.email,
                          badge: u.role,
                          avatar: (u.full_name || u.email).charAt(0)
                        }))}
                        placeholder="Select User"
                      />
                    </div>
                    <div>
                      <CustomSelect 
                        label="Project Role"
                        value={selectedAddRole}
                        onChange={setSelectedAddRole}
                        options={[
                          { value: 'Member', label: 'Member', badge: 'Member' },
                          { value: 'Manager', label: 'Manager', badge: 'Manager' }
                        ]}
                      />
                    </div>
                  </div>
                  <button 
                    type="submit"
                    disabled={isManagingMember}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
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
};

export default Projects;

