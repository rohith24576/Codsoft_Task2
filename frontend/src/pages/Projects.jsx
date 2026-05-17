import { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Layers, Users, Calendar, Trash2, UserPlus, CheckCircle2, Zap, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import clsx from 'clsx';

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

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const [projRes, usersRes] = await Promise.all([
        api.get('/projects'),
        api.get('/projects/users')
      ]);
      setProjects(projRes.data);
      setAllUsers(usersRes.data);
    } catch (error) {
      console.error(error);
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
      fetchProjects();
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
      fetchProjects();
    } catch (error) {
      showNotify('error', 'Failed to remove member');
    }
  };

  if (loading) return <div className="animate-pulse h-32 bg-gray-200 rounded-xl max-w-[1400px] mx-auto mt-10"></div>;

  return (
    <div className="max-w-[1400px] mx-auto py-8 px-4 space-y-10">
      <div className="flex justify-between items-center mb-10">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Project Portfolio</h2>
          <p className="text-sm text-gray-500 font-medium">Tracking {projects.length} strategic initiatives across the organization.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => { if (projects.length > 0) setSelectedManageProject(projects[0].id); setShowMemberModal(true); }}
            className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-2xl flex items-center gap-2 text-sm font-bold shadow-sm transition-all active:scale-95"
          >
            <Users className="w-4 h-4 text-indigo-600" /> Manage Team
          </button>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 text-sm font-bold shadow-xl shadow-indigo-100 transition-all active:scale-95">
            <Plus className="w-4 h-4" /> New Project
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
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
};

export default Projects;

