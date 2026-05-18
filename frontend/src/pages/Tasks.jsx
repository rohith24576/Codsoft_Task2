import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Plus, Search, Filter, MoreHorizontal, 
  Calendar, Flag, Layers, CheckCircle2,
  Clock, AlertCircle, Trash2, User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import CustomSelect from '../components/CustomSelect';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newTask, setNewTask] = useState({ title: '', description: '', project_id: '', priority: 'Medium', status: 'To Do', deadline: '', assignee_id: '' });

  const fetchTasks = async () => {
    try {
      const [taskRes, projRes, usersRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/projects'),
        api.get('/projects/users').catch(() => ({ data: [] }))
      ]);
      setTasks(taskRes.data);
      setProjects(projRes.data);
      if (usersRes?.data) setUsers(usersRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      await api.patch(`/tasks/${taskId}`, { status: newStatus });
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    } catch (error) {
      console.error('Failed to update status');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', newTask);
      setShowCreateModal(false);
      setNewTask({ title: '', description: '', project_id: '', priority: 'Medium', status: 'To Do', deadline: '', assignee_id: '' });
      fetchTasks();
    } catch (error) {
      console.error('Failed to create task');
    }
  };

  const deleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(tasks.filter(t => t.id !== id));
    } catch (error) {
      console.error('Failed to delete task');
    }
  };

  if (loading) return (
    <div className="max-w-[1400px] mx-auto py-12 px-4 space-y-8">
      <div className="h-20 bg-gray-100 rounded-3xl animate-pulse"></div>
      <div className="grid grid-cols-3 gap-8">
        {[1, 2, 3].map(i => <div key={i} className="h-[600px] bg-gray-50 rounded-[2.5rem] animate-pulse"></div>)}
      </div>
    </div>
  );

  const columns = [
    { id: 'To Do', icon: Clock, color: 'text-gray-400', bg: 'bg-gray-100' },
    { id: 'In Progress', icon: Layers, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { id: 'Done', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' }
  ];

  return (
    <div className="max-w-[1500px] mx-auto space-y-8 pb-20 px-4">
      
      {/* Kanban Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Task Flow</h2>
          <p className="text-sm text-gray-500 font-medium">Coordinate deliverables and track velocity across all initiatives.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="pl-11 pr-6 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none w-64 shadow-sm"
            />
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-xl shadow-indigo-100 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> New Task
          </button>
        </div>
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {columns.map(col => {
          const colTasks = tasks.filter(t => {
            const matchesStatus = t.status === col.id;
            const matchesSearch = searchQuery.trim() === '' || 
              t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
              (t.assignee_name && t.assignee_name.toLowerCase().includes(searchQuery.toLowerCase()));
            return matchesStatus && matchesSearch;
          });
          return (
            <div key={col.id} className="bg-gray-50/50 border border-gray-100/80 rounded-[2.5rem] p-6 space-y-6 flex flex-col min-h-[650px] shadow-xs">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${col.bg} ${col.color} rounded-2xl flex items-center justify-center font-bold shadow-xs`}>
                    <col.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-base tracking-tight">{col.id}</h3>
                </div>
                <span className="px-3 py-1 bg-white border border-gray-200/80 rounded-xl text-xs font-black text-gray-600 shadow-xs">
                  {colTasks.length}
                </span>
              </div>

              <div className="space-y-4 flex-1 overflow-y-auto pr-1 no-scrollbar">
                <AnimatePresence>
                  {colTasks.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="h-40 border-2 border-dashed border-gray-200 rounded-[2rem] flex flex-col items-center justify-center text-gray-400 italic text-xs gap-2"
                    >
                      <AlertCircle className="w-5 h-5 opacity-40" />
                      No tasks in {col.id.toLowerCase()}
                    </motion.div>
                  ) : (
                    colTasks.map((task) => (
                      <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="group bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all space-y-4 relative overflow-hidden"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className={clsx(
                              "px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border",
                              task.priority === 'High' ? 'bg-red-50 text-red-600 border-red-100' :
                              task.priority === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                              'bg-blue-50 text-blue-600 border-blue-100'
                            )}>
                              {task.priority} Priority
                            </span>
                            <button 
                              onClick={() => deleteTask(task.id)}
                              className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl transition-all cursor-pointer"
                              title="Delete Task"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <h4 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors text-base tracking-tight">{task.title}</h4>
                        </div>

                        {task.description && (
                          <p className="text-xs text-gray-400 leading-relaxed font-medium line-clamp-2">{task.description}</p>
                        )}

                        <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-[10px]">
                              {task.assignee_name ? task.assignee_name.charAt(0) : <User className="w-3.5 h-3.5" />}
                            </div>
                            <span className="text-xs font-bold text-gray-600 truncate max-w-[100px]">
                              {task.assignee_name || 'Unassigned'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {col.id !== 'To Do' && (
                              <button 
                                onClick={() => handleUpdateStatus(task.id, col.id === 'Done' ? 'In Progress' : 'To Do')}
                                className="px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 text-[10px] font-bold border border-gray-200/60 transition-all cursor-pointer"
                              >
                                ← Move
                              </button>
                            )}
                            {col.id !== 'Done' && (
                              <button 
                                onClick={() => handleUpdateStatus(task.id, col.id === 'To Do' ? 'In Progress' : 'Done')}
                                className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-[10px] font-bold border border-indigo-100 transition-all cursor-pointer"
                              >
                                Move →
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Task Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl p-10 space-y-8 max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-gray-900">Create New Task</h3>
                <p className="text-gray-400 text-sm font-medium">Assign work and set clear expectations for the team.</p>
              </div>
              
              <form className="space-y-6" onSubmit={handleCreateTask}>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Task Title</label>
                  <input 
                    required
                    type="text" 
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="e.g. Architect Core Services"
                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Description</label>
                  <textarea 
                    rows={3}
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="Provide detailed requirements..."
                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none resize-none" 
                  ></textarea>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                      <CustomSelect 
                        label="Project"
                        value={newTask.project_id}
                        onChange={(val) => setNewTask({ ...newTask, project_id: val })}
                        options={projects.map(p => ({ value: p.id, label: p.name, sublabel: p.status }))}
                        placeholder="Select Project"
                      />
                   </div>
                   <div>
                      <CustomSelect 
                        label="Priority"
                        value={newTask.priority}
                        onChange={(val) => setNewTask({ ...newTask, priority: val })}
                        options={[
                          { value: 'Low', label: 'Low', badge: 'Low' },
                          { value: 'Medium', label: 'Medium', badge: 'Medium' },
                          { value: 'High', label: 'High', badge: 'High' }
                        ]}
                      />
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                      <CustomSelect 
                        label="Assignee"
                        value={newTask.assignee_id}
                        onChange={(val) => setNewTask({ ...newTask, assignee_id: val })}
                        options={users.map(u => ({
                          value: u.id,
                          label: u.full_name || u.email.split('@')[0],
                          sublabel: u.email,
                          badge: u.role,
                          avatar: (u.full_name || u.email).charAt(0)
                        }))}
                        placeholder="Select Assignee"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Deadline</label>
                      <input 
                        type="date"
                        value={newTask.deadline}
                        onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-3.5 text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none" 
                      />
                   </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-gray-100">
                   <button 
                     type="button"
                     onClick={() => setShowCreateModal(false)}
                     className="flex-1 py-4 bg-gray-50 text-gray-500 rounded-2xl text-sm font-bold hover:bg-gray-100 transition-all cursor-pointer"
                   >
                     Cancel
                   </button>
                   <button 
                     type="submit"
                     className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 cursor-pointer"
                   >
                     Create Task
                   </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tasks;
